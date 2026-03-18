// src/controllers/backups.controller.ts
import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import pool from '../config/db';
import * as tarStream from 'tar-stream';
import * as zlib from 'zlib';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🛠️ FUNCIÓN AUXILIAR: Extrae la BD, la comprime en .tar.gz y la sube
const generateAndUploadBackup = async (folderName: string) => {

    // ✅ FIX: Ahora trae tablas de TODOS los schemas (auth, inventory, operations, public)
    // Excluimos schemas internos de PostgreSQL que no son datos de la app
    const tablesRes = await pool.query(`
        SELECT schemaname, tablename 
        FROM pg_catalog.pg_tables 
        WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        ORDER BY schemaname, tablename;
    `);

    const backupData: Record<string, any[]> = {};

    for (const row of tablesRes.rows) {
        const { schemaname, tablename } = row;

        const dataRes = await pool.query(`SELECT * FROM "${schemaname}"."${tablename}"`);

        // La clave incluye el schema para evitar colisiones de nombres: "auth.users", "public.orders", etc.
        const key = `${schemaname}.${tablename}`;
        backupData[key] = dataRes.rows;
    }

    const dateStr = new Date().toISOString().replace(/T/, '_').replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `backup_${dateStr}.tar.gz`;

    // Crear el archivo .tar.gz en memoria agrupando por schema
    const pack = tarStream.pack();
    const gzip = zlib.createGzip();

    // Agrupar por schema para crear carpetas dentro del tar
    // Resultado: auth/users.json, inventory/products.json, operations/appointments.json, etc.
    const bySchema: Record<string, Record<string, any[]>> = {};
    for (const [key, rows] of Object.entries(backupData)) {
        const [schema, table] = key.split('.');
        if (!bySchema[schema]) bySchema[schema] = {};
        bySchema[schema][table] = rows;
    }

    for (const [schema, tables] of Object.entries(bySchema)) {
        for (const [table, rows] of Object.entries(tables)) {
            const content = Buffer.from(JSON.stringify(rows, null, 2));
            // Cada tabla queda en su carpeta: auth/users.json, inventory/products.json, etc.
            pack.entry({ name: `${schema}/${table}.json`, size: content.length }, content);
        }
    }

    // Archivo resumen con TODO junto
    const fullDump = Buffer.from(JSON.stringify(backupData, null, 2));
    pack.entry({ name: 'full_backup.json', size: fullDump.length }, fullDump);

    pack.finalize();

    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        pack.pipe(gzip);
        gzip.on('data', (chunk: Buffer) => chunks.push(chunk));
        gzip.on('error', reject);
        gzip.on('end', () => {
            const buffer = Buffer.concat(chunks);
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: 'raw', folder: folderName, public_id: fileName, format: '' },
                (error: any, result: any) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });
    });
};

// ✅ Helper: URL pública directa (ya habilitaste PDF/ZIP delivery en Cloudinary)
const toDownloadUrl = (secureUrl: string): string => {
    return secureUrl.replace('/upload/', '/upload/fl_attachment/');
};

// 1. CREAR MANUAL -> Carpeta: manuales
export const createBackup = async (req: Request, res: Response): Promise<void> => {
    try {
        const uploadResult: any = await generateAndUploadBackup('estetica_backups/manuales');
        res.status(201).json({
            message: 'Respaldo manual creado con éxito ☁️',
            url: toDownloadUrl(uploadResult.secure_url)
        });
    } catch (error) {
        console.error("Error creando backup manual:", error);
        res.status(500).json({ message: 'Error interno al generar el respaldo.' });
    }
};

// 2. CREAR AUTOMÁTICO -> Carpeta: automaticos
export const createAutoBackup = async (req: Request, res: Response): Promise<void> => {
    try {
        const uploadResult: any = await generateAndUploadBackup('estetica_backups/automaticos');
        res.status(201).json({
            message: 'Respaldo automático creado en la nube 🤖',
            url: toDownloadUrl(uploadResult.secure_url)
        });
    } catch (error) {
        console.error("Error creando backup automático:", error);
        res.status(500).json({ message: 'Error en respaldo automático.' });
    }
};

// 3. LISTAR AMBOS TIPOS
export const listBackups = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            resource_type: 'raw',
            prefix: 'estetica_backups/',
            max_results: 100
        });

        const backups = result.resources.map((file: any) => {
            const type = file.public_id.includes('manuales') ? 'Manual' : 'Automático';
            return {
                fileName: file.public_id.split('/').pop(),
                public_id: file.public_id,
                url: toDownloadUrl(file.secure_url),
                size: (file.bytes / 1024 / 1024).toFixed(2) + ' MB',
                createdAt: file.created_at,
                type: type
            };
        });

        backups.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        res.json(backups);
    } catch (error) {
        console.error("Error al listar:", error);
        res.status(500).json({ message: 'Error al listar los respaldos' });
    }
};

// 4. ELIMINAR
export const deleteBackup = async (req: Request, res: Response): Promise<void> => {
    try {
        const publicId = req.query.public_id as string;
        if (!publicId) {
            res.status(400).json({ message: 'Se requiere el public_id del archivo.' });
            return;
        }
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        res.json({ message: 'Respaldo eliminado.' });
    } catch (error) {
        console.error("Error al eliminar:", error);
        res.status(500).json({ message: 'Error al eliminar.' });
    }
};

// 5. DESCARGAR — Genera URL firmada válida por 5 minutos
export const downloadBackup = async (req: Request, res: Response): Promise<void> => {
    try {
        const publicId = req.query.public_id as string;
        if (!publicId) {
            res.status(400).json({ message: 'Se requiere el public_id del archivo.' });
            return;
        }

        const signedUrl = cloudinary.utils.private_download_url(publicId, '', {
            resource_type: 'raw',
            type: 'upload',
            attachment: true,
            expires_at: Math.floor(Date.now() / 1000) + 300
        });

        res.redirect(signedUrl);
    } catch (error) {
        console.error("Error generando URL de descarga:", error);
        res.status(500).json({ message: 'Error al generar el enlace de descarga.' });
    }
};

// 6. AUTO-LIMPIEZA (borra respaldos con más de 7 días)
export const autoCleanupBackups = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await cloudinary.search
            .expression('folder:estetica_backups/*')
            .execute();

        const sieteDiasMs = 7 * 24 * 60 * 60 * 1000;
        const ahora = new Date().getTime();
        let borrados = 0;

        for (const file of result.resources) {
            if (ahora - new Date(file.created_at).getTime() > sieteDiasMs) {
                await cloudinary.uploader.destroy(file.public_id, { resource_type: 'raw' });
                borrados++;
            }
        }

        res.json({ message: `Se borraron ${borrados} respaldos viejos.` });
    } catch (error) {
        console.error("Error al limpiar:", error);
        res.status(500).json({ message: 'Error al limpiar.' });
    }
};
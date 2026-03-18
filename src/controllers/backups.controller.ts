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
    // 1. Extraer todas las tablas de la base de datos
    const tablesRes = await pool.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';");
    const backupData: Record<string, any[]> = {};

    for (const row of tablesRes.rows) {
        const tableName = row.tablename;
        const dataRes = await pool.query(`SELECT * FROM "${tableName}"`);
        backupData[tableName] = dataRes.rows;
    }

    const dateStr = new Date().toISOString().replace(/T/, '_').replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `backup_${dateStr}.tar.gz`;

    // 2. Crear el archivo .tar.gz en memoria (sin escribir en disco)
    const pack = tarStream.pack();
    const gzip = zlib.createGzip();

    // Cada tabla se guarda como un archivo .json independiente dentro del tar
    for (const [tableName, rows] of Object.entries(backupData)) {
        const content = Buffer.from(JSON.stringify(rows, null, 2));
        pack.entry({ name: `${tableName}.json`, size: content.length }, content);
    }

    // Archivo resumen con TODAS las tablas juntas (útil para restaurar de un solo golpe)
    const fullDump = Buffer.from(JSON.stringify(backupData, null, 2));
    pack.entry({ name: 'full_backup.json', size: fullDump.length }, fullDump);

    pack.finalize();

    // 3. Pipear pack → gzip → buffer → Cloudinary
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];

        pack.pipe(gzip);

        gzip.on('data', (chunk: Buffer) => chunks.push(chunk));
        gzip.on('error', reject);
        gzip.on('end', () => {
            const buffer = Buffer.concat(chunks);

            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'raw',
                    folder: folderName,
                    public_id: fileName,
                    format: '',
                },
                (error: any, result: any) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            uploadStream.end(buffer);
        });
    });
};

// ✅ FIX: Agrega fl_attachment a la URL para forzar descarga en Cloudinary
// Sin esto, Cloudinary muestra el archivo en el navegador en lugar de descargarlo
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
                // ✅ FIX: fl_attachment fuerza la descarga en lugar de abrir en el navegador
                url: toDownloadUrl(file.secure_url),
                size: (file.bytes / 1024 / 1024).toFixed(2) + ' MB',
                createdAt: file.created_at,
                type: type
            };
        });

        // Más nuevo arriba
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

// 5. AUTO-LIMPIEZA (borra respaldos con más de 7 días)
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
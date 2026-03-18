// src/controllers/backups.controller.ts
import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import pool from '../config/db'; // 👈 ¡Ruta corregida!

dotenv.config();

// Configuración de Cloudinary (necesaria para que el controlador tenga permisos)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 1. CREAR Y SUBIR A CLOUDINARY
export const createBackup = async (req: Request, res: Response): Promise<void> => {
    try {
        const tablesRes = await pool.query(
            "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';"
        );
        
        const backupData: any = {};

        for (const row of tablesRes.rows) {
            const tableName = row.tablename;
            const dataRes = await pool.query(`SELECT * FROM "${tableName}"`);
            backupData[tableName] = dataRes.rows;
        }

        const jsonString = JSON.stringify(backupData, null, 2);
        const buffer = Buffer.from(jsonString);

        const dateStr = new Date().toISOString().replace(/T/, '_').replace(/[:.]/g, '-').slice(0, 19);
        const fileName = `backup_estetica_${dateStr}.json`; 

        const uploadResult: any = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { 
                    resource_type: 'raw', 
                    folder: 'estetica_backups', 
                    public_id: fileName 
                },
                (error: any, result: any) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(buffer);
        });

        res.status(201).json({ 
            message: 'Respaldo en la nube creado con éxito ☁️', 
            url: uploadResult.secure_url,
            fileName: uploadResult.public_id
        });

    } catch (error: any) {
        console.error("Error creando el backup:", error);
        res.status(500).json({ message: 'Error interno al generar el respaldo.' });
    }
};

// 2. LISTAR DESDE CLOUDINARY
export const listBackups = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await cloudinary.search
            .expression('folder:estetica_backups')
            .sort_by('created_at', 'desc')
            .execute();

        const backups = result.resources.map((file: any) => ({
            fileName: file.public_id.split('/')[1], 
            public_id: file.public_id, 
            url: file.secure_url,
            size: (file.bytes / 1024 / 1024).toFixed(2) + ' MB',
            createdAt: file.created_at
        }));

        res.json(backups);
    } catch (error) {
        console.error("Error al listar respaldos:", error);
        res.status(500).json({ message: 'Error al listar los respaldos de la nube' });
    }
};

// 3. ELIMINAR DE CLOUDINARY
export const deleteBackup = async (req: Request, res: Response): Promise<void> => {
    try {
        const publicId = req.query.public_id as string; 
        
        if (!publicId) {
            res.status(400).json({ message: 'Falta el public_id del archivo' });
            return;
        }

        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });

        res.json({ message: 'Respaldo eliminado de la nube correctamente.' });
    } catch (error) {
        console.error("Error al borrar el archivo:", error);
        res.status(500).json({ message: 'Error al eliminar el respaldo.' });
    }
};

// 4. LIMPIEZA AUTOMÁTICA (El Exterminador de 7 días)
export const autoCleanupBackups = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await cloudinary.search.expression('folder:estetica_backups').execute();
        
        const sieteDiasEnMs = 7 * 24 * 60 * 60 * 1000;
        const ahora = new Date().getTime();
        let borrados = 0;

        for (const file of result.resources) {
            const fechaCreacion = new Date(file.created_at).getTime();
            if (ahora - fechaCreacion > sieteDiasEnMs) {
                await cloudinary.uploader.destroy(file.public_id, { resource_type: 'raw' });
                borrados++;
            }
        }

        res.json({ message: `Limpieza terminada. Se borraron ${borrados} respaldos viejos.` });
    } catch (error) {
        console.error("Error en autolimpieza:", error);
        res.status(500).json({ message: 'Error al limpiar respaldos viejos' });
    }
};
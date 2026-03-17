// src/controllers/backups.controller.ts
import { Request, Response } from 'express';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

// Creamos una carpeta PERMANENTE llamada 'backups' (ya no 'temp')
const backupsFolder = path.join(process.cwd(), 'backups');
if (!fs.existsSync(backupsFolder)){
    fs.mkdirSync(backupsFolder);
}

// 1. CREAR: Genera el respaldo y lo guarda en el servidor
export const createBackup = (req: Request, res: Response): void => {
    // Generamos un nombre bonito con la fecha exacta
    const dateStr = new Date().toISOString().replace(/T/, '_').replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `backup_estetica_${dateStr}.sql`;
    const filePath = path.join(backupsFolder, fileName);

    const dbUser = process.env.DB_USER || 'postgres';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbName = process.env.DB_NAME || 'estetica_proyecto';
    const dbPassword = process.env.DB_PASSWORD || '12345'; 

    const command = `pg_dump -U ${dbUser} -h ${dbHost} -d ${dbName} -f "${filePath}"`;

    exec(command, { env: { ...process.env, PGPASSWORD: dbPassword, PGSSLMODE: 'disable' } }, (error) => {
        if (error) {
            console.error(`Error crítico generando el backup: ${error.message}`);
            res.status(500).json({ message: 'Error interno al generar el respaldo.' });
            return;
        }
        res.status(201).json({ message: 'Respaldo creado y guardado en el servidor', fileName });
    });
};

// 2. LISTAR: Lee la carpeta y devuelve los archivos
export const listBackups = (req: Request, res: Response): void => {
    try {
        const files = fs.readdirSync(backupsFolder);
        
        // Filtramos solo los .sql y sacamos su información
        const backups = files.filter(f => f.endsWith('.sql')).map(file => {
            const stats = fs.statSync(path.join(backupsFolder, file));
            return {
                fileName: file,
                size: (stats.size / 1024 / 1024).toFixed(2) + ' MB', // Tamaño en Megabytes
                createdAt: stats.birthtime // Fecha de creación
            };
        }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Ordenamos: los más nuevos primero

        res.json(backups);
    } catch (error) {
        console.error("Error al leer la carpeta de respaldos:", error);
        res.status(500).json({ message: 'Error al listar los respaldos' });
    }
};

// 3. DESCARGAR: Descarga un archivo a la computadora del admin
export const downloadBackup = (req: Request, res: Response): void => {
    const  fileName  = req.params.fileName as string;
    const filePath = path.join(backupsFolder, fileName);

    if (fs.existsSync(filePath)) {
        res.download(filePath); // Lo descarga, pero YA NO lo borra
    } else {
        res.status(404).json({ message: 'El archivo de respaldo no existe en el servidor.' });
    }
};


// 4. ELIMINAR: Borra un archivo del servidor
export const deleteBackup = (req: Request, res: Response): void => {
    // Aquí está la magia contra el error
    const fileName = req.params.fileName as string;
    const filePath = path.join(backupsFolder, fileName);

    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ message: 'Respaldo eliminado del servidor correctamente.' });
        } else {
            res.status(404).json({ message: 'El archivo no existe.' });
        }
    } catch (error) {
        console.error("Error al borrar el archivo:", error);
        res.status(500).json({ message: 'Error al eliminar el respaldo.' });
    }
};
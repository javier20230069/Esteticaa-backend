// src/routes/backups.routes.ts
import { Router } from 'express';
import { 
    createBackup, 
    createAutoBackup, 
    listBackups, 
    deleteBackup, 
    autoCleanupBackups 
} from '../controllers/backups.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

// 1. LISTAR: Trae los respaldos (manuales y automáticos) desde Cloudinary
router.get('/', verifyToken, isAdmin, listBackups);

// 2. CREAR MANUAL: Se ejecuta cuando presionas el botón en tu página
router.post('/', verifyToken, isAdmin, createBackup);

// 3. ELIMINAR: Borra un archivo específico (recibe ?public_id=...)
router.delete('/', verifyToken, isAdmin, deleteBackup);

// ==========================================
// 🤖 RUTAS AUTOMÁTICAS (Para Vercel Cron Jobs)
// No usan verifyToken porque Vercel las llamará de forma interna y segura
// ==========================================

// 4. CREAR AUTOMÁTICO: Sube el respaldo a la carpeta 'automaticos'
router.post('/cron/create', createAutoBackup);

// 5. AUTO-LIMPIEZA: Borra los respaldos con más de 7 días de antigüedad
router.post('/cron/cleanup', autoCleanupBackups);

export default router;
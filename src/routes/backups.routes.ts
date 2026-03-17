// src/routes/backups.routes.ts
import { Router } from 'express';
import { createBackup, listBackups, downloadBackup, deleteBackup } from '../controllers/backups.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware'; // Importamos la seguridad

const router = Router();

// 1. CREAR: Genera un nuevo archivo .sql en el servidor
// Usamos POST porque estamos "creando" algo nuevo
router.post('/', verifyToken, isAdmin, createBackup);

// 2. LISTAR: Lee la carpeta y te devuelve la lista de archivos
// Usamos GET porque solo queremos "leer" información
router.get('/', verifyToken, isAdmin, listBackups);

// 3. DESCARGAR: Descarga el archivo específico a tu computadora
// Usamos GET y le pasamos el nombre del archivo en la URL (:fileName)
router.get('/download/:fileName', verifyToken, isAdmin, downloadBackup);

// 4. ELIMINAR: Borra el archivo del disco duro del servidor
// Usamos DELETE para la acción destructiva
router.delete('/:fileName', verifyToken, isAdmin, deleteBackup);

export default router;
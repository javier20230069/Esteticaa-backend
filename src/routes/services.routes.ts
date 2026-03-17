// src/routes/services.routes.ts
import { Router } from 'express';
import { 
    getServices, 
    getActiveServices, 
    getServiceById, 
    createService, 
    updateService, 
    toggleServiceStatus 
} from '../controllers/services.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

// ==========================================
// RUTAS PÚBLICAS / GENERALES
// ==========================================
// Los clientes verán los activos, el admin necesita ver todos
router.get('/active', getActiveServices); 
router.get('/', getServices);             
router.get('/:id', getServiceById);

// ==========================================
// RUTAS PROTEGIDAS (Solo Administradores)
// ==========================================
// Importante: verifyToken y isAdmin actúan como guardias de seguridad
router.post('/', verifyToken, isAdmin, createService);
router.put('/:id', verifyToken, isAdmin, updateService);

// La nueva ruta mágica para ocultar/mostrar
router.patch('/:id/toggle', verifyToken, isAdmin, toggleServiceStatus);

export default router;
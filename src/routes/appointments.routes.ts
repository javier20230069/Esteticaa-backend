// src/routes/appointments.routes.ts
import { Router } from 'express';
// Importamos a los 3 Chefs (¡Agregamos createAppointment!)
import { getAppointments, updateAppointmentStatus, createAppointment } from '../controllers/appointments.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

// 1. Ruta para obtener TODAS las citas (Solo Admin)
router.get('/', verifyToken, isAdmin, getAppointments);

// 2. Ruta para cambiar el estado (Solo Admin)
router.put('/:id/status', verifyToken, isAdmin, updateAppointmentStatus);

// 3. NUEVA RUTA: Crear una cita (Cualquier usuario logueado con Token puede hacerlo)
router.post('/', verifyToken, createAppointment);

export default router;
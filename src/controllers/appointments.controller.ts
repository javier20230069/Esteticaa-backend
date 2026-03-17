// src/controllers/appointments.controller.ts
import { Request, Response } from 'express';
import pool from '../config/db'; 

// =========================================================================
// 1. EL CHEF QUE BUSCA TODAS LAS CITAS (Para el panel de Admin)
// =========================================================================
export const getAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    // FIX: Ahora cruzamos las tablas indicando su esquema exacto (operations y auth)
    const query = `
      SELECT 
        a.id, 
        u.full_name AS cliente, 
        s.name AS servicio, 
        a.appointment_date, 
        a.total_amount, 
        a.status
      FROM operations.appointments a
      LEFT JOIN auth.users u ON a.client_id = u.id
      LEFT JOIN operations.services s ON a.service_id = s.id
      ORDER BY a.appointment_date DESC;
    `;
    
    const result = await pool.query(query);
    
    // TRUCO DE SENIOR: Imprimimos en la consola negra de Node.js lo que nos devolvió PostgreSQL
    console.log("Citas encontradas en la BD (Crudas):", result.rows);
    
    res.json(result.rows);

  } catch (error) {
    console.error('🔥 Error al obtener las citas:', error);
    res.status(500).json({ message: 'Error interno del servidor al cargar las citas' });
  }
};

// =========================================================================
// 2. EL CHEF QUE ACTUALIZA EL ESTADO (Aceptar/Cancelar cita)
// =========================================================================
export const updateAppointmentStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body; 

  try {
    if (!status) {
      res.status(400).json({ message: 'El estado es obligatorio' });
      return;
    }

    // FIX: Agregamos operations.
    const query = `
      UPDATE operations.appointments 
      SET status = $1 
      WHERE id = $2 
      RETURNING *;
    `;
    
    const result = await pool.query(query, [status, id]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Cita no encontrada en la base de datos' });
      return;
    }

    res.json({ 
      message: 'Estado de la cita actualizado correctamente', 
      cita: result.rows[0] 
    });

  } catch (error) {
    console.error('🔥 Error al actualizar la cita:', error);
    res.status(500).json({ message: 'Error interno del servidor al actualizar la cita' });
  }
};

// =========================================================================
// 3. EL CHEF QUE CREA UNA CITA NUEVA (Desde el panel del cliente)
// =========================================================================
export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { service_id, appointment_date, total_amount } = req.body;
    
    // Sacamos el ID del cliente directamente de su Token de seguridad
    const client_id = (req as any).user.id; 

    // FIX: Agregamos operations.
    const query = `
      INSERT INTO operations.appointments (client_id, service_id, appointment_date, status, total_amount, deposit_amount)
      VALUES ($1, $2, $3, 'pending', $4, 0)
      RETURNING *;
    `;
    
    const result = await pool.query(query, [client_id, service_id, appointment_date, total_amount]);

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('🔥 Error al crear la cita:', error);
    res.status(500).json({ message: 'Error interno del servidor al crear la cita' });
  }
};
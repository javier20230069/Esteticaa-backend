// src/controllers/services.controller.ts
import { Request, Response } from 'express';
import pool from '../config/db';

// 🔍 OBTENER TODOS LOS SERVICIOS (Para el Panel Admin)
export const getServices = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM operations.services ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener servicios:", error);
        res.status(500).json({ error: 'Error al obtener los servicios' });
    }
};

// 🌟 OBTENER SOLO SERVICIOS ACTIVOS (Para la vista de clientes/agendar)
export const getActiveServices = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM operations.services WHERE is_active = TRUE ORDER BY name ASC');
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener servicios activos:", error);
        res.status(500).json({ error: 'Error al obtener servicios activos' });
    }
};

// 🆔 OBTENER SERVICIO POR ID
export const getServiceById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM operations.services WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Servicio no encontrado' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error al obtener servicio:", error);
        res.status(500).json({ error: 'Error al obtener el servicio' });
    }
};

// ✨ CREAR NUEVO SERVICIO
export const createService = async (req: Request, res: Response) => {
    const { name, description, duration, price } = req.body;
    try {
        // Por defecto al crearlo, lo hacemos activo (TRUE)
        const result = await pool.query(
            'INSERT INTO operations.services (name, description, duration, price, is_active) VALUES ($1, $2, $3, $4, TRUE) RETURNING *',
            [name, description, duration, price]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error al crear servicio:", error);
        res.status(500).json({ error: 'Error al crear el servicio' });
    }
};

// 🔄 ACTUALIZAR SERVICIO
export const updateService = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, duration, price } = req.body;
    try {
        const result = await pool.query(
            'UPDATE operations.services SET name=$1, description=$2, duration=$3, price=$4 WHERE id=$5 RETURNING *',
            [name, description, duration, price, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Servicio no encontrado' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error al actualizar servicio:", error);
        res.status(500).json({ error: 'Error al actualizar el servicio' });
    }
};

// 👁️ OCULTAR / MOSTRAR SERVICIO (Soft Delete)
export const toggleServiceStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'UPDATE operations.services SET is_active = NOT is_active WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Servicio no encontrado' });
        res.json({ message: 'Estado del servicio actualizado', service: result.rows[0] });
    } catch (error) {
        console.error("Error al cambiar estado:", error);
        res.status(500).json({ error: 'Error al cambiar el estado del servicio' });
    }
};
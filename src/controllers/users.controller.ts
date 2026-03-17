// src/controllers/users.controller.ts
import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middlewares/auth.middleware'; 

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        const result = await pool.query(
            'SELECT id, full_name, email, phone, role, is_active FROM auth.users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("🔥 ERROR OBTENIENDO PERFIL:", error);
        res.status(500).json({ error: 'Error del servidor al obtener perfil' });
    }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT id, full_name, email, phone, role, is_active, 
                   TO_CHAR(created_at, 'YYYY-MM-DD') as fecha_registro 
            FROM auth.users 
            ORDER BY id DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("🔥 ERROR OBTENIENDO USUARIOS:", error);
        res.status(500).json({ error: 'Error del servidor al obtener usuarios' });
    }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    // FIX TYPESCRIPT DEFINITIVO: Convertimos a String explícitamente
    if (req.user?.id === parseInt(String(id), 10)) {
        return res.status(400).json({ error: 'No puedes bloquear tu propia cuenta' });
    }

    try {
        const result = await pool.query(
            'UPDATE auth.users SET is_active = NOT is_active WHERE id = $1 RETURNING id, full_name, is_active', 
            [id]
        );
        
        if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        
        const nuevoEstado = result.rows[0].is_active ? 'desbloqueado' : 'bloqueado';
        res.json({ message: `Usuario ${nuevoEstado} correctamente`, user: result.rows[0] });
    } catch (error) {
        console.error("🔥 ERROR AL BLOQUEAR/DESBLOQUEAR USUARIO:", error);
        res.status(500).json({ error: 'Error al cambiar el estado del usuario' });
    }
};
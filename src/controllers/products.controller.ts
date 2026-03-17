// src/controllers/products.controller.ts
import { Request, Response } from 'express';
import pool from '../config/db';
import stream from 'stream'; 
import csv from 'csv-parser';

// 🔍 OBTENER TODOS LOS PRODUCTOS
export const getProducts = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM inventory.products ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
};

// 🛒 OBTENER PRODUCTOS PARA LA TIENDA (ACTIVOS Y CON STOCK)
export const getActiveProducts = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM inventory.products WHERE is_active = TRUE AND stock > 0 ORDER BY name ASC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener productos activos' });
    }
};

// 🆔 OBTENER PRODUCTO POR ID
export const getProductById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM inventory.products WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
};

// ✨ CREAR PRODUCTO NUEVO
export const createProduct = async (req: Request, res: Response) => {
    const { name, brand, category, price, stock, min_stock } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const result = await pool.query(
            'INSERT INTO inventory.products (name, brand, category, price, stock, min_stock, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, brand, category, price, stock, min_stock, imageUrl]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error al crear:", error);
        res.status(500).json({ error: 'Error al crear el producto' });
    }
};

// 🔄 ACTUALIZAR PRODUCTO
export const updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, brand, category, price, stock, min_stock } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        let query = '';
        let values = [];

        if (imageUrl) {
            query = 'UPDATE inventory.products SET name=$1, brand=$2, category=$3, price=$4, stock=$5, min_stock=$6, image_url=$7 WHERE id=$8 RETURNING *';
            values = [name, brand, category, price, stock, min_stock, imageUrl, id];
        } else {
            query = 'UPDATE inventory.products SET name=$1, brand=$2, category=$3, price=$4, stock=$5, min_stock=$6 WHERE id=$7 RETURNING *';
            values = [name, brand, category, price, stock, min_stock, id];
        }

        const result = await pool.query(query, values);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error al actualizar:", error);
        res.status(500).json({ error: 'Error al actualizar' });
    }
};

// 🗑️ ELIMINAR PRODUCTO
export const deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM inventory.products WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar' });
    }
};

// 👁️ CAMBIAR ESTADO (VISIBILIDAD)
export const toggleProductStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'UPDATE inventory.products SET is_active = NOT is_active WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json({ message: 'Estado actualizado', product: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al cambiar estado' });
    }
};

// 📥 IMPORTACIÓN MASIVA INTELIGENTE (RAM)
export const importProductsCSV = async (req: Request, res: Response) => {
    const { action } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No se subió archivo' });

    const results: any[] = [];
    const bufferStream = new stream.PassThrough();
    bufferStream.end(file.buffer);

    bufferStream
        .pipe(csv({
            // Detecta tanto comas como puntos y comas (común en Excel español)
            mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '') 
        }))
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                const dbRes = await pool.query('SELECT id, name FROM inventory.products');
                const dbProducts = dbRes.rows;

                const nuevos: any[] = [];
                const repetidos: any[] = [];

                for (const row of results) {
                    // Limpiamos los nombres de las columnas por si Excel puso comillas extras
                    const nombre = row['Nombre'] || row['nombre'] || '';
                    const id_csv = parseInt(row['id_producto']) || null;
                    
                    if (!nombre) continue;

                    const existe = dbProducts.find(p => p.id === id_csv || p.name.toLowerCase() === nombre.toLowerCase());

                    const prod = { 
                        id: existe?.id || null, 
                        name: nombre, 
                        brand: row['Marca'] || '', 
                        category: row['Categoria'] || '', 
                        price: parseFloat(row['Precio']) || 0, 
                        stock: parseInt(row['Stock']) || 0, 
                        is_active: row['Estado'] === 'Activo' 
                    };

                    if (existe) repetidos.push(prod);
                    else nuevos.push(prod);
                }

                if (action === 'preview') return res.json({ nuevos, repetidos });

                for (const n of nuevos) {
                    await pool.query(
                        'INSERT INTO inventory.products (name, brand, category, price, stock, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
                        [n.name, n.brand, n.category, n.price, n.stock, n.is_active]
                    );
                }

                if (action === 'update') {
                    for (const r of repetidos) {
                        await pool.query(
                            'UPDATE inventory.products SET name=$1, brand=$2, category=$3, price=$4, stock=$5, is_active=$6 WHERE id=$7',
                            [r.name, r.brand, r.category, r.price, r.stock, r.is_active, r.id]
                        );
                    }
                }
                res.json({ message: 'Importación exitosa' });
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: 'Error al procesar' });
            }
        });
};
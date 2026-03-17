import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    // 🌟 CAMBIA EL 'false' POR ESTO:
    ssl: {
        rejectUnauthorized: false 
    }
});

pool.on('connect', () => {
    console.log('✅ Base de Datos PostgreSQL conectada');
});

pool.on('error', (err) => {
    console.error('❌ Error inesperado en la BD:', err);
});

export default pool;
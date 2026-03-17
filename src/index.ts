import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/auth.routes';
// ... (tus otros imports de rutas)

dotenv.config();
const app = express();

// 🚀 1. CORS MANUAL (ESTO DEBE IR PRIMERO QUE TODO)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://stetica.netlify.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') return res.status(200).end();
    next();
});

app.use(express.json());

// 🚀 2. RUTA DE PRUEBA (Para ver si el backend responde)
app.get('/api/test', (req, res) => {
    res.json({ status: "Router funcionando", date: new Date() });
});

// 🚀 3. REGISTRO DE RUTAS
app.use('/api/auth', authRoutes);
// ... (tus otras rutas)

// Ruta raíz para Vercel
app.get('/', (req, res) => {
    res.json({ message: "Backend Estética Online 🚀" });
});

export default app;
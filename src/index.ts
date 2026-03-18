// src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// IMPORTANTE: Revisa que estos nombres coincidan EXACTAMENTE con tus archivos
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import productsRoutes from './routes/products.routes';
import servicesRoutes from './routes/services.routes';
import usersRoutes from './routes/users.routes';
import appointmentsRoutes from './routes/appointments.routes';
import backupRoutes from './routes/backups.routes';

dotenv.config();
const app = express();

// 🚀 1. CORS MANUAL (EL "GUARDIA")
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://stetica.netlify.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') return res.status(200).end();
    next();
});

app.use(express.json());

// 🚀 2. REGISTRO DE RUTAS (Ordenado de lo más específico a lo más general)
// Cambiamos /api por /api/health para evitar choques
app.use('/api/health', healthRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/backups', backupRoutes);

// Carpeta de archivos
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Ruta raíz de bienvenida (La que ya sabemos que funciona)
app.get('/', (req, res) => {
    res.json({ 
        message: "Backend Estética Online 🚀",
        endpoints: ["/api/auth", "/api/products", "/api/health"]
    });
});

export default app;
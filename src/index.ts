// src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Importar rutas
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import productsRoutes from './routes/products.routes';
import servicesRoutes from './routes/services.routes';
import usersRoutes from './routes/users.routes';
import backupsRoutes from './routes/backups.routes';
import appointmentsRoutes from './routes/appointments.routes';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// 🌟 1. CONFIGURACIÓN DE CORS ACTUALIZADA
// Cambiado a 'stetica.netlify.app' para que coincida con tu URL real
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://stetica.netlify.app' 
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// 🌟 2. CARPETAS ESTÁTICAS
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 🌟 3. RUTA DE BIENVENIDA
app.get('/', (req, res) => {
    res.json({ message: "API de Estética corriendo con éxito en Vercel 🚀" });
});

// 🌟 4. REGISTRAR RUTAS
app.use('/api', healthRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/backups', backupsRoutes);
app.use('/api/appointments', appointmentsRoutes);

// 🌟 5. ENCENDER SERVIDOR (Local)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor local en puerto: ${PORT}`);
    });
}

// 🌟 6. EXPORTAR APP
export default app;
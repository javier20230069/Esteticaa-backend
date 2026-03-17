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

// 🌟 1. CONFIGURACIÓN DE CORS (Debe ir ANTES de las rutas)
app.use(cors({
  // Cuando tengas tu URL de Netlify, cambia 'https://tu-sitio.netlify.app' por la tuya
  origin: ['http://localhost:5173', 'https://ssteticaa.netlify.app'], 
  credentials: true
}));

app.use(express.json());

// 🌟 2. CARPETAS ESTÁTICAS
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 🌟 3. REGISTRAR RUTAS
app.use('/api', healthRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/backups', backupsRoutes);
app.use('/api/appointments', appointmentsRoutes);

// 🌟 4. ENCENDER SERVIDOR (Para cuando trabajas en local)
app.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 Servidor corriendo en puerto: ${PORT}`);
    console.log(`-----------------------------------------`);
});

// 🌟 5. EXPORTAR APP (Vital para que Vercel funcione)
export default app;
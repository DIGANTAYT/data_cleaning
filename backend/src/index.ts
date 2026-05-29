import dotenv from 'dotenv';
dotenv.config();

// Programmatically bypass Prisma TLS self-signed certificate chain validation
if (process.env.DATABASE_URL) {
  if (process.env.DATABASE_URL.includes('sslmode=require')) {
    process.env.DATABASE_URL = process.env.DATABASE_URL.replace('sslmode=require', 'sslmode=no-verify');
  } else if (!process.env.DATABASE_URL.includes('sslmode=')) {
    const separator = process.env.DATABASE_URL.includes('?') ? '&' : '?';
    process.env.DATABASE_URL = `${process.env.DATABASE_URL}${separator}sslmode=no-verify`;
  }
  if (!process.env.DATABASE_URL.includes('sslaccept=')) {
    const separator = process.env.DATABASE_URL.includes('?') ? '&' : '?';
    process.env.DATABASE_URL = `${process.env.DATABASE_URL}${separator}sslaccept=accept_invalid_certs`;
  }
}

import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.routes';
import datasetRoutes from './routes/dataset.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/datasets', datasetRoutes);
app.use('/api/dashboards', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

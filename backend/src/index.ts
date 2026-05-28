import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import datasetRoutes from './routes/dataset.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/datasets', datasetRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

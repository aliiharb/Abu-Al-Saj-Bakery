import './env.js';
import cors from 'cors';
import express from 'express';
import { pool } from './db.js';
import authRoutes from './routes/authRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'abu-al-saj-api' });
});

app.use('/api', authRoutes);
app.use('/api', menuRoutes);
app.use('/api', uploadRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});

app.use((error, _req, res, _next) => {
  const status = error.status || error.statusCode || 500;
  const message = status >= 500 ? 'Server error.' : error.message;

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({ message });
});

process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Abu Al-Saj API running on http://localhost:${PORT}`);
});

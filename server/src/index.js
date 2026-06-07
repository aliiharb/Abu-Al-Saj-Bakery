import './env.js';
import cors from 'cors';
import express from 'express';
import { pool } from './db.js';
import authRoutes from './routes/authRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();
const allowedOrigins = [
  ...(process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  'https://abualsajbakey.netlify.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8888',
  'http://127.0.0.1:8888'
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error('Blocked by CORS:', {
        origin,
        allowedOrigins
      });

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);
app.use(express.json({ limit: '2mb' }));

app.use('/api', (req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/images')) {
    res.set('Cache-Control', 'no-store');
  }

  next();
});

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
  let status = error.status || error.statusCode || 500;
  let message = status >= 500 ? 'Server error.' : error.message;

  if (error.type === 'entity.too.large') {
    status = 413;
    message = 'The selected image is too large. Please choose a smaller image.';
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    status = 413;
    message = 'The selected image is too large. Please choose a smaller image.';
  }

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({ message });
});

process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

if (!process.env.NETLIFY) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Abu Al-Saj API running on http://localhost:${PORT}`);
  });
}

export default app;

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDB, pool } from './server/config/db.js';

import authRoutes    from './server/routes/auth.js';
import projectRoutes from './server/routes/projects.js';
import taskRoutes    from './server/routes/tasks.js';
import postRoutes    from './server/routes/posts.js';
import userRoutes    from './server/routes/users.js';
import adminRoutes   from './server/routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '8mb' }));

app.use('/api/auth',     authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks',    taskRoutes);
app.use('/api/posts',    postRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/admin',    adminRoutes);

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', ts: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ status: 'error', db: 'disconnected', message: e.message });
  }
});

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

async function boot() {
  try {
    await initDB();
    app.listen(PORT, () => console.log(`CampusForge server running on port ${PORT}`));
  } catch (err) {
    console.error('Boot failed:', err);
    process.exit(1);
  }
}

boot();

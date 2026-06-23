import express from 'express';
import path from 'node:path';
import { securityHeaders } from './middleware/securityHeaders.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { staticCache } from './middleware/staticCache.js';
import { registerHealthRoutes } from './routes/healthRoutes.js';
import { registerNotificationRoutes } from './routes/notificationRoutes.js';
import { notFoundHandler } from './utils/http.js';
import { errorHandler } from './utils/errorHandler.js';

export const buildApp = (config) => {
  const app = express();
  const distDir = path.join(config.rootDir, 'dist');

  app.disable('x-powered-by');
  // Simple CORS for development (allow Vite dev server)
  app.use((req, res, next) => {
    const origin = req.headers.origin || '';
    if (origin && origin.includes('localhost')) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });
  app.use(securityHeaders(config));
  app.use(rateLimiter(config.rateLimit));
  app.use(express.json({ limit: config.jsonBodyLimit }));
  app.use(express.urlencoded({ extended: false, limit: config.jsonBodyLimit }));

  registerHealthRoutes(app);
  registerNotificationRoutes(app);
  app.use('/api', notFoundHandler);

  app.use(staticCache());
  app.use(express.static(distDir, {
    etag: true,
    lastModified: true,
    maxAge: config.staticCacheMaxAge,
  }));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });

  app.use(notFoundHandler);

  // centralized error handler
  app.use(errorHandler);

  return app;
};

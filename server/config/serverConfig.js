import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validatePositiveInteger } from '../validators/envValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

export const getServerConfig = () => ({
  rootDir,
  port: validatePositiveInteger(process.env.PORT, 3000),
  jsonBodyLimit: process.env.JSON_BODY_LIMIT || '100kb',
  staticCacheMaxAge: process.env.STATIC_CACHE_MAX_AGE || '1d',
  rateLimit: {
    windowMs: validatePositiveInteger(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
    max: validatePositiveInteger(process.env.RATE_LIMIT_MAX, 120),
  },
});

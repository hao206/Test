import pg from 'pg';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const { Pool } = pg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isRender = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com');

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: (isRender || process.env.NODE_ENV === 'production')
    ? { rejectUnauthorized: false }
    : false,
});

pool.on('error', (err) => {
  console.error('Unexpected PG pool error:', err);
});

/**
 * Run schema.sql to create all tables (idempotent).
 * Called once on startup.
 */
export async function initDB() {
  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  const sql = readFileSync(schemaPath, 'utf8');
  await pool.query(sql);
  console.log('✔ Database schema initialized');
}

export default pool;

import './env.js';
import pg from 'pg';

const { Pool } = pg;

const shouldUseSsl =
  process.env.PGSSLMODE === 'require' ||
  process.env.DATABASE_URL?.includes('supabase') ||
  process.env.DATABASE_URL?.includes('pooler.supabase');

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined
});

export function ensureDatabaseConfigured() {
  if (!process.env.DATABASE_URL) {
    const error = new Error('DATABASE_URL is not configured.');
    error.status = 500;
    throw error;
  }
}

export async function query(text, params) {
  ensureDatabaseConfigured();
  return pool.query(text, params);
}

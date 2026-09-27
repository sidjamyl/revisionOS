import postgres from 'postgres';

try { process.loadEnvFile('.env.local'); } catch { /* Containers pass DATABASE_URL directly. */ }
if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL first.');
const sql = postgres(process.env.DATABASE_URL);
try {
  await sql`CREATE EXTENSION IF NOT EXISTS vector`;
} finally {
  await sql.end();
}

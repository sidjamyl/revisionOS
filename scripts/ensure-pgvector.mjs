import postgres from 'postgres';

process.loadEnvFile('.env.local');
if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL in .env.local first.');
const sql = postgres(process.env.DATABASE_URL);
try {
  await sql`CREATE EXTENSION IF NOT EXISTS vector`;
} finally {
  await sql.end();
}

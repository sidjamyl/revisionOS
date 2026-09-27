import { drizzle } from 'drizzle-orm/postgres-js';
import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import postgres from 'postgres';
import type { ModuleData } from '../src/shared/types';

export const modules = pgTable('modules', {
  id: text('id').primaryKey(),
  data: jsonb('data').$type<ModuleData>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const documents = pgTable('documents', {
  id: text('id').primaryKey(),
  moduleId: text('module_id').notNull(),
  kind: text('kind').notNull(),
  title: text('title').notNull(),
  year: text('year'),
  path: text('path').notNull(),
  status: text('status').notNull().default('pending'),
  error: text('error'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

const connectionString = process.env.DATABASE_URL;
export const db = connectionString ? drizzle(postgres(connectionString), { schema: { modules, documents } }) : null;

import { eq } from 'drizzle-orm';
import { db, documents, modules } from './db';
import { demoModules } from './demo-data';
import type { ModuleData, SourceKind } from '../src/shared/types';

export type StoredDocument = {
  id: string;
  moduleId: string;
  kind: SourceKind;
  title: string;
  year: number | null;
  path: string;
  status: string;
  error: string | null;
};

export async function getModule(id: string): Promise<ModuleData | null> {
  if (db) {
    const [row] = await db.select().from(modules).where(eq(modules.id, id));
    if (row) return row.data;
  }
  return demoModules.find(module => module.id === id) ?? null;
}

export async function saveModule(module: ModuleData): Promise<void> {
  if (!db) throw new Error('DATABASE_URL est requis pour enregistrer un module.');
  await db.insert(modules).values({ id: module.id, data: module, updatedAt: new Date() })
    .onConflictDoUpdate({ target: modules.id, set: { data: module, updatedAt: new Date() } });
}

export async function listDocuments(moduleId: string): Promise<StoredDocument[]> {
  if (!db) return [];
  const rows = await db.select().from(documents).where(eq(documents.moduleId, moduleId));
  return rows.map(row => ({ ...row, kind: row.kind as SourceKind, year: row.year ? Number(row.year) : null }));
}

export async function getDocument(id: string): Promise<StoredDocument | null> {
  if (!db) return null;
  const [row] = await db.select().from(documents).where(eq(documents.id, id));
  return row ? { ...row, kind: row.kind as SourceKind, year: row.year ? Number(row.year) : null } : null;
}

export async function saveDocument(document: StoredDocument): Promise<void> {
  if (!db) throw new Error('DATABASE_URL est requis pour importer des documents.');
  await db.insert(documents).values({
    id: document.id, moduleId: document.moduleId, kind: document.kind,
    title: document.title, year: document.year?.toString() ?? null,
    path: document.path, status: document.status, error: document.error,
  }).onConflictDoUpdate({ target: documents.id, set: { status: document.status, error: document.error } });
}

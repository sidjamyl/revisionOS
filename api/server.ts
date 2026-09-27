import { createReadStream } from 'node:fs';
import { execFile } from 'node:child_process';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { promisify } from 'node:util';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { z } from 'zod';
import { catalog } from './catalog';
import { buildRoadmap, gradeQuiz } from './domain';
import { processDocument } from './ingestion';
import { getDocument, getModule, listDocuments, saveDocument } from './repository';
import type { SourceKind } from '../src/shared/types';

const app = Fastify({ logger: true });
const run = promisify(execFile);
await app.register(cors, { origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] });
await app.register(multipart, { limits: { fileSize: 25 * 1024 * 1024, files: 1 } });
const processingByModule = new Map<string, Promise<void>>();

// Stored paths may come from another machine (e.g. a Windows import); resolve them inside this app's .data folder.
function dataPath(path: string): string {
  const normalized = path.replaceAll('\\', '/');
  const index = normalized.lastIndexOf('/.data/');
  return index >= 0 ? join(process.cwd(), normalized.slice(index + 1)) : path;
}

function enqueueDocument(document: Parameters<typeof processDocument>[0]) {
  const previous = processingByModule.get(document.moduleId) ?? Promise.resolve();
  const current = previous.catch(() => undefined).then(() => processDocument(document)).catch(error => {
    app.log.error({ error, documentId: document.id }, 'Document processing failed unexpectedly');
  });
  processingByModule.set(document.moduleId, current);
  void current.finally(() => {
    if (processingByModule.get(document.moduleId) === current) processingByModule.delete(document.moduleId);
  });
}

app.get('/api/health', async () => ({ ok: true }));
app.get('/api/catalog', async () => catalog);

app.get<{ Params: { id: string } }>('/api/modules/:id', async (request, reply) => {
  const module = await getModule(request.params.id);
  if (!module) return reply.code(404).send({ error: 'Module introuvable.' });
  return { ...module, quiz: module.quiz.map(({ answerIndex: _answerIndex, ...question }) => question) };
});

app.get<{ Params: { id: string }; Querystring: { examDate?: string } }>('/api/modules/:id/roadmap', async (request, reply) => {
  const module = await getModule(request.params.id);
  if (!module) return reply.code(404).send({ error: 'Module introuvable.' });
  return buildRoadmap(module, request.query.examDate);
});

const answersSchema = z.object({ answers: z.record(z.string(), z.number().int().min(0).max(3)) });
app.post<{ Params: { id: string } }>('/api/modules/:id/quiz', async (request, reply) => {
  const parsed = answersSchema.safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: 'Réponses invalides.' });
  const module = await getModule(request.params.id);
  if (!module) return reply.code(404).send({ error: 'Module introuvable.' });
  return gradeQuiz(module, parsed.data.answers);
});

app.get<{ Params: { id: string } }>('/api/admin/modules/:id/documents', async (request, reply) => {
  return listDocuments(request.params.id);
});

app.get<{ Params: { id: string } }>('/api/admin/modules/:id/stats', async (request, reply) => {
  const module = await getModule(request.params.id);
  if (!module) return reply.code(404).send({ error: 'Module introuvable.' });
  return {
    occurrences: module.occurrences,
    topics: buildRoadmap(module).topics.map(({ id, title, chapter, summary, prerequisites, sources, confidence, appearanceCount, examCount, averagePoints, importance }) => ({
      id, title, chapter, summary, prerequisites, sources, confidence, appearanceCount, examCount, averagePoints, importance,
    })),
    isDemonstration: module.isDemonstration,
  };
});

app.post<{ Params: { id: string }; Querystring: { kind?: string; year?: string; title?: string } }>(
  '/api/admin/modules/:id/documents', async (request, reply) => {
    if (!await getModule(request.params.id)) return reply.code(404).send({ error: 'Module introuvable.' });
    const kind = request.query.kind;
    if (kind !== 'course' && kind !== 'td' && kind !== 'exam') return reply.code(400).send({ error: 'Type de document invalide.' });
    const year = request.query.year ? Number(request.query.year) : null;
    if (year !== null && (!Number.isInteger(year) || year < 2000 || year > 2100)) return reply.code(400).send({ error: 'Année invalide.' });
    const file = await request.file();
    if (!file) return reply.code(400).send({ error: 'PDF manquant.' });
    const bytes = await file.toBuffer();
    if (!bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))) return reply.code(400).send({ error: 'Le fichier doit être un PDF.' });
    const id = randomUUID();
    const dir = join(process.cwd(), '.data', 'uploads');
    await mkdir(dir, { recursive: true });
    const path = join(dir, `${id}.pdf`);
    await writeFile(path, bytes);
    const document = {
      id, moduleId: request.params.id, kind: kind as SourceKind,
      title: request.query.title?.trim() || file.filename,
      year, path, status: 'queued', error: null,
    };
    await saveDocument(document);
    enqueueDocument(document);
    return reply.code(202).send({ id, status: 'queued' });
  },
);

app.get<{ Params: { id: string } }>('/api/documents/:id/file', async (request, reply) => {
  const document = await getDocument(request.params.id);
  if (!document) return reply.code(404).send({ error: 'Document introuvable.' });
  reply.type('application/pdf');
  reply.header('Content-Disposition', `inline; filename="${document.id}.pdf"`);
  return reply.send(createReadStream(dataPath(document.path)));
});

app.get<{ Params: { id: string; page: string } }>('/api/documents/:id/page/:page', async (request, reply) => {
  const document = await getDocument(request.params.id);
  const page = Number(request.params.page);
  if (!document || !Number.isInteger(page) || page < 1 || page > 1000) return reply.code(404).send({ error: 'PDF page not found.' });
  const directory = join(process.cwd(), '.data', 'previews');
  const prefix = join(directory, `${document.id}-${page}`);
  const image = `${prefix}.png`;
  try { await stat(image); } catch {
    await mkdir(directory, { recursive: true });
    await run('pdftoppm', ['-f', String(page), '-l', String(page), '-r', '140', '-png', '-singlefile', dataPath(document.path), prefix], { timeout: 120_000 });
  }
  try { await stat(image); } catch { return reply.code(404).send({ error: 'PDF page not found.' }); }
  reply.type('image/png');
  reply.header('Cache-Control', 'private, max-age=86400');
  return reply.send(createReadStream(image));
});

await app.listen({ port: Number(process.env.API_PORT ?? 4000), host: process.env.API_HOST ?? '127.0.0.1' });

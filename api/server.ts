import { createReadStream } from 'node:fs';
import { access } from 'node:fs/promises';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { z } from 'zod';
import { catalog } from './demo-data';
import { buildRoadmap, gradeQuiz } from './domain';
import { processDocument } from './ingestion';
import { getDocument, getModule, listDocuments, saveDocument } from './repository';
import { localSourceFileNames } from './verified-evidence';
import type { SourceKind } from '../src/shared/types';

const app = Fastify({ logger: true });
await app.register(cors, { origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] });
await app.register(multipart, { limits: { fileSize: 25 * 1024 * 1024, files: 1 } });
const processingByModule = new Map<string, Promise<void>>();

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

function isAdmin(token: unknown): boolean {
  return Boolean(process.env.ADMIN_TOKEN) && token === `Bearer ${process.env.ADMIN_TOKEN}`;
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
  if (!isAdmin(request.headers.authorization)) return reply.code(401).send({ error: 'Accès administrateur requis.' });
  return listDocuments(request.params.id);
});

app.get<{ Params: { id: string } }>('/api/admin/modules/:id/stats', async (request, reply) => {
  if (!isAdmin(request.headers.authorization)) return reply.code(401).send({ error: 'Accès administrateur requis.' });
  const module = await getModule(request.params.id);
  if (!module) return reply.code(404).send({ error: 'Module introuvable.' });
  return {
    occurrences: module.occurrences,
    topics: buildRoadmap(module).topics.map(({ id, title, appearanceCount, examCount, averagePoints, importance }) => ({
      id, title, appearanceCount, examCount, averagePoints, importance,
    })),
    isDemonstration: module.isDemonstration,
  };
});

app.post<{ Params: { id: string }; Querystring: { kind?: string; year?: string; title?: string } }>(
  '/api/admin/modules/:id/documents', async (request, reply) => {
    if (!isAdmin(request.headers.authorization)) return reply.code(401).send({ error: 'Accès administrateur requis.' });
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
  return reply.send(createReadStream(document.path));
});

app.get<{ Params: { id: string } }>('/api/source-pdfs/:id', async (request, reply) => {
  if (!Object.hasOwn(localSourceFileNames, request.params.id)) return reply.code(404).send({ error: 'Unknown source PDF.' });
  const name = localSourceFileNames[request.params.id];
  const path = join(process.cwd(), '.data', 'imports', name);
  try {
    await access(path);
  } catch {
    return reply.redirect(`https://drive.google.com/file/d/${request.params.id}/view`);
  }
  reply.type('application/pdf');
  reply.header('Content-Disposition', `inline; filename="${name}"`);
  return reply.send(createReadStream(path));
});

await app.listen({ port: Number(process.env.API_PORT ?? 4000), host: '127.0.0.1' });

import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { eq } from 'drizzle-orm';
import { initialModules } from '../api/catalog';
import { courseChunks, db, documents, modules } from '../api/db';
import { generateQuiz, processDocument } from '../api/ingestion';
import { getDocument, getModule, saveDocument, saveModule, type StoredDocument } from '../api/repository';
import type { SourceKind } from '../src/shared/types';

if (!db) throw new Error('DATABASE_URL is required.');
const directory = join(process.cwd(), '.data', 'imports');
const names = (await readdir(directory)).filter(name => /^esi-(alg1|igl)-(course|td|exam)-.*\.pdf$/.test(name)).sort();
if (names.length !== 35) throw new Error(`Expected 35 supplied PDFs, found ${names.length}.`);

const fresh = process.argv.includes('--fresh');
if (fresh) {
  for (const module of initialModules) {
    await db.delete(courseChunks).where(eq(courseChunks.moduleId, module.id));
    await db.delete(documents).where(eq(documents.moduleId, module.id));
    await db.delete(modules).where(eq(modules.id, module.id));
    await saveModule(structuredClone(module));
  }
  console.log('Removed prior generated/manual state for the two ESI modules.');
}

const corpus: StoredDocument[] = [];
for (const name of names) {
  const path = join(directory, name);
  const bytes = await readFile(path);
  if (!bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error(`${name} is not a PDF.`);
  const [, moduleName, kindName] = name.match(/^esi-(alg1|igl)-(course|td|exam)-/) ?? [];
  const kind = kindName as SourceKind;
  corpus.push({
    id: createHash('sha256').update(bytes).digest('hex').slice(0, 24),
    moduleId: `esi-${moduleName}`,
    kind,
    title: name,
    year: null,
    path,
    status: 'queued',
    error: null,
  });
}

for (const moduleId of ['esi-alg1', 'esi-igl']) {
  console.log(`Starting ${moduleId}: ${corpus.filter(document => document.moduleId === moduleId).length} PDFs.`);
  for (const kind of ['course', 'td', 'exam'] as const) {
    for (const document of corpus.filter(item => item.moduleId === moduleId && item.kind === kind)) {
      const prior = await getDocument(document.id);
      if (prior?.status === 'complete') { console.log(`SKIP ${document.title}`); continue; }
      await saveDocument(document);
      try {
        console.log(`QWEN ${document.title}`);
        await processDocument(document);
        console.log(`DONE ${document.title}`);
      } catch (error) {
        console.error(`FAILED ${document.title}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    if (kind === 'course') {
      const module = await getModule(moduleId);
      if (module?.topics.length) {
        try { console.log(`QUIZ ${moduleId}: ${await generateQuiz(moduleId)} questions`); }
        catch (error) { console.error(`QUIZ FAILED ${moduleId}: ${error instanceof Error ? error.message : String(error)}`); }
      }
    }
  }
}

const completed = await Promise.all(corpus.map(document => getDocument(document.id)));
console.log(`Corpus complete: ${completed.filter(item => item?.status === 'complete').length}/${corpus.length} documents.`);
if (completed.some(item => item?.status !== 'complete')) process.exitCode = 1;

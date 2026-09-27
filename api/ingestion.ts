import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText } from 'ai';
import { z } from 'zod';
import { assertAcyclic } from './domain';
import { getModule, saveDocument, saveModule, type StoredDocument } from './repository';
import { indexCoursePages, retrieveCoursePages } from './retrieval';
import type { ModuleData, QuizQuestion, Source, Topic } from '../src/shared/types';

const run = promisify(execFile);
const evidence = z.object({ page: z.number().int().positive().nullable(), excerpt: z.string().max(900), confidence: z.number().min(0).max(1) });
const courseSchema = z.object({ topics: z.array(evidence.extend({
  title: z.string().min(2), chapter: z.string().min(2), summary: z.string().min(4), prerequisiteTitles: z.array(z.string()),
})).max(15) });
const matchingSchema = z.object({
  year: z.number().int().min(2000).max(2100).nullable(),
  paperPoints: z.number().positive().nullable(),
  matches: z.array(evidence.extend({
    topicId: z.string(), exercise: z.string().nullable(), question: z.string(),
    points: z.number().min(0).nullable(), exercisePoints: z.number().positive().nullable(),
  })).max(60),
});
const quizSchema = z.object({ questions: z.array(z.object({
  topicId: z.string(), prompt: z.string().min(10), options: z.tuple([z.string(), z.string(), z.string(), z.string()]), answerIndex: z.number().int().min(0).max(3),
})).min(1).max(8) });
type Page = { page: number; text: string };
type Match = z.infer<typeof matchingSchema>['matches'][number];

function model() {
  if (!process.env.AIGRID_CHAT_API_KEY) throw new Error('AIGRID_CHAT_API_KEY is required for Qwen analysis.');
  return createOpenAICompatible({
    name: 'aigrid-chat', baseURL: process.env.AIGRID_BASE_URL ?? 'https://app.ai-grid.io/v1', apiKey: process.env.AIGRID_CHAT_API_KEY,
  }).chatModel(process.env.AIGRID_CHAT_MODEL ?? 'Qwen/Qwen3.8-27B');
}

async function qwen<T extends z.ZodTypeAny>(document: StoredDocument, key: string, schema: T, system: string, prompt: string): Promise<z.infer<T>> {
  const directory = join(process.cwd(), '.data', 'analysis', document.id);
  const cachePath = join(directory, `${key}.json`);
  try { return schema.parse(JSON.parse(await readFile(cachePath, 'utf8'))); } catch { /* Incomplete cache: ask Qwen. */ }
  // The AIGrid endpoint ignores JSON response formats, so the JSON is read from plain text. Each attempt gets its own timeout.
  let parsed: z.infer<T> | undefined;
  let lastError: unknown;
  for (let attempt = 0; attempt < 2 && parsed === undefined; attempt++) {
    try {
      const { text: raw, finishReason } = await generateText({
        model: model(), system, maxOutputTokens: 12_000, abortSignal: AbortSignal.timeout(420_000), providerOptions: { aigridChat: { chat_template_kwargs: { enable_thinking: false } } },
        prompt: `/no_think\n${prompt}\nReturn only the requested JSON object. No Markdown or explanation. Reply with a compact valid JSON object beginning with { and ending with }.`,
      });
      // Drop any leaked reasoning block, and raw control characters that OCR excerpts put inside JSON strings.
      const text = raw.replace(/<think>[\s\S]*?(<\/think>|$)/g, '').replace(/[\u0000-\u001f]+/g, ' ');
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start < 0 || end <= start) throw new Error(`Qwen returned no JSON for ${document.title}, ${key} (finish: ${finishReason}, ${raw.length} chars).`);
      try { parsed = schema.parse(JSON.parse(text.slice(start, end + 1))); }
      catch (error) { throw new Error(`Invalid Qwen JSON for ${document.title}, ${key} (finish: ${finishReason}, ${raw.length} chars): ${error instanceof Error ? error.message.slice(0, 200) : String(error)}`); }
    } catch (error) { lastError = error; }
  }
  if (parsed === undefined) throw lastError;
  await mkdir(directory, { recursive: true });
  await writeFile(cachePath, JSON.stringify(parsed));
  return parsed;
}

async function ocrPage(document: StoredDocument, page: number): Promise<string> {
  const directory = join(process.cwd(), '.data', 'ocr');
  await mkdir(directory, { recursive: true });
  const prefix = join(directory, `${document.id}-${page}`);
  const cached = `${prefix}.txt`;
  try { return await readFile(cached, 'utf8'); } catch { /* OCR has not run yet. */ }
  await run('pdftoppm', ['-f', String(page), '-l', String(page), '-r', '80', '-gray', '-png', '-singlefile', document.path, prefix], { timeout: 120_000 });
  const { stdout } = await run('powershell.exe', [
    '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', join(process.cwd(), 'scripts', 'ocr-page.ps1'), `${prefix}.png`,
  ], { timeout: 90_000, maxBuffer: 4 * 1024 * 1024 });
  const text = stdout.trim();
  await writeFile(cached, text);
  return text;
}

async function pdfPages(document: StoredDocument, bytes: Buffer): Promise<Page[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(bytes), useSystemFonts: true }).promise;
  const pages: Page[] = [];
  for (let page = 1; page <= pdf.numPages; page++) {
    const content = await (await pdf.getPage(page)).getTextContent();
    const extracted = content.items.map(item => 'str' in item ? item.str : '').join(' ').trim();
    pages.push({ page, text: extracted.length >= 80 ? extracted : await ocrPage(document, page) });
  }
  await pdf.cleanup();
  return pages;
}

function groups(pages: Page[]): Page[][] {
  const result: Page[][] = [];
  let group: Page[] = [];
  let length = 0;
  for (const page of pages.filter(item => item.text.trim().length > 10)) {
    if (group.length && (group.length >= 12 || length + page.text.length > 7_500)) { result.push(group); group = []; length = 0; }
    group.push(page); length += page.text.length;
  }
  if (group.length) result.push(group);
  return result;
}

function context(pages: Page[]): string {
  return pages.map(({ page, text }) => `[PDF page ${page}]\n${text.slice(0, 10_000)}`).join('\n\n');
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function source(document: StoredDocument, page: number | null, excerpt: string, extra: Partial<Source> = {}): Source {
  return { id: randomUUID(), kind: document.kind, title: document.title, page, excerpt, url: `/api/documents/${document.id}/file`, year: document.year, ...extra };
}

function confidence(value: number, page: number | null, excerpt: string, pages: Page[]): number {
  const body = pages.find(item => item.page === page)?.text;
  return body && normalize(excerpt).length >= 12 && normalize(body).includes(normalize(excerpt).slice(0, 30)) ? value : Math.min(value, 0.4);
}

async function analyzeCourseGroup(document: StoredDocument, pages: Page[], key: string): Promise<z.infer<typeof courseSchema>['topics']> {
  try {
    const output = await qwen(document, `course-${key}`, courseSchema,
      'Extract granular study concepts from the supplied course pages. A concept is narrower than a chapter. Identify only prerequisites taught in this module. Use English for titles and summaries; preserve source quotes in their original language.',
      `Document: ${document.title}. Return {"topics":[{"title":"...","chapter":"...","summary":"...","prerequisiteTitles":[],"page":1,"excerpt":"exact short quote","confidence":0.8}]}. Use the actual PDF page labels below. Include at most 10 distinct concepts.\n${context(pages)}`);
    return output.topics;
  } catch (error) {
    if (pages.length === 1) throw error;
    const middle = Math.ceil(pages.length / 2);
    return [...await analyzeCourseGroup(document, pages.slice(0, middle), `${key}-a`), ...await analyzeCourseGroup(document, pages.slice(middle), `${key}-b`)];
  }
}

function mergeTopics(module: ModuleData, document: StoredDocument, pages: Page[], extracted: z.infer<typeof courseSchema>['topics']): void {
  const merged = new Map(module.topics.map(topic => [topic.id, structuredClone(topic)]));
  const byTitle = new Map(module.topics.map(topic => [normalize(topic.title), topic.id]));
  for (const item of extracted) if (!byTitle.has(normalize(item.title))) byTitle.set(normalize(item.title), randomUUID());
  for (const item of extracted) {
    const id = byTitle.get(normalize(item.title))!;
    const old = merged.get(id);
    merged.set(id, {
      id, title: item.title, chapter: item.chapter, summary: item.summary,
      prerequisites: old?.prerequisites ?? [],
      sources: [...old?.sources ?? [], source(document, item.page, item.excerpt)],
      confidence: confidence(item.confidence, item.page, item.excerpt, pages),
    });
  }
  for (const item of extracted) {
    const topic = merged.get(byTitle.get(normalize(item.title))!)!;
    for (const title of item.prerequisiteTitles) {
      const id = byTitle.get(normalize(title));
      if (!id || id === topic.id || topic.prerequisites.includes(id)) continue;
      topic.prerequisites.push(id);
      try { assertAcyclic([...merged.values()]); } catch { topic.prerequisites.pop(); }
    }
  }
  module.topics = [...merged.values()];
}

async function analyzeQuestionGroup(document: StoredDocument, pages: Page[], key: string, module: ModuleData): Promise<z.infer<typeof matchingSchema>[]> {
  try {
    const relevant = await retrieveCoursePages(module.id, context(pages));
    const queryWords = new Set(normalize(context(pages)).split(/[^a-z0-9]+/).filter(word => word.length >= 4));
    const candidates = module.topics.map(topic => ({
      topic,
      score: topic.sources.some(source => relevant.some(page => source.url === `/api/documents/${page.documentId}/file` && source.page === page.page)) ? 100 : 0,
      words: normalize(topic.title).split(/[^a-z0-9]+/).filter(word => word.length >= 4),
    })).map(item => ({ ...item, score: item.score + item.words.filter(word => queryWords.has(word)).length * 5 }))
      .sort((a, b) => b.score - a.score).slice(0, 40).map(item => item.topic);
    const courseContext = relevant.map(item => item.content).join('\n').slice(0, 2_000);
    const output = await qwen(document, `questions-${key}`, matchingSchema,
      `Match every exercise subquestion to ONE primary topic ID from this module. Valid topics: ${candidates.map(topic => `${topic.id}: ${topic.title}`).join('; ')}. Do not duplicate points across topics. An exercise total is not the paper total.`,
      `Document: ${document.title} (${document.kind}). Return {"year":2024,"paperPoints":20,"matches":[{"topicId":"valid-id","exercise":"Exercise 1","question":"1a","points":null,"exercisePoints":5,"page":1,"excerpt":"exact short quote","confidence":0.8}]}. Use null for values not printed. For TD, year, paperPoints and points are null. Include every subquestion once. Read the PDF pages below. Related course text (context only): ${courseContext}\n${context(pages)}`);
    return [output];
  } catch (error) {
    if (pages.length === 1) throw error;
    const middle = Math.ceil(pages.length / 2);
    return [...await analyzeQuestionGroup(document, pages.slice(0, middle), `${key}-a`, module), ...await analyzeQuestionGroup(document, pages.slice(middle), `${key}-b`, module)];
  }
}

export function estimateMissingExamPoints(matches: Match[]): Array<Match & { estimatedPoints: boolean }> {
  const groups = new Map<string, Match[]>();
  for (const match of matches) {
    const key = `${match.exercise ?? 'unknown'}:${match.exercisePoints ?? 'unknown'}`;
    groups.set(key, [...groups.get(key) ?? [], match]);
  }
  return matches.map(match => {
    if (match.points !== null || match.exercisePoints === null) return { ...match, estimatedPoints: false };
    const group = groups.get(`${match.exercise ?? 'unknown'}:${match.exercisePoints}`) ?? [];
    const missing = group.filter(item => item.points === null);
    const stated = group.reduce((sum, item) => sum + (item.points ?? 0), 0);
    return { ...match, points: missing.length ? Math.max(0, match.exercisePoints - stated) / missing.length : null, estimatedPoints: true };
  });
}

export async function generateQuiz(moduleId: string): Promise<number> {
  const module = await getModule(moduleId);
  if (!module || module.topics.length === 0) throw new Error(`No Qwen topics available for ${moduleId}.`);
  const document: StoredDocument = { id: `${moduleId}-quiz`, moduleId, title: `${module.title} level check`, kind: 'course', path: '', year: null, status: 'processing', error: null };
  const result = await qwen(document, 'quiz', quizSchema,
    'Write a short, basic diagnostic quiz from the listed course concepts. Each question has exactly four options and one unambiguous correct answer.',
    `Return {"questions":[{"topicId":"valid-id","prompt":"...","options":["...","...","...","..."],"answerIndex":0}]}. Write exactly 7 questions in English, covering different topics. Valid topics: ${module.topics.map(topic => `${topic.id}: ${topic.title} — ${topic.summary}`).join('; ')}`);
  const ids = new Set(module.topics.map(topic => topic.id));
  module.quiz = result.questions.filter(question => ids.has(question.topicId)).map((question): QuizQuestion => ({ id: randomUUID(), ...question }));
  await saveModule(module);
  return module.quiz.length;
}

export async function processDocument(document: StoredDocument): Promise<void> {
  try {
    await saveDocument({ ...document, status: 'processing', error: null });
    const module = await getModule(document.moduleId);
    if (!module) throw new Error('Unknown module.');
    const bytes = await readFile(document.path);
    const pages = await pdfPages(document, bytes);
    if (document.kind === 'course') {
      const extracted: z.infer<typeof courseSchema>['topics'] = [];
      for (const [index, group] of groups(pages).entries()) extracted.push(...await analyzeCourseGroup(document, group, String(index)));
      if (extracted.length === 0) throw new Error('Qwen extracted no course topics.');
      mergeTopics(module, document, pages, extracted);
      await indexCoursePages(module.id, document.id, pages.map(page => page.text));
    } else {
      if (module.topics.length === 0) throw new Error('Course topics must be processed before TDs and exams.');
      const results: z.infer<typeof matchingSchema>[] = [];
      for (const page of pages.filter(item => item.text.trim().length > 10)) results.push(...await analyzeQuestionGroup(document, [page], String(page.page), module));
      const matches = results.flatMap(result => result.matches);
      if (matches.length === 0) throw new Error('Qwen matched no questions.');
      const topics = new Map(module.topics.map(topic => [topic.id, topic]));
      const year = results.find(result => result.year !== null)?.year ?? 0;
      const paperPoints = results.find(result => result.paperPoints !== null)?.paperPoints ?? null;
      let linkedCount = 0;
      for (const match of document.kind === 'exam' ? estimateMissingExamPoints(matches) : matches.map(item => ({ ...item, estimatedPoints: false }))) {
        const topic = topics.get(match.topicId);
        if (!topic) continue;
        linkedCount++;
        const linked = source(document, match.page, match.excerpt, { question: match.question, points: match.points, estimatedPoints: match.estimatedPoints, year });
        topic.sources.push(linked);
        if (document.kind === 'exam') module.occurrences.push({
          examId: document.id, year, topicId: topic.id, points: match.points, totalPoints: paperPoints,
          question: match.question, sourceId: linked.id, estimatedPoints: match.estimatedPoints,
        });
      }
      if (linkedCount === 0) throw new Error('Qwen returned no valid topic IDs for this document.');
    }
    module.updatedAt = new Date().toISOString();
    module.isDemonstration = false;
    await saveModule(module);
    await saveDocument({ ...document, status: 'complete', error: null });
  } catch (error) {
    await saveDocument({ ...document, status: 'failed', error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

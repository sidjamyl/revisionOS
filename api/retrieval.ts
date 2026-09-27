import { randomUUID } from 'node:crypto';
import { google } from '@ai-sdk/google';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { embed, embedMany } from 'ai';
import { cosineDistance, eq } from 'drizzle-orm';
import { courseChunks, db } from './db';

const dimensions = 768;

function embeddingConfig() {
  if (process.env.AI_PROVIDER === 'ollama') {
    if (!process.env.OLLAMA_EMBEDDING_MODEL) throw new Error('Set OLLAMA_EMBEDDING_MODEL to a 768-dimensional embedding model.');
    return {
      model: createOpenAICompatible({ name: 'ollama', baseURL: process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434/v1' }).embeddingModel(process.env.OLLAMA_EMBEDDING_MODEL),
    };
  }
  return {
    model: google.embeddingModel(process.env.GOOGLE_EMBEDDING_MODEL ?? 'gemini-embedding-001'),
    providerOptions: { google: { outputDimensionality: dimensions } },
  };
}

function assertDimensions(embedding: number[]) {
  if (embedding.length !== dimensions) throw new Error(`Embedding has ${embedding.length} dimensions; expected ${dimensions}.`);
}

export async function indexCoursePages(moduleId: string, documentId: string, pages: string[]): Promise<number> {
  if (!db) throw new Error('DATABASE_URL is required for semantic retrieval.');
  const entries = pages.map((content, index) => ({ page: index + 1, content: content.trim().slice(0, 3_500) }))
    .filter(entry => entry.content.length >= 80);
  await db.delete(courseChunks).where(eq(courseChunks.documentId, documentId));
  const config = embeddingConfig();
  try {
    for (let index = 0; index < entries.length; index += 20) {
      const batch = entries.slice(index, index + 20);
      const { embeddings } = await embedMany({ ...config, values: batch.map(entry => entry.content) });
      if (embeddings.length !== batch.length) throw new Error('The embedding model returned an incomplete batch.');
      await db.insert(courseChunks).values(batch.map((entry, offset) => {
        assertDimensions(embeddings[offset]);
        return { id: randomUUID(), moduleId, documentId, ...entry, embedding: embeddings[offset] };
      }));
    }
  } catch (error) {
    await db.delete(courseChunks).where(eq(courseChunks.documentId, documentId));
    throw error;
  }
  return entries.length;
}

export async function retrieveCoursePages(moduleId: string, questionText: string) {
  if (!db || questionText.trim().length < 80) return [];
  const [available] = await db.select({ id: courseChunks.id }).from(courseChunks)
    .where(eq(courseChunks.moduleId, moduleId)).limit(1);
  if (!available) return [];
  const { embedding } = await embed({ ...embeddingConfig(), value: questionText.slice(0, 3_500) });
  assertDimensions(embedding);
  return db.select({ documentId: courseChunks.documentId, page: courseChunks.page, content: courseChunks.content })
    .from(courseChunks).where(eq(courseChunks.moduleId, moduleId))
    .orderBy(cosineDistance(courseChunks.embedding, embedding)).limit(6);
}

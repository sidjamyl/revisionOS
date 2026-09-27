import { randomUUID } from 'node:crypto';
import { google } from '@ai-sdk/google';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { embed, embedMany } from 'ai';
import { and, cosineDistance, eq } from 'drizzle-orm';
import { courseChunks, db } from './db';

const dimensions = 3584;

function embeddingConfig() {
  if (process.env.AI_PROVIDER === 'aigrid') {
    const id = process.env.AIGRID_EMBED_MODEL ?? 'Alibaba-NLP/gte-Qwen2-7B-instruct';
    if (!process.env.AIGRID_EMBED_API_KEY) throw new Error('AIGRID_EMBED_API_KEY is required for indexing.');
    return {
      id,
      model: createOpenAICompatible({ name: 'aigrid-embeddings', baseURL: process.env.AIGRID_BASE_URL ?? 'https://app.ai-grid.io/v1', apiKey: process.env.AIGRID_EMBED_API_KEY }).embeddingModel(id),
    };
  }
  if (process.env.AI_PROVIDER === 'ollama') {
    if (!process.env.OLLAMA_EMBEDDING_MODEL) throw new Error('Set OLLAMA_EMBEDDING_MODEL before importing.');
    return {
      id: `ollama:${process.env.OLLAMA_EMBEDDING_MODEL}`,
      model: createOpenAICompatible({ name: 'ollama', baseURL: process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434/v1' }).embeddingModel(process.env.OLLAMA_EMBEDDING_MODEL),
    };
  }
  return {
    id: `google:${process.env.GOOGLE_EMBEDDING_MODEL ?? 'gemini-embedding-001'}`,
    model: google.embeddingModel(process.env.GOOGLE_EMBEDDING_MODEL ?? 'gemini-embedding-001'),
    providerOptions: { google: { outputDimensionality: 768 } },
  };
}

function storedEmbedding(embedding: number[]): number[] {
  if (embedding.length > dimensions || embedding.length === 0) throw new Error(`Embedding has ${embedding.length} dimensions; maximum is ${dimensions}.`);
  // ponytail: zero-padding preserves cosine within one model; keep model IDs separate if providers change.
  return embedding.length === dimensions ? embedding : [...embedding, ...Array(dimensions - embedding.length).fill(0)];
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
        return { id: randomUUID(), moduleId, documentId, ...entry, embeddingModel: config.id, embedding: storedEmbedding(embeddings[offset]) };
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
  const config = embeddingConfig();
  const [available] = await db.select({ id: courseChunks.id }).from(courseChunks)
    .where(and(eq(courseChunks.moduleId, moduleId), eq(courseChunks.embeddingModel, config.id))).limit(1);
  if (!available) return [];
  const { embedding } = await embed({ ...config, value: questionText.slice(0, 3_500) });
  return db.select({ documentId: courseChunks.documentId, page: courseChunks.page, content: courseChunks.content })
    .from(courseChunks).where(and(eq(courseChunks.moduleId, moduleId), eq(courseChunks.embeddingModel, config.id)))
    .orderBy(cosineDistance(courseChunks.embedding, storedEmbedding(embedding))).limit(6);
}

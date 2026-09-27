import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

process.loadEnvFile('.env.local');

if (!process.env.ADMIN_TOKEN) throw new Error('Set ADMIN_TOKEN in .env.local first.');
if (process.env.AI_PROVIDER === 'ollama' ? !process.env.OLLAMA_MODEL : !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error('Configure the chosen AI model in .env.local before importing the corpus.');
}

const baseUrl = `http://127.0.0.1:${process.env.API_PORT ?? 4000}`;
const directory = join(process.cwd(), '.data', 'imports');
const requestedModule = process.argv[2];
if (requestedModule && !['esi-alg1', 'esi-igl'].includes(requestedModule)) {
  throw new Error('Optional module must be esi-alg1 or esi-igl.');
}

async function api(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}`, ...options.headers },
  });
  if (!response.ok) throw new Error(`${response.status} ${path}: ${await response.text()}`);
  return response.json();
}

const names = (await readdir(directory)).filter(name => /^esi-(alg1|igl)-(course|td|exam)-.*\.pdf$/.test(name)).sort();
if (names.length === 0) throw new Error(`No corpus PDFs found in ${directory}.`);

for (const moduleId of ['esi-alg1', 'esi-igl']) {
  if (requestedModule && requestedModule !== moduleId) continue;
  const existing = await api(`/api/admin/modules/${moduleId}/documents`);
  for (const name of names.filter(name => name.startsWith(`${moduleId}-`))) {
    if (existing.some(document => document.title === name && document.status !== 'failed')) {
      console.log(`Already submitted: ${name}`);
      continue;
    }
    const kind = name.slice(moduleId.length + 1).split('-')[0];
    const form = new FormData();
    form.append('file', new Blob([await readFile(join(directory, name))], { type: 'application/pdf' }), name);
    const result = await api(`/api/admin/modules/${moduleId}/documents?kind=${kind}`, { method: 'POST', body: form });
    console.log(`Queued: ${name} (${result.id})`);
  }
}

console.log('Uploads are asynchronous. Review status and point attribution in the admin workspace.');

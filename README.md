# RevisionOS

RevisionOS helps Algerian university students decide **what to revise first**. The student chooses a module, answers a seven-question knowledge check, then explores an interactive prerequisite graph. Every concept can link to its course passage, TD exercise and past-exam question. Students can mark concepts as mastered.

The UI is in English. Academic PDFs may be in English, French or another language; source excerpts keep their original language.

## Current state

- Working student flow for ESI Algebra 1 and Introduction to Software Engineering (IGL).
- The two ESI modules are rebuilt only from Qwen analysis of the team's 35 PDFs. No hand-authored topics, dependencies, exam matches, or quiz questions are shipped.
- Open `/admin` audit workspace: document status, extracted concepts, prerequisites, source excerpts, exam occurrences, frequency, average points and final priority score. It intentionally has no sign-in in this MVP.
- A PostgreSQL document store with pgvector course-page indexing. TD and exam matching retrieves related course passages before assigning a primary concept. When an exam prints an exercise total but not its subquestion marks, the remaining total is split evenly and visibly treated as an estimate.
- Corpus processing is resumable. Import status and failures are shown in the admin workspace; do not describe a module as complete until all its documents are marked complete.

The original academic PDFs are excluded from Git. Cited pages open from the ignored local corpus through the API, including an embedded PDF preview at the cited page. Download the corpus on the demo host.

## Start locally

Requires Node.js 24+, npm and Docker. Run from the repository root:

```powershell
npm ci
docker compose up -d db
npm run db:push
Copy-Item .env.example .env.local
```

In `.env.local`, set `AI_PROVIDER=aigrid` with `AIGRID_CHAT_API_KEY` and `AIGRID_EMBED_API_KEY` to use AIGrid's `Qwen/Qwen3.8-27B` generation model and `Alibaba-NLP/gte-Qwen2-7B-instruct` embedding model (3584 dimensions). Google and Ollama remain supported alternatives. Never commit `.env.local`.

Then run:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the student flow and [http://localhost:3000/admin](http://localhost:3000/admin) for imports and point inspection. The Fastify API listens on `127.0.0.1:4000`.

To download the 35 shared PDFs into the ignored `.data/imports/` directory, run `powershell -NoProfile -File scripts/download-drive-resources.ps1`. The script verifies each PDF signature. Scanned pages are OCRed locally before Qwen reads their text; the selected Qwen model is text-only, so OCR accuracy should be inspected in the admin view.

Once the model and database are configured, run `node --env-file-if-exists=.env.local node_modules/tsx/dist/cli.mjs scripts/rebuild-corpus.ts --fresh` to replace the two ESI modules with a Qwen-only import. The `--fresh` flag removes their previous generated state; omit it to resume after an interruption. This invokes Qwen for every PDF and the embedding model for course pages and may incur API costs.

## Checks

```powershell
npm run typecheck
npm test
npm run build
```

## Data and scoring

The module graph is a within-module DAG; cycles and references to missing concepts are rejected. The short quiz marks only correctly answered concepts as mastered. Untested concepts remain unknown.

Each exam subquestion is assigned one primary concept for points. The priority score is `60% × appearance frequency + 40% × mean known point share`. Unknown points count toward appearance frequency but not toward the average. Multiple subquestions for the same concept are summed within an exam. The graph highlights up to ten high-priority concepts and all their prerequisites, narrowing to six high-priority concepts within 14 days of an exam. There is no daily timetable.

## Boundaries

Student contributions are UI-only in this version. The demo catalog also lists other Algerian programs, but they remain disabled until their sources are integrated. There is no login system in the MVP, including the admin route. Student progress is stored in browser local storage and is not synchronized between devices.

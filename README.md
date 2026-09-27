# RevisionOS

RevisionOS helps Algerian university students decide **what to revise first**. The student chooses a module, answers a seven-question knowledge check, then explores an interactive prerequisite graph. Every concept can link to its course passage, TD exercise and past-exam question. Students can mark concepts as mastered.

The UI is in English. Academic PDFs may be in English, French or another language; source excerpts keep their original language.

## Current state

- Working student flow for ESI Algebra 1 and Introduction to Software Engineering (IGL).
- Source-backed **preview** with verified passages from team-provided PDFs and selected exam questions. It is not a complete analysis of the 35-document corpus. The UI labels its priorities provisional.
- Admin upload endpoint and workspace, with asynchronous PDF analysis through Vercel AI SDK. Gemini receives the original PDF, including scans and diagrams; Ollama currently receives extracted text and rejects image-only PDFs.
- A PostgreSQL document store. The Docker image includes pgvector, reserved for semantic retrieval; vector indexing is **not yet implemented**. The current AI flow is PDF-grounded extraction and matching, not full vector RAG.
- The complete AI flow is **not verified** until an API key or compatible local model is supplied. Import failures are shown explicitly in the admin workspace.

The original academic PDFs are excluded from Git. The preview links to their [shared Drive folder](https://drive.google.com/drive/folders/1x1c97ZiqCHsZHAytwxOpztiUz6jO_x06). Keep its reader access enabled for a public demo.

## Start locally

Requires Node.js 24+, npm and Docker. Run from the repository root:

```powershell
npm ci
docker compose up -d db
npm run db:push
Copy-Item .env.example .env.local
```

In `.env.local`, set `ADMIN_TOKEN` to a long random value. To analyze documents, set either `GOOGLE_GENERATIVE_AI_API_KEY` with `AI_PROVIDER=google`, or `AI_PROVIDER=ollama` plus a compatible `OLLAMA_MODEL`. Never commit `.env.local`.

Then run:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the student flow and [http://localhost:3000/admin](http://localhost:3000/admin) for imports and point inspection. The Fastify API listens on `127.0.0.1:4000`.

To download the 35 shared PDFs into the ignored `.data/imports/` directory for local inspection, run `powershell -NoProfile -File scripts/download-drive-resources.ps1`. The script verifies each file starts with the PDF signature. Do not infer exam year from its folder or filename: some supplied files are mislabeled or contain more than one paper.

Once the model is configured and the API is running, queue those local PDFs with `node scripts/import-drive-resources.mjs`. Pass `esi-alg1` or `esi-igl` to import one module at a time. The importer skips documents already queued or completed; inspect failures and inferred years in the admin workspace. This invokes the model for every uploaded PDF and may incur API costs.

## Checks

```powershell
npm run typecheck
npm test
npm run build
```

## Data and scoring

The module graph is a within-module DAG; cycles and references to missing concepts are rejected. The short quiz marks only correctly answered concepts as mastered. Untested concepts remain unknown.

Each exam subquestion is assigned one primary concept for points. The priority score is `60% × appearance frequency + 40% × mean known point share`. Unknown points count toward appearance frequency but not toward the average. Multiple subquestions for the same concept are summed within an exam. Near an exam (14 days or less), the graph highlights a smaller, higher-priority set and all its prerequisites. There is no daily timetable.

The preview currently uses three Algebra exam papers with unknown subquestion points and two IGL papers whose individual barèmes sum to 20 points each. It does not extrapolate from the remaining papers until they are processed and reviewed.

## Boundaries

Only admins can upload documents. Student contributions are UI-only in this version. The demo catalog also lists other Algerian programs, but they remain disabled until their sources are integrated. There is no login system; the admin area is protected by the local bearer token. Student progress is stored in browser local storage and is not synchronized between devices.

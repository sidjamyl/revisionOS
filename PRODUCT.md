# RevisionOS

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js, TypeScript, shadcn/ui, React Flow, Fastify, PostgreSQL with pgvector, Drizzle ORM, and Vercel AI SDK. Gemini and a locally hosted model through Ollama are candidate providers. Guepard is excluded.

## Users

The primary users are Algerian university students preparing for exams, including new students and students who struggle to decide what to revise. Administrators maintain the source documents and academic catalog.

## Product Purpose

Show students which concepts to revise within a module, why those concepts matter, and which prerequisites to learn first. A short level test runs before the graph is generated. Students explore an interactive concept graph, open cited course passages and related TD or past exam questions, and mark concepts as mastered.

## Positioning

Revision priorities are grounded in the module's course material, TDs, and past exams, with visible prerequisites and source evidence for each concept.

## Operating Context

The MVP uses Algebra 1 and Introduction to Software Engineering (IGL) from ESI when the team supplies their documents. The catalog may contain other verified Algerian university programs, but full document processing initially targets those two modules. Students select institution, program, year, specialty when relevant, and module before a brief level test. The examination date changes the emphasis of high frequency and high point concepts without creating a daily schedule.

## Capabilities and Constraints

- Administrators add PDF courses, TDs, and past exams. PDF pages may contain images, so extraction needs a model that can inspect visual content.
- Course chapters are fragmented into concepts. The only graph relation in the MVP is `prerequisite of`, within one module and without cycles. Independent concepts are valid.
- The extraction and matching stages run automatically. Every concept and dependency retains its source document, page, and supporting excerpt when available; low confidence results remain visibly uncertain.
- Exam matching works at question or subquestion level. A question has one primary concept for point attribution and may link to other concepts without duplicating points.
- Exam priority uses historical appearance frequency and average available points. Unknown point values still count as appearances. Recency of a topic's last appearance is not a ranking factor.
- A short module test asks six to eight questions. Untested concepts remain `unknown` rather than being marked unmastered.
- The graph keeps all concepts visible. As the exam approaches, it highlights an essential route through prerequisites and historically important concepts.
- Students can mark a concept mastered. Student content contributions appear only as a coherent future feature in the frontend; they do not write data in this MVP.
- The demo uses source code, presentation, and a 90 second video. User supplied academic documents have not yet arrived.

## Evidence on Hand

No course, TD, or past exam PDF has been provided yet. Sample academic content must be labeled as demonstration data until it is replaced with supplied or verified public material.

## Product Principles

- Every recommendation should have an inspectable reason and source.
- Keep the student flow short: choose a module, answer a brief test, explore the graph.
- Show uncertainty honestly when documents or extracted points are incomplete.
- Favor one working study flow over speculative learning features.

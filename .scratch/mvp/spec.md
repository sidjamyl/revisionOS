# MVP implementation tracker

Status: active

## Completed

- [x] English student onboarding and seven-question checks for Algebra 1 and IGL.
- [x] Interactive prerequisite graph, priority route, per-concept evidence and local mastery state.
- [x] Admin PDF upload API and statistics view; PostgreSQL persistence.
- [x] Source-backed preview from selected pages of the 35 team-provided PDFs; originals stay outside Git.
- [x] Manually checked two 20-point IGL papers (2018 and 2023), with one primary topic per scored question.
- [x] Local corpus importer, gated on a configured model, for all 35 PDFs.
- [x] pgvector schema and course-page retrieval path for grounding TD/exam matching (not yet model-tested).
- [x] Whitelisted local PDF delivery for page-specific citations, with public Drive fallback.
- [x] Unit checks for the DAG, score aggregation and quiz semantics.

## Remaining before a full corpus-backed demo

- [ ] Configure the team's multimodal model credentials in ignored `.env.local`.
- [ ] Run and inspect automatic extraction/matching for the entire corpus, correcting processing defects.
- [ ] Verify vector embedding/retrieval with the selected model and inspect retrieved passages.
- [ ] Validate all point attributions and ambiguous exam years, especially scanned papers.
- [ ] Record and review the 90-second demo after the app is stable.

## Notes

The frontend is English. Resources may be multilingual. No Guepard dependency. Student uploads and graph-editing stay in V2.

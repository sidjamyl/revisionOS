import assert from 'node:assert/strict';
import test from 'node:test';
import { assertAcyclic, buildRoadmap, gradeQuiz } from '../api/domain';
import { demoModules } from '../api/demo-data';
import type { ModuleData, Topic } from '../src/shared/types';

function topic(id: string, prerequisites: string[] = []): Topic {
  return { id, title: id, chapter: 'Test', summary: id, prerequisites, sources: [], confidence: 1 };
}

test('rejects cycles and missing prerequisites, but accepts independent concepts', () => {
  assert.doesNotThrow(() => assertAcyclic([topic('a'), topic('b')]));
  assert.throws(() => assertAcyclic([topic('a', ['b']), topic('b', ['a'])]), /circulaire/);
  assert.throws(() => assertAcyclic([topic('a', ['missing'])]), /inconnu/);
});

test('aggregates subquestion points per topic and exam, without treating unknown points as zero', () => {
  const module: ModuleData = {
    ...demoModules[0], topics: [topic('a'), topic('b')], quiz: [],
    occurrences: [
      { examId: 'one', year: 2023, topicId: 'a', points: 2, totalPoints: 20, question: '1a', sourceId: null },
      { examId: 'one', year: 2023, topicId: 'a', points: 3, totalPoints: 20, question: '1b', sourceId: null },
      { examId: 'two', year: 2024, topicId: 'a', points: null, totalPoints: 20, question: '2a', sourceId: null },
      { examId: 'two', year: 2024, topicId: 'b', points: 4, totalPoints: 20, question: '2b', sourceId: null },
    ],
  };
  const roadmap = buildRoadmap(module);
  const a = roadmap.topics.find(item => item.id === 'a')!;
  assert.equal(a.appearanceCount, 2);
  assert.equal(a.examCount, 2);
  assert.equal(a.averagePoints, 5);
  assert.equal(a.importance, 70);
});

test('includes prerequisites in the essential route', () => {
  const module: ModuleData = {
    ...demoModules[0], topics: [topic('base'), topic('advanced', ['base']), topic('other')], quiz: [],
    occurrences: [{ examId: 'one', year: 2025, topicId: 'advanced', points: 10, totalPoints: 20, question: 'Q', sourceId: null }],
  };
  const roadmap = buildRoadmap(module, '2026-09-29');
  assert.equal(roadmap.topics.find(item => item.id === 'advanced')?.essential, true);
  assert.equal(roadmap.topics.find(item => item.id === 'base')?.essential, true);
  assert.equal(roadmap.topics.find(item => item.id === 'other')?.essential, false);
});

test('grades answered concepts without marking untested concepts mastered', () => {
  const result = gradeQuiz(demoModules[0], { 'alg-q1': 1 });
  assert.deepEqual(result.masteredTopicIds, ['alg-logic']);
  assert.equal(result.attempted, 1);
});

test('IGL 2023 evidence accounts for the full 20-point paper exactly once', () => {
  const module = demoModules.find(item => item.id === 'esi-igl')!;
  const earlier = module.occurrences.filter(item => item.examId === 'igl-2018');
  assert.equal(earlier.reduce((sum, item) => sum + (item.points ?? 0), 0), 20);
  const questions = module.occurrences.filter(item => item.examId === 'igl-2023');
  assert.equal(questions.length, 21);
  assert.equal(questions.reduce((sum, item) => sum + (item.points ?? 0), 0), 20);
  assert.equal(new Set(questions.map(item => item.question)).size, questions.length);
  assert.equal(new Set(module.occurrences.map(item => item.examId)).size, 2);
});

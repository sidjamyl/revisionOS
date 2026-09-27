import assert from 'node:assert/strict';
import test from 'node:test';
import { initialModules } from '../api/catalog';
import { assertAcyclic, buildRoadmap, gradeQuiz } from '../api/domain';
import { estimateMissingExamPoints } from '../api/ingestion';
import type { ModuleData, Topic } from '../src/shared/types';

function topic(id: string, prerequisites: string[] = []): Topic {
  return { id, title: id, chapter: 'Test', summary: id, prerequisites, sources: [], confidence: 1 };
}

function module(topics: Topic[], occurrences: ModuleData['occurrences'] = [], quiz: ModuleData['quiz'] = []): ModuleData {
  return { ...structuredClone(initialModules[0]), topics, occurrences, quiz };
}

test('ships no hand-authored topics, exam matches, or quiz questions', () => {
  assert.deepEqual(initialModules.map(item => item.id), ['esi-alg1', 'esi-igl']);
  for (const item of initialModules) {
    assert.equal(item.topics.length, 0);
    assert.equal(item.occurrences.length, 0);
    assert.equal(item.quiz.length, 0);
  }
});

test('rejects cycles and missing prerequisites, but accepts independent concepts', () => {
  assert.doesNotThrow(() => assertAcyclic([topic('a'), topic('b')]));
  assert.throws(() => assertAcyclic([topic('a', ['b']), topic('b', ['a'])]), /circulaire/);
  assert.throws(() => assertAcyclic([topic('a', ['missing'])]), /inconnu/);
});

test('aggregates subquestion points per topic and exam, without treating unknown points as zero', () => {
  const roadmap = buildRoadmap(module([topic('a'), topic('b')], [
    { examId: 'one', year: 2023, topicId: 'a', points: 2, totalPoints: 20, question: '1a', sourceId: null },
    { examId: 'one', year: 2023, topicId: 'a', points: 3, totalPoints: 20, question: '1b', sourceId: null },
    { examId: 'two', year: 2024, topicId: 'a', points: null, totalPoints: 20, question: '2a', sourceId: null },
    { examId: 'two', year: 2024, topicId: 'b', points: 4, totalPoints: 20, question: '2b', sourceId: null },
  ]));
  const a = roadmap.topics.find(item => item.id === 'a')!;
  assert.equal(a.appearanceCount, 2);
  assert.equal(a.examCount, 2);
  assert.equal(a.averagePoints, 5);
  assert.equal(a.importance, 70);
});

test('includes prerequisites in the essential route and nothing without exam evidence', () => {
  const topics = [topic('base'), topic('advanced', ['base']), topic('other')];
  const roadmap = buildRoadmap(module(topics, [{ examId: 'one', year: 2025, topicId: 'advanced', points: 10, totalPoints: 20, question: 'Q', sourceId: null }]), '2026-09-29');
  assert.equal(roadmap.topics.find(item => item.id === 'advanced')?.essential, true);
  assert.equal(roadmap.topics.find(item => item.id === 'base')?.essential, true);
  assert.equal(buildRoadmap(module(topics)).topics.some(item => item.essential), false);
});

test('grades answered concepts without marking untested concepts mastered', () => {
  const quiz = [
    { id: 'q1', topicId: 'a', prompt: 'Question one?', options: ['1', '2', '3', '4'] as [string, string, string, string], answerIndex: 1 },
    { id: 'q2', topicId: 'b', prompt: 'Question two?', options: ['1', '2', '3', '4'] as [string, string, string, string], answerIndex: 2 },
  ];
  const result = gradeQuiz(module([topic('a'), topic('b')], [], quiz), { q1: 1 });
  assert.deepEqual(result.masteredTopicIds, ['a']);
  assert.equal(result.attempted, 1);
});

test('splits an exercise total between subquestions whose point values are not printed', () => {
  const match = (question: string, points: number | null) => ({ page: 1, excerpt: question, confidence: 1, topicId: question, exercise: 'Exercise 2', question, points, exercisePoints: 12 });
  const estimated = estimateMissingExamPoints([match('2a', 6), match('2b', null), match('2c', null)]);
  assert.deepEqual(estimated.map(item => item.points), [6, 3, 3]);
  assert.deepEqual(estimated.map(item => item.estimatedPoints), [false, true, true]);
});

test('overview graph keeps key concepts and condenses prerequisites through hidden ones', async () => {
  const { compactTopics } = await import('../src/lib/compact-graph');
  const topics = [topic('base'), topic('hidden', ['base']), topic('key', ['hidden']), topic('other')];
  const roadmap = buildRoadmap(module(topics, [{ examId: 'one', year: 2025, topicId: 'key', points: 10, totalPoints: 20, question: 'Q', sourceId: null }]));
  const compact = compactTopics(roadmap.topics, 2);
  assert.deepEqual(compact.map(item => item.id).sort(), ['base', 'key']);
  assert.deepEqual(compact.find(item => item.id === 'key')?.prerequisites, ['base']);
  assert.equal(compact.find(item => item.id === 'key')?.layer, 1);
});

test('narrows the priority route as the exam gets closer', () => {
  const topics = Array.from({ length: 12 }, (_, index) => topic(`t${index}`));
  const occurrences = topics.map((item, index) => ({ examId: 'one', year: 2025, topicId: item.id, points: index + 1, totalPoints: 100, question: `Q${index}`, sourceId: null }));
  const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
  const essential = (date?: string) => buildRoadmap(module(topics, occurrences), date).topics.filter(item => item.essential).length;
  assert.equal(essential(), 10);
  assert.equal(essential(inDays(10)), 6);
  assert.equal(essential(inDays(5)), 4);
  assert.equal(essential(inDays(1)), 2);
});

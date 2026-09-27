import type { ExamOccurrence, ModuleData, Roadmap, RoadmapTopic, Topic } from '../src/shared/types';

export function assertAcyclic(topics: Topic[]): void {
  const byId = new Map(topics.map(topic => [topic.id, topic]));
  if (byId.size !== topics.length) throw new Error('Identifiants de notions dupliqués.');
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(id: string): void {
    if (visiting.has(id)) throw new Error(`Dépendance circulaire détectée autour de « ${id} ».`);
    if (visited.has(id)) return;
    const topic = byId.get(id);
    if (!topic) throw new Error(`Prérequis inconnu : ${id}.`);
    visiting.add(id);
    for (const prerequisite of topic.prerequisites) visit(prerequisite);
    visiting.delete(id);
    visited.add(id);
  }

  for (const topic of topics) visit(topic.id);
}

export function buildRoadmap(module: ModuleData, examDate?: string): Roadmap {
  assertAcyclic(module.topics);
  const byId = new Map(module.topics.map(topic => [topic.id, topic]));
  const examIds = new Set(module.occurrences.map(item => item.examId));
  const examCount = examIds.size;
  const examDays = parseExamDays(examDate);
  const layerCache = new Map<string, number>();

  function layer(id: string): number {
    const cached = layerCache.get(id);
    if (cached !== undefined) return cached;
    const topic = byId.get(id)!;
    const value = topic.prerequisites.length === 0 ? 0 : 1 + Math.max(...topic.prerequisites.map(layer));
    layerCache.set(id, value);
    return value;
  }

  const topics: RoadmapTopic[] = module.topics.map(topic => {
    const appearances = module.occurrences.filter(item => item.topicId === topic.id);
    const appearanceCount = new Set(appearances.map(item => item.examId)).size;
    const withPoints = appearances.filter(item => item.points !== null);
    const averagePoints = withPoints.length === 0
      ? null
      : withPoints.reduce((sum, item) => sum + item.points!, 0) / withPoints.length;
    const frequency = examCount === 0 ? 0 : appearanceCount / examCount;
    const pointsShare = withPoints.length === 0
      ? 0
      : withPoints.reduce((sum, item) => sum + item.points! / item.totalPoints, 0) / withPoints.length;
    return {
      ...topic,
      layer: layer(topic.id),
      importance: Math.round(100 * (0.6 * frequency + 0.4 * pointsShare)),
      essential: false,
      appearanceCount,
      examCount,
      averagePoints,
    };
  });

  const ranked = [...topics].sort((a, b) => b.importance - a.importance || a.layer - b.layer);
  const fraction = examDays !== null && examDays <= 14 ? 0.4 : 0.65;
  const essentialIds = new Set<string>();
  const selected = examCount === 0 ? ranked : ranked.slice(0, Math.max(1, Math.ceil(ranked.length * fraction)));
  function includePrerequisites(id: string): void {
    if (essentialIds.has(id)) return;
    essentialIds.add(id);
    for (const prerequisite of byId.get(id)!.prerequisites) includePrerequisites(prerequisite);
  }
  for (const topic of selected) includePrerequisites(topic.id);
  for (const topic of topics) topic.essential = essentialIds.has(topic.id);

  return {
    module: {
      id: module.id,
      title: module.title,
      institution: module.institution,
      program: module.program,
      level: module.level,
      isDemonstration: module.isDemonstration,
      updatedAt: module.updatedAt,
    },
    topics: topics.sort((a, b) => a.layer - b.layer || b.importance - a.importance),
    examDays,
    isDemonstration: module.isDemonstration,
  };
}

function parseExamDays(value?: string): number | null {
  if (!value) return null;
  const parsed = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(parsed.valueOf())) return null;
  return Math.max(0, Math.ceil((parsed.valueOf() - Date.now()) / 86_400_000));
}

export function gradeQuiz(module: ModuleData, answers: Record<string, number>) {
  const results = module.quiz.map(question => ({
    questionId: question.id,
    topicId: question.topicId,
    correct: answers[question.id] === question.answerIndex,
    answerIndex: question.answerIndex,
  }));
  return {
    results,
    masteredTopicIds: results.filter(result => result.correct).map(result => result.topicId),
    attempted: results.filter(result => answers[result.questionId] !== undefined).length,
  };
}

export function matchPrimaryTopic(occurrence: ExamOccurrence, topics: Topic[]) {
  return topics.some(topic => topic.id === occurrence.topicId);
}

import type { RoadmapTopic } from '@/shared/types';

// Overview graph: keeps the key concepts and condenses prerequisite paths through the hidden ones.
export function compactTopics(topics: RoadmapTopic[], limit = 12): RoadmapTopic[] {
  const byId = new Map(topics.map(topic => [topic.id, topic]));
  const dependents = new Map<string, number>();
  const ancestors = (id: string, seen = new Set<string>()): Set<string> => {
    for (const prerequisite of byId.get(id)?.prerequisites ?? []) {
      if (seen.has(prerequisite) || !byId.has(prerequisite)) continue;
      seen.add(prerequisite);
      ancestors(prerequisite, seen);
    }
    return seen;
  };
  const ancestry = new Map(topics.map(topic => [topic.id, ancestors(topic.id)]));
  for (const found of ancestry.values()) for (const id of found) dependents.set(id, (dependents.get(id) ?? 0) + 1);

  // Targets: the most exam-relevant concepts (or the deepest ones before exams are processed).
  const targets = [...topics].sort((a, b) =>
    b.importance - a.importance || Number(b.essential) - Number(a.essential) || ancestry.get(b.id)!.size - ancestry.get(a.id)!.size,
  ).slice(0, Math.ceil(limit / 2));
  // Foundations: the prerequisites shared by the most targets, so the overview stays a connected route.
  const coverage = new Map<string, number>();
  for (const target of targets) for (const id of ancestry.get(target.id)!) coverage.set(id, (coverage.get(id) ?? 0) + 1);
  const targetIds = new Set(targets.map(topic => topic.id));
  const foundations = [...coverage.keys()].filter(id => !targetIds.has(id))
    .sort((a, b) => coverage.get(b)! - coverage.get(a)! || (dependents.get(b) ?? 0) - (dependents.get(a) ?? 0) || byId.get(b)!.importance - byId.get(a)!.importance)
    .slice(0, limit - targets.length).map(id => byId.get(id)!);
  const chosen = new Set([...targets, ...foundations].map(topic => topic.id));
  const filler = [...topics].filter(topic => !chosen.has(topic.id))
    .sort((a, b) => b.importance - a.importance || (dependents.get(b.id) ?? 0) - (dependents.get(a.id) ?? 0))
    .slice(0, limit - chosen.size);
  const key = [...targets, ...foundations, ...filler];
  const kept = new Set(key.map(topic => topic.id));

  // Nearest kept prerequisites, walking through hidden concepts.
  const direct = new Map<string, Set<string>>();
  for (const topic of key) {
    const found = new Set<string>();
    const seen = new Set<string>();
    const stack = [...topic.prerequisites];
    while (stack.length) {
      const id = stack.pop()!;
      if (seen.has(id) || !byId.has(id)) continue;
      seen.add(id);
      if (kept.has(id)) found.add(id);
      else stack.push(...byId.get(id)!.prerequisites);
    }
    direct.set(topic.id, found);
  }

  // Transitive reduction: drop an edge already implied by a longer path.
  const reach = (from: string, target: string, seen = new Set<string>()): boolean => {
    for (const id of direct.get(from) ?? []) {
      if (id === target) return true;
      if (!seen.has(id)) { seen.add(id); if (reach(id, target, seen)) return true; }
    }
    return false;
  };
  const prerequisites = new Map(key.map(topic => {
    const candidates = [...direct.get(topic.id)!];
    return [topic.id, candidates.filter(id => !candidates.some(other => other !== id && reach(other, id)))];
  }));

  const layers = new Map<string, number>();
  const layer = (id: string): number => {
    if (!layers.has(id)) {
      const parents = prerequisites.get(id) ?? [];
      layers.set(id, parents.length ? 1 + Math.max(...parents.map(layer)) : 0);
    }
    return layers.get(id)!;
  };
  return key.map(topic => ({ ...topic, prerequisites: prerequisites.get(topic.id)!, layer: layer(topic.id) }))
    .sort((a, b) => a.layer - b.layer || b.importance - a.importance);
}

import type { RoadmapTopic } from '@/shared/types';

export type Chapter = { id: string; title: string; topicIds: string[]; prerequisites: string[]; links: Record<string, number>; layer: number };

const generic = /^(definitions?|theorem|proposition|lemma|corollary|remarks?|examples?|properties|some properties|introduction|summary|conclusion|exercises?|proof|notation|proposition-definition)\b/i;

function clean(value: string): string {
  return (value.split('|').at(-1) ?? value)
    .replace(/^\s*(chapter|chapitre|section|lesson|leçon|part|partie|principle|principe)\s*[\divxlc]*\s*[,:.\-–]?\s*/i, '')
    .replace(/^[\d.\s]+/, '')
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// "esi-alg1-course-polynomials.pdf" -> "Polynomials"; "esi-igl-course-02-modeling.pdf" -> "Modeling"
function documentName(topic: RoadmapTopic): string {
  const title = topic.sources.find(source => source.kind === 'course')?.title ?? 'Other concepts';
  const name = title.replace(/\.pdf$/i, '').replace(/^.*-course-/, '').replace(/^\d+-/, '').replace(/[-_]+/g, ' ');
  return titleCase(name.trim() || 'Other concepts');
}

/** Groups concepts into readable chapters and links chapters that depend on each other. */
export function chapterGraph(topics: RoadmapTopic[]): { chapters: Chapter[]; chapterOf: Map<string, string> } {
  // 1. Normalised chapter label, falling back to the course document for numbered or generic labels.
  const label = new Map<string, string>();
  for (const topic of topics) {
    const cleaned = clean(topic.chapter);
    label.set(topic.id, cleaned.length < 3 || generic.test(cleaned) ? documentName(topic) : titleCase(cleaned));
  }
  const byKey = new Map<string, { title: string; ids: string[] }>();
  for (const topic of topics) {
    const title = label.get(topic.id)!;
    const key = title.toLowerCase().replace(/s\b/g, '');
    byKey.set(key, { title: byKey.get(key)?.title ?? title, ids: [...byKey.get(key)?.ids ?? [], topic.id] });
  }
  // 2. Small chapters join their course document's chapter; the size floor rises until at most 16 bubbles remain.
  const byId = new Map(topics.map(topic => [topic.id, topic]));
  let groups = new Map<string, { title: string; ids: string[] }>();
  for (let minimum = 3; minimum <= topics.length; minimum++) {
    groups = new Map();
    for (const group of byKey.values()) {
      for (const id of group.ids) {
        const title = group.ids.length >= minimum ? group.title : documentName(byId.get(id)!);
        const key = title.toLowerCase().replace(/s\b/g, '');
        groups.set(key, { title: groups.get(key)?.title ?? title, ids: [...groups.get(key)?.ids ?? [], id] });
      }
    }
    if (groups.size <= 16) break;
  }
  const chapterOf = new Map<string, string>();
  for (const [key, group] of groups) for (const id of group.ids) chapterOf.set(id, key);

  // 3. Chapter links, weighted by the number of concept-level prerequisites crossing them.
  const weight = new Map<string, number>();
  for (const topic of topics) for (const prerequisite of topic.prerequisites) {
    const from = chapterOf.get(prerequisite);
    const to = chapterOf.get(topic.id)!;
    if (from && from !== to) weight.set(`${from}>${to}`, (weight.get(`${from}>${to}`) ?? 0) + 1);
  }
  // Keep the dominant direction of a two-way link, then drop links that close a cycle.
  const edges = [...weight].filter(([key, count]) => { const [from, to] = key.split('>'); const back = weight.get(`${to}>${from}`) ?? 0; return count > back || (count === back && from < to); })
    .sort((a, b) => b[1] - a[1]);
  const parents = new Map<string, Set<string>>([...groups.keys()].map(key => [key, new Set<string>()]));
  const reaches = (from: string, target: string, seen = new Set<string>()): boolean => {
    if (from === target) return true;
    for (const parent of parents.get(from) ?? []) if (!seen.has(parent)) { seen.add(parent); if (reaches(parent, target, seen)) return true; }
    return false;
  };
  const links = new Map<string, Record<string, number>>();
  for (const [key, count] of edges) {
    const [from, to] = key.split('>');
    if (reaches(from, to)) continue;
    parents.get(to)!.add(from);
    links.set(to, { ...links.get(to), [from]: count });
  }
  // Transitive reduction keeps the chapter map readable.
  const reduced = new Map([...parents].map(([key, set]) => [key, [...set].filter(id => ![...set].some(other => other !== id && reaches(other, id)))]));

  const layers = new Map<string, number>();
  const layer = (key: string): number => {
    if (!layers.has(key)) { const list = reduced.get(key) ?? []; layers.set(key, list.length ? 1 + Math.max(...list.map(layer)) : 0); }
    return layers.get(key)!;
  };
  const chapters = [...groups].map(([key, group]) => ({ id: key, title: group.title, topicIds: group.ids, prerequisites: reduced.get(key) ?? [], links: links.get(key) ?? {}, layer: layer(key) }))
    .sort((a, b) => a.layer - b.layer || b.topicIds.length - a.topicIds.length);
  return { chapters, chapterOf };
}

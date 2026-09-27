'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { ReactFlow, Background, BackgroundVariant, Handle, Panel, useReactFlow, MarkerType, Position, useNodesState, type Edge, type Node, type NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, ArrowRight, BookOpenText, CalendarDays, Check, CheckCircle2, CircleHelp, ExternalLink, FileText, LoaderCircle, Maximize2, Minimize2, Minus, Plus, RotateCcw, Scan, X } from 'lucide-react';
import { AppHeader, Brand, Kicker } from '@/components/brand';
import { Button, buttonVariants } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PdfPreview } from '@/components/pdf-preview';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { chapterGraph, type Chapter } from '@/lib/chapter-graph';
import { compactTopics } from '@/lib/compact-graph';
import { countdownLabel, examDateFor, roadmapUrl, setExamDate } from '@/lib/profile';
import { cn } from '@/lib/utils';
import type { ModuleData, Roadmap, RoadmapTopic, Source } from '@/shared/types';

type PublicModule = Omit<ModuleData, 'quiz'> & { quiz: Omit<ModuleData['quiz'][number], 'answerIndex'>[] };
type TopicNodeData = { topic: RoadmapTopic; mastered: boolean; tested: boolean; selected: boolean };
type FlowTopicNode = Node<TopicNodeData, 'topic'>;
type FlowNode = FlowTopicNode | FlowChapterNode;

function TopicNode({ data }: NodeProps<FlowTopicNode>) {
  const { topic, mastered, tested, selected } = data;
  const status = mastered ? 'Mastered' : !tested ? 'Not tested' : topic.essential ? 'Priority' : 'To review';
  return <div className={cn('w-52 rounded-[10px] border bg-white p-4 text-left shadow-[0_1px_2px_rgba(28,27,33,0.04),0_2px_8px_rgba(28,27,33,0.04)] transition-shadow', selected ? 'border-2 border-[#ed8139] shadow-[0_0_0_4px_rgba(237,129,57,0.14),0_6px_18px_rgba(237,129,57,0.16)]' : mastered ? 'border-[#d5e8d9] bg-[#f4faf5]' : topic.essential ? 'border-[#eab83e]' : 'border-[#e4e0db]', topic.confidence < 0.6 && !selected && 'border-dashed')}>
    <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-0 !bg-[#cfcac3]"/>
    <div className="flex items-center gap-2 text-xs font-bold"><span className={cn('h-2 w-2 shrink-0 rounded-full', mastered ? 'bg-[#57b279]' : !tested ? 'border border-[#cfcac3]' : topic.essential ? 'bg-[#eab83e]' : 'bg-[#7c8798]')}/><span className={mastered ? 'text-[#346d4a]' : !tested ? 'text-[#56606f]' : topic.essential ? 'text-[#7a5a00]' : 'text-[#56606f]'}>{status}</span>{topic.confidence < 0.6 && <span className="ml-auto text-[10px] text-[#646269]">Check source</span>}</div>
    <p className="mt-2 text-base font-bold leading-5 text-[#1c1b21]">{topic.title}</p>
    <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-[#646269]"><span><b className="block text-xs text-[#1c1b21]">{topic.appearanceCount}/{topic.examCount}</b>frequency</span><span><b className="block text-xs text-[#1c1b21]">{topic.averagePoints === null ? '—' : topic.averagePoints.toFixed(1)}</b>avg pts</span><span><b className="block text-xs text-[#1c1b21]">{topic.importance}</b>score</span></div>
    <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-0 !bg-[#cfcac3]"/>
  </div>;
}

type ChapterNodeData = { chapter: Chapter; topics: RoadmapTopic[]; mastered: Set<string> };
type FlowChapterNode = Node<ChapterNodeData, 'chapter'>;

// A chapter bubble: click it to open the concept graph inside.
function ChapterNode({ data }: NodeProps<FlowChapterNode>) {
  const { chapter, topics, mastered } = data;
  const done = topics.filter(topic => mastered.has(topic.id)).length;
  const priority = topics.filter(topic => topic.essential && !mastered.has(topic.id)).length;
  return <div className={cn('group w-[260px] cursor-pointer rounded-[22px] border bg-white/95 p-5 text-left shadow-[0_1px_2px_rgba(28,27,33,0.04),0_8px_24px_rgba(28,27,33,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(28,27,33,0.12)]', priority ? 'border-[#eab83e]/70' : 'border-[#e4e0db]')}>
    <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-0 !bg-[#cfcac3]"/>
    <div className="flex items-center justify-between gap-2"><span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#646269]">Chapter</span>{priority > 0 && <span className="rounded-full bg-[#fdf3dc] px-2 py-0.5 text-[11px] font-semibold text-[#7a5a00]">{priority} priority</span>}</div>
    <p className="mt-2 text-[17px] font-bold leading-snug tracking-tight text-[#1c1b21]">{chapter.title}</p>
    <div className="mt-3 flex flex-wrap gap-1" aria-hidden="true">{topics.slice(0, 40).map(topic => <i key={topic.id} className={cn('size-2 rounded-full', mastered.has(topic.id) ? 'bg-[#57b279]' : topic.essential ? 'bg-[#eab83e]' : 'bg-[#dcd8d3]')}/>)}{topics.length > 40 && <span className="text-[10px] leading-2 text-[#646269]">+{topics.length - 40}</span>}</div>
    <div className="mt-4 flex items-center justify-between text-xs text-[#646269]"><span><b className="text-[#1c1b21]">{topics.length}</b> concepts · <b className="text-[#1c1b21]">{done}</b> mastered</span><span className="font-semibold text-[#965935] opacity-0 transition-opacity group-hover:opacity-100">Open →</span></div>
    <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-0 !bg-[#cfcac3]"/>
  </div>;
}

function chapterElements(chapters: Chapter[], topics: RoadmapTopic[], mastered: Set<string>): { nodes: FlowChapterNode[]; edges: Edge[] } {
  const byId = new Map(topics.map(topic => [topic.id, topic]));
  const columns = 4;
  const rows = new Map<number, Chapter[]>();
  for (const chapter of chapters) rows.set(chapter.layer, [...rows.get(chapter.layer) ?? [], chapter]);
  const nodes: FlowChapterNode[] = [];
  let y = 0;
  for (const layer of [...rows.keys()].sort((a, b) => a - b)) {
    const row = rows.get(layer)!;
    row.forEach((chapter, index) => {
      const inRow = Math.min(columns, row.length - Math.floor(index / columns) * columns);
      nodes.push({ id: chapter.id, type: 'chapter', position: { x: (index % columns) * 300 + (columns - inRow) * 150, y: y + Math.floor(index / columns) * 230 }, data: { chapter, topics: chapter.topicIds.map(id => byId.get(id)!).filter(Boolean), mastered }, draggable: true });
    });
    y += Math.ceil(row.length / columns) * 230 + 70;
  }
  const edges: Edge[] = chapters.flatMap(chapter => chapter.prerequisites.map(prerequisite => {
    const weight = chapter.links[prerequisite] ?? 1;
    return { id: `${prerequisite}-${chapter.id}`, source: prerequisite, target: chapter.id, type: 'smoothstep', label: `${weight} link${weight === 1 ? '' : 's'}`,
      labelStyle: { fontSize: 11, fill: '#646269' }, labelBgStyle: { fill: '#fcfcfc' }, style: { stroke: '#eea973', strokeWidth: Math.min(4, 1.5 + weight * 0.4) }, markerEnd: { type: MarkerType.ArrowClosed, color: '#eea973' } };
  }));
  return { nodes, edges };
}

// Concepts of one chapter, keeping only the prerequisite links inside it.
function chapterTopics(topics: RoadmapTopic[], chapter: Chapter): RoadmapTopic[] {
  const ids = new Set(chapter.topicIds);
  const inside = topics.filter(topic => ids.has(topic.id)).map(topic => ({ ...topic, prerequisites: topic.prerequisites.filter(id => ids.has(id)) }));
  const byId = new Map(inside.map(topic => [topic.id, topic]));
  const layers = new Map<string, number>();
  const layer = (id: string): number => {
    if (!layers.has(id)) { const parents = byId.get(id)!.prerequisites; layers.set(id, parents.length ? 1 + Math.max(...parents.map(layer)) : 0); }
    return layers.get(id)!;
  };
  return inside.map(topic => ({ ...topic, layer: layer(topic.id) })).sort((a, b) => a.layer - b.layer || b.importance - a.importance);
}

const nodeTypes = { topic: TopicNode, chapter: ChapterNode };

// Faster than the default 1.2x step: each click zooms by 1.6x.
function ZoomControls() {
  const flow = useReactFlow();
  const zoom = (factor: number) => flow.zoomTo(Math.min(2, Math.max(0.2, flow.getZoom() * factor)), { duration: 160 });
  const buttonClass = 'grid size-9 place-items-center bg-white text-[#1c1b21] hover:bg-[#f7f7f8]';
  return <Panel position="bottom-left" className="flex flex-col divide-y overflow-hidden rounded-[10px] border bg-white shadow-xs">
    <button className={buttonClass} onClick={() => zoom(1.6)} aria-label="Zoom in"><Plus size={16}/></button>
    <button className={buttonClass} onClick={() => zoom(1 / 1.6)} aria-label="Zoom out"><Minus size={16}/></button>
    <button className={buttonClass} onClick={() => flow.fitView({ padding: 0.15, duration: 200 })} aria-label="Fit graph"><Scan size={15}/></button>
  </Panel>;
}

function graphElements(topics: RoadmapTopic[], mastered: Set<string>, tested: Set<string>, selectedId: string | null, compact = false): { nodes: FlowTopicNode[]; edges: Edge[] } {
  const columns = compact ? 4 : 6;
  const prerequisites = new Set(topics.flatMap(topic => topic.prerequisites));
  const independent = topics.filter(topic => topic.prerequisites.length === 0 && !prerequisites.has(topic.id));
  const connected = topics.filter(topic => !independent.includes(topic));
  const counts = new Map<number, number>();
  const offsets = new Map<number, number>();
  let nextY = 0;
  for (const layer of [...new Set(connected.map(topic => topic.layer))].sort((a, b) => a - b)) {
    offsets.set(layer, nextY);
    nextY += Math.ceil(connected.filter(topic => topic.layer === layer).length / columns) * 180 + 90;
  }
  // Standalone concepts sit beside the connected layers: one column in the detailed view, a compact grid in the overview.
  const connectedWidth = (compact ? columns : Math.min(columns, Math.max(0, ...[...offsets.keys()].map(layer => connected.filter(topic => topic.layer === layer).length)))) * 240;
  const standaloneColumns = compact ? 3 : 1;
  const nodes: FlowTopicNode[] = topics.map(topic => {
    const standaloneIndex = independent.findIndex(item => item.id === topic.id);
    const index = counts.get(topic.layer) ?? 0;
    if (standaloneIndex < 0) counts.set(topic.layer, index + 1);
    const position = standaloneIndex >= 0 ? { x: (compact ? connectedWidth : columns * 240) + 80 + (standaloneIndex % standaloneColumns) * 240, y: Math.floor(standaloneIndex / standaloneColumns) * 180 } : { x: (index % columns) * 240 + (compact ? (columns - Math.min(columns, connected.filter(item => item.layer === topic.layer).length - Math.floor(index / columns) * columns)) * 120 : 0), y: (offsets.get(topic.layer) ?? 0) + Math.floor(index / columns) * 180 };
    return { id: topic.id, type: 'topic', position, data: { topic, mastered: mastered.has(topic.id), tested: tested.has(topic.id), selected: selectedId === topic.id }, draggable: true };
  });
  const edges: Edge[] = topics.flatMap(topic => topic.prerequisites.map(prerequisite => ({
    id: `${prerequisite}-${topic.id}`, source: prerequisite, target: topic.id,
    type: 'smoothstep', animated: false, style: { stroke: topic.essential ? '#eea973' : '#cfcac3', strokeWidth: topic.essential ? 2 : 1.5, strokeDasharray: topic.essential ? undefined : '4 4' },
    markerEnd: { type: MarkerType.ArrowClosed, color: topic.essential ? '#eea973' : '#cfcac3' },
  })));
  return { nodes, edges };
}

function sourceLabel(source: Source) {
  return source.kind === 'course' ? 'Course' : source.kind === 'td' ? 'TD' : source.kind === 'exam' ? 'Exam' : 'Syllabus';
}

function TopicDetails({ topic, module, mastered, onToggle, onPreview }: { topic: RoadmapTopic; module: PublicModule; mastered: boolean; onToggle: () => void; onPreview: (source: Source) => void }) {
  const occurrences = module.occurrences.filter(item => item.topicId === topic.id);
  const sources = [...topic.sources].sort((a, b) => ({ course: 0, syllabus: 1, td: 2, exam: 3 })[a.kind] - ({ course: 0, syllabus: 1, td: 2, exam: 3 })[b.kind]);
  const dependents = module.topics.filter(item => item.prerequisites.includes(topic.id)).map(item => item.title);
  const examReason = topic.examCount === 0 ? 'No past exam has been mapped yet.' : topic.appearanceCount === 0 ? 'No question in the mapped papers directly tests it.' : `Appears in ${topic.appearanceCount} of ${topic.examCount} reviewed exams${topic.averagePoints === null ? '; points are not verified.' : `, worth ${topic.averagePoints.toFixed(1)} known points on average.`}`;
  return <aside className="min-w-0 border-t border-[#e4e0db] bg-white p-5 lg:border-l lg:border-t-0 lg:p-6">
    <div className="flex flex-wrap items-center gap-2"><Badge>{topic.chapter}</Badge>{mastered ? <Badge className="bg-[#f4faf5] text-[#346d4a]">Mastered</Badge> : topic.essential && <Badge className="bg-[#fdf5d4] text-[#7a5a00]">Priority</Badge>}{topic.confidence < 0.6 && <Badge className="bg-[#fbebe9] text-[#b8322c]">Needs verification</Badge>}</div>
    <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-[#1c1b21]">{topic.title}</h2>
    <p className="mt-3 text-sm leading-6 text-[#4a4951]">{topic.summary}</p>
    <div className="mt-5 rounded-[10px] bg-[#f6f5f1] p-3 text-sm leading-6 text-[#4a4951]"><strong className="text-[#1c1b21]">Why this concept?</strong> {examReason}{topic.essential && dependents.length > 0 && ` It is a prerequisite for ${dependents.slice(0, 2).join(' and ')}${dependents.length > 2 ? ' and others' : ''}.`}</div>
    <Button className="mt-5 w-full" variant={mastered ? 'secondary' : 'default'} onClick={onToggle}>{mastered ? <><Check size={17}/> Mastered · undo</> : <><CheckCircle2 size={17}/> Mark as mastered</>}</Button>
    {topic.prerequisites.length > 0 && <div className="mt-7"><h3 className="text-sm font-bold">Learn first</h3><p className="mt-2 text-sm leading-6 text-[#646269]">{topic.prerequisites.map(id => module.topics.find(item => item.id === id)?.title ?? id).join(' · ')}</p></div>}
    <div className="mt-7"><h3 className="flex items-center gap-2 text-sm font-bold"><BookOpenText size={16} className="text-[#965935]"/> Sources and exercises</h3>
      {sources.length === 0 && <p className="mt-3 text-sm text-[#7e929b]">No linked passage yet.</p>}
      <div className="mt-3 space-y-3">{sources.map(source => <div key={source.id} className="rounded-[10px] bg-[#f6f5f1] p-3"><div className="flex items-center justify-between gap-2"><Badge className="bg-white text-[#4a4951]">{sourceLabel(source)}{source.page ? ` · p. ${source.page}` : ''}</Badge><div className="flex items-center gap-3"><button className="text-xs font-bold text-[#965935] hover:underline" onClick={() => onPreview(source)}>Preview</button>{source.url && <a className="text-[#965935] hover:underline" href={`${source.url}${source.page ? `#page=${source.page}` : ''}`} target="_blank" rel="noreferrer" aria-label={`Open ${source.title}`}><ExternalLink size={16}/></a>}</div></div><p className="mt-2 text-xs font-semibold text-[#1c1b21]">{source.title}</p><p className="mt-1 text-xs leading-5 text-[#646269]">{source.excerpt}</p>{source.question && <p className="mt-2 text-xs text-[#4a4951]">Question: {source.question}</p>}</div>)}</div>
    </div>
    {occurrences.length > 0 && <div className="mt-7"><h3 className="flex items-center gap-2 text-sm font-bold"><FileText size={16} className="text-[#2b907e]"/> Past exam history</h3><div className="mt-3 space-y-2">{occurrences.map((item, index) => <div key={`${item.examId}-${index}`} className="flex justify-between gap-3 border-b border-[#edf1f2] py-2 text-xs"><span className="text-[#647e8a]">{item.year || 'Unknown year'} · {item.question}</span><strong className="shrink-0 text-[#173654]">{item.points === null ? 'points unknown' : `${item.points} pt`}</strong></div>)}</div></div>}
  </aside>;
}

export default function ModulePage() {
  const { id } = useParams<{ id: string }>();
  const [module, setModule] = useState<PublicModule | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [quizIndex, setQuizIndex] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [mastered, setMastered] = useState<Set<string>>(new Set());
  const [tested, setTested] = useState<Set<string>>(new Set());
  const [quizDone, setQuizDone] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [previewSource, setPreviewSource] = useState<Source | null>(null);
  const [focus, setFocus] = useState(false);
  const [view, setView] = useState<'overview' | 'detailed'>('overview');
  const [examDay, setExamDay] = useState('');
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [chapterId, setChapterId] = useState<string | null>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setFocus(window.localStorage.getItem('revisionos:focus:graph') === 'true'); }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { if (previewSource) setPreviewSource(null); else setFocus(false); }
      if (event.key.toLowerCase() === 'f' && !(event.target instanceof HTMLInputElement)) setFocus(previous => !previous);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [previewSource]);
  useEffect(() => { window.localStorage.setItem('revisionos:focus:graph', String(focus)); }, [focus]);
  useEffect(() => { if (window.localStorage.getItem('revisionos:graph-view') === 'detailed') setView('detailed'); }, []);
  function changeExamDate(date: string) {
    setExamDate(id, date); setExamDay(date);
    fetch(roadmapUrl(id)).then(response => response.json() as Promise<Roadmap>).then(setRoadmap).catch(() => undefined);
  }
  function changeView(next: 'overview' | 'detailed') { setView(next); setSelectedId(null); setChapterId(null); window.localStorage.setItem('revisionos:graph-view', next); }

  useEffect(() => {
    if (selectedId && window.innerWidth < 1024) {
      detailsRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    } else if (selectedId) {
      detailsRef.current?.scrollTo(0, 0);
    }
  }, [selectedId]);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('examDate');
    if (fromUrl) setExamDate(id, fromUrl);
    setExamDay(examDateFor(id) ?? '');
    Promise.all([
      fetch(`/api/modules/${id}`).then(response => { if (!response.ok) throw new Error('Module not found.'); return response.json() as Promise<PublicModule>; }),
      fetch(roadmapUrl(id)).then(response => response.json() as Promise<Roadmap>),
    ]).then(([loaded, map]) => {
      setModule(loaded); setRoadmap(map);
      const saved = window.localStorage.getItem(`revisionos:qwen:${id}`);
      if (saved) { const progress = JSON.parse(saved) as { mastered: string[]; tested?: string[]; quizDone: boolean }; const topicIds = new Set(map.topics.map(topic => topic.id)); setMastered(new Set(progress.mastered.filter(topicId => topicIds.has(topicId)))); setTested(new Set((progress.tested ?? []).filter(topicId => topicIds.has(topicId)))); setQuizDone(progress.quizDone); }
    }).catch(cause => setError(cause instanceof Error ? cause.message : 'Unable to load this module.'));
  }, [id]);

  const persist = useCallback((next: Set<string>, done: boolean, nextTested = tested) => {
    setMastered(next); setTested(nextTested); setQuizDone(done);
    window.localStorage.setItem(`revisionos:qwen:${id}`, JSON.stringify({ mastered: [...next], tested: [...nextTested], quizDone: done }));
  }, [id, tested]);

  async function finishQuiz(submitted = answers) {
    if (!module) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/modules/${id}/quiz`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers: submitted }) });
      if (!response.ok) throw new Error('Unable to grade the quick check.');
      const result = await response.json() as { masteredTopicIds: string[] };
      const attempted = new Set(module.quiz.filter(question => submitted[question.id] !== undefined).map(question => question.topicId));
      persist(new Set([...mastered, ...result.masteredTopicIds]), true, new Set([...tested, ...attempted]));
      setShowQuizResult(true);
      window.scrollTo(0, 0);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Something went wrong.'); }
    finally { setBusy(false); }
  }

  const chapters = useMemo(() => chapterGraph(roadmap?.topics ?? []).chapters, [roadmap]);
  const openChapter = chapters.find(item => item.id === chapterId) ?? null;
  const showChapters = view === 'detailed' && !openChapter;
  const visibleTopics = useMemo(() => view === 'overview' ? compactTopics(roadmap?.topics ?? []) : openChapter ? chapterTopics(roadmap?.topics ?? [], openChapter) : roadmap?.topics ?? [], [roadmap, view, openChapter]);
  const selected = visibleTopics.find(item => item.id === selectedId) ?? visibleTopics.find(item => item.essential && !mastered.has(item.id)) ?? visibleTopics[0];
  const graph = useMemo<{ nodes: FlowNode[]; edges: Edge[] }>(() => showChapters ? chapterElements(chapters, roadmap?.topics ?? [], mastered) : graphElements(visibleTopics, mastered, tested, selected?.id ?? null, view === 'overview'), [showChapters, chapters, roadmap, view, visibleTopics, mastered, tested, selected?.id]);
  const layoutKey = `${view}:${openChapter?.id ?? 'all'}`;
  const layoutView = useRef(layoutKey);

  useEffect(() => {
    // Keep dragged positions within a view, but lay out afresh when switching views or chapters.
    const sameView = layoutView.current === layoutKey;
    layoutView.current = layoutKey;
    setFlowNodes(previous => graph.nodes.map(node => ({ ...node, position: (sameView && previous.find(item => item.id === node.id)?.position) || node.position })));
  }, [graph.nodes, setFlowNodes, layoutKey]);

  const exit = <a href="/" className={buttonVariants({ variant: 'ghost', size: 'sm' })}><ArrowLeft size={15}/> Home</a>;
  if (error && !module) return <main className="min-h-svh"><AppHeader>{exit}</AppHeader><Card className="mx-auto mt-16 max-w-xl p-6 text-sm text-destructive" role="alert">{error}</Card></main>;
  if (!module || !roadmap) return <main className="min-h-svh"><AppHeader>{exit}</AppHeader><div className="mx-auto mt-16 w-[min(calc(100%-40px),640px)] space-y-4" aria-label="Loading your roadmap"><div className="h-1.5 animate-pulse rounded-full bg-secondary"/><div className="h-10 w-3/4 animate-pulse rounded-lg bg-secondary"/><div className="h-40 animate-pulse rounded-xl bg-secondary"/></div></main>;
  if (module.topics.length === 0 || module.quiz.length === 0) return <main className="min-h-svh"><AppHeader>{exit}</AppHeader>
    <div className="mx-auto mt-16 w-[min(calc(100%-40px),640px)] sm:mt-24">
      <Kicker>{module.institution} · {module.level}</Kicker>
      <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em]">{module.title}</h1>
      <p className="mt-4 leading-7 text-muted-foreground">The team’s course PDFs are still being analyzed. The knowledge check and concept map will appear here as soon as the course extraction is ready.</p>
      <Card className="mt-8 flex items-center gap-4 p-5"><span className="grid size-10 place-items-center rounded-lg border bg-secondary"><LoaderCircle size={18} className="animate-spin text-ember"/></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Analysis in progress</p><p className="text-[13px] text-muted-foreground">Courses first, then TDs and past exams.</p></div><a className={buttonVariants({ variant: 'outline', size: 'sm' })} href={`/admin?module=${id}`}>View progress</a></Card>
    </div>
  </main>;

  if (showQuizResult || !quizDone) {
    const question = module.quiz[quizIndex];
    const answered = Object.keys(answers).length;
    return <main className="min-h-svh">
      <AppHeader center={<span className="hidden sm:inline">Quick check · {module.title}</span>}>{exit}</AppHeader>
      <div className="mx-auto w-[min(calc(100%-40px),720px)] pb-16 pt-8 sm:pt-12">
        {showQuizResult ? <div className="pt-10 text-center sm:pt-16">
          <span className="mx-auto grid size-12 place-items-center rounded-xl border border-[#cfe6d8] bg-[#f1f9f4] text-[#247452]"><Check size={22}/></span>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em]">We have your starting point.</h1>
          <p className="mx-auto mt-4 max-w-[46ch] leading-7 text-muted-foreground">{mastered.size} concept{mastered.size === 1 ? '' : 's'} already mastered. Concepts you did not answer stay untested, and you can mark any concept as mastered later.</p>
          <Button size="lg" className="mt-8" onClick={() => setShowQuizResult(false)}>See my concept map <ArrowRight size={16}/></Button>
        </div> : question && <>
          <Progress value={((quizIndex + 1) / module.quiz.length) * 100}/>
          <div className="mt-10 flex items-center justify-between gap-4"><Kicker>Question {quizIndex + 1} of {module.quiz.length}</Kicker><span className="text-[13px] text-muted-foreground">{answered} answered</span></div>
          <h1 className="mt-5 text-2xl font-semibold leading-snug tracking-[-0.025em] text-balance sm:text-3xl">{question.prompt}</h1>
          <div className="mt-8 grid gap-2.5">{question.options.map((option, optionIndex) => {
            const chosen = answers[question.id] === optionIndex;
            return <button key={optionIndex} type="button" aria-pressed={chosen} className={cn('grid w-full grid-cols-[32px_minmax(0,1fr)] items-center gap-3.5 rounded-xl border bg-card px-4 py-3.5 text-left text-[15px] leading-6 outline-none transition-all duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/40', chosen ? 'border-ember/60 bg-[#fffaf5] shadow-[0_0_0_3px_rgba(237,129,57,0.10)]' : 'hover:-translate-y-px hover:border-[#d6d3d1] hover:shadow-[0_10px_28px_rgba(24,24,27,0.06)]')}
              onClick={() => { setSkipped(previous => { const next = new Set(previous); next.delete(question.id); return next; }); setAnswers(previous => ({ ...previous, [question.id]: optionIndex })); }}>
              <span className={cn('grid size-8 place-items-center rounded-lg border font-mono text-xs', chosen ? 'border-ember bg-ember text-white' : 'bg-secondary text-muted-foreground')}>{'ABCD'[optionIndex]}</span>{option}
            </button>;
          })}</div>
          {error && <p className="mt-4 text-sm text-destructive" role="alert">{error}</p>}
          <div className="mt-10 flex items-center justify-between gap-4 border-t pt-6">
            <Button variant="outline" onClick={() => { const next = { ...answers }; delete next[question.id]; setSkipped(previous => new Set(previous).add(question.id)); setAnswers(next); if (quizIndex + 1 < module.quiz.length) setQuizIndex(quizIndex + 1); else void finishQuiz(next); }}>I don’t know</Button>
            <Button size="lg" disabled={busy || (answers[question.id] === undefined && !skipped.has(question.id))} onClick={() => quizIndex + 1 < module.quiz.length ? setQuizIndex(quizIndex + 1) : void finishQuiz()}>{quizIndex + 1 === module.quiz.length ? 'Finish' : 'Next'} <ArrowRight size={16}/></Button>
          </div>
          <p className="mt-5 text-center text-xs text-muted-foreground">No timer and no grade. Unknown concepts are not counted as wrong.</p>
        </>}
      </div>
    </main>;
  }

  return <main className="min-h-screen">
    <span className="sr-only" aria-live="polite">{focus ? 'Focus mode activated' : 'Focus mode deactivated'}</span>
    {!focus && <header className="border-b border-[#e4e0db] bg-white"><div className="mx-auto flex max-w-[1540px] items-center justify-between px-5 py-4 sm:px-8"><a href="/" className="flex items-center gap-2 text-sm font-semibold text-[#646269]"><ArrowLeft size={17}/> Home</a><Brand/></div></header>}
    <div className="mx-auto max-w-[1540px] px-5 pb-16 pt-8 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><Badge>{module.institution}</Badge><span className="text-xs text-[#646269]">{module.level}</span></div><h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1c1b21] sm:text-4xl">{module.title}</h1><p className="mt-2 text-sm text-[#646269]">{quizDone ? 'Your personal study roadmap' : 'A few questions before your roadmap'}</p></div>{quizDone && <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => { setAnswers({}); setSkipped(new Set()); setQuizIndex(0); setShowQuizResult(false); persist(mastered, false); }}><RotateCcw size={15}/> Retake quick check</Button><Button variant="outline" size="sm" onClick={() => setFocus(previous => !previous)}>{focus ? <Minimize2 size={15}/> : <Maximize2 size={15}/>} {focus ? 'Exit focus' : 'Focus mode'}</Button><a className="inline-flex h-9 items-center gap-2 rounded-[10px] bg-[#1c1b21] px-4 text-sm font-bold text-white" href={`/module/${id}/session`}>Guided session <ArrowRight size={15}/></a></div>}</div>
      {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
      <>
        <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-2 border-y border-[#e4e0db] py-4 text-sm text-[#4a4951]"><span><strong className="text-[#1c1b21]">{mastered.size} / {roadmap.topics.length}</strong> mastered</span><span><strong className="text-[#1c1b21]">{roadmap.topics.filter(topic => topic.essential && !mastered.has(topic.id)).length}</strong> priority concepts left</span><label className="flex items-center gap-2"><CalendarDays size={15} className="text-[#965935]"/><input type="date" min={new Date().toISOString().slice(0, 10)} value={examDay} onChange={event => changeExamDate(event.target.value)} aria-label="Exam date" className="h-8 rounded-md border bg-background px-2 text-[13px] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"/><strong className={cn('text-[#1c1b21]', roadmap.examDays !== null && roadmap.examDays <= 7 && 'text-destructive')}>{countdownLabel(roadmap.examDays)}</strong></label>{roadmap.examDays !== null && (() => { const left = roadmap.topics.filter(topic => topic.essential && !mastered.has(topic.id)).length; const perDay = left ? Math.ceil(left / Math.max(1, roadmap.examDays)) : 0; return <span><strong className="text-[#1c1b21]">{perDay}</strong> concept{perDay === 1 ? '' : 's'} per day to be ready</span>; })()}</div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3"><div><div className="flex flex-wrap items-center gap-3"><h2 className="text-xl font-bold">Concept map</h2><div role="tablist" aria-label="Graph detail" className="inline-flex rounded-lg border bg-secondary p-0.5">{(['overview', 'detailed'] as const).map(item => <button key={item} role="tab" aria-selected={view === item} onClick={() => changeView(item)} className={cn('h-7 rounded-md px-3 text-[13px] font-medium transition-colors', view === item ? 'bg-background text-foreground shadow-xs ring-1 ring-border' : 'text-muted-foreground hover:text-foreground')}>{item === 'overview' ? `Overview · ${Math.min(12, roadmap.topics.length)}` : `Detailed · ${roadmap.topics.length}`}</button>)}</div></div><p className="mt-1 text-sm text-[#718894]">{view === 'overview' ? 'Key concepts only, with condensed prerequisite links. Switch to Detailed for every concept.' : 'Concepts grouped by chapter. Arrows show which chapters build on others; open a chapter to see its concept graph.'} Drag to pan, use + and − to zoom, and click a concept to see its resources.</p></div><div className="flex flex-wrap gap-3 text-xs text-[#6f8793]"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#8fd0b8]"/> mastered</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#e7ca83]"/> priority</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#dce5e8]"/> other</span></div></div>
        <Card className={cn('relative mt-4 grid overflow-hidden', !focus && 'lg:grid-cols-[minmax(0,1fr)_370px]')}><div className="h-[570px] min-w-0 bg-[#fcfcfc] sm:h-[650px]"><ReactFlow key={layoutKey} zoomOnScroll={false} preventScrolling={false} zoomOnPinch zoomOnDoubleClick={false} fitViewOptions={{ padding: 0.15 }} nodes={flowNodes} edges={graph.edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onNodeClick={(_, node) => { if (node.type === 'chapter') { setChapterId(node.id); setSelectedId(null); } else setSelectedId(node.id); }} nodesDraggable fitView minZoom={0.2} maxZoom={2}><Background variant={BackgroundVariant.Dots} color="#c9c6c2" bgColor="#fcfcfc" gap={18} size={1.6}/><ZoomControls/>
          {view === 'detailed' && <Panel position="top-left" className="flex items-center gap-1.5 rounded-lg border bg-white/95 px-2 py-1.5 text-[13px] shadow-xs backdrop-blur">
            {openChapter ? <><button className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-[#646269] hover:bg-[#f7f7f8] hover:text-[#1c1b21]" onClick={() => { setChapterId(null); setSelectedId(null); }}><ArrowLeft size={14}/> All chapters</button><span className="text-[#cfcac3]">/</span><span className="px-1 font-semibold text-[#1c1b21]">{openChapter.title}</span><span className="text-[#646269]">· {openChapter.topicIds.length} concepts</span></>
              : <span className="px-2 py-1 text-[#646269]"><b className="text-[#1c1b21]">{chapters.length} chapters</b> · click one to open its concepts</span>}
          </Panel>}</ReactFlow></div>{selected && (!focus || selectedId) && <div ref={detailsRef} className={cn('min-w-0 lg:h-[650px] lg:overflow-y-auto', focus && 'absolute inset-y-0 right-0 z-10 w-full max-w-[370px] border-l border-[#e4e0db] shadow-lg')}>
          {focus && <button className="absolute right-3 top-3 z-10 rounded-md bg-white p-2" onClick={() => setSelectedId(null)} aria-label="Close concept details"><X size={17}/></button>}
          <TopicDetails topic={selected} module={module} mastered={mastered.has(selected.id)} onPreview={setPreviewSource} onToggle={() => { const next = new Set(mastered); if (next.has(selected.id)) next.delete(selected.id); else next.add(selected.id); persist(next, true, new Set([...tested, selected.id])); }}/></div>}</Card>
        <div className="mt-6 rounded-xl border border-dashed border-[#cbd8df] p-5 text-sm text-[#6c8390]"><div className="flex items-center gap-2 font-semibold text-[#4b6a79]"><CircleHelp size={16}/> Missing a course or module?</div><p className="mt-1">Student resource contributions are coming soon. For now, the team adds the documents.</p></div>
      </>
    </div>
    {previewSource && <PdfPreview source={previewSource} onClose={() => setPreviewSource(null)}/>}
  </main>;
}

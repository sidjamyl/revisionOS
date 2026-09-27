'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { ReactFlow, Background, BackgroundVariant, Controls, Handle, MarkerType, Position, useNodesState, type Edge, type Node, type NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, ArrowRight, BookOpenText, Check, CheckCircle2, CircleHelp, ExternalLink, FileText, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ModuleData, Roadmap, RoadmapTopic, Source } from '@/shared/types';

type PublicModule = Omit<ModuleData, 'quiz'> & { quiz: Omit<ModuleData['quiz'][number], 'answerIndex'>[] };
type TopicNodeData = { topic: RoadmapTopic; mastered: boolean; selected: boolean };
type FlowTopicNode = Node<TopicNodeData, 'topic'>;

function TopicNode({ data }: NodeProps<FlowTopicNode>) {
  const { topic, mastered, selected } = data;
  const status = mastered ? 'Mastered' : topic.essential ? 'Priority' : 'Later';
  return <div className={cn('w-52 rounded-[10px] border bg-white p-4 text-left shadow-[0_1px_2px_rgba(28,27,33,0.04),0_2px_8px_rgba(28,27,33,0.04)] transition-shadow', selected ? 'border-2 border-[#ed8139] shadow-[0_0_0_4px_rgba(237,129,57,0.14),0_6px_18px_rgba(237,129,57,0.16)]' : mastered ? 'border-[#d5e8d9] bg-[#f4faf5]' : topic.essential ? 'border-[#eab83e]' : 'border-[#e4e0db]', topic.confidence < 0.6 && !selected && 'border-dashed')}>
    <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-0 !bg-[#cfcac3]"/>
    <div className="flex items-center gap-2 text-xs font-bold"><span className={cn('h-2 w-2 shrink-0 rounded-full', mastered ? 'bg-[#57b279]' : topic.essential ? 'bg-[#eab83e]' : 'bg-[#7c8798]')}/><span className={mastered ? 'text-[#346d4a]' : topic.essential ? 'text-[#7a5a00]' : 'text-[#56606f]'}>{status}</span>{topic.confidence < 0.6 && <span className="ml-auto text-[10px] text-[#646269]">Check source</span>}</div>
    <p className="mt-2 text-base font-bold leading-5 text-[#1c1b21]">{topic.title}</p>
    <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-[#646269]"><span><b className="block text-xs text-[#1c1b21]">{topic.appearanceCount}/{topic.examCount}</b>frequency</span><span><b className="block text-xs text-[#1c1b21]">{topic.averagePoints === null ? '—' : topic.averagePoints.toFixed(1)}</b>avg pts</span><span><b className="block text-xs text-[#1c1b21]">{topic.importance}</b>score</span></div>
    <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-0 !bg-[#cfcac3]"/>
  </div>;
}

const nodeTypes = { topic: TopicNode };

function graphElements(topics: RoadmapTopic[], mastered: Set<string>, selectedId: string | null): { nodes: FlowTopicNode[]; edges: Edge[] } {
  const counts = new Map<number, number>();
  const nodes: FlowTopicNode[] = topics.map(topic => {
    const index = counts.get(topic.layer) ?? 0;
    counts.set(topic.layer, index + 1);
    return { id: topic.id, type: 'topic', position: { x: index * 240, y: topic.layer * 185 }, data: { topic, mastered: mastered.has(topic.id), selected: selectedId === topic.id }, draggable: true };
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
    {module.isDemonstration && <p className="mt-3 text-xs leading-5 text-[#965935]">This preview covers only selected, cited past papers. Priorities may change when all files are processed.</p>}
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
  const [mastered, setMastered] = useState<Set<string>>(new Set());
  const [quizDone, setQuizDone] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [previewSource, setPreviewSource] = useState<Source | null>(null);
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState<FlowTopicNode>([]);
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedId && window.innerWidth < 1024) {
      detailsRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    } else if (selectedId) {
      detailsRef.current?.scrollTo(0, 0);
    }
  }, [selectedId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const examDate = params.get('examDate');
    Promise.all([
      fetch(`/api/modules/${id}`).then(response => { if (!response.ok) throw new Error('Module not found.'); return response.json() as Promise<PublicModule>; }),
      fetch(`/api/modules/${id}/roadmap${examDate ? `?examDate=${examDate}` : ''}`).then(response => response.json() as Promise<Roadmap>),
    ]).then(([loaded, map]) => {
      setModule(loaded); setRoadmap(map);
      const saved = window.localStorage.getItem(`revisionos:${id}`);
      if (saved) { const progress = JSON.parse(saved) as { mastered: string[]; quizDone: boolean }; setMastered(new Set(progress.mastered)); setQuizDone(progress.quizDone); }
    }).catch(cause => setError(cause instanceof Error ? cause.message : 'Unable to load this module.'));
  }, [id]);

  const persist = useCallback((next: Set<string>, done: boolean) => {
    setMastered(next); setQuizDone(done);
    window.localStorage.setItem(`revisionos:${id}`, JSON.stringify({ mastered: [...next], quizDone: done }));
  }, [id]);

  async function finishQuiz() {
    if (!module) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/modules/${id}/quiz`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers }) });
      if (!response.ok) throw new Error('Unable to grade the quick check.');
      const result = await response.json() as { masteredTopicIds: string[] };
      persist(new Set([...mastered, ...result.masteredTopicIds]), true);
      window.scrollTo(0, 0);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Something went wrong.'); }
    finally { setBusy(false); }
  }

  const selected = roadmap?.topics.find(item => item.id === selectedId) ?? roadmap?.topics.find(item => item.essential && !mastered.has(item.id)) ?? roadmap?.topics[0];
  const graph = useMemo(() => graphElements(roadmap?.topics ?? [], mastered, selected?.id ?? null), [roadmap, mastered, selected?.id]);

  useEffect(() => {
    setFlowNodes(previous => graph.nodes.map(node => ({ ...node, position: previous.find(item => item.id === node.id)?.position ?? node.position })));
  }, [graph.nodes, setFlowNodes]);

  if (error && !module) return <main className="mx-auto max-w-2xl p-8"><a href="/" className="text-sm text-[#965935]">← Home</a><Card className="mt-8 p-8 text-red-700" role="alert">{error}</Card></main>;
  if (!module || !roadmap) return <main className="flex min-h-screen items-center justify-center text-[#646269]">Loading your roadmap…</main>;

  return <main className="min-h-screen">
    <header className="border-b border-[#e4e0db] bg-white"><div className="mx-auto flex max-w-[1540px] items-center justify-between px-5 py-4 sm:px-8"><a href="/" className="flex items-center gap-2 text-sm font-semibold text-[#646269]"><ArrowLeft size={17}/> Back to programs</a><span className="text-sm font-bold tracking-tight text-[#1c1b21]">RevisionOS</span></div></header>
    <div className="mx-auto max-w-[1540px] px-5 pb-16 pt-8 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><Badge>{module.institution}</Badge><span className="text-xs text-[#646269]">{module.level}</span></div><h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1c1b21] sm:text-4xl">{module.title}</h1><p className="mt-2 text-sm text-[#646269]">{quizDone ? 'Your personal study roadmap' : 'A few questions before your roadmap'}</p></div>{quizDone && <Button variant="outline" size="sm" onClick={() => { setAnswers({}); setQuizDone(false); }}><RotateCcw size={15}/> Retake quick check</Button>}</div>
      {module.isDemonstration && <div className="mt-6 rounded-xl border border-[#e4e0db] bg-[#fcf0e4] px-4 py-3 text-sm text-[#965935]" role="note"><strong>Source-backed preview:</strong> the linked ESI courses, TDs and exam questions are real, but only a subset of the supplied PDFs has been mapped. Priorities are provisional; unknown subquestion points stay unknown.</div>}
      {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
      {!quizDone ? <div className="mx-auto mt-8 max-w-3xl">
        <div className="mb-5 flex items-center justify-between text-sm"><span className="font-semibold text-[#2a5368]">Quick knowledge check</span><span className="text-[#8195a0]">{Object.keys(answers).length} / {module.quiz.length} answered</span></div>
        <div className="space-y-4">{module.quiz.map((question, questionIndex) => <Card key={question.id} className="p-5 sm:p-6"><div className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e6f2ed] text-sm font-bold text-[#247a69]">{questionIndex + 1}</span><div className="min-w-0 flex-1"><h2 className="pt-1 text-base font-semibold leading-6">{question.prompt}</h2><div className="mt-4 grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => <button key={optionIndex} className={cn('rounded-xl border p-3 text-left text-sm leading-5 transition focus-visible:outline-2 focus-visible:outline-[#2b907e]', answers[question.id] === optionIndex ? 'border-[#56ab96] bg-[#eaf7f1] text-[#205d52]' : 'border-[#dbe5e8] bg-white hover:border-[#a7c7c5] hover:bg-[#f7faf9]')} onClick={() => setAnswers(previous => ({ ...previous, [question.id]: optionIndex }))}>{option}</button>)}</div></div></div></Card>)}</div>
        <div className="mt-6 flex items-center justify-between gap-4"><p className="text-xs text-[#7f949e]">No grade — this only helps identify what you already know.</p><Button disabled={busy || Object.keys(answers).length !== module.quiz.length} onClick={finishQuiz}>View my roadmap <ArrowRight size={17}/></Button></div>
      </div> : <>
        <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-2 border-y border-[#e4e0db] py-4 text-sm text-[#4a4951]"><span><strong className="text-[#1c1b21]">{mastered.size} / {roadmap.topics.length}</strong> mastered</span><span><strong className="text-[#1c1b21]">{roadmap.topics.filter(topic => topic.essential && !mastered.has(topic.id)).length}</strong> priority concepts left</span><span>{roadmap.examDays === null ? 'No exam date set' : `${roadmap.examDays} day${roadmap.examDays !== 1 ? 's' : ''} until your exam`}</span></div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Concept map</h2><p className="mt-1 text-sm text-[#718894]">Follow the arrows to learn prerequisites first. Drag to explore; click a concept to see its resources.</p></div><div className="flex flex-wrap gap-3 text-xs text-[#6f8793]"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#8fd0b8]"/> mastered</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#e7ca83]"/> priority</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#dce5e8]"/> other</span></div></div>
        <Card className="mt-4 grid overflow-hidden lg:grid-cols-[minmax(0,1fr)_370px]"><div className="h-[570px] min-w-0 bg-white sm:h-[650px]"><ReactFlow nodes={flowNodes} edges={graph.edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onNodeClick={(_, node) => setSelectedId(node.id)} nodesDraggable defaultViewport={{ x: 35, y: 45, zoom: 0.85 }} minZoom={0.3} maxZoom={1.5} proOptions={{ hideAttribution: true }}><Background variant={BackgroundVariant.Dots} color="#d7d7d7" gap={20} size={1}/><Controls showInteractive={false}/></ReactFlow></div>{selected && <div ref={detailsRef} className="min-w-0 lg:h-[650px] lg:overflow-y-auto"><TopicDetails topic={selected} module={module} mastered={mastered.has(selected.id)} onPreview={setPreviewSource} onToggle={() => { const next = new Set(mastered); if (next.has(selected.id)) next.delete(selected.id); else next.add(selected.id); persist(next, true); }}/></div>}</Card>
        <div className="mt-6 rounded-xl border border-dashed border-[#cbd8df] p-5 text-sm text-[#6c8390]"><div className="flex items-center gap-2 font-semibold text-[#4b6a79]"><CircleHelp size={16}/> Missing a course or module?</div><p className="mt-1">Student resource contributions are coming soon. For now, the team adds the documents.</p></div>
      </>}
    </div>
    {previewSource && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1b21]/35 p-5" role="dialog" aria-modal="true" aria-label={`Source preview: ${previewSource.title}`}><section className="max-h-[min(620px,90vh)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#e4e0db] bg-white p-6 shadow-[0_10px_30px_rgba(28,27,33,0.22)]"><div className="flex items-start justify-between gap-4"><div><Badge>{sourceLabel(previewSource)}{previewSource.page ? ` · page ${previewSource.page}` : ''}</Badge><h2 className="mt-3 text-xl font-extrabold tracking-tight">{previewSource.title}</h2></div><button className="rounded-md p-2 text-[#646269] hover:bg-[#f6f5f1]" onClick={() => setPreviewSource(null)} aria-label="Close preview"><X size={20}/></button></div><p className="mt-5 rounded-xl bg-[#f6f5f1] p-4 text-sm leading-7 text-[#4a4951]">{previewSource.excerpt}</p>{previewSource.question && <p className="mt-4 text-sm text-[#4a4951]"><strong className="text-[#1c1b21]">Question:</strong> {previewSource.question}</p>}<div className="mt-6 flex justify-end gap-3"><Button variant="secondary" onClick={() => setPreviewSource(null)}>Close</Button>{previewSource.url && <a className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#1c1b21] px-4 text-sm font-bold text-white hover:bg-[#4a4951]" href={`${previewSource.url}${previewSource.page ? `#page=${previewSource.page}` : ''}`} target="_blank" rel="noreferrer"><ExternalLink size={16}/> Open PDF</a>}</div></section></div>}
  </main>;
}

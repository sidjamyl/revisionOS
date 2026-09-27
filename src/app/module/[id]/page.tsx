'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { ReactFlow, Background, Controls, Handle, MarkerType, Position, type Edge, type Node, type NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, ArrowRight, BookOpenText, Check, CheckCircle2, CircleHelp, Clock3, ExternalLink, FileText, RotateCcw, Sparkles } from 'lucide-react';
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
  return <div className={cn('w-58 rounded-2xl border-2 bg-white p-4 text-left shadow-[0_9px_30px_rgba(24,50,74,0.08)] transition', selected ? 'border-[#2d8e80]' : mastered ? 'border-[#8fd0b8]' : topic.essential ? 'border-[#ecd394]' : 'border-[#dce5e8]')}>
    <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-0 !bg-[#8caab5]"/>
    <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8b9da7]">{topic.chapter}</span>{mastered ? <CheckCircle2 size={17} className="shrink-0 text-[#2b907e]"/> : topic.essential ? <span className="h-2 w-2 shrink-0 rounded-full bg-[#d6a542]"/> : null}</div>
    <p className="mt-2 text-sm font-bold leading-5 text-[#18324a]">{topic.title}</p>
    <div className="mt-3 flex items-center justify-between text-[11px] text-[#6f8793]"><span>{topic.appearanceCount} appearance{topic.appearanceCount !== 1 ? 's' : ''}</span><span>{topic.importance} / 100</span></div>
    <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-0 !bg-[#8caab5]"/>
  </div>;
}

const nodeTypes = { topic: TopicNode };

function graphElements(topics: RoadmapTopic[], mastered: Set<string>, selectedId: string | null): { nodes: FlowTopicNode[]; edges: Edge[] } {
  const counts = new Map<number, number>();
  const nodes: FlowTopicNode[] = topics.map(topic => {
    const index = counts.get(topic.layer) ?? 0;
    counts.set(topic.layer, index + 1);
    return { id: topic.id, type: 'topic', position: { x: topic.layer * 310, y: index * 150 }, data: { topic, mastered: mastered.has(topic.id), selected: selectedId === topic.id }, draggable: false };
  });
  const edges: Edge[] = topics.flatMap(topic => topic.prerequisites.map(prerequisite => ({
    id: `${prerequisite}-${topic.id}`, source: prerequisite, target: topic.id,
    type: 'smoothstep', animated: false, style: { stroke: topic.essential ? '#84bba9' : '#c4d3d8', strokeWidth: topic.essential ? 2 : 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: topic.essential ? '#84bba9' : '#c4d3d8' },
  })));
  return { nodes, edges };
}

function sourceLabel(source: Source) {
  return source.kind === 'course' ? 'Course' : source.kind === 'td' ? 'TD' : source.kind === 'exam' ? 'Exam' : 'Syllabus';
}

function TopicDetails({ topic, module, mastered, onToggle }: { topic: RoadmapTopic; module: PublicModule; mastered: boolean; onToggle: () => void }) {
  const occurrences = module.occurrences.filter(item => item.topicId === topic.id);
  const sources = [...topic.sources].sort((a, b) => ({ course: 0, syllabus: 1, td: 2, exam: 3 })[a.kind] - ({ course: 0, syllabus: 1, td: 2, exam: 3 })[b.kind]);
  return <aside className="min-w-0 border-t border-[#dbe4e9] bg-white p-5 lg:border-l lg:border-t-0 lg:p-6">
    <div className="flex flex-wrap items-center gap-2"><Badge>{topic.chapter}</Badge>{topic.essential && <Badge className="bg-[#fff3d7] text-[#966b24]">Priority</Badge>}{topic.confidence < 0.6 && <Badge className="bg-[#fff0ed] text-[#a9543e]">Needs verification</Badge>}</div>
    <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#173654]">{topic.title}</h2>
    <p className="mt-3 text-sm leading-6 text-[#5a7280]">{topic.summary}</p>
    <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-[#f5f8f8] p-3"><span className="block text-xl font-bold">{topic.appearanceCount}<span className="text-sm font-normal text-[#80939d]"> / {topic.examCount}</span></span><span className="text-xs text-[#718793]">past exams reviewed</span></div><div className="rounded-xl bg-[#f5f8f8] p-3"><span className="block text-xl font-bold">{topic.averagePoints === null ? '—' : topic.averagePoints.toFixed(1)}</span><span className="text-xs text-[#718793]">average known points</span></div></div>
    {module.isDemonstration && <p className="mt-3 text-xs leading-5 text-[#9a6b2a]">This preview covers only selected, cited past papers. Priorities may change when all files are processed.</p>}
    <Button className="mt-5 w-full" variant={mastered ? 'secondary' : 'default'} onClick={onToggle}>{mastered ? <><Check size={17}/> Mastered · undo</> : <><CheckCircle2 size={17}/> Mark as mastered</>}</Button>
    {topic.prerequisites.length > 0 && <div className="mt-7"><h3 className="text-sm font-bold">Learn first</h3><p className="mt-2 text-sm leading-6 text-[#617986]">{topic.prerequisites.map(id => module.topics.find(item => item.id === id)?.title ?? id).join(' · ')}</p></div>}
    <div className="mt-7"><h3 className="flex items-center gap-2 text-sm font-bold"><BookOpenText size={16} className="text-[#2b907e]"/> Sources and exercises</h3>
      {sources.length === 0 && <p className="mt-3 text-sm text-[#7e929b]">No linked passage yet.</p>}
      <div className="mt-3 space-y-3">{sources.map(source => <div key={source.id} className="rounded-xl border border-[#e1e9eb] p-3"><div className="flex items-center justify-between gap-2"><Badge className="bg-[#f0f4f6] text-[#526e7c]">{sourceLabel(source)}{source.page ? ` · p. ${source.page}` : ''}</Badge>{source.url && <a className="text-[#2b907e] hover:underline" href={`${source.url}${source.page ? `#page=${source.page}` : ''}`} target="_blank" rel="noreferrer" aria-label={`Open ${source.title}`}><ExternalLink size={16}/></a>}</div><p className="mt-2 text-xs font-semibold text-[#496371]">{source.title}</p><p className="mt-1 text-xs leading-5 text-[#6e8490]">{source.excerpt}</p>{source.question && <p className="mt-2 text-xs text-[#476577]">Question: {source.question}</p>}</div>)}</div>
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

  const selected = roadmap?.topics.find(item => item.id === selectedId) ?? roadmap?.topics.find(item => item.essential) ?? roadmap?.topics[0];
  const graph = useMemo(() => graphElements(roadmap?.topics ?? [], mastered, selected?.id ?? null), [roadmap, mastered, selected?.id]);

  if (error && !module) return <main className="mx-auto max-w-2xl p-8"><a href="/" className="text-sm text-[#2b907e]">← Home</a><Card className="mt-8 p-8 text-red-700" role="alert">{error}</Card></main>;
  if (!module || !roadmap) return <main className="flex min-h-screen items-center justify-center text-[#728996]">Loading your roadmap…</main>;

  return <main className="min-h-screen">
    <header className="border-b border-[#dce5e8] bg-white"><div className="mx-auto flex max-w-[1540px] items-center justify-between px-5 py-4 sm:px-8"><a href="/" className="flex items-center gap-2 text-sm font-semibold text-[#527080]"><ArrowLeft size={17}/> Back to programs</a><span className="text-sm font-bold tracking-tight text-[#173654]">RevisionOS</span></div></header>
    <div className="mx-auto max-w-[1540px] px-5 pb-16 pt-8 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><Badge>{module.institution}</Badge><span className="text-xs text-[#8b9da7]">{module.level}</span></div><h1 className="mt-3 text-3xl font-bold tracking-tight text-[#173654] sm:text-4xl">{module.title}</h1><p className="mt-2 text-sm text-[#6e8490]">{quizDone ? 'Your personal study roadmap' : 'A few questions before your roadmap'}</p></div>{quizDone && <Button variant="outline" size="sm" onClick={() => { setAnswers({}); setQuizDone(false); }}><RotateCcw size={15}/> Retake quick check</Button>}</div>
      {module.isDemonstration && <div className="mt-6 rounded-xl border border-[#f1dba9] bg-[#fff9e9] px-4 py-3 text-sm text-[#856127]" role="note"><strong>Source-backed preview:</strong> the linked ESI courses, TDs and exam questions are real, but only a subset of the supplied PDFs has been mapped. Priorities are provisional; unknown subquestion points stay unknown.</div>}
      {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
      {!quizDone ? <div className="mx-auto mt-8 max-w-3xl">
        <div className="mb-5 flex items-center justify-between text-sm"><span className="font-semibold text-[#2a5368]">Quick knowledge check</span><span className="text-[#8195a0]">{Object.keys(answers).length} / {module.quiz.length} answered</span></div>
        <div className="space-y-4">{module.quiz.map((question, questionIndex) => <Card key={question.id} className="p-5 sm:p-6"><div className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e6f2ed] text-sm font-bold text-[#247a69]">{questionIndex + 1}</span><div className="min-w-0 flex-1"><h2 className="pt-1 text-base font-semibold leading-6">{question.prompt}</h2><div className="mt-4 grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => <button key={optionIndex} className={cn('rounded-xl border p-3 text-left text-sm leading-5 transition focus-visible:outline-2 focus-visible:outline-[#2b907e]', answers[question.id] === optionIndex ? 'border-[#56ab96] bg-[#eaf7f1] text-[#205d52]' : 'border-[#dbe5e8] bg-white hover:border-[#a7c7c5] hover:bg-[#f7faf9]')} onClick={() => setAnswers(previous => ({ ...previous, [question.id]: optionIndex }))}>{option}</button>)}</div></div></div></Card>)}</div>
        <div className="mt-6 flex items-center justify-between gap-4"><p className="text-xs text-[#7f949e]">No grade — this only helps identify what you already know.</p><Button disabled={busy || Object.keys(answers).length !== module.quiz.length} onClick={finishQuiz}>View my roadmap <ArrowRight size={17}/></Button></div>
      </div> : <>
        <div className="mt-7 grid gap-3 sm:grid-cols-3"><Card className="flex items-center gap-3 p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5ee] text-[#2b907e]"><CheckCircle2 size={20}/></span><span><strong className="block text-xl">{mastered.size} / {roadmap.topics.length}</strong><small className="text-[#7d929c]">concepts mastered</small></span></Card><Card className="flex items-center gap-3 p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff5df] text-[#a87624]"><Sparkles size={20}/></span><span><strong className="block text-xl">{roadmap.topics.filter(topic => topic.essential && !mastered.has(topic.id)).length}</strong><small className="text-[#7d929c]">priority concepts left</small></span></Card><Card className="flex items-center gap-3 p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f1f5] text-[#4e7f9a]"><Clock3 size={20}/></span><span><strong className="block text-xl">{roadmap.examDays === null ? 'Your pace' : `${roadmap.examDays} day${roadmap.examDays !== 1 ? 's' : ''}`}</strong><small className="text-[#7d929c]">{roadmap.examDays === null ? 'no exam date set' : 'until your exam'}</small></span></Card></div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Concept map</h2><p className="mt-1 text-sm text-[#718894]">Follow the arrows to learn prerequisites first. Drag to explore; click a concept to see its resources.</p></div><div className="flex flex-wrap gap-3 text-xs text-[#6f8793]"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#8fd0b8]"/> mastered</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#e7ca83]"/> priority</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#dce5e8]"/> other</span></div></div>
        <Card className="mt-4 grid overflow-hidden lg:grid-cols-[minmax(0,1fr)_370px]"><div className="h-[570px] min-w-0 bg-[#fafdfe] sm:h-[650px]"><ReactFlow nodes={graph.nodes} edges={graph.edges} nodeTypes={nodeTypes} onNodeClick={(_, node) => setSelectedId(node.id)} nodesDraggable={false} defaultViewport={{ x: 65, y: 200, zoom: 0.8 }} minZoom={0.3} maxZoom={1.5} proOptions={{ hideAttribution: true }}><Background color="#dbe7e9" gap={18}/><Controls showInteractive={false}/></ReactFlow></div>{selected && <TopicDetails topic={selected} module={module} mastered={mastered.has(selected.id)} onToggle={() => { const next = new Set(mastered); if (next.has(selected.id)) next.delete(selected.id); else next.add(selected.id); persist(next, true); }}/>}</Card>
        <div className="mt-6 rounded-xl border border-dashed border-[#cbd8df] p-5 text-sm text-[#6c8390]"><div className="flex items-center gap-2 font-semibold text-[#4b6a79]"><CircleHelp size={16}/> Missing a course or module?</div><p className="mt-1">Student resource contributions are coming soon. For now, the team adds the documents.</p></div>
      </>}
    </div>
  </main>;
}

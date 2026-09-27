'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, BookOpenText, Check, ExternalLink, FilePenLine, GraduationCap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { roadmapUrl } from '@/lib/profile';
import { LogoMark } from '@/components/brand';
import { cn } from '@/lib/utils';
import type { Roadmap, RoadmapTopic, Source } from '@/shared/types';

type SessionState = { queue: string[]; index: number; acquired: string[]; review: string[]; retried: string[] };

function orderedPath(topics: RoadmapTopic[], mastered: Set<string>): string[] {
  const remaining = new Map(topics.filter(topic => topic.essential && !mastered.has(topic.id)).map(topic => [topic.id, topic]));
  const done = new Set(mastered);
  const result: string[] = [];
  while (remaining.size) {
    const ready = [...remaining.values()].filter(topic => topic.prerequisites.every(id => done.has(id) || !remaining.has(id))).sort((a, b) => b.importance - a.importance);
    if (!ready.length) break;
    const topic = ready[0];
    result.push(topic.id); done.add(topic.id); remaining.delete(topic.id);
  }
  return result;
}

function SourceLink({ source }: { source: Source }) {
  return <a className="flex items-start justify-between gap-4 rounded-xl border border-[#e4e0db] p-4 text-sm hover:border-[#ed8139]" href={`${source.url ?? '#'}${source.page ? `#page=${source.page}` : ''}`} target="_blank" rel="noreferrer"><span><strong className="block text-[#1c1b21]">{source.title}{source.page ? ` · page ${source.page}` : ''}</strong><span className="mt-1 block leading-6 text-[#646269]">{source.excerpt}</span>{source.question && <span className="mt-1 block text-[#4a4951]">{source.question}</span>}</span><ExternalLink size={16} className="mt-1 shrink-0 text-[#965935]"/></a>;
}

export default function GuidedSession() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [state, setState] = useState<SessionState | null>(null);
  const [block, setBlock] = useState(0);
  const [confirmExit, setConfirmExit] = useState(false);
  const [error, setError] = useState('');
  const sessionKey = `revisionos:session:${id}`;
  const progressKey = `revisionos:qwen:${id}`;

  useEffect(() => {
    fetch(roadmapUrl(id)).then(response => { if (!response.ok) throw new Error(); return response.json() as Promise<Roadmap>; }).then(map => {
      setRoadmap(map);
      let mastered = new Set<string>();
      try { mastered = new Set((JSON.parse(window.localStorage.getItem(progressKey) ?? '{}') as { mastered?: string[] }).mastered ?? []); } catch { /* Start from an empty profile. */ }
      const path = orderedPath(map.topics, mastered);
      try { const saved = window.localStorage.getItem(sessionKey); if (saved) { const previous = JSON.parse(saved) as SessionState; if (previous.queue.length && previous.queue.every(topicId => map.topics.some(topic => topic.id === topicId))) { setState(previous); return; } } } catch { /* Start a new session. */ }
      setState({ queue: path, index: 0, acquired: [], review: [], retried: [] });
    }).catch(() => setError('The guided session could not be loaded. Please retry.'));
  }, [id, progressKey, sessionKey]);

  const save = useCallback((next: SessionState) => { setState(next); window.localStorage.setItem(sessionKey, JSON.stringify(next)); setBlock(0); }, [sessionKey]);
  const topic = useMemo(() => roadmap?.topics.find(item => item.id === state?.queue[state.index]), [roadmap, state]);
  const finished = Boolean(state && state.index >= state.queue.length);

  function advance(action: 'acquired' | 'review' | 'skip') {
    if (!state || !topic) return;
    const next = { ...state, queue: [...state.queue], acquired: [...state.acquired], review: [...state.review], retried: [...state.retried], index: state.index + 1 };
    if (action === 'acquired') {
      next.acquired.push(topic.id);
      next.review = next.review.filter(id => id !== topic.id);
      let progress: { mastered: string[]; tested?: string[]; quizDone: boolean } = { mastered: [], tested: [], quizDone: true };
      try { progress = JSON.parse(window.localStorage.getItem(progressKey) ?? '') as typeof progress; } catch { /* First saved concept. */ }
      progress.mastered = [...new Set([...progress.mastered, topic.id])];
      progress.tested = [...new Set([...(progress.tested ?? []), topic.id])];
      window.localStorage.setItem(progressKey, JSON.stringify(progress));
    } else if (action === 'review') {
      if (!next.review.includes(topic.id)) next.review.push(topic.id);
      if (!next.retried.includes(topic.id)) { next.retried.push(topic.id); next.queue.push(topic.id); }
    }
    save(next);
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setConfirmExit(true); return; }
      if (confirmExit || !topic) return;
      if (event.key === 'Enter') advance('acquired');
      if (event.key.toLowerCase() === 'p') advance('review');
      if (event.key === 'ArrowRight') advance('skip');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (error) return <main className="mx-auto max-w-xl p-8" role="alert"><p>{error}</p><Button className="mt-4" onClick={() => window.location.reload()}>Retry</Button></main>;
  if (!roadmap || !state) return <main className="mx-auto max-w-3xl p-8"><div className="h-48 animate-pulse rounded-2xl bg-[#f6f5f3]"/></main>;
  if (!state.queue.length) return <main className="mx-auto max-w-2xl p-8"><h1 className="text-3xl font-extrabold">No concepts to review yet</h1><p className="mt-3 text-[#646269]">Your essential path is empty or already mastered.</p><Button className="mt-6" onClick={() => router.push(`/module/${id}`)}>Back to graph</Button></main>;
  if (finished) return <main className="mx-auto max-w-2xl px-6 py-20"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f4faf5] text-[#346d4a]"><Check/></div><h1 className="mt-7 text-3xl font-extrabold">Path complete for now.</h1><p className="mt-3 text-[#646269]">{state.acquired.length} concepts mastered, {state.review.length} to revisit.</p>{state.review.length > 0 && <div className="mt-8 space-y-2">{state.review.map(topicId => <p key={topicId} className="rounded-xl border border-[#e4e0db] p-3">{roadmap.topics.find(item => item.id === topicId)?.title}</p>)}</div>}<div className="mt-8 flex gap-3">{state.review.length > 0 && <Button onClick={() => save({ queue: state.review, index: 0, acquired: [], review: [], retried: [] })}>Review again</Button>}<Button variant="secondary" onClick={() => { window.localStorage.removeItem(sessionKey); router.push(`/module/${id}`); }}>Back to graph</Button></div></main>;
  if (!topic) return <main className="p-8">This concept is no longer in the roadmap. <a href={`/module/${id}`} className="underline">Return to graph</a>.</main>;

  const course = topic.sources.filter(source => source.kind === 'course');
  const td = topic.sources.filter(source => source.kind === 'td');
  const exams = topic.sources.filter(source => source.kind === 'exam').sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  return <main className="min-h-screen bg-white pb-28"><header className="border-b border-[#e4e0db] px-5 py-4"><div className="mx-auto flex max-w-5xl items-center justify-between gap-4"><span className="flex items-center gap-3 font-bold"><LogoMark size={30}/>{roadmap.module.title}</span><span className="text-sm text-[#646269]">Concept {state.index + 1} of {state.queue.length}</span><Button variant="secondary" onClick={() => setConfirmExit(true)}><X size={16}/> Exit</Button></div><div className="mx-auto mt-4 flex max-w-5xl gap-1">{state.queue.map((item, index) => <span key={`${item}-${index}`} className={cn('h-1.5 flex-1 rounded-full', index < state.index ? 'bg-[#57b279]' : index === state.index ? 'bg-[#ed8139]' : 'bg-[#e4e0db]')}/>)}</div></header>
    <div className="mx-auto max-w-[760px] px-5 py-12"><p className="text-xs font-bold tracking-widest text-[#965935]">CONCEPT {state.index + 1} OF {state.queue.length}</p><h1 className="mt-3 text-4xl font-extrabold tracking-tight">{topic.title}</h1><p className="mt-3 text-sm text-[#646269]">{topic.chapter}{topic.confidence < 0.6 ? ' · Source needs verification' : ''}</p><section className="mt-8 rounded-xl bg-[#f7f7f8] p-5"><h2 className="font-bold">Why now?</h2><p className="mt-2 text-sm leading-6 text-[#4a4951]">{topic.appearanceCount ? `This concept appeared in ${topic.appearanceCount} of ${topic.examCount} reviewed exams.` : 'This concept supports the next steps in your prerequisite path.'} {topic.averagePoints !== null && `It carries ${topic.averagePoints.toFixed(1)} known points on average.`}</p></section>
      {[{ title: 'Read', icon: BookOpenText, sources: course, empty: 'No course passage linked yet.' }, { title: 'Practice', icon: FilePenLine, sources: td, empty: 'No TD exercise linked yet.' }, { title: 'Past exams', icon: GraduationCap, sources: exams, empty: 'No past exam question linked yet.' }].map((section, index) => <section key={section.title} className="mt-5 rounded-xl border border-[#e4e0db] p-5"><button className="flex w-full items-center justify-between text-left font-bold" onClick={() => setBlock(index)}><span className="flex items-center gap-3"><section.icon size={19} className="text-[#965935]"/>{section.title}</span><span className="text-xs text-[#646269]">{block === index ? 'Open' : 'Show'}</span></button>{block === index && <div className="mt-5 space-y-3">{section.sources.length ? section.sources.map(source => <SourceLink key={source.id} source={source}/>) : <p className="text-sm text-[#646269]">{section.empty}</p>}{index < 2 && <Button variant="secondary" onClick={() => setBlock(index + 1)}>Next <ArrowRight size={16}/></Button>}</div>}</section>)}
    </div><div className="fixed inset-x-0 bottom-0 border-t border-[#e4e0db] bg-white px-5 py-4"><div className="mx-auto flex max-w-[760px] flex-wrap items-center justify-between gap-3"><Button variant="secondary" onClick={() => advance('review')}>Not yet</Button><div className="flex gap-3"><Button variant="secondary" onClick={() => advance('skip')}>Skip <ArrowRight size={16}/></Button><Button onClick={() => advance('acquired')}><Check size={16}/> I understand</Button></div></div></div>
    {confirmExit && <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#1c1b21]/35 p-5" role="dialog" aria-modal="true" aria-label="Exit session"><div className="w-full max-w-xl rounded-2xl bg-white p-6"><h2 className="text-xl font-bold">Exit the session?</h2><p className="mt-2 text-sm text-[#646269]">You can resume at concept {state.index + 1}.</p><div className="mt-6 flex justify-end gap-3"><Button variant="secondary" onClick={() => setConfirmExit(false)}>Continue</Button><Button onClick={() => router.push(`/module/${id}`)}><ArrowLeft size={16}/> Exit</Button></div></div></div>}
  </main>;
}

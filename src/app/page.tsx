'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, BookOpenText, Building2, CalendarDays, Check, House, Layers, Maximize2, Minimize2, Sparkles } from 'lucide-react';
import { AppHeader, Brand, Kicker } from '@/components/brand';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { countdownLabel, daysUntil, loadProfile, masteredFor, profileKey, roadmapUrl, saveProfile, setExamDate, type Profile } from '@/lib/profile';
import { cn } from '@/lib/utils';
import type { CatalogProgram, Roadmap, RoadmapTopic } from '@/shared/types';

type CatalogModule = CatalogProgram['modules'][number];
const years = ['1CP', '2CP', '1CS', '2CS', '3CS'];
const yearLabels: Record<string, string> = {
  '1CP': 'First preparatory year', '2CP': 'Second preparatory year', '1CS': 'Engineering cycle, year 1', '2CS': 'Engineering cycle, year 2', '3CS': 'Engineering cycle, year 3',
};
const yearModules: Record<string, string[]> = { '1CP': ['esi-alg1'], '3CS': ['esi-igl'] };
const steps = [
  { kicker: 'Institution', title: 'Where do you study?', copy: 'Choose your university to find the right courses, exercises and past exams.' },
  { kicker: 'Year', title: 'What year are you in?', copy: 'We use it to highlight the modules of your year.' },
  { kicker: 'Modules', title: 'Pick your modules.', copy: 'Every module with processed documents is selected. Untick the ones you do not need.' },
  { kicker: 'Exams', title: 'When are your exams?', copy: 'Your daily plan and priorities adapt to the time left. You can change these dates later.' },
];
const today = () => new Date().toISOString().slice(0, 10);

function ChoiceRow({ index, icon, title, detail, selected, disabled, trailing, onClick }: { index: number; icon: React.ReactNode; title: string; detail?: string; selected: boolean; disabled?: boolean; trailing?: React.ReactNode; onClick: () => void }) {
  return <button type="button" disabled={disabled} aria-pressed={selected} onClick={onClick} className={cn(
    'group grid w-full grid-cols-[28px_40px_minmax(0,1fr)_auto] items-center gap-3.5 rounded-xl border bg-card px-4 py-4 text-left outline-none transition-all duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/40',
    selected ? 'border-ember/60 bg-[#fffaf5] shadow-[0_0_0_3px_rgba(237,129,57,0.10)]' : 'hover:-translate-y-px hover:border-[#d6d3d1] hover:shadow-[0_10px_28px_rgba(24,24,27,0.06)]',
    disabled && 'cursor-not-allowed opacity-50 hover:translate-y-0 hover:shadow-none',
  )}>
    <span className="font-mono text-[10px] text-muted-foreground/70">{String(index + 1).padStart(2, '0')}</span>
    <span className={cn('grid size-10 place-items-center rounded-lg border bg-secondary text-muted-foreground', selected && 'border-ember/30 bg-white text-ember-deep')}>{icon}</span>
    <span className="min-w-0"><strong className="block truncate text-[15px] font-semibold">{title}</strong>{detail && <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">{detail}</span>}</span>
    {trailing ?? <span className={cn('grid size-5 place-items-center rounded-full border', selected ? 'border-ember bg-ember text-white' : 'border-[#d6d3d1]')}>{selected && <Check size={12} strokeWidth={3}/>}</span>}
  </button>;
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return <div className="flex items-center justify-between gap-4 border-t py-3.5 first:border-t-0">
    <span className="text-[13px] text-muted-foreground">{label}</span>
    {value ? <span className="truncate text-right text-[13px] font-semibold">{value}</span> : <span className="h-2 w-16 rounded-full bg-secondary"/>}
  </div>;
}

function Onboarding({ catalog, onFinish }: { catalog: CatalogProgram[]; onFinish: (profile: Profile) => void }) {
  const readyIds = (institution: string) => catalog.filter(item => item.institution === institution).flatMap(item => item.modules).filter(item => item.ready).map(item => item.id);
  const [step, setStep] = useState(0);
  const [institution, setInstitution] = useState('ESI Algiers');
  const [year, setYear] = useState('1CP');
  const [programId, setProgramId] = useState('esi-informatique');
  const [selected, setSelected] = useState<string[]>(() => readyIds('ESI Algiers'));
  const [examDates, setExamDates] = useState<Record<string, string>>({});
  const institutions = [...new Set(catalog.map(item => item.institution))];
  const programs = catalog.filter(item => item.institution === institution);
  const inYear = (id: string) => (yearModules[year] ?? []).includes(id);
  const modules = programs.flatMap(item => item.modules).sort((a, b) => Number(b.ready) - Number(a.ready) || Number(inYear(b.id)) - Number(inYear(a.id)));
  const allModules = catalog.flatMap(item => item.modules);
  const titleOf = (id: string) => allModules.find(item => item.id === id)?.title ?? id;
  const last = steps.length - 1;

  function chooseInstitution(value: string) {
    setInstitution(value); setProgramId(catalog.find(item => item.institution === value)?.id ?? ''); setSelected(readyIds(value));
  }
  function finish() {
    const moduleIds = selected.length ? selected : readyIds(institution);
    onFinish({ institution, year, programId, moduleIds, examDates: Object.fromEntries(Object.entries(examDates).filter(([id, date]) => date && moduleIds.includes(id))) });
  }
  const current = steps[step];

  return <main className="min-h-svh bg-background">
    <AppHeader center={<span className="hidden sm:inline">Step {step + 1} of {steps.length}</span>}>
      <Button variant="ghost" size="sm" onClick={() => step < last ? setStep(step + 1) : finish()}>Skip</Button>
    </AppHeader>
    <div className="mx-auto w-[min(calc(100%-40px),1080px)] pb-16 pt-8 sm:pt-12">
      <div className="grid grid-cols-4 gap-2" aria-hidden="true">{steps.map((_, index) => <Progress key={index} value={index <= step ? 100 : 0}/>)}</div>
      <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)] lg:gap-10">
        <section>
          <Kicker>Step {step + 1} · {current.kicker}</Kicker>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-balance sm:text-5xl">{current.title}</h1>
          <p className="mt-4 max-w-[52ch] text-base leading-7 text-muted-foreground">{current.copy}</p>

          <div className="mt-9">
            {step === 0 && <div className="grid gap-2.5">{institutions.map((item, index) => {
              const count = catalog.filter(entry => entry.institution === item).flatMap(entry => entry.modules).length;
              return <ChoiceRow key={item} index={index} icon={<Building2 size={18}/>} title={item} detail={`${count} module${count === 1 ? '' : 's'} listed`} selected={institution === item} onClick={() => chooseInstitution(item)}/>;
            })}</div>}

            {step === 1 && <>
              <div className="grid gap-2.5 sm:grid-cols-2">{years.map((item, index) => <ChoiceRow key={item} index={index} icon={<Layers size={18}/>} title={item} detail={yearLabels[item]} selected={year === item} onClick={() => setYear(item)}/>)}</div>
              {['2CS', '3CS'].includes(year) && programs.length > 1 && <label className="mt-6 block text-sm font-medium">Specialization
                <select value={programId} onChange={event => setProgramId(event.target.value)} className="mt-2 block h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">{programs.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
              </label>}
            </>}

            {step === 2 && <div className="grid gap-2.5">
              {modules.map((item, index) => <ChoiceRow key={item.id} index={index} icon={<BookOpenText size={18}/>} title={item.title} detail={`${item.level}${inYear(item.id) ? ' · Your year' : ''}`} disabled={!item.ready} selected={selected.includes(item.id)}
                trailing={item.ready ? undefined : <Badge variant="outline">Coming soon</Badge>}
                onClick={() => setSelected(previous => previous.includes(item.id) ? previous.filter(id => id !== item.id) : [...previous, item.id])}/>)}
            </div>}

            {step === 3 && <div className="grid gap-2.5">
              {selected.map((id, index) => <div key={id} className="grid grid-cols-[28px_40px_minmax(0,1fr)] items-center gap-3.5 rounded-xl border bg-card px-4 py-4 sm:grid-cols-[28px_40px_minmax(0,1fr)_auto]">
                <span className="font-mono text-[10px] text-muted-foreground/70">{String(index + 1).padStart(2, '0')}</span>
                <span className="grid size-10 place-items-center rounded-lg border bg-secondary text-muted-foreground"><CalendarDays size={18}/></span>
                <span className="min-w-0"><strong className="block truncate text-[15px] font-semibold">{titleOf(id)}</strong><span className="mt-0.5 block text-[13px] text-muted-foreground">{examDates[id] ? countdownLabel(daysUntil(examDates[id])) : 'Optional'}</span></span>
                <input type="date" min={today()} value={examDates[id] ?? ''} onChange={event => setExamDates(previous => ({ ...previous, [id]: event.target.value }))} aria-label={`Exam date for ${titleOf(id)}`} className="col-span-3 h-10 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 sm:col-span-1"/>
              </div>)}
            </div>}
          </div>

          <div className="mt-10 flex items-center justify-between border-t pt-6">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft size={16}/> Back</Button>
            <Button size="lg" disabled={step === 2 && selected.length === 0} onClick={() => step < last ? setStep(step + 1) : finish()}>{step === last ? 'Build my roadmap' : 'Continue'} <ArrowRight size={16}/></Button>
          </div>
        </section>

        <aside className="hidden lg:block">
          <Card className="sticky top-24">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Your setup</CardTitle><CardDescription className="text-[13px]">Used to pick your courses, TDs and past exams.</CardDescription></CardHeader>
            <CardContent className="pb-4">
              <SummaryRow label="Institution" value={institution}/>
              <SummaryRow label="Year" value={step >= 1 ? year : undefined}/>
              <SummaryRow label="Modules" value={step >= 2 && selected.length ? `${selected.length} selected` : undefined}/>
              <SummaryRow label="Exam dates" value={step >= 3 ? `${Object.values(examDates).filter(Boolean).length} set` : undefined}/>
            </CardContent>
            <div className="flex items-start gap-2.5 rounded-b-xl border-t bg-secondary/50 px-6 py-4 text-[12px] leading-5 text-muted-foreground"><Sparkles size={14} className="mt-0.5 shrink-0 text-ember"/>A 7-question check follows for each module. Unknown answers are never counted as wrong.</div>
          </Card>
        </aside>
      </div>
    </div>
  </main>;
}

type PlanItem = { module: CatalogModule; topic: RoadmapTopic };
type ModulePace = { module: CatalogModule; days: number | null; left: number; perDay: number; today: PlanItem[] };

// Daily pace: remaining priority concepts, in prerequisite order, spread over the days before the exam.
function modulePace(module: CatalogModule, map: Roadmap | undefined, mastered: Set<string>): ModulePace {
  const remaining = (map?.topics ?? []).filter(topic => topic.essential && !mastered.has(topic.id));
  const days = map?.examDays ?? null;
  const perDay = remaining.length === 0 ? 0 : days === null ? Math.min(3, remaining.length) : Math.ceil(remaining.length / Math.max(1, days));
  return { module, days, left: remaining.length, perDay, today: remaining.slice(0, perDay).map(topic => ({ module, topic })) };
}

function Dashboard({ profile, catalog, onReset, onProfile }: { profile: Profile; catalog: CatalogProgram[]; onReset: () => void; onProfile: (profile: Profile) => void }) {
  const [maps, setMaps] = useState<Record<string, Roadmap>>({});
  const [focus, setFocus] = useState(false);
  const [mastered, setMastered] = useState<Record<string, Set<string>>>({});
  // Every module with processed documents is listed; the earliest exams come first.
  const modules = useMemo(() => catalog.flatMap(item => item.modules).filter(item => item.ready || profile.moduleIds.includes(item.id))
    .sort((a, b) => (daysUntil(profile.examDates?.[a.id]) ?? 999) - (daysUntil(profile.examDates?.[b.id]) ?? 999) || Number(profile.moduleIds.includes(b.id)) - Number(profile.moduleIds.includes(a.id))), [catalog, profile]);
  useEffect(() => {
    for (const item of modules) fetch(roadmapUrl(item.id)).then(response => response.json()).then((map: Roadmap) => setMaps(previous => ({ ...previous, [item.id]: map }))).catch(() => undefined);
    setMastered(Object.fromEntries(modules.map(item => [item.id, masteredFor(item.id)])));
  }, [modules]);
  useEffect(() => { setFocus(window.localStorage.getItem('revisionos:focus') === 'true'); }, []);
  useEffect(() => { window.localStorage.setItem('revisionos:focus', String(focus)); }, [focus]);
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setFocus(false); if (event.key.toLowerCase() === 'f' && !(event.target instanceof HTMLInputElement)) setFocus(previous => !previous); }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, []);

  const paces = modules.map(item => modulePace(item, maps[item.id], mastered[item.id] ?? new Set()));
  const plan = paces.filter(pace => pace.today.length).sort((a, b) => (a.days ?? 999) - (b.days ?? 999));
  const next = plan[0]?.today[0];
  const changeDate = (moduleId: string, date: string) => { setExamDate(moduleId, date); onProfile(loadProfile()!); };

  return <main className={cn('min-h-svh bg-background', !focus && 'lg:grid lg:grid-cols-[248px_minmax(0,1fr)]')}>
    <span className="sr-only" aria-live="polite">{focus ? 'Focus mode activated' : 'Focus mode deactivated'}</span>
    {!focus && <aside className="flex flex-col border-b bg-secondary/30 p-4 lg:sticky lg:top-0 lg:h-svh lg:border-b-0 lg:border-r lg:p-5">
      <Brand className="px-2"/>
      <nav className="mt-6 flex gap-1 lg:flex-col">
        <a className="flex items-center gap-2.5 rounded-lg bg-background px-3 py-2 text-sm font-medium shadow-xs ring-1 ring-border" href="/"><House size={16}/> Home</a>
        <a className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-background hover:text-foreground" href="#modules"><BookOpenText size={16}/> My modules</a>
      </nav>
      <div className="mt-8 hidden lg:block">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Modules</p>
        <div className="mt-2 space-y-0.5">{paces.map(({ module, days }) => <a key={module.id} href={`/module/${module.id}`} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-background"><span className="size-2 shrink-0 rounded-full bg-ember"/><span className="min-w-0 flex-1 truncate">{module.title}</span>{days !== null && <span className={cn('text-[11px] tabular-nums', days <= 7 ? 'font-semibold text-destructive' : 'text-muted-foreground')}>D-{days}</span>}</a>)}</div>
      </div>
      <button onClick={onReset} className="mt-auto hidden rounded-lg border bg-background p-3 text-left lg:block hover:bg-secondary">
        <span className="block text-sm font-medium">{profile.institution || 'Your profile'}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{profile.year} · Change profile</span>
      </button>
    </aside>}

    <div className={cn('mx-auto w-full px-5 py-10 sm:px-10 lg:py-14', focus ? 'max-w-[760px]' : 'max-w-5xl')}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><Kicker>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</Kicker><h1 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Your study path</h1><p className="mt-2 text-muted-foreground">Ordered by prerequisites, past exam evidence and the time left before each exam.</p></div>
        <div className="flex gap-2"><Button variant="outline" size="sm" className="lg:hidden" onClick={onReset}>Change profile</Button><Button variant="outline" size="sm" onClick={() => setFocus(previous => !previous)}>{focus ? <Minimize2 size={15}/> : <Maximize2 size={15}/>} {focus ? 'Exit focus' : 'Focus mode'}</Button></div>
      </div>

      <Card className="mt-10 overflow-hidden">
        <div className="grid gap-6 p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ember-deep">Revise now</p>
            {next ? <><h2 className="mt-3 text-2xl font-semibold tracking-tight">{next.topic.title}</h2><p className="mt-1.5 text-sm text-muted-foreground">{next.module.title} · {countdownLabel(plan[0].days)} · seen in {next.topic.appearanceCount} of {next.topic.examCount} reviewed exams</p></>
              : <><h2 className="mt-3 text-xl font-semibold tracking-tight">Your roadmap is being prepared</h2><p className="mt-1.5 text-sm text-muted-foreground">Course documents are still being analyzed. Your next concept will appear here.</p></>}
          </div>
          {next && <a className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/85" href={`/module/${next.module.id}/session`}>Start session <ArrowRight size={16}/></a>}
        </div>
        {plan.length > 0 && <div className="border-t bg-secondary/40 px-6 py-5 sm:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Today’s plan</p>
          <div className="mt-3 grid gap-5 md:grid-cols-2">{plan.map(pace => <div key={pace.module.id}>
            <p className="text-sm font-semibold">{pace.module.title} <span className="font-normal text-muted-foreground">· {pace.perDay} concept{pace.perDay === 1 ? '' : 's'} today{pace.days !== null ? `, ${pace.left} left before the exam` : ''}</span></p>
            <ol className="mt-2 space-y-1">{pace.today.map((item, index) => <li key={item.topic.id} className="flex items-center gap-2.5 text-sm"><span className="grid size-5 shrink-0 place-items-center rounded-full border bg-background font-mono text-[10px] text-muted-foreground">{index + 1}</span><span className="truncate">{item.topic.title}</span></li>)}</ol>
          </div>)}</div>
        </div>}
      </Card>

      {!focus && <section id="modules" className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight">My modules</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">{paces.map(({ module: item, days, left }) => {
          const map = maps[item.id];
          const ready = Boolean(map?.topics.length);
          const done = mastered[item.id]?.size ?? 0;
          return <Card key={item.id} className="p-5 transition-all hover:-translate-y-px hover:shadow-[0_10px_28px_rgba(24,24,27,0.06)]">
            <div className="flex items-center justify-between gap-3"><span className="grid size-9 place-items-center rounded-lg border bg-secondary text-ember-deep"><BookOpenText size={17}/></span>{days === null ? <Badge variant="outline">No exam date</Badge> : <Badge className={cn(days <= 7 && 'bg-[#fdecea] text-destructive')}>{countdownLabel(days)}</Badge>}</div>
            <a href={`/module/${item.id}`} className="mt-4 block font-semibold hover:underline">{item.title}</a>
            <p className="mt-1 text-sm text-muted-foreground">{item.level}{ready ? ` · ${map.topics.length} concepts · ${left} priority left` : ' · Analyzing documents'}</p>
            {ready && <Progress className="mt-4" value={(done / map.topics.length) * 100}/>}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-[13px] text-muted-foreground"><CalendarDays size={14}/><input type="date" min={today()} value={profile.examDates?.[item.id] ?? ''} onChange={event => changeDate(item.id, event.target.value)} aria-label={`Exam date for ${item.title}`} className="h-8 rounded-md border bg-background px-2 text-[13px] text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"/></label>
              <a href={`/module/${item.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium">Open <ArrowRight size={14}/></a>
            </div>
          </Card>;
        })}</div>
      </section>}
    </div>
  </main>;
}

export default function Home() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<CatalogProgram[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    // "/?reset" starts over as a first-time visitor (profile, quiz results, progress and view settings).
    if (new URLSearchParams(window.location.search).has('reset')) {
      for (const key of Object.keys(window.localStorage)) if (key.startsWith('revisionos:')) window.localStorage.removeItem(key);
      window.history.replaceState(null, '', '/');
    }
    setProfile(loadProfile()); fetch('/api/catalog').then(response => { if (!response.ok) throw new Error(); return response.json() as Promise<CatalogProgram[]>; }).then(setCatalog).catch(() => setError('The catalog is unavailable. Please retry.')); }, []);
  if (error) return <main className="mx-auto max-w-xl p-10" role="alert"><h1 className="text-2xl font-semibold">Unable to load RevisionOS</h1><p className="mt-3 text-muted-foreground">{error}</p><Button className="mt-5" onClick={() => window.location.reload()}>Retry</Button></main>;
  if (!catalog.length) return <main className="min-h-svh p-6"><div className="h-10 w-40 animate-pulse rounded-lg bg-secondary"/><div className="mx-auto mt-24 h-64 max-w-3xl animate-pulse rounded-xl bg-secondary"/></main>;
  if (profile) return <Dashboard profile={profile} catalog={catalog} onProfile={setProfile} onReset={() => { window.localStorage.removeItem(profileKey); setProfile(null); }}/>;
  return <Onboarding catalog={catalog} onFinish={next => { saveProfile(next); setProfile(next); if (next.moduleIds[0]) router.push(`/module/${next.moduleIds[0]}`); }}/>;
}

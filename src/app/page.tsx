'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpenText, CheckCircle2, GitBranch, GraduationCap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { CatalogProgram } from '@/shared/types';

const fieldClass = 'h-12 w-full rounded-xl border border-[#cbd8df] bg-white px-4 text-sm text-[#18324a] outline-none transition focus:border-[#49998b] focus:ring-2 focus:ring-[#b4ded3]';

export default function Home() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<CatalogProgram[]>([]);
  const [institution, setInstitution] = useState('ESI Algiers');
  const [programId, setProgramId] = useState('esi-informatique');
  const [moduleId, setModuleId] = useState('esi-alg1');
  const [examDate, setExamDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/catalog').then(response => response.json()).then(setCatalog)
      .catch(() => setError('The server is unavailable. Start the backend to view programs.'));
  }, []);

  const institutions = useMemo(() => [...new Set(catalog.map(item => item.institution))], [catalog]);
  const programs = catalog.filter(item => item.institution === institution);
  const program = programs.find(item => item.id === programId);
  const module = program?.modules.find(item => item.id === moduleId);

  function changeInstitution(value: string) {
    const first = catalog.find(item => item.institution === value);
    setInstitution(value);
    setProgramId(first?.id ?? '');
    setModuleId(first?.modules[0]?.id ?? '');
  }

  function changeProgram(value: string) {
    const next = catalog.find(item => item.id === value);
    setProgramId(value);
    setModuleId(next?.modules[0]?.id ?? '');
  }

  return <main className="min-h-screen">
    <header className="border-b border-[#dce5e8] bg-white/85">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <a href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-[#173654]"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#173654] text-white"><GitBranch size={19}/></span> RevisionOS</a>
        <a href="/admin" className="text-sm font-medium text-[#537085] hover:text-[#173654]">Admin workspace</a>
      </div>
    </header>

    <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16 lg:pt-20">
      <div>
        <Badge className="bg-[#e4f3ed] text-[#1a6b5e]"><Sparkles size={13} className="mr-1.5"/> Built for Algerian students</Badge>
        <h1 className="mt-7 max-w-2xl text-5xl font-bold leading-[1.08] tracking-[-0.055em] text-[#173654] sm:text-6xl">Study in the <span className="text-[#2b907e]">right order.</span></h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[#5c7180]">Know what to study, where to start, and why each concept matters for your exam. A clear roadmap grounded in course materials and past papers.</p>
        <div className="mt-9 grid max-w-xl gap-5 sm:grid-cols-3">
          <div className="flex items-start gap-2 text-sm leading-5 text-[#476577]"><BookOpenText className="shrink-0 text-[#2b907e]" size={18}/><span>Course-based concepts</span></div>
          <div className="flex items-start gap-2 text-sm leading-5 text-[#476577]"><GitBranch className="shrink-0 text-[#2b907e]" size={18}/><span>Visible prerequisites</span></div>
          <div className="flex items-start gap-2 text-sm leading-5 text-[#476577]"><CheckCircle2 className="shrink-0 text-[#2b907e]" size={18}/><span>Progress at your pace</span></div>
        </div>
        <div className="mt-12 hidden max-w-lg rounded-2xl border border-[#dbe4e9] bg-white p-5 shadow-[0_12px_40px_rgba(29,56,76,0.05)] lg:block" aria-hidden="true">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#8496a0]">Your study path</p>
          <div className="flex items-center gap-2 text-xs sm:gap-3">
            <span className="rounded-xl border border-[#9ed6c7] bg-[#e8f8f0] px-3 py-3 font-semibold text-[#227666]">Logic ✓</span><span className="h-px flex-1 bg-[#8fc4b6]"/><span className="rounded-xl border border-[#a7cfdf] bg-[#e8f4f8] px-3 py-3 font-semibold text-[#245673]">Polynomials</span><span className="h-px flex-1 bg-[#8fc4b6]"/><span className="rounded-xl border border-[#eed7ad] bg-[#fff8e9] px-3 py-3 font-semibold text-[#926423]">Fractions</span>
          </div>
        </div>
      </div>

      <Card className="p-6 sm:p-8">
        <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7f2ed] text-[#2b907e]"><GraduationCap size={25}/></div>
        <h2 className="text-2xl font-bold tracking-tight">Set up your roadmap</h2>
        <p className="mt-2 text-sm leading-6 text-[#68808d]">Choose your program and module. A quick check will then shape your study path.</p>
        <div className="mt-7 space-y-5">
          <label className="block"><span className="mb-2 block text-sm font-semibold">Institution</span><select className={fieldClass} value={institution} onChange={event => changeInstitution(event.target.value)}>{institutions.map(item => <option key={item}>{item}</option>)}</select></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold">Program / specialization</span><select className={fieldClass} value={programId} onChange={event => changeProgram(event.target.value)}>{programs.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold">Module and year</span><select className={fieldClass} value={moduleId} onChange={event => setModuleId(event.target.value)}>{program?.modules.map(item => <option key={item.id} value={item.id}>{item.title} · {item.level}{item.ready ? '' : ' · coming soon'}</option>)}</select></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold">Exam date <span className="font-normal text-[#8395a0]">(optional)</span></span><input type="date" className={fieldClass} value={examDate} onChange={event => setExamDate(event.target.value)}/></label>
        </div>
        {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
        {module && !module.ready && <p className="mt-4 rounded-xl bg-[#fff7e5] p-3 text-sm text-[#826126]">This program is listed, but its study resources are not available yet.</p>}
        <Button className="mt-7 w-full" size="lg" disabled={!module?.ready} onClick={() => router.push(`/module/${moduleId}${examDate ? `?examDate=${examDate}` : ''}`)}>Start the quick check <ArrowRight size={17}/></Button>
        <p className="mt-4 text-center text-xs text-[#8a9ba5]">About 7 questions · no account needed for the demo</p>
      </Card>
    </div>
  </main>;
}

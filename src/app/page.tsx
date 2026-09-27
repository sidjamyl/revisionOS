'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpenText, CheckCircle2, GitBranch, GraduationCap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { CatalogProgram } from '@/shared/types';

const fieldClass = 'h-12 w-full rounded-[10px] border border-[#e4e0db] bg-[#f6f5f1] px-4 text-sm text-[#1c1b21] outline-none transition focus:border-[#ed8139] focus:ring-2 focus:ring-[#fcdfc6]';

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
    <header className="border-b border-[#e4e0db] bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <a href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-[#1c1b21]"><span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#ed8139] text-white"><GitBranch size={19}/></span> RevisionOS</a>
        <a href="/admin" className="text-sm font-medium text-[#646269] hover:text-[#1c1b21]">Admin workspace</a>
      </div>
    </header>

    <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start lg:gap-16 lg:pt-12">
      <div className="hidden lg:block">
        <Badge className="bg-[#fcf0e4] text-[#965935]"><Sparkles size={13} className="mr-1.5"/> Built for Algerian students</Badge>
        <h1 className="mt-7 max-w-2xl text-5xl font-extrabold leading-[1.08] tracking-[-0.035em] text-[#1c1b21] sm:text-6xl">Study in the right order.</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[#4a4951]">Know what to study, where to start, and why each concept matters for your exam. A clear roadmap grounded in course materials and past papers.</p>
        <div className="mt-9 grid max-w-xl gap-5 sm:grid-cols-3">
          <div className="flex items-start gap-2 text-sm leading-5 text-[#4a4951]"><BookOpenText className="shrink-0 text-[#965935]" size={18}/><span>Course-based concepts</span></div>
          <div className="flex items-start gap-2 text-sm leading-5 text-[#4a4951]"><GitBranch className="shrink-0 text-[#965935]" size={18}/><span>Visible prerequisites</span></div>
          <div className="flex items-start gap-2 text-sm leading-5 text-[#4a4951]"><CheckCircle2 className="shrink-0 text-[#965935]" size={18}/><span>Progress at your pace</span></div>
        </div>
        <div className="mt-12 hidden max-w-lg rounded-2xl border border-[#e4e0db] bg-[#fcf1e3] p-5 lg:block" aria-hidden="true">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-[#646269]">Your study path</p>
          <div className="flex items-center gap-2 text-xs sm:gap-3">
            <span className="rounded-[10px] border border-[#d5e8d9] bg-[#f4faf5] px-3 py-3 font-semibold text-[#346d4a]">Logic ✓</span><span className="h-px flex-1 bg-[#eea973]"/><span className="rounded-[10px] border border-[#ed8139] bg-white px-3 py-3 font-semibold text-[#965935]">Polynomials</span><span className="h-px flex-1 bg-[#cfcac3]"/><span className="rounded-[10px] border border-[#e4e0db] bg-white px-3 py-3 font-semibold text-[#56606f]">Fractions</span>
          </div>
        </div>
      </div>

      <Card className="p-6 sm:p-7">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fcf0e4] text-[#965935]"><GraduationCap size={23}/></div>
        <h2 className="text-2xl font-bold tracking-tight">Set up your roadmap</h2>
        <p className="mt-2 text-sm leading-6 text-[#646269]">Choose your program and module. A quick check will then shape your study path.</p>
        <div className="mt-5 space-y-4">
          <label className="block"><span className="mb-2 block text-sm font-semibold">Institution</span><select className={fieldClass} value={institution} onChange={event => changeInstitution(event.target.value)}>{institutions.map(item => <option key={item}>{item}</option>)}</select></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold">Program / specialization</span><select className={fieldClass} value={programId} onChange={event => changeProgram(event.target.value)}>{programs.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold">Module and year</span><select className={fieldClass} value={moduleId} onChange={event => setModuleId(event.target.value)}>{program?.modules.map(item => <option key={item.id} value={item.id}>{item.title} · {item.level}{item.ready ? '' : ' · coming soon'}</option>)}</select></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold">Exam date <span className="font-normal text-[#8395a0]">(optional)</span></span><input type="date" className={fieldClass} value={examDate} onChange={event => setExamDate(event.target.value)}/></label>
        </div>
        {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
        {module && !module.ready && <p className="mt-4 rounded-xl bg-[#fff7e5] p-3 text-sm text-[#826126]">This program is listed, but its study resources are not available yet.</p>}
        <Button className="mt-5 w-full" size="lg" disabled={!module?.ready} onClick={() => router.push(`/module/${moduleId}${examDate ? `?examDate=${examDate}` : ''}`)}>Start the quick check <ArrowRight size={17}/></Button>
        <p className="mt-3 text-center text-xs text-[#646269]">About 7 questions · no account needed for the demo</p>
      </Card>
    </div>
  </main>;
}

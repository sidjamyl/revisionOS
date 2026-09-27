'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, FileUp, LockKeyhole, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { CatalogProgram, ExamOccurrence } from '@/shared/types';

type DocumentRow = { id: string; title: string; kind: string; year: number | null; status: string; error: string | null };
type Stats = { occurrences: ExamOccurrence[]; topics: { id: string; title: string; appearanceCount: number; examCount: number; averagePoints: number | null; importance: number }[]; isDemonstration: boolean };
const field = 'h-11 w-full rounded-xl border border-[#cbd8df] bg-white px-3 text-sm outline-none focus:border-[#49998b]';

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [catalog, setCatalog] = useState<CatalogProgram[]>([]);
  const [moduleId, setModuleId] = useState('esi-alg1');
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [kind, setKind] = useState('course');
  const [year, setYear] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setToken(window.sessionStorage.getItem('revisionos:admin-token') ?? '');
    fetch('/api/catalog').then(response => response.json()).then(setCatalog).catch(() => setMessage('Unable to load the catalog.'));
  }, []);

  async function refresh() {
    setMessage('');
    const headers = { Authorization: `Bearer ${token}` };
    const [docsResponse, statsResponse] = await Promise.all([
      fetch(`/api/admin/modules/${moduleId}/documents`, { headers }),
      fetch(`/api/admin/modules/${moduleId}/stats`, { headers }),
    ]);
    if (!docsResponse.ok || !statsResponse.ok) { setMessage('Admin access failed. Check the token and API.'); return; }
    setDocuments(await docsResponse.json());
    setStats(await statsResponse.json());
    window.sessionStorage.setItem('revisionos:admin-token', token);
  }

  async function upload() {
    if (!file) return;
    setBusy(true); setMessage('');
    try {
      const form = new FormData(); form.append('file', file);
      const query = new URLSearchParams({ kind, title: file.name });
      if (year) query.set('year', year);
      const response = await fetch(`/api/admin/modules/${moduleId}/documents?${query}`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Upload failed.');
      setMessage('PDF received. AI analysis is running; refresh the list to see its status.');
      setFile(null);
      await refresh();
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Upload failed.'); }
    finally { setBusy(false); }
  }

  const modules = catalog.flatMap(program => program.modules.filter(item => item.ready));
  return <main className="min-h-screen"><header className="border-b border-[#dce5e8] bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8"><a href="/" className="flex items-center gap-2 text-sm font-semibold text-[#527080]"><ArrowLeft size={17}/> Back to home</a><span className="text-sm font-bold text-[#173654]">RevisionOS · Admin</span></div></header>
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8"><div className="flex items-center gap-3"><span className="rounded-xl bg-[#e7f2ed] p-3 text-[#2b907e]"><LockKeyhole size={23}/></span><div><h1 className="text-3xl font-bold tracking-tight">Document workspace</h1><p className="mt-1 text-sm text-[#6e8490]">Upload sources and inspect exam points before presenting recommendations.</p></div></div>
      <Card className="mt-8 grid gap-4 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><label className="text-sm font-semibold">Admin token<input type="password" className={`${field} mt-2`} value={token} onChange={event => setToken(event.target.value)} placeholder="ADMIN_TOKEN from .env.local"/></label><label className="text-sm font-semibold">Module<select className={`${field} mt-2`} value={moduleId} onChange={event => setModuleId(event.target.value)}>{modules.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><Button onClick={refresh}><RefreshCw size={16}/> Load data</Button></Card>
      {message && <p className="mt-4 rounded-xl bg-[#eaf3f4] px-4 py-3 text-sm text-[#315e70]" role="status">{message}</p>}
      <div className="mt-7 grid gap-6 lg:grid-cols-[360px_1fr]"><Card className="h-fit p-5"><h2 className="flex items-center gap-2 text-lg font-bold"><FileUp size={19} className="text-[#2b907e]"/> Add a PDF</h2><p className="mt-2 text-sm leading-6 text-[#738a95]">Courses extract concepts and prerequisites. TDs and exams link questions to the extracted concepts.</p><div className="mt-5 space-y-4"><label className="block text-sm font-semibold">Document type<select className={`${field} mt-2`} value={kind} onChange={event => setKind(event.target.value)}><option value="course">Course</option><option value="td">Tutorial / TD</option><option value="exam">Past exam</option></select></label>{kind === 'exam' && <label className="block text-sm font-semibold">Exam year<input type="number" min="2000" max="2100" className={`${field} mt-2`} value={year} onChange={event => setYear(event.target.value)} placeholder="e.g. 2024"/></label>}<label className="block text-sm font-semibold">PDF file<input type="file" accept="application/pdf,.pdf" className="mt-2 block w-full rounded-xl border border-dashed border-[#cbd8df] bg-[#f9fbfb] p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#e7f2ed] file:px-3 file:py-2 file:text-[#226a5c]" onChange={event => setFile(event.target.files?.[0] ?? null)}/></label></div><Button className="mt-5 w-full" disabled={!file || busy || !token} onClick={upload}>{busy ? 'Uploading…' : 'Upload and analyze'}</Button><p className="mt-3 text-xs leading-5 text-[#889ba4]">A configured Gemini or Ollama model and PostgreSQL are required for processing.</p></Card>
      <div className="space-y-6"><Card className="p-5"><h2 className="text-lg font-bold">Imported documents</h2><div className="mt-4 space-y-2">{documents.length === 0 && <p className="text-sm text-[#8296a0]">No documents loaded yet.</p>}{documents.map(document => <div key={document.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#e1e9eb] px-3 py-3 text-sm"><span className="font-medium">{document.title} {document.year ? `· ${document.year}` : ''}</span><div className="flex items-center gap-2"><Badge>{document.kind}</Badge><Badge className={document.status === 'failed' ? 'bg-[#ffede8] text-red-700' : document.status === 'complete' ? 'bg-[#e5f5e9] text-green-800' : 'bg-[#fff2d6] text-amber-800'}>{document.status}</Badge></div>{document.error && <p className="w-full text-xs text-red-700">{document.error}</p>}</div>)}</div></Card>
      <Card className="overflow-hidden"><div className="border-b border-[#e1e9eb] p-5"><h2 className="text-lg font-bold">Exam evidence and points</h2><p className="mt-1 text-sm text-[#79909b]">One primary topic per subquestion; unknown points are not treated as zero.</p>{stats?.isDemonstration && <p className="mt-2 text-xs text-[#a1722a]">Source-backed preview; exam coverage is incomplete.</p>}</div><div className="max-h-[410px] overflow-auto"><table className="w-full min-w-[540px] text-left text-sm"><thead className="sticky top-0 bg-[#f6f9f9] text-xs uppercase tracking-wide text-[#79909b]"><tr><th className="px-5 py-3">Topic</th><th className="px-4 py-3">Frequency</th><th className="px-4 py-3">Avg. points</th><th className="px-4 py-3">Priority</th></tr></thead><tbody>{stats?.topics.map(topic => <tr key={topic.id} className="border-t border-[#edf1f2]"><td className="px-5 py-3 font-medium">{topic.title}</td><td className="px-4 py-3">{topic.appearanceCount}/{topic.examCount}</td><td className="px-4 py-3">{topic.averagePoints === null ? 'Unknown' : topic.averagePoints.toFixed(1)}</td><td className="px-4 py-3">{topic.importance}/100</td></tr>)}</tbody></table>{!stats && <p className="p-5 text-sm text-[#8296a0]">Load data to inspect the module.</p>}</div></Card></div></div>
    </div>
  </main>;
}

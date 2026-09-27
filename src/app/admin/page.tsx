'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronDown, FileUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { CatalogProgram, ExamOccurrence, Source } from '@/shared/types';

type DocumentRow = { id: string; title: string; kind: string; year: number | null; status: string; error: string | null };
type TopicAudit = { id: string; title: string; chapter: string; summary: string; prerequisites: string[]; sources: Source[]; confidence: number; appearanceCount: number; examCount: number; averagePoints: number | null; importance: number };
type Stats = { occurrences: ExamOccurrence[]; topics: TopicAudit[]; isDemonstration: boolean };
const field = 'mt-2 h-11 w-full rounded-xl border border-[#e4e0db] bg-white px-3 text-sm outline-none focus:border-[#ed8139] focus:ring-2 focus:ring-[#fcf0e4]';

function points(value: number | null, estimated = false) {
  return value === null ? 'Unknown' : `${estimated ? '≈ ' : ''}${value.toFixed(value % 1 ? 1 : 0)} pt`;
}

export default function AdminPage() {
  const [catalog, setCatalog] = useState<CatalogProgram[]>([]);
  const [moduleId, setModuleId] = useState('esi-alg1');
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [kind, setKind] = useState('course');
  const [year, setYear] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { const requested = new URLSearchParams(window.location.search).get('module'); if (requested) setModuleId(requested); }, []);
  useEffect(() => { fetch('/api/catalog').then(response => response.json()).then(setCatalog).catch(() => setMessage('Unable to load the catalog.')); }, []);
  const modules = catalog.flatMap(program => program.modules.filter(item => item.ready));

  async function refresh() {
    setMessage('');
    const [docsResponse, statsResponse] = await Promise.all([fetch(`/api/admin/modules/${moduleId}/documents`), fetch(`/api/admin/modules/${moduleId}/stats`)]);
    if (!docsResponse.ok || !statsResponse.ok) { setMessage('Unable to load this module audit.'); return; }
    setDocuments(await docsResponse.json());
    setStats(await statsResponse.json());
  }

  useEffect(() => { if (catalog.length) void refresh(); }, [moduleId, catalog.length]);

  async function upload() {
    if (!file) return;
    setBusy(true); setMessage('');
    try {
      const form = new FormData(); form.append('file', file);
      const query = new URLSearchParams({ kind, title: file.name });
      if (year) query.set('year', year);
      const response = await fetch(`/api/admin/modules/${moduleId}/documents?${query}`, { method: 'POST', body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Upload failed.');
      setMessage('PDF received. Analysis is running; refresh to inspect its output.'); setFile(null);
      await refresh();
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Upload failed.'); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-white"><header className="border-b border-[#e4e0db] bg-white"><div className="mx-auto flex max-w-[1540px] items-center justify-between px-5 py-4 sm:px-8"><a href="/" className="flex items-center gap-2 text-sm font-semibold text-[#646269]"><ArrowLeft size={17}/> Back to roadmap</a><span className="text-sm font-bold tracking-tight text-[#1c1b21]">RevisionOS · Admin audit</span></div></header>
    <div className="mx-auto max-w-[1540px] px-5 py-8 sm:px-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-extrabold tracking-tight text-[#1c1b21]">Module audit</h1><p className="mt-2 text-sm text-[#646269]">Inspect the pipeline output before presenting it to students. This MVP route is intentionally open.</p></div><Button variant="outline" onClick={refresh}><RefreshCw size={16}/> Refresh data</Button></div>
      <Card className="mt-7 grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><label className="text-sm font-semibold">Module<select className={field} value={moduleId} onChange={event => setModuleId(event.target.value)}>{modules.map(item => <option key={item.id} value={item.id}>{item.title} · {item.level}</option>)}</select></label><Button onClick={refresh}><RefreshCw size={16}/> Load audit</Button></Card>
      {message && <p className="mt-4 rounded-xl border border-[#e4e0db] bg-[#f6f5f1] px-4 py-3 text-sm text-[#4a4951]" role="status">{message}</p>}
      <div className="mt-7 grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]"><Card className="h-fit p-5"><h2 className="flex items-center gap-2 text-lg font-bold"><FileUp size={19} className="text-[#965935]"/> Add a source</h2><p className="mt-2 text-sm leading-6 text-[#646269]">Courses create concepts; TDs and exams match them to questions.</p><div className="mt-5 space-y-4"><label className="block text-sm font-semibold">Document type<select className={field} value={kind} onChange={event => setKind(event.target.value)}><option value="course">Course</option><option value="td">Tutorial / TD</option><option value="exam">Past exam</option></select></label>{kind === 'exam' && <label className="block text-sm font-semibold">Exam year<input type="number" min="2000" max="2100" className={field} value={year} onChange={event => setYear(event.target.value)} placeholder="e.g. 2024"/></label>}<label className="block text-sm font-semibold">PDF file<input type="file" accept="application/pdf,.pdf" className="mt-2 block w-full rounded-xl border border-dashed border-[#cfcac3] bg-[#f6f5f1] p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#fcf0e4] file:px-3 file:py-2 file:text-[#965935]" onChange={event => setFile(event.target.files?.[0] ?? null)}/></label></div><Button className="mt-5 w-full" disabled={!file || busy} onClick={upload}>{busy ? 'Uploading…' : 'Upload and analyze'}</Button><p className="mt-3 text-xs leading-5 text-[#646269]">No sign-in is required in this hackathon MVP.</p></Card>
        <div className="space-y-6"><Card className="p-5"><h2 className="text-lg font-bold">Imported documents</h2><div className="mt-4 space-y-2">{documents.length === 0 && <p className="text-sm text-[#646269]">No uploaded documents for this module.</p>}{documents.map(document => <div key={document.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#e4e0db] px-3 py-3 text-sm"><span className="font-medium">{document.title} {document.year ? `· ${document.year}` : ''}</span><div className="flex items-center gap-2"><Badge>{document.kind}</Badge><Badge className={document.status === 'failed' ? 'bg-[#fbebe9] text-[#b8322c]' : document.status === 'complete' ? 'bg-[#f4faf5] text-[#346d4a]' : 'bg-[#fdf5d4] text-[#7a5a00]'}>{document.status}</Badge></div>{document.error && <p className="w-full text-xs text-[#b8322c]">{document.error}</p>}</div>)}</div></Card>
          <Card className="overflow-hidden"><div className="border-b border-[#e4e0db] p-5"><h2 className="text-lg font-bold">Scoring audit</h2><p className="mt-1 text-sm text-[#646269]">Frequency, average point value and the final priority score for every extracted topic.</p></div><div className="max-h-[430px] overflow-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="sticky top-0 bg-[#f6f5f1] text-xs uppercase tracking-wide text-[#646269]"><tr><th className="px-5 py-3">Topic</th><th className="px-4 py-3">Frequency</th><th className="px-4 py-3">Average points</th><th className="px-4 py-3">Score</th></tr></thead><tbody>{stats?.topics.map(topic => <tr key={topic.id} className="border-t border-[#e4e0db]"><td className="px-5 py-3 font-medium">{topic.title}</td><td className="px-4 py-3">{topic.appearanceCount}/{topic.examCount} exams</td><td className="px-4 py-3">{points(topic.averagePoints)}</td><td className="px-4 py-3 font-semibold tabular-nums">{topic.importance}/100</td></tr>)}</tbody></table>{!stats && <p className="p-5 text-sm text-[#646269]">Load a module to inspect its score.</p>}</div></Card>
          <div className="space-y-3"><h2 className="text-lg font-bold text-[#1c1b21]">Extracted topics and evidence</h2>{stats?.topics.map(topic => <details key={topic.id} className="rounded-2xl border border-[#e4e0db] bg-white p-5"><summary className="flex cursor-pointer list-none items-start justify-between gap-4"><div><p className="font-bold text-[#1c1b21]">{topic.title}</p><p className="mt-1 text-sm text-[#646269]">{topic.chapter} · confidence {Math.round(topic.confidence * 100)}%</p></div><ChevronDown size={18} className="mt-1 shrink-0 text-[#646269]"/></summary><p className="mt-4 max-w-3xl text-sm leading-6 text-[#4a4951]">{topic.summary}</p><div className="mt-4 grid gap-4 text-sm md:grid-cols-2"><div><h3 className="font-semibold">Prerequisites</h3><p className="mt-1 text-[#646269]">{topic.prerequisites.length ? topic.prerequisites.map(id => stats.topics.find(item => item.id === id)?.title ?? id).join(' · ') : 'Independent topic'}</p></div><div><h3 className="font-semibold">Mapped exam questions</h3><p className="mt-1 text-[#646269]">{stats.occurrences.filter(item => item.topicId === topic.id).map(item => `${item.year || 'Unknown'}: ${item.question} (${points(item.points, item.estimatedPoints)})`).join(' · ') || 'None yet'}</p></div></div><div className="mt-4 space-y-2">{topic.sources.map(source => <div key={source.id} className="rounded-xl bg-[#f6f5f1] p-3 text-xs"><span className="font-bold text-[#1c1b21]">{source.kind} · {source.title}{source.page ? ` · page ${source.page}` : ''}</span><p className="mt-1 leading-5 text-[#646269]">{source.excerpt}</p></div>)}</div></details>)}</div>
        </div></div>
    </div>
  </main>;
}

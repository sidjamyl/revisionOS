'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, X } from 'lucide-react';
import type { Source } from '@/shared/types';

export function PdfPreview({ source, onClose }: { source: Source; onClose: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const imageUrl = source.url?.match(/^\/api\/documents\/[^/]+\/file$/) ? source.url.replace(/\/file$/, `/page/${source.page ?? 1}`) : null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1b21]/50 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={`PDF preview: ${source.title}`} onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="flex h-[min(900px,94vh)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(28,27,33,0.22)]">
      <div className="flex items-center justify-between gap-4 border-b border-[#e4e0db] px-4 py-3 sm:px-6"><div className="min-w-0"><p className="text-xs font-bold text-[#965935]">{source.kind.toUpperCase()}{source.page ? ` · PDF page ${source.page}` : ''}</p><h2 className="truncate text-base font-bold">{source.title}</h2></div><button className="rounded-md p-2 text-[#646269] hover:bg-[#f7f7f8] focus-visible:outline-2 focus-visible:outline-[#ed8139]" onClick={onClose} aria-label="Close PDF preview"><X size={20}/></button></div>
      <div className="min-h-0 flex-1 overflow-auto bg-[#f7f7f8] text-center">{imageUrl && !failed ? <><img className="mx-auto h-auto max-w-full bg-white" src={imageUrl} alt={`PDF page ${source.page ?? 1} from ${source.title}`} onLoad={() => setLoaded(true)} onError={() => setFailed(true)}/>{!loaded && <p className="p-8 text-sm text-[#646269]">Rendering the cited PDF page…</p>}</> : <p className="p-8 text-sm text-[#646269]">The page preview is unavailable. You can still open the PDF.</p>}</div>
      <div className="flex items-center justify-between gap-3 border-t border-[#e4e0db] px-4 py-3 sm:px-6"><p className="min-w-0 truncate text-xs text-[#646269]">{source.excerpt}</p>{source.url && <a className="inline-flex shrink-0 items-center gap-2 rounded-[10px] bg-[#1c1b21] px-4 py-2 text-sm font-bold text-white hover:bg-[#4a4951]" href={`${source.url}${source.page ? `#page=${source.page}` : ''}`} target="_blank" rel="noreferrer"><ExternalLink size={16}/> Open PDF</a>}</div>
    </section>
  </div>;
}

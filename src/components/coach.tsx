'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp, ChevronDown, MessageCircleQuestion, Sparkles, X } from 'lucide-react';
import { LogoMark } from '@/components/brand';
import { cn } from '@/lib/utils';
import type { RoadmapTopic } from '@/shared/types';

type Message = { role: 'student' | 'coach'; text: string };

// Suggested questions are built from the selected concept; answers are a front-end placeholder for now.
function suggestions(topic: RoadmapTopic, prerequisiteTitles: string[]): string[] {
  const list = [`Explain “${topic.title}” simply, with an example.`];
  if (prerequisiteTitles[0]) list.push(`How does ${topic.title} build on ${prerequisiteTitles[0]}?`);
  if (topic.appearanceCount > 0) list.push(`What kind of exam question uses ${topic.title}?`);
  if (topic.averagePoints !== null) list.push(`How do I earn the ${topic.averagePoints.toFixed(1)} points it is usually worth?`);
  list.push(`Give me a quick exercise on ${topic.title}.`, `What mistakes do students often make with ${topic.title}?`);
  return list.slice(0, 4);
}

export function Coach({ topic, prerequisiteTitles, onClose }: { topic: RoadmapTopic; prerequisiteTitles: string[]; onClose: () => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const prompts = suggestions(topic, prerequisiteTitles);

  useEffect(() => { setMessages([]); setDraft(''); setTyping(false); }, [topic.id]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [messages, typing]);

  function ask(text: string) {
    const question = text.trim();
    if (!question || typing) return;
    setOpen(true); setDraft('');
    setMessages(previous => [...previous, { role: 'student', text: question }]);
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMessages(previous => [...previous, { role: 'coach', text: `The coach is coming soon. For now, start with the course passage and the TD exercise linked to “${topic.title}” in the panel on the right.` }]);
    }, 900);
  }

  return <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(16px,env(safe-area-inset-bottom))]">
    <section aria-label={`Ask coach about ${topic.title}`} className="pointer-events-auto w-full max-w-2xl overflow-hidden rounded-2xl border bg-white/95 shadow-[0_18px_50px_rgba(28,27,33,0.18)] backdrop-blur-md">
      <header className="flex items-center gap-2.5 px-4 pt-3">
        <LogoMark size={22}/>
        <p className="min-w-0 flex-1 truncate text-sm"><b className="font-semibold">Ask coach</b><span className="text-muted-foreground"> · {topic.title}</span></p>
        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">Preview</span>
        {messages.length > 0 && <button className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary" onClick={() => setOpen(previous => !previous)} aria-label={open ? 'Collapse conversation' : 'Expand conversation'}><ChevronDown size={16} className={cn('transition-transform', !open && 'rotate-180')}/></button>}
        <button className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary" onClick={onClose} aria-label="Close coach"><X size={16}/></button>
      </header>

      {open && messages.length > 0 && <div className="mt-3 max-h-[min(320px,40vh)] space-y-2.5 overflow-y-auto border-y bg-secondary/40 px-4 py-3" aria-live="polite">
        {messages.map((message, index) => <div key={index} className={cn('flex', message.role === 'student' ? 'justify-end' : 'justify-start')}>
          <p className={cn('max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-6', message.role === 'student' ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md border bg-white text-foreground')}>{message.text}</p>
        </div>)}
        {typing && <div className="flex"><span className="inline-flex gap-1 rounded-2xl rounded-bl-md border bg-white px-3.5 py-3" aria-label="Coach is typing">{[0, 1, 2].map(dot => <i key={dot} className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: `${dot * 120}ms` }}/>)}</span></div>}
        <div ref={endRef}/>
      </div>}

      <div className="flex gap-2 overflow-x-auto px-4 pt-3 [scrollbar-width:none]">{prompts.map(prompt => <button key={prompt} onClick={() => ask(prompt)} disabled={typing} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-[13px] text-foreground/85 transition-colors hover:border-ember/50 hover:bg-[#fffaf5] disabled:opacity-50"><Sparkles size={13} className="text-ember"/>{prompt}</button>)}</div>

      <form className="flex items-center gap-2 p-3" onSubmit={event => { event.preventDefault(); ask(draft); }}>
        <MessageCircleQuestion size={18} className="ml-1 shrink-0 text-muted-foreground"/>
        <input value={draft} onChange={event => setDraft(event.target.value)} placeholder={`Ask anything about ${topic.title}…`} className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"/>
        <button type="submit" disabled={!draft.trim() || typing} className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-30" aria-label="Send question"><ArrowUp size={16}/></button>
      </form>
    </section>
  </div>;
}

import * as React from 'react';
import { cn } from '@/lib/utils';

// "Le chemin": the ink path ends on the orange arrival dot. Orange stays on the dot only.
export function LogoMark({ size = 28, inverse = false, className }: { size?: number; inverse?: boolean; className?: string }) {
  const ink = inverse ? '#FFFFFF' : '#1C1B21';
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
    <circle cx="13" cy="13" r="4.5" stroke={ink} strokeWidth="3.5"/>
    <path d="M13 17.5 V25 A9 9 0 0 0 22 34 H27" stroke={ink} strokeWidth="3.5" strokeLinecap="round"/>
    <circle cx="33" cy="34" r="6" fill="#ED8139"/>
  </svg>;
}

export function Wordmark({ className }: { className?: string }) {
  return <span className={cn('font-extrabold tracking-[-0.02em] text-[#1C1B21]', className)}>Revision <span className="font-bold text-[#646269]">OS</span></span>;
}

export function Brand({ className }: { className?: string }) {
  return <a href="/" aria-label="Revision OS home" className={cn('inline-flex items-center gap-1.5 text-[17px]', className)}>
    <LogoMark size={32}/>
    <Wordmark/>
  </a>;
}

export function AppHeader({ children, center }: { children?: React.ReactNode; center?: React.ReactNode }) {
  return <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
    <div className="mx-auto grid h-16 w-[min(calc(100%-40px),1240px)] grid-cols-[1fr_auto_1fr] items-center">
      <Brand/>
      <div className="text-sm text-muted-foreground">{center}</div>
      <div className="flex items-center justify-end gap-2">{children}</div>
    </div>
  </header>;
}

export function Kicker({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex h-7 items-center gap-2 rounded-full border bg-secondary/60 px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
    <span className="size-1.5 rounded-full bg-ember shadow-[0_0_0_4px_rgba(237,129,57,0.14)]"/>{children}
  </span>;
}

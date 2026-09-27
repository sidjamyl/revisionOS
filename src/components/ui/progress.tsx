import * as React from 'react';
import { cn } from '@/lib/utils';

export function Progress({ value, className, ...props }: React.ComponentProps<'div'> & { value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  return <div data-slot="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(clamped)} className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-secondary', className)} {...props}>
    <div className="h-full rounded-full bg-ember transition-[width] duration-300 ease-out" style={{ width: `${clamped}%` }}/>
  </div>;
}

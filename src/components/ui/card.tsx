import * as React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('rounded-2xl border border-[#e4e0db] bg-white shadow-[0_1px_2px_rgba(28,27,33,0.04),0_2px_8px_rgba(28,27,33,0.04)]', className)} {...props} />;
}

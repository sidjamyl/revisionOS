import * as React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('rounded-2xl border border-[#dbe4e9] bg-white shadow-[0_6px_28px_rgba(29,56,76,0.04)]', className)} {...props} />;
}

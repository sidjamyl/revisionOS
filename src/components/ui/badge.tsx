import * as React from 'react';
import { cn } from '@/lib/utils';

export function Badge({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={cn('inline-flex items-center rounded-md bg-[#f6f5f1] px-2.5 py-1 text-xs font-bold text-[#4a4951]', className)} {...props} />;
}

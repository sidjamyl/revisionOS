import * as React from 'react';
import { cn } from '@/lib/utils';

export function Badge({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={cn('inline-flex items-center rounded-full bg-[#e6f0f4] px-2.5 py-1 text-xs font-semibold text-[#31566c]', className)} {...props} />;
}

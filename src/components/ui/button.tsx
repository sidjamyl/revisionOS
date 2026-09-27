import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const variants = cva('inline-flex items-center justify-center gap-2 rounded-[10px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ed8139] disabled:pointer-events-none disabled:opacity-50', {
  variants: {
    variant: {
      default: 'bg-[#1c1b21] text-[#fffcf7] hover:bg-[#4a4951]',
      secondary: 'bg-[#f6f5f1] text-[#1c1b21] hover:bg-[#e4e0db]',
      outline: 'border border-[#e4e0db] bg-white text-[#1c1b21] hover:bg-[#f6f5f1]',
      ghost: 'text-[#1c1b21] hover:bg-[#fcf0e4]',
    },
    size: { default: 'h-11 px-5 text-sm', sm: 'h-9 px-3 text-sm', lg: 'h-12 px-6 text-base' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

export function Button({ className, variant, size, ...props }: React.ComponentProps<'button'> & VariantProps<typeof variants>) {
  return <button className={cn(variants({ variant, size }), className)} {...props} />;
}

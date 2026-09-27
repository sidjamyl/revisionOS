import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const variants = cva('inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:pointer-events-none disabled:opacity-50', {
  variants: {
    variant: {
      default: 'bg-[#173654] text-white hover:bg-[#234b70]',
      secondary: 'bg-[#e9eff4] text-[#173654] hover:bg-[#dce8f0]',
      outline: 'border border-[#cbd8df] bg-white text-[#173654] hover:bg-[#f3f7f8]',
      ghost: 'text-[#173654] hover:bg-[#e9eff4]',
    },
    size: { default: 'h-11 px-5 text-sm', sm: 'h-9 px-3 text-sm', lg: 'h-12 px-6 text-base' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

export function Button({ className, variant, size, ...props }: React.ComponentProps<'button'> & VariantProps<typeof variants>) {
  return <button className={cn(variants({ variant, size }), className)} {...props} />;
}

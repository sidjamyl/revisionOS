import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva('inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-45 [&_svg]:shrink-0', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/85',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-[#efeff1]',
      outline: 'border bg-background shadow-xs hover:bg-secondary',
      ghost: 'text-muted-foreground hover:bg-secondary hover:text-foreground',
      link: 'text-foreground underline-offset-4 hover:underline',
    },
    size: { default: 'h-10 px-4', sm: 'h-8 px-3 text-[13px]', lg: 'h-11 px-6', icon: 'size-9' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

export function Button({ className, variant, size, ...props }: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {
  return <button data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

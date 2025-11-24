import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-medium transition-all duration-200 whitespace-nowrap',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 active:opacity-75',
        secondary: 'bg-background-card text-text-primary border border-primary/30 hover:border-primary hover:bg-primary/5',
        ghost: 'text-text-secondary hover:text-text-primary hover:bg-white/5',
      },
      size: {
        sm: 'text-sm px-3 py-2',
        md: 'text-base px-4 py-2.5',
        lg: 'text-lg px-6 py-3',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, ...props }, ref) => (
    <button
      ref={ref}
      className={buttonVariants({ variant, size, className })}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? '...' : children}
    </button>
  )
);

Button.displayName = 'Button';

export { Button, buttonVariants };

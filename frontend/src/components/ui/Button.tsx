import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed select-none';
    
    const variants = {
      primary: 'bg-primary-purple hover:bg-primary-pink text-primary-yellow focus:ring-primary-purple shadow-lg glow-hover border border-primary-purple/30',
      secondary: 'bg-primary-pink hover:bg-primary-purple text-primary-yellow focus:ring-primary-pink shadow-lg glow-hover border border-primary-pink/30',
      outline: 'border-2 border-primary-purple/50 text-primary-yellow hover:bg-primary-purple hover:text-primary-yellow hover:border-primary-purple focus:ring-primary-purple bg-transparent',
      ghost: 'text-primary-yellow hover:bg-primary-purple/20 focus:ring-primary-purple bg-transparent border border-transparent hover:border-primary-purple/30',
      danger: 'bg-red-500/80 hover:bg-red-500 text-primary-yellow focus:ring-red-500 shadow-lg border border-red-500/30',
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm h-8',
      md: 'px-4 py-2 text-base h-10',
      lg: 'px-6 py-3 text-lg h-12',
    };

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading && (
          <div className="spinner mr-2" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };

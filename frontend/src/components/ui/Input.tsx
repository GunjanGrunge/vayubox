import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-primary-yellow mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary-yellow/60">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'block w-full rounded-lg border bg-primary-black text-primary-yellow placeholder-primary-yellow/50 focus:outline-none transition-all duration-300 h-10',
              'border-primary-purple/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20',
              'px-3 py-2',
              icon && 'pl-10',
              error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

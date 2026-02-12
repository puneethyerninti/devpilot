import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../LayoutHelpers';

/**
 * Premium Input component with prefix/suffix icons and validation states
 * Supports floating labels and helper text
 */

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, prefixIcon, suffixIcon, fullWidth = false, className, ...props }, ref) => {
    const hasError = Boolean(error);

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label className="text-sm font-medium text-text-primary" htmlFor={props.id}>
            {label}
          </label>
        )}
        <div className="relative">
          {prefixIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-tertiary">{prefixIcon}</div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              hasError ? 'border-danger focus:ring-danger' : 'border-border hover:border-border-hover',
              prefixIcon ? 'pl-10' : '',
              suffixIcon ? 'pr-10' : '',
              className
            )}
            {...props}
          />
          {suffixIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-text-tertiary">{suffixIcon}</div>
          )}
        </div>
        {(helperText || error) && (
          <p className={cn('text-xs', hasError ? 'text-danger' : 'text-text-secondary')}>{error || helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

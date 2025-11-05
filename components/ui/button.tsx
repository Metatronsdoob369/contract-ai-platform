import React from 'react';
import { cn } from './utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'primary' | 'secondary' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      default: 'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300',
      ghost: 'text-gray-800 disabled:text-gray-300 hover:bg-gray-100 hover:text-black',
      primary: 'bg-black text-white hover:bg-gray-800 disabled:bg-gray-300',
      secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:bg-gray-300',
      outline: 'border border-2 border-gray-100 text-gray-800 hover:bg-gray-100 hover:text-black',
    };
    
    const sizes = {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-10 rounded-md px-8',
      icon: 'h-10 w-10 rounded-full',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
import React from 'react';
import { cn } from './utils';

export const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('relative overflow-hidden', className)}
    {...props}
  >
    <div className="h-full w-full rounded-[inherit] overflow-auto">
      {children}
    </div>
  </div>
));
ScrollArea.displayName = 'ScrollArea';
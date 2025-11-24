import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, hoverable = false, ...props }, ref) => (
    <div
      ref={ref}
      className={`
        bg-background-card rounded-xl p-6 
        border border-white/5
        ${hoverable ? 'transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 cursor-pointer' : ''}
        ${className || ''}
      `}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = 'Card';

export { Card };

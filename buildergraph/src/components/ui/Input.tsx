import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-text-primary font-medium mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-4 py-3 rounded-lg
          bg-background-elevated border border-white/10
          text-text-primary placeholder-text-muted
          focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30
          transition-colors duration-200
          ${error ? 'border-red-500 focus:border-red-500' : ''}
          ${className || ''}
        `}
        {...props}
      />
      {error && (
        <p className="text-red-400 text-sm mt-2">{error}</p>
      )}
    </div>
  )
);

Input.displayName = 'Input';

export { Input };

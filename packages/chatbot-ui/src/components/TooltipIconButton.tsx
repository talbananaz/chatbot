import { forwardRef, type ButtonHTMLAttributes } from 'react';

/**
 * TooltipIconButton component
 * A button component with optional tooltip support
 */
interface TooltipIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tooltip?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'default' | 'outline' | 'ghost';
}

export const TooltipIconButton = forwardRef<HTMLButtonElement, TooltipIconButtonProps>(
  ({ tooltip, side = 'top', variant = 'default', className = '', children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
    };

    const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        title={tooltip}
        aria-label={tooltip}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TooltipIconButton.displayName = 'TooltipIconButton';

'use client';

import { forwardRef, ReactNode, InputHTMLAttributes } from 'react';

interface GlassInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    hint?: string;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'filled';
    fullWidth?: boolean;
    className?: string;
}

const sizeStyles = {
    sm: 'h-10 text-sm px-3',
    md: 'h-12 text-base px-4',
    lg: 'h-14 text-lg px-5',
};

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
    (
        {
            label,
            error,
            hint,
            icon,
            iconPosition = 'left',
            size = 'md',
            variant = 'default',
            fullWidth = false,
            className = '',
            ...props
        },
        ref
    ) => {
        const hasError = !!error;

        return (
            <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
                {label && (
                    <label className="block text-sm font-medium text-white/70 mb-2">
                        {label}
                    </label>
                )}

                <div className="relative">
                    {icon && iconPosition === 'left' && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                            {icon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        className={`
              w-full rounded-xl
              backdrop-blur-xl
              text-white placeholder-white/30
              outline-none
              transition-all duration-300
              ${sizeStyles[size]}
              ${icon && iconPosition === 'left' ? 'pl-10' : ''}
              ${icon && iconPosition === 'right' ? 'pr-10' : ''}
              ${variant === 'filled'
                                ? 'bg-white/10'
                                : 'bg-black/30'
                            }
              ${hasError
                                ? 'border-2 border-red-500/50 focus:border-red-400'
                                : 'border border-white/10 focus:border-[#D4AF37]/50'
                            }
              focus:shadow-[0_0_20px_rgba(212,175,55,0.2)]
            `}
                        {...props}
                    />

                    {icon && iconPosition === 'right' && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                            {icon}
                        </div>
                    )}
                </div>

                {(error || hint) && (
                    <p
                        className={`mt-2 text-sm ${hasError ? 'text-red-400' : 'text-white/50'
                            }`}
                    >
                        {error || hint}
                    </p>
                )}
            </div>
        );
    }
);

GlassInput.displayName = 'GlassInput';

/**
 * GlassTextarea - Multiline text input
 */
interface GlassTextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
    fullWidth?: boolean;
    className?: string;
}

export const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
    (
        { label, error, hint, fullWidth = false, className = '', ...props },
        ref
    ) => {
        const hasError = !!error;

        return (
            <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
                {label && (
                    <label className="block text-sm font-medium text-white/70 mb-2">
                        {label}
                    </label>
                )}

                <textarea
                    ref={ref}
                    className={`
            w-full rounded-xl p-4
            backdrop-blur-xl bg-black/30
            text-white placeholder-white/30
            outline-none
            transition-all duration-300
            resize-none min-h-[120px]
            ${hasError
                            ? 'border-2 border-red-500/50 focus:border-red-400'
                            : 'border border-white/10 focus:border-[#D4AF37]/50'
                        }
            focus:shadow-[0_0_20px_rgba(212,175,55,0.2)]
          `}
                    {...props}
                />

                {(error || hint) && (
                    <p
                        className={`mt-2 text-sm ${hasError ? 'text-red-400' : 'text-white/50'
                            }`}
                    >
                        {error || hint}
                    </p>
                )}
            </div>
        );
    }
);

GlassTextarea.displayName = 'GlassTextarea';

/**
 * GlassSelect - Dropdown select component
 */
interface GlassSelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
    fullWidth?: boolean;
    className?: string;
}

export const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(
    (
        { label, error, options, fullWidth = false, className = '', ...props },
        ref
    ) => {
        const hasError = !!error;

        return (
            <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
                {label && (
                    <label className="block text-sm font-medium text-white/70 mb-2">
                        {label}
                    </label>
                )}

                <select
                    ref={ref}
                    className={`
            w-full h-12 rounded-xl px-4
            backdrop-blur-xl bg-black/30
            text-white
            outline-none
            transition-all duration-300
            cursor-pointer
            appearance-none
            ${hasError
                            ? 'border-2 border-red-500/50 focus:border-red-400'
                            : 'border border-white/10 focus:border-[#D4AF37]/50'
                        }
            focus:shadow-[0_0_20px_rgba(212,175,55,0.2)]
          `}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value} className="bg-gray-900">
                            {option.label}
                        </option>
                    ))}
                </select>

                {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            </div>
        );
    }
);

GlassSelect.displayName = 'GlassSelect';

export default GlassInput;

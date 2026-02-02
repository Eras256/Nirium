'use client';

import { forwardRef, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    className?: string;
}

const variantStyles = {
    primary: {
        background: 'linear-gradient(135deg, rgba(212,175,55,0.8) 0%, rgba(160,120,40,0.8) 100%)',
        border: 'rgba(212,175,55,0.4)',
        text: 'text-white',
        shadow: '0 4px 20px rgba(212,175,55,0.25)',
        hover: {
            shadow: '0 6px 30px rgba(212,175,55,0.4)',
            scale: 1.02,
        },
    },
    secondary: {
        background: 'linear-gradient(135deg, rgba(30,25,50,0.8) 0%, rgba(20,15,40,0.9) 100%)',
        border: 'rgba(255,255,255,0.15)',
        text: 'text-white/90',
        shadow: '0 4px 16px rgba(0,0,0,0.3)',
        hover: {
            shadow: '0 6px 24px rgba(0,0,0,0.4)',
            scale: 1.02,
        },
    },
    ghost: {
        background: 'transparent',
        border: 'rgba(255,255,255,0.1)',
        text: 'text-white/70 hover:text-white',
        shadow: 'none',
        hover: {
            shadow: '0 4px 16px rgba(255,255,255,0.1)',
            scale: 1.02,
        },
    },
    danger: {
        background: 'linear-gradient(135deg, rgba(220,50,80,0.8) 0%, rgba(180,30,60,0.9) 100%)',
        border: 'rgba(255,100,100,0.4)',
        text: 'text-white',
        shadow: '0 4px 20px rgba(220,50,80,0.25)',
        hover: {
            shadow: '0 6px 30px rgba(220,50,80,0.4)',
            scale: 1.02,
        },
    },
    success: {
        background: 'linear-gradient(135deg, rgba(50,200,100,0.8) 0%, rgba(30,150,80,0.9) 100%)',
        border: 'rgba(100,255,150,0.4)',
        text: 'text-white',
        shadow: '0 4px 20px rgba(50,200,100,0.25)',
        hover: {
            shadow: '0 6px 30px rgba(50,200,100,0.4)',
            scale: 1.02,
        },
    },
};

const sizeStyles = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
};

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
    (
        {
            children,
            variant = 'primary',
            size = 'md',
            loading = false,
            icon,
            iconPosition = 'left',
            fullWidth = false,
            className = '',
            disabled,
            ...props
        },
        ref
    ) => {
        const styles = variantStyles[variant];

        return (
            <motion.button
                ref={ref}
                whileHover={
                    !disabled && !loading
                        ? { scale: styles.hover.scale, boxShadow: styles.hover.shadow }
                        : undefined
                }
                whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
                disabled={disabled || loading}
                className={`
          relative inline-flex items-center justify-center
          font-medium
          backdrop-blur-md
          transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeStyles[size]}
          ${styles.text}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
                style={{
                    background: styles.background,
                    border: `1px solid ${styles.border}`,
                    boxShadow: styles.shadow,
                }}
                {...props}
            >
                {/* Inner highlight */}
                <div
                    className="absolute inset-0 rounded-inherit pointer-events-none"
                    style={{
                        background:
                            'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, transparent 50%)',
                        borderRadius: 'inherit',
                    }}
                />

                {/* Loading spinner */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                    </div>
                )}

                {/* Content */}
                <span
                    className={`
            relative z-10 flex items-center gap-2
            ${loading ? 'opacity-0' : 'opacity-100'}
          `}
                >
                    {icon && iconPosition === 'left' && icon}
                    {children}
                    {icon && iconPosition === 'right' && icon}
                </span>
            </motion.button>
        );
    }
);

GlassButton.displayName = 'GlassButton';

/**
 * GlassIconButton - Compact icon-only button
 */
interface GlassIconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
    icon: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    tooltip?: string;
    className?: string;
}

const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
};

export const GlassIconButton = forwardRef<HTMLButtonElement, GlassIconButtonProps>(
    (
        { icon, variant = 'secondary', size = 'md', tooltip, className = '', ...props },
        ref
    ) => {
        const styles = variantStyles[variant];

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.05, boxShadow: styles.hover.shadow }}
                whileTap={{ scale: 0.95 }}
                className={`
          relative inline-flex items-center justify-center
          rounded-xl
          backdrop-blur-md
          transition-all duration-300
          ${iconSizes[size]}
          ${className}
        `}
                style={{
                    background: styles.background,
                    border: `1px solid ${styles.border}`,
                    boxShadow: styles.shadow,
                }}
                title={tooltip}
                {...props}
            >
                <span className={styles.text}>{icon}</span>
            </motion.button>
        );
    }
);

GlassIconButton.displayName = 'GlassIconButton';

export default GlassButton;

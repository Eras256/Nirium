'use client';

import { forwardRef, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
    children: ReactNode;
    variant?: 'default' | 'elevated' | 'subtle' | 'glow';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    hover?: boolean;
    glow?: boolean;
    glowColor?: string;
    className?: string;
}

const variants = {
    default: {
        background: 'linear-gradient(135deg, rgba(15,10,30,0.7) 0%, rgba(10,8,25,0.8) 100%)',
        border: 'rgba(255,255,255,0.1)',
        shadow: '0 8px 32px rgba(0,0,0,0.3)',
    },
    elevated: {
        background: 'linear-gradient(135deg, rgba(20,15,40,0.85) 0%, rgba(15,12,35,0.9) 100%)',
        border: 'rgba(255,255,255,0.15)',
        shadow: '0 12px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
    },
    subtle: {
        background: 'linear-gradient(135deg, rgba(10,8,20,0.5) 0%, rgba(8,6,18,0.6) 100%)',
        border: 'rgba(255,255,255,0.05)',
        shadow: '0 4px 16px rgba(0,0,0,0.2)',
    },
    glow: {
        background: 'linear-gradient(135deg, rgba(212,175,55,0.05) 0%, rgba(160,120,40,0.05) 100%)',
        border: 'rgba(212,175,55,0.3)',
        shadow: '0 8px 32px rgba(212,175,55,0.1), 0 0 60px rgba(212,175,55,0.05)',
    },
};

const sizes = {
    sm: 'p-4 rounded-xl',
    md: 'p-6 rounded-2xl',
    lg: 'p-8 rounded-3xl',
    xl: 'p-10 rounded-3xl',
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
    (
        {
            children,
            variant = 'default',
            size = 'md',
            hover = true,
            glow = false,
            glowColor = 'rgba(212,175,55,0.3)',
            className = '',
            ...props
        },
        ref
    ) => {
        const variantStyles = variants[variant];

        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={
                    hover
                        ? {
                            scale: 1.01,
                            boxShadow: glow
                                ? `0 12px 48px ${glowColor}, 0 0 80px ${glowColor}`
                                : variantStyles.shadow.replace('0.3', '0.5'),
                        }
                        : undefined
                }
                className={`
          relative overflow-hidden
          backdrop-blur-xl
          ${sizes[size]}
          ${className}
        `}
                style={{
                    background: variantStyles.background,
                    border: `1px solid ${variantStyles.border}`,
                    boxShadow: glow
                        ? `${variantStyles.shadow}, 0 0 40px ${glowColor}`
                        : variantStyles.shadow,
                }}
                {...props}
            >
                {/* Inner highlight */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            'linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 50%)',
                    }}
                />

                {/* Content */}
                <div className="relative z-10">{children}</div>

                {/* Corner accent */}
                <div
                    className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
                    style={{
                        background:
                            'radial-gradient(circle at top right, rgba(212,175,55,0.15), transparent 70%)',
                    }}
                />
            </motion.div>
        );
    }
);

GlassCard.displayName = 'GlassCard';

/**
 * GlassCardHeader - Consistent header styling for glass cards
 */
interface GlassCardHeaderProps {
    title: string;
    subtitle?: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
}

export function GlassCardHeader({
    title,
    subtitle,
    icon,
    action,
    className = '',
}: GlassCardHeaderProps) {
    return (
        <div className={`flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 ${className}`}>
            <div className="flex items-center gap-3">
                {icon && (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#A08020]/20 flex items-center justify-center border border-[#D4AF37]/30">
                        {icon}
                    </div>
                )}
                <div>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    {subtitle && (
                        <p className="text-sm text-white/50 mt-0.5">{subtitle}</p>
                    )}
                </div>
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}

/**
 * GlassCardContent - Content wrapper with consistent spacing
 */
interface GlassCardContentProps {
    children: ReactNode;
    className?: string;
}

export function GlassCardContent({
    children,
    className = '',
}: GlassCardContentProps) {
    return <div className={`text-white/80 ${className}`}>{children}</div>;
}

/**
 * GlassCardFooter - Footer with action buttons
 */
interface GlassCardFooterProps {
    children: ReactNode;
    className?: string;
}

export function GlassCardFooter({
    children,
    className = '',
}: GlassCardFooterProps) {
    return (
        <div
            className={`mt-6 pt-4 border-t border-white/10 flex items-center gap-3 ${className}`}
        >
            {children}
        </div>
    );
}

export default GlassCard;

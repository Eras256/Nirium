'use client';

import { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface GlassModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;
    className?: string;
}

const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]',
};

export function GlassModal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnOverlayClick = true,
    className = '',
}: GlassModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
        }

        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        onClick={closeOnOverlayClick ? onClose : undefined}
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className={`
                relative w-full pointer-events-auto
                rounded-3xl overflow-hidden
                backdrop-blur-2xl
                border border-white/10
                shadow-[0_24px_80px_rgba(0,0,0,0.5),0_0_60px_rgba(212,175,55,0.1)]
                ${sizes[size]}
                ${className}
              `}
                            style={{
                                background:
                                    'linear-gradient(135deg, rgba(15,10,35,0.95) 0%, rgba(8,5,20,0.98) 100%)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Inner glow */}
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background:
                                        'radial-gradient(circle at top, rgba(212,175,55,0.1), transparent 50%)',
                                }}
                            />

                            {/* Header */}
                            {(title || showCloseButton) && (
                                <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/10">
                                    {title && (
                                        <h2 className="text-xl font-semibold text-white">{title}</h2>
                                    )}
                                    {showCloseButton && (
                                        <button
                                            onClick={onClose}
                                            className="
                        w-8 h-8 rounded-lg
                        flex items-center justify-center
                        text-white/60 hover:text-white
                        hover:bg-white/10
                        transition-all duration-200
                      "
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Content */}
                            <div className="relative p-6 max-h-[70vh] overflow-y-auto">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}

/**
 * GlassDrawer - Side panel drawer
 */
interface GlassDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    position?: 'left' | 'right';
    size?: 'sm' | 'md' | 'lg';
}

const drawerSizes = {
    sm: 'w-full sm:w-80',
    md: 'w-full sm:w-96',
    lg: 'w-full sm:w-[480px]',
};

export function GlassDrawer({
    isOpen,
    onClose,
    title,
    children,
    position = 'right',
    size = 'md',
}: GlassDrawerProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ x: position === 'right' ? '100%' : '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: position === 'right' ? '100%' : '-100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className={`
              fixed top-0 bottom-0 z-50
              ${position === 'right' ? 'right-0' : 'left-0'}
              ${drawerSizes[size]}
              backdrop-blur-2xl
              border-l border-white/10
              shadow-xl
            `}
                        style={{
                            background:
                                'linear-gradient(135deg, rgba(15,10,35,0.98) 0%, rgba(8,5,20,0.99) 100%)',
                        }}
                    >
                        {title && (
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                                <h2 className="text-lg font-semibold text-white">{title}</h2>
                                <button
                                    onClick={onClose}
                                    className="text-white/60 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                        <div className="p-6 overflow-y-auto h-full">{children}</div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}

export default GlassModal;

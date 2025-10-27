'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    motion,
    SpringOptions,
    useMotionValue,
    useSpring,
    AnimatePresence,
    Transition,
    Variant,
} from 'motion/react';
import { cn } from '@/features/core/lib/utils';

export type CursorProps = {
    children: React.ReactNode;
    className?: string;
    springConfig?: SpringOptions;
    attachToParent?: boolean;
    transition?: Transition;
    variants?: {
        initial: Variant;
        animate: Variant;
        exit: Variant;
    };
    onPositionChange?: (x: number, y: number) => void;
};

export function CursorWrapper({
    children,
    className,
    springConfig,
    attachToParent,
    variants,
    transition,
    onPositionChange,
}: CursorProps) {
    const cursorX = useMotionValue(0);
    const cursorY = useMotionValue(0);
    const cursorRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(!attachToParent);
    const parentRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            cursorX.set(window.innerWidth / 2);
            cursorY.set(window.innerHeight / 2);
        }
    }, [cursorX, cursorY]);

    const updatePosition = useCallback((e: MouseEvent) => {
        if (attachToParent && parentRef.current) {
            const rect = parentRef.current.getBoundingClientRect();
            cursorX.set(e.clientX - rect.left);
            cursorY.set(e.clientY - rect.top);
        } else {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        }
        onPositionChange?.(e.clientX, e.clientY);
    }, [cursorX, cursorY, onPositionChange, attachToParent]);

    const handleMouseEnter = useCallback(() => {
        if (parentRef.current) {
            parentRef.current.style.cursor = 'none';
            setIsVisible(true);
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (parentRef.current) {
            parentRef.current.style.cursor = 'auto';
            setIsVisible(false);
        }
    }, []);

    useEffect(() => {
        if (!attachToParent) {
            document.body.style.cursor = 'none';
            document.addEventListener('mousemove', updatePosition);
        } else {
            document.body.style.cursor = 'auto';
            // Find parent element
            if (cursorRef.current) {
                parentRef.current = cursorRef.current.parentElement;
            }
        }

        const currentParent = parentRef.current;

        if (attachToParent && currentParent) {
            currentParent.addEventListener('mouseenter', handleMouseEnter);
            currentParent.addEventListener('mouseleave', handleMouseLeave);
            currentParent.addEventListener('mousemove', updatePosition);
        }

        return () => {
            if (!attachToParent) {
                document.removeEventListener('mousemove', updatePosition);
                document.body.style.cursor = 'auto';
            }

            if (attachToParent && currentParent) {
                currentParent.removeEventListener('mouseenter', handleMouseEnter);
                currentParent.removeEventListener('mouseleave', handleMouseLeave);
                currentParent.removeEventListener('mousemove', updatePosition);
            }
        };
    }, [attachToParent, updatePosition, handleMouseEnter, handleMouseLeave]);

    const cursorXSpring = useSpring(cursorX, springConfig || { duration: 0 });
    const cursorYSpring = useSpring(cursorY, springConfig || { duration: 0 });

    return (
        <motion.div
            ref={cursorRef}
            className={cn(
                'pointer-events-none z-50',
                attachToParent ? 'absolute' : 'fixed left-0 top-0',
                className
            )}
            style={{
                x: cursorXSpring,
                y: cursorYSpring,
                translateX: '-50%',
                translateY: '-50%',
            }}
        >
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial='initial'
                        animate='animate'
                        exit='exit'
                        variants={variants}
                        transition={transition}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
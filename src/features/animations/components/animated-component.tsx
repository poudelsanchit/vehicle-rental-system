// components/ui/AnimatedComponents.tsx
'use client'
import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';
import {
    useScrollAnimation,
    scaleIn,
    staggerContainer,
    staggerItem
} from '@/features/core/hooks/use-scroll-animation';

interface AnimatedWrapperProps {
    children: ReactNode;
    className?: string;
    variants?: Variants;
}
export function AnimationWrapper({ children, className, variants }: AnimatedWrapperProps) {
    const animation = useScrollAnimation(0.1, true);

    return (
        <motion.div
            ref={animation.ref}
            variants={staggerContainer}
            initial="hidden"
            animate={animation.controls}
            className={className}
        >
            <motion.div variants={variants || staggerItem}>
                {children}
            </motion.div>
        </motion.div>
    );
}


export function AnimatedTitle({ children, className, variants }: AnimatedWrapperProps) {
    const animation = useScrollAnimation(0.1, true);

    return (
        <motion.div
            ref={animation.ref}
            variants={staggerContainer}
            initial="hidden"
            animate={animation.controls}
            className={className}
        >
            <motion.div variants={variants || staggerItem}>
                {children}
            </motion.div>
        </motion.div>
    );
}

export function AnimatedDescription({ children, className, variants }: AnimatedWrapperProps) {
    const animation = useScrollAnimation(0.1, true);

    return (
        <motion.div
            ref={animation.ref}
            variants={staggerContainer}
            initial="hidden"
            animate={animation.controls}
            className={className}
        >
            <motion.div variants={variants || staggerItem}>
                {children}
            </motion.div>
        </motion.div>
    );
}

export function AnimatedButton({ children, className, variants }: AnimatedWrapperProps) {
    const animation = useScrollAnimation(0.1, true);

    return (
        <motion.div
            ref={animation.ref}
            variants={staggerContainer}
            initial="hidden"
            animate={animation.controls}
            className={className}
        >
            <motion.div variants={variants || staggerItem}>
                {children}
            </motion.div>
        </motion.div>
    );
}

export function AnimatedArrow({ children, className }: AnimatedWrapperProps) {
    return (
        <motion.div
            className={className}
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedImageContainer({ children, className, variants }: AnimatedWrapperProps) {
    const animation = useScrollAnimation(0.1, true);

    return (
        <motion.div
            ref={animation.ref}
            variants={variants || scaleIn}
            initial="hidden"
            animate={animation.controls}
            className={className}
        >
            {children}
        </motion.div>
    );
}

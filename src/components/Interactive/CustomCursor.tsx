'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import styles from './CustomCursor.module.css';

export default function CustomCursor() {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [cursorType, setCursorType] = useState('default');

    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const moveMouse = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const handleOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isClickable = target.closest('a, button, .btn-primary, .btn-outline, .btn-secondary, [role="button"]');
            const isImage = target.tagName.toLowerCase() === 'img' || target.closest('[data-cursor="image"]');

            if (isClickable) {
                setIsHovering(true);
                setCursorType('pointer');
            } else if (isImage) {
                setIsHovering(true);
                setCursorType('image');
            } else {
                setIsHovering(false);
                setCursorType('default');
            }
        };

        window.addEventListener('mousemove', moveMouse);
        window.addEventListener('mouseover', handleOver);

        return () => {
            window.removeEventListener('mousemove', moveMouse);
            window.removeEventListener('mouseover', handleOver);
        };
    }, [isVisible, mouseX, mouseY]);

    if (!isVisible) return null;

    return (
        <>
            <motion.div
                className={styles.cursor}
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
                animate={{
                    scale: isHovering ? (cursorType === 'image' ? 3 : 2.5) : 1,
                    backgroundColor: isHovering ? 'rgba(8, 145, 178, 0.15)' : 'rgba(8, 145, 178, 0.2)',
                    border: isHovering ? '1px solid rgba(8, 145, 178, 0.4)' : '1px solid rgba(8, 145, 178, 0.2)',
                }}
            />
        </>
    );
}

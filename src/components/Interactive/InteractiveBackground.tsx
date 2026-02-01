'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import styles from './InteractiveBackground.module.css';

export default function InteractiveBackground() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const { scrollY } = useScroll();

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({
                x: (e.clientX / window.innerWidth) - 0.5,
                y: (e.clientY / window.innerHeight) - 0.5,
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const springConfig = { damping: 30, stiffness: 100 };
    const x = useSpring(mousePos.x * 50, springConfig);
    const y = useSpring(mousePos.y * 50, springConfig);

    // Parallax effect based on scroll
    const scrollY1 = useTransform(scrollY, [0, 1000], [0, -100]);
    const scrollY2 = useTransform(scrollY, [0, 1000], [0, 100]);

    return (
        <div className={styles.backgroundContainer}>
            <motion.div
                className={styles.blob}
                style={{
                    x,
                    y: scrollY1,
                    top: '20%',
                    left: '10%',
                    background: 'radial-gradient(circle, var(--primary-light) 0%, transparent 70%)',
                }}
            />
            <motion.div
                className={styles.blob}
                style={{
                    x: useTransform(x, (v) => -v * 1.5),
                    y: scrollY2,
                    top: '60%',
                    right: '10%',
                    background: 'radial-gradient(circle, var(--accent-light) 0%, transparent 70%)',
                }}
            />
            <motion.div
                className={styles.blob}
                style={{
                    x: useTransform(x, (v) => v * 0.8),
                    y: useTransform(scrollY, [0, 1000], [0, -50]),
                    bottom: '10%',
                    left: '40%',
                    background: 'radial-gradient(circle, var(--secondary-light) 0%, transparent 70%)',
                }}
            />
        </div>
    );
}

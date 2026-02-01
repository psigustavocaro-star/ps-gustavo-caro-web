'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface RevealProps {
    children: ReactNode;
    delay?: number;
}

export default function Reveal({ children, delay = 0.2 }: RevealProps) {
    return (
        <div style={{ position: "relative", overflow: "hidden" }}>
            <motion.div
                initial={{
                    y: 40,
                    opacity: 0,
                    filter: "blur(10px)"
                }}
                whileInView={{
                    y: 0,
                    opacity: 1,
                    filter: "blur(0px)"
                }}
                viewport={{ once: true }}
                transition={{
                    duration: 1.2,
                    delay: delay,
                    ease: [0.22, 1, 0.36, 1] // Quintic out for extremely smooth deceleration
                }}
            >
                {children}
            </motion.div>
        </div>
    );
}

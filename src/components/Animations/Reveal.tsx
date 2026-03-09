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
                    y: 30,
                    opacity: 0,
                    scale: 0.98
                }}
                whileInView={{
                    y: 0,
                    opacity: 1,
                    scale: 1
                }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                    duration: 0.8,
                    delay: delay,
                    ease: [0.16, 1, 0.3, 1] // Custom butter-smooth easing
                }}
            >
                {children}
            </motion.div>
        </div>
    );
}

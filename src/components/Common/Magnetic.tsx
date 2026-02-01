'use client';

import { motion, useSpring, useMotionValue } from 'framer-motion';
import { useRef, ReactNode } from 'react';

export default function Magnetic({ children }: { children: ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);

    // Valores de posición
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Configuración de resorte más rígida para evitar el efecto de "hundimiento" o retraso excesivo
    // Aumentamos stiffness para que sea más reactivo y damping para evitar oscilaciones
    const springConfig = { damping: 30, stiffness: 250 };
    const x = useSpring(mouseX, springConfig);
    const y = useSpring(mouseY, springConfig);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        if (ref.current) {
            const { height, width, left, top } = ref.current.getBoundingClientRect();

            // Calculamos la distancia desde el centro del elemento
            const middleX = clientX - (left + width / 2);
            const middleY = clientY - (top + height / 2);

            // Factor de movimiento sutil (0.15) para evitar que el botón se desplace demasiado
            mouseX.set(middleX * 0.15);
            mouseY.set(middleY * 0.15);
        }
    }

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    }

    return (
        <motion.div
            style={{
                position: "relative",
                display: "inline-block",
                x,
                y,
                willChange: "transform"
            }}
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </motion.div>
    );
}

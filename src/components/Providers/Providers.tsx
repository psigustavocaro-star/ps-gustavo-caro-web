'use client';

import { ReactNode } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <LazyMotion features={domAnimation}>
            {children}
        </LazyMotion>
    );
}

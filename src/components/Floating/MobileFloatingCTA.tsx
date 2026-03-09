'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './MobileFloatingCTA.module.css';

export default function MobileFloatingCTA() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling down a bit (e.g. past the hero call to action)
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={`${styles.floatingWrapper} ${isVisible ? styles.visible : ''}`}>
            <Link href="/agendar" className={styles.floatingButton}>
                <span className={styles.icon}>📅</span>
                <span className={styles.text}>Agendar Hora</span>
            </Link>
        </div>
    );
}

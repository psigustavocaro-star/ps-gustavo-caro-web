'use client';

import Link from 'next/link';
import styles from './BlogCTA.module.css';

interface BlogCTAProps {
    title?: string;
    description?: string;
}

export default function BlogCTA({
    title = "¿Este tema te resonó?",
    description = "Si sientes que necesitas apoyo profesional para trabajar en esto, estoy aquí para acompañarte."
}: BlogCTAProps) {
    return (
        <div className={styles.ctaCard}>
            <div className={styles.icon}>💬</div>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
            <div className={styles.actions}>
                <Link href="/agendar" className={styles.primaryBtn}>
                    Agendar una sesión
                </Link>
                <a
                    href={`https://wa.me/56922409953?text=${encodeURIComponent("Hola Gustavo, acabo de leer tu blog y me gustaría conversar sobre agendar una sesión.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.secondaryBtn}
                >
                    Consultar por WhatsApp
                </a>
            </div>
        </div>
    );
}

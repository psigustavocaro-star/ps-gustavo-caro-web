'use client';

import { motion } from 'framer-motion';
import styles from './TrustBadges.module.css';

const badges = [
    {
        title: "Atención Segura",
        desc: "Protocolos de encriptación médica",
        icon: "🛡️",
        color: "#0ea5e9" // Blue
    },
    {
        title: "Colegiado",
        desc: "Registro Nacional de Salud",
        icon: "🎓",
        color: "#6366f1" // Indigo
    },
    {
        title: "Boleta Automática",
        desc: "Reembolsable en Isapres/Seguros",
        icon: "⚡",
        color: "#f59e0b" // Amber
    },
    {
        title: "Confianza Pacientes",
        desc: "Respaldo y ética profesional",
        icon: "⭐",
        color: "#fbbf24" // Yellow
    }
];

export default function TrustBadges() {
    return (
        <section className={styles.trustBar}>
            <div className={`container ${styles.badgesContent}`}>
                {badges.map((b, i) => (
                    <motion.div
                        key={i}
                        className={styles.badge}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className={styles.iconWrapper} style={{ '--accent': b.color } as any}>
                            <span className={styles.icon}>{b.icon}</span>
                        </div>
                        <div className={styles.text}>
                            <strong>{b.title}</strong>
                            <span>{b.desc}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './TrustBar.module.css';

const institutions = [
    {
        name: "Universidad de Chile",
        logo: "/images/logo-uchile.png",
        width: 120
    },
    {
        name: "Pontificia Universidad Católica de Chile",
        logo: "/images/logo-puc.png",
        width: 140
    },
    {
        name: "Universidad Católica de Córdoba",
        logo: "/images/logo-ucc.png",
        width: 130
    },
    {
        name: "Neurociencia Cognitiva y Clínica Chile",
        logo: "/images/logo-nccc.png",
        width: 150
    }
];

const certifications = [
    "Certificación ADOS-2",
    "Acreditación WISC-V"
];

export default function TrustBar() {
    return (
        <section className={styles.trustBar}>
            <div className={`container ${styles.content}`}>
                <div className={styles.inner}>
                    <div className={styles.topRow}>
                        <span className={styles.label}>Respaldo Académico e Institucional</span>
                        <div className={styles.logoGrid}>
                            {institutions.map((inst, index) => (
                                <motion.div
                                    key={index}
                                    className={styles.logoItem}
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Image
                                        src={inst.logo}
                                        alt={inst.name}
                                        width={inst.width}
                                        height={50}
                                        className={styles.logo}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.bottomRow}>
                        <div className={styles.certList}>
                            {certifications.map((cert, index) => (
                                <motion.div
                                    key={index}
                                    className={styles.certBadge}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4 + (index * 0.1) }}
                                >
                                    <span className={styles.check}>✓</span>
                                    <span className={styles.certName}>{cert}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

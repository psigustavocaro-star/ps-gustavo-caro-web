'use client';

import { motion } from 'framer-motion';
import styles from './Testimonials.module.css';

const testimonials = [
    {
        name: "María Elena S.",
        initials: "ME",
        text: "Encontrar a Gustavo fue un alivio. Su enfoque clínico con TCC me dio herramientas reales y concretas para manejar mi ansiedad en el día a día.",
        role: "Paciente Online",
        color: "#0891b2"
    },
    {
        name: "Ricardo A.",
        initials: "RA",
        text: "Excelente profesional. La comodidad de la atención online no le resta nada de calidez ni profundidad al proceso. Muy recomendado para procesos TCC.",
        role: "Paciente Online",
        color: "#059669"
    },
    {
        name: "Javiera V.",
        initials: "JV",
        text: "Como madre, valoro mucho su trabajo con adolescentes. Logró conectar con mi hija de una forma que otros profesionales no pudieron anteriormente.",
        role: "Madre de paciente",
        color: "#7c3aed"
    },
    {
        name: "Andrés P.",
        initials: "AP",
        text: "Al principio dudaba de la terapia online, pero Gustavo logró crear un espacio tan seguro como cualquier consulta presencial. Mi proceso de TDAH ha sido transformador.",
        role: "Paciente Online",
        color: "#dc2626"
    }
];

export default function Testimonials() {
    return (
        <section className={styles.testimonials}>
            <div className="container">
                <div className={styles.header}>
                    <span className={styles.tag}>Testimonios Verificados</span>
                    <h2 className="section-title">Voces de Confianza</h2>
                    <p className={styles.subtitle}>Relatos de quienes han encontrado herramientas concretas para su bienestar.</p>
                </div>

                <div className={styles.grid}>
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            className={styles.card}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className={styles.stars}>
                                {[...Array(5)].map((_, index) => (
                                    <span key={index}>★</span>
                                ))}
                            </div>
                            <p className={styles.text}>"{t.text}"</p>
                            <div className={styles.footer}>
                                <div
                                    className={styles.avatar}
                                    style={{ backgroundColor: t.color }}
                                >
                                    {t.initials}
                                </div>
                                <div className={styles.info}>
                                    <span className={styles.name}>{t.name}</span>
                                    <span className={styles.role}>{t.role}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className={styles.disclaimer}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>Testimonios reales de pacientes. Nombres abreviados por confidencialidad.</span>
                </div>
            </div>
        </section>
    );
}


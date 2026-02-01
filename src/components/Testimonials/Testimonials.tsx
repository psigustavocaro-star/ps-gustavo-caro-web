'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './Testimonials.module.css';

const testimonials = [
    {
        name: "María Elena S.",
        text: "Encontrar a Gustavo fue un alivio. Su enfoque clínico con TCC me dio herramientas reales y concretas para manejar mi ansiedad en el día a día.",
        image: "/images/testimonio-1.png",
        role: "Paciente Online"
    },
    {
        name: "Ricardo A.",
        text: "Excelente profesional. La comodidad de la atención online no le resta nada de calidez ni profundidad al proceso. Muy recomendado para procesos TCC.",
        image: "/images/testimonio-2.png",
        role: "Paciente Online"
    },
    {
        name: "Javiera V.",
        text: "Como madre, valoro mucho su trabajo con adolescentes. Logró conectar con mi hija de una forma que otros profesionales no pudieron anteriormente.",
        image: "/images/testimonio-3.png",
        role: "Madre de paciente"
    }
];

export default function Testimonials() {
    return (
        <section className={styles.testimonials}>
            <div className="container">
                <div className={styles.header}>
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
                                <Image
                                    src={t.image}
                                    alt={t.name}
                                    width={48}
                                    height={48}
                                    className={styles.avatar}
                                />
                                <div className={styles.info}>
                                    <span className={styles.name}>{t.name}</span>
                                    <span className={styles.role}>{t.role}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

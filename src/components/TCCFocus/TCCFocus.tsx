
'use client';

import { motion } from 'framer-motion';
import Reveal from '../Animations/Reveal';
import styles from './TCCFocus.module.css';

const focalPoints = [
    {
        title: "Crisis de Ansiedad y Pánico",
        description: "¿Sientes que pierdes el control o que el miedo te paraliza en el metro o el trabajo? La TCC es el 'Gold Standard' para desactivar la respuesta de alarma de tu cerebro, dándote herramientas para recuperar tu libertad en Santiago y donde sea que estés.",
        keywords: "Ansiedad, Crisis de Pánico, Agorafobia"
    },
    {
        title: "Depresión y Falta de Sentido",
        description: "Cuando la sombra emocional te quita las ganas de conectar con los tuyos o avanzar en tu carrera. Trabajamos en reestructurar los pensamientos que te hunden y reactivar tu vida de forma progresiva y humana.",
        keywords: "Depresión, Melancolía, Baja Autoestima"
    },
    {
        title: "TDAH y Desorganización",
        description: "¿Tu mente nunca se detiene pero sientes que no avanzas nada? Especialista en TDAH Adulto: pasamos de la frustración a sistemas ejecutivos que funcionan con tu cerebro neurodivergente, no contra él.",
        keywords: "TDAH Adulto, Concentración, Procrastinación"
    },
    {
        title: "Estrés Laboral y Burnout",
        description: "El ritmo vertical de Santiago puede quemar hasta al más fuerte. Si el domingo te genera angustia y el agotamiento es crónico, usamos TCC para poner límites sanos y proteger tu activo más valioso: tu mente.",
        keywords: "Burnout, Estrés, Desgaste Profesional"
    }
];

export default function TCCFocus() {
    return (
        <section className={styles.tccSection}>
            <div className="container">
                <Reveal>
                    <div className={styles.header}>
                        <h2 className={styles.title}>¿Te identificas con alguna de estas situaciones?</h2>
                        <p className={styles.subtitle}>
                            Como <strong>Psicólogo en Santiago</strong> especializado en <strong>Terapia Cognitivo Conductual (TCC)</strong>, mi objetivo es que dejes de "sobrevivir" al día a día y comiences a gestionar tu bienestar con herramientas probadas por la ciencia.
                        </p>
                    </div>
                </Reveal>

                <div className={styles.grid}>
                    {focalPoints.map((point, index) => (
                        <motion.div
                            key={index}
                            className={styles.card}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <h3 className={styles.cardTitle}>{point.title}</h3>
                            <p className={styles.cardDesc}>{point.description}</p>
                            <div className={styles.tags}>
                                {point.keywords.split(', ').map(tag => (
                                    <span key={tag} className={styles.tag}>#{tag}</span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <Reveal>
                    <div className={styles.footer}>
                        <p>La <strong>Terapia Online en Chile</strong> permite que accedamos a este tratamiento de alta efectividad sin importar las distancias, con la misma calidad de la atención presencial.</p>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

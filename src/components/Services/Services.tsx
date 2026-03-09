'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Reveal from '../Animations/Reveal';
import styles from './Services.module.css';
import WorkshopForm from './WorkshopForm';

export default function Services() {
    const [isWorkshopOpen, setIsWorkshopOpen] = useState(false);

    return (
        <section id="servicios" className={styles.services}>
            <div className="container">
                <motion.div
                    className={styles.header}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className={styles.label}>Servicios Profesionales</span>
                    <Reveal><h2 className={styles.title}>Mi Enfoque de Trabajo</h2></Reveal>
                    <p className={styles.subtitle}>Calidad clínica y calidez humana en cada etapa del proceso.</p>
                </motion.div>

                <div className={styles.descriptionBlock}>
                    <p className={styles.introText}>
                        Ofrezco servicios especializados de psicoterapia y evaluación desde un enfoque clínico riguroso y humano.
                        Todos los procesos se adaptan a las necesidades particulares de cada persona.
                    </p>
                    <div className={styles.serviceBenefits}>
                        <div className={styles.benefit}>
                            <strong>Enfoque TCC</strong>
                            <span>Basado en evidencia científica y objetivos claros.</span>
                        </div>
                        <div className={styles.benefit}>
                            <strong>Evaluación Exhaustiva</strong>
                            <span>Uso de baterías neuropsicológicas estandarizadas.</span>
                        </div>
                        <div className={styles.benefit}>
                            <strong>Soporte Continuo</strong>
                            <span>Seguimiento y materiales post-sesión.</span>
                        </div>
                    </div>
                </div>

                <WorkshopForm
                    isOpen={isWorkshopOpen}
                    onClose={() => setIsWorkshopOpen(false)}
                />

                <motion.div
                    className={styles.cta}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                >
                    <Link href="/agendar" className="btn-primary">Agendar mi sesión</Link>
                    <p className={styles.note}>Boleta electrónica automática · Reembolsable en Isapres</p>
                </motion.div>
            </div>
        </section>
    );
}

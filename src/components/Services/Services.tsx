'use client';

import { useState } from 'react';
import Image from 'next/image';
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

                <motion.article
                    className={styles.wiscFeature}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.65 }}
                >
                    <div className={styles.wiscImageWrap}>
                        <Image
                            src="/images/wisc-v-evaluacion.png"
                            alt="Evaluación cognitiva infantil en un entorno clínico cálido y profesional"
                            fill
                            sizes="(max-width: 900px) 100vw, 48vw"
                            className={styles.wiscImage}
                        />
                        <span className={styles.wiscImageBadge}>6 a 16 años 11 meses</span>
                    </div>

                    <div className={styles.wiscContent}>
                        <span className={styles.wiscEyebrow}>Nuevo servicio · Evaluación estandarizada</span>
                        <h3>Evaluación Cognitiva WISC-V</h3>
                        <p className={styles.wiscLead}>Un proceso cuidadoso para comprender el perfil cognitivo, reconocer fortalezas y orientar apoyos concretos en el hogar y el contexto educativo.</p>
                        <ul className={styles.wiscIncludes}>
                            <li>Entrevista inicial y revisión de antecedentes.</li>
                            <li>Aplicación completa, corrección e interpretación WISC-V.</li>
                            <li>Informe profesional impreso y digital.</li>
                            <li>Devolución posterior explicada con recomendaciones.</li>
                        </ul>
                        <div className={styles.wiscOffer}>
                            <div>
                                <span className={styles.wiscPrice}>$144.000</span>
                                <span className={styles.wiscInstallments}>Equivalente a 4 sesiones de $36.000</span>
                            </div>
                            <div className={styles.wiscPromo}>
                                <strong>Promo de lanzamiento</strong>
                                <span>Usa WISC12 y paga $132.000</span>
                            </div>
                        </div>
                        <div className={styles.wiscActions}>
                            <Link href="/agendar" className="btn-primary">Agendar evaluación WISC-V</Link>
                            <span>La primera fecha inicia el proceso; las siguientes instancias se coordinan posteriormente.</span>
                        </div>
                    </div>
                </motion.article>

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
                    <p className={styles.note}>Boleta de honorarios para posible reembolso en Isapres y seguros</p>
                </motion.div>
            </div>
        </section>
    );
}

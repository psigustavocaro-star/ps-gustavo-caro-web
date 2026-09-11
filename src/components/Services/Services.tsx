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
                    <Reveal><h2 className={styles.title}>Terapia y evaluaciones, con caminos claros</h2></Reveal>
                    <p className={styles.subtitle}>Dos procesos distintos, explicados para que puedas elegir con tranquilidad.</p>
                </motion.div>

                <div className={styles.descriptionBlock}>
                    <p className={styles.introText}>
                        La psicoterapia online está orientada a personas adultas que buscan un espacio de trabajo regular. Las evaluaciones son procesos presenciales, con objetivos, instrumentos y entrega de informe definidos desde el inicio.
                    </p>
                    <div className={styles.serviceBenefits}>
                        <div className={styles.benefit}>
                            <strong>Psicoterapia online</strong>
                            <span>Sesiones de 45–50 minutos, con objetivos acordados y herramientas para la vida cotidiana.</span>
                        </div>
                        <div className={styles.benefit}>
                            <strong>Evaluaciones presenciales</strong>
                            <span>Entrevista, instrumentos pertinentes, integración clínica e informe explicado.</span>
                        </div>
                        <div className={styles.benefit}>
                            <strong>Proceso informado</strong>
                            <span>Antes de reservar conoces modalidad, valor, coordinación y condiciones de atención.</span>
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
                        <span className={styles.wiscImageBadge}>Atención presencial · Santiago</span>
                    </div>

                    <div className={styles.wiscContent}>
                        <span className={styles.wiscEyebrow}>Oferta exclusiva web · Evaluaciones presenciales</span>
                        <h3>Elige la evaluación que necesitas por $135.000</h3>
                        <p className={styles.wiscLead}>Tres procesos clínicos con objetivos distintos, realizados presencialmente y con el mismo valor especial. Cada evaluación integra antecedentes, instrumentos pertinentes, análisis profesional e informe explicado.</p>
                        <div className={styles.evaluationChoices}>
                            <div className={styles.evaluationChoice}>
                                <strong>WISC-V</strong>
                                <span>Para niños, niñas y adolescentes de 6 a 16 años 11 meses. Permite comprender su perfil cognitivo, fortalezas y necesidades de apoyo escolar o clínico.</span>
                            </div>
                            <div className={styles.evaluationChoice}>
                                <strong>Evaluación de TDAH</strong>
                                <span>Explora atención, impulsividad y funciones ejecutivas mediante entrevista, cuestionarios y pruebas estandarizadas que apoyan la clarificación diagnóstica.</span>
                            </div>
                            <div className={styles.evaluationChoice}>
                                <strong>Evaluación neurocognitiva</strong>
                                <span>Examina memoria, atención, velocidad de procesamiento y funciones ejecutivas para comprender dificultades cognitivas y orientar apoyos.</span>
                            </div>
                        </div>
                        <ul className={styles.wiscIncludes}>
                            <li>Entrevista inicial y revisión de antecedentes.</li>
                            <li>Aplicación presencial de instrumentos según la evaluación elegida.</li>
                            <li>Corrección, integración clínica e informe profesional.</li>
                            <li>Devolución posterior explicada con orientaciones.</li>
                        </ul>
                        <div className={styles.wiscOffer}>
                            <div>
                                <span className={styles.wiscPrice}>$135.000</span>
                                <span className={styles.wiscInstallments}>Valor total por cualquiera de las 3 evaluaciones</span>
                            </div>
                            <div className={styles.wiscPromo}>
                                <strong>Oferta exclusiva web</strong>
                                <span>Aplicación + análisis + informe + devolución</span>
                            </div>
                        </div>
                        <div className={styles.wiscActions}>
                            <Link href="/agendar" className="btn-primary">Reservar evaluación presencial</Link>
                            <span>Pagas online y luego coordinamos por WhatsApp un rango de fechas compatible con la disponibilidad del centro.</span>
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

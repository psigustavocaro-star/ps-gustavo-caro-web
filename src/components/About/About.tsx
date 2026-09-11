'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import Reveal from '../Animations/Reveal';
import styles from './About.module.css';

export default function About() {
    return (
        <section id="sobre-mi" className={styles.about}>
            <div className={`container ${styles.aboutContent}`}>
                <motion.div
                    className={styles.imageContainer}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <div className={styles.imageGrid}>
                        <Image
                            src="/images/gustavo-1-hq.jpg"
                            alt="Gustavo Caro - Psicólogo TCC"
                            width={600}
                            height={800}
                            quality={100}
                            unoptimized={true}
                            className={styles.gridImage}
                        />
                        <Image
                            src="/images/gustavo-2-hq.jpg"
                            alt="Psicología y Naturaleza"
                            width={600}
                            height={800}
                            quality={100}
                            unoptimized={true}
                            className={styles.gridImage}
                        />
                    </div>
                    <motion.div
                        className={styles.floatingCard}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        <span className={styles.floatingTitle}>Especialista en TCC</span>
                        <p className={styles.floatingText}>Salud Mental con experiencia clínica en diversas zonas de nuestro país.</p>
                    </motion.div>
                </motion.div>

                <motion.div
                    className={styles.textContent}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <span className={styles.subtitle}>Mi Enfoque Humano y Científico</span>
                    <Reveal><h2 className={styles.sectionTitle}>Entender tu mente para sanar tu corazón.</h2></Reveal>
                    <p className={styles.text}>
                        Soy psicólogo clínico con <strong>Especialización en Terapia Cognitivo Conductual (TCC)</strong> por la Universidad de Chile. En psicoterapia acompaño principalmente a personas adultas; las evaluaciones de niños, adolescentes y adultos se abordan de manera presencial y con un proceso diferenciado.
                    </p>
                    <p className={styles.text}>
                        Con formación de postgrado en salud mental y adicciones (UCC), trabajo desde una mirada clínica cuidadosa y basada en evidencia. El proceso parte por comprender tu situación, acordar objetivos realistas y revisar juntos qué está siendo útil en el camino.
                    </p>

                    <div className={styles.expertiseList}>
                        <div className={styles.expertiseItem}>
                            <div className={styles.expertIcon}>
                                <Image src="/images/logo-uchile.png" alt="U. de Chile" width={45} height={45} className={styles.blendLogo} />
                            </div>
                            <div className={styles.expertText}>
                                <span className={styles.expertTitle}>Especialidad en TCC</span>
                                <p className={styles.expertDesc}>Formación de postítulo en la Universidad de Chile, bajo estándares de evidencia científica.</p>
                            </div>
                        </div>
                        <div className={styles.expertiseItem}>
                            <div className={styles.expertIcon}>
                                <div className={styles.checkIcon}>✓</div>
                            </div>
                            <div className={styles.expertText}>
                                <span className={styles.expertTitle}>Trayectoria Clínica</span>
                                <p className={styles.expertDesc}>Años de experiencia en salud mental pública y privada a lo largo del país.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

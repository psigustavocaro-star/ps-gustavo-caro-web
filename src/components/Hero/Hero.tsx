'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Magnetic from '../Common/Magnetic';
import Reveal from '../Animations/Reveal';
import InteractiveTilt from '../Interactive/InteractiveTilt';
import styles from './Hero.module.css';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.decoration}></div>
            <div className={`container ${styles.heroContent}`}>
                <motion.div
                    className={styles.textContent}
                    initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                >
                    <motion.div
                        className={styles.topBadge}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className={styles.logoWrapper}>
                            <Image src="/images/logo-uchile.png" alt="U. de Chile" width={40} height={40} className={styles.uniLogo} unoptimized={true} />
                        </div>
                        <span className={styles.badgeText}>Especializado en terapia cognitivo conductual TCC</span>
                    </motion.div>

                    <Reveal>
                        <h1 className={styles.title}>
                            Tu bienestar merece un espacio <span>seguro</span> y profesional.
                        </h1>
                    </Reveal>

                    <p className={styles.description}>
                        Hola, soy Gustavo Caro, Psicólogo Clínico con <strong>Especialización en Terapia Cognitivo Conductual</strong> por la Universidad de Chile. Experto en salud mental con herramientas concretas para tu bienestar emocional.
                    </p>

                    <div className={styles.actions}>
                        <Magnetic>
                            <Link href="/agendar" className="btn-primary">
                                Agendar sesión ahora
                            </Link>
                        </Magnetic>
                        <Link href="#sobre-mi" className="btn-outline">
                            Conoce mi enfoque
                        </Link>
                    </div>

                    <div className={styles.trustFooter}>
                        <span className={styles.trustItem}>✓ Escucha activa sin juicios</span>
                        <span className={styles.trustItem}>✓ Rigor científico</span>
                        <span className={styles.trustItem}>✓ Procesos 100% humanos</span>
                    </div>
                </motion.div>

                <motion.div
                    className={styles.imageWrapper}
                    initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                >
                    <InteractiveTilt className={styles.imageTilt}>
                        <div className={styles.imageInner}>
                            <Image
                                src="/images/gustavo-collage-2.jpg"
                                alt="Ps. Gustavo Caro - Especialista en TCC"
                                width={1200}
                                height={1200}
                                quality={100}
                                unoptimized={true}
                                className={styles.mainImage}
                                style={{ objectFit: 'cover', objectPosition: 'center' }}
                                priority
                            />
                        </div>
                    </InteractiveTilt>
                </motion.div>
            </div>
        </section>
    );
}

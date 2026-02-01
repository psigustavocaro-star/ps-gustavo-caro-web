'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Reveal from '../Animations/Reveal';
import styles from './Credentials.module.css';

const certifications = [
    {
        title: "Postítulo en Formación en Terapia Cognitivo Conductual",
        institution: "Universidad de Chile",
        year: "Especialidad",
        logo: "/images/logo-uchile.png",
        featured: true
    },
    {
        title: "Diplomado en Salud Mental en Adolescentes",
        institution: "Universidad de Chile",
        year: "Postgrado",
        logo: "/images/logo-uchile.png",
        featured: true
    },
    {
        title: "Diplomatura en Adicciones",
        institution: "Universidad Católica de Córdoba",
        year: "Postítulo",
        logo: "https://www.ucc.edu.ar/archivos/imagenes/identidad-institucional/isologotipo-ucc-azul.png"
    },
    {
        title: "Certificación Clínica ADOS-2",
        institution: "Pearson Clinical / WPS",
        year: "Acreditación",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Pearson_logo.svg/2560px-Pearson_logo.svg.png"
    },
    {
        title: "Acreditación Escala WISC-V",
        institution: "Evaluación Infanto-Juvenil",
        year: "Especialidad",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Pearson_logo.svg/2560px-Pearson_logo.svg.png"
    },
    {
        title: "Conducta Adaptativa ABAS-2",
        institution: "Certificación Clínica",
        year: "Especialidad",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Pearson_logo.svg/2560px-Pearson_logo.svg.png"
    }
];

export default function Credentials() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % certifications.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section id="acreditacion" className={styles.credentials}>
            <div className="container">
                <div className={styles.header}>
                    <span className={styles.label}>Respaldado por la excelencia</span>
                    <Reveal><h2 className={styles.title}>Acreditación Académica</h2></Reveal>
                </div>

                <div className={styles.sliderContainer}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            className={`${styles.slideItem} ${certifications[currentIndex].featured ? styles.featuredSlide : ''}`}
                            initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div className={styles.logoArea}>
                                <Image
                                    src={certifications[currentIndex].logo}
                                    alt={certifications[currentIndex].institution}
                                    width={80}
                                    height={80}
                                    className={styles.slideLogo}
                                />
                            </div>

                            <div className={styles.contentArea}>
                                <div className={styles.metaInfo}>
                                    <span className={styles.slideYear}>{certifications[currentIndex].year}</span>
                                    {certifications[currentIndex].featured && <span className={styles.featuredBadge}>Destacado</span>}
                                </div>
                                <h3 className={styles.slideTitle}>{certifications[currentIndex].title}</h3>
                                <p className={styles.slideInstitution}>{certifications[currentIndex].institution}</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Indicadores visuales */}
                    <div className={styles.indicators}>
                        {certifications.map((_, index) => (
                            <div
                                key={index}
                                className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
                                onClick={() => setCurrentIndex(index)}
                            />
                        ))}
                    </div>
                </div>

                <div className={styles.trustBar}>
                    <p className={styles.trustText}>Especialización continua bajo estándares clínicos internacionales.</p>
                </div>
            </div>
        </section>
    );
}

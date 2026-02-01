'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Reveal from '../Animations/Reveal';
import InteractiveTilt from '../Interactive/InteractiveTilt';
import styles from './Services.module.css';

const services = [
    {
        name: "Sesión Individual",
        price: "$40.000",
        description: "Psicoterapia online 50-60 min",
    },
    {
        name: "Pack de 4 Sesiones",
        price: "$115.000",
        description: "Prioridad y continuidad mensual",
        tag: "Más conveniente"
    },
    {
        name: "Evaluación Neuropsicológica",
        price: "Consultar",
        description: "WISC, WAIS, TDAH y más",
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function Services() {
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
                    <span className={styles.label}>Inversión en tu bienestar</span>
                    <Reveal><h2 className={styles.title}>Tarifas transparentes</h2></Reveal>
                    <p className={styles.subtitle}>Sin sorpresas. Valores claros para tu tranquilidad.</p>
                </motion.div>

                <motion.div
                    className={styles.priceList}
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            className={styles.priceItemWrapper}
                            variants={itemVariants}
                        >
                            <InteractiveTilt className={styles.tiltWrapper}>
                                <div className={styles.priceItem}>
                                    <div className={styles.serviceInfo}>
                                        <span className={styles.serviceName}>{service.name}</span>
                                        {service.tag && <span className={styles.tag}>{service.tag}</span>}
                                        <span className={styles.serviceDesc}>{service.description}</span>
                                    </div>
                                    <div className={styles.priceValue}>{service.price}</div>
                                </div>
                            </InteractiveTilt>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    className={styles.cta}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                >
                    <Link href="#agendar" className="btn-primary">Agendar mi sesión</Link>
                    <p className={styles.note}>Boleta electrónica automática · Reembolsable en Isapres</p>
                </motion.div>
            </div>
        </section>
    );
}

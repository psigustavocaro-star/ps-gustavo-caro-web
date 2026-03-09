import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Image from "next/image";
import Link from "next/link";
import styles from "./sobre-mi.module.css";

export const metadata = {
    title: 'Sobre Mí',
    description: 'Conoce a Gustavo Caro, Psicólogo Clínico con Especialización en Terapia Cognitivo Conductual (TCC) por la Universidad de Chile.',
};

export default function SobreMiPage() {
    return (
        <main className={styles.page}>
            <Navbar />

            <section className={styles.hero}>
                <div className="container">
                    <div className={styles.heroContent}>
                        <div className={styles.heroText}>
                            <span className={styles.tag}>Ps. Gustavo Caro</span>
                            <h1>Psicólogo Clínico<br />Especialista en TCC</h1>
                            <p className={styles.intro}>
                                Creo firmemente que el bienestar emocional no es un lujo, sino un derecho.
                                Mi misión es acompañarte con herramientas concretas, respaldadas por la
                                evidencia científica, en un espacio donde te sientas escuchado sin juicios.
                            </p>
                            <div className={styles.cta}>
                                <Link href="/agendar" className="btn-primary">
                                    Agendar una sesión
                                </Link>
                            </div>
                        </div>
                        <div className={styles.heroImage}>
                            <Image
                                src="/images/gustavo-collage-2.jpg"
                                alt="Ps. Gustavo Caro"
                                width={500}
                                height={600}
                                className={styles.portrait}
                                priority
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.philosophy}>
                <div className="container">
                    <div className={styles.philosophyContent}>
                        <h2>Mi Filosofía de Trabajo</h2>
                        <div className={styles.philosophyGrid}>
                            <div className={styles.philosophyCard}>
                                <div className={styles.cardIcon}>🧠</div>
                                <h3>Enfoque Basado en Evidencia</h3>
                                <p>
                                    Utilizo técnicas de Terapia Cognitivo Conductual (TCC) que han demostrado
                                    ser efectivas en investigaciones científicas. No trabajamos con suposiciones,
                                    sino con herramientas que funcionan.
                                </p>
                            </div>
                            <div className={styles.philosophyCard}>
                                <div className={styles.cardIcon}>🤝</div>
                                <h3>Vínculo Terapéutico</h3>
                                <p>
                                    La relación entre terapeuta y paciente es el pilar de cualquier proceso.
                                    Me esfuerzo por crear un espacio de confianza donde puedas expresarte
                                    con total libertad.
                                </p>
                            </div>
                            <div className={styles.philosophyCard}>
                                <div className={styles.cardIcon}>🎯</div>
                                <h3>Objetivos Claros</h3>
                                <p>
                                    Trabajamos juntos para definir metas concretas y medibles. No creo en
                                    terapias interminables; mi objetivo es que adquieras las herramientas
                                    para tu autonomía emocional.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.credentials}>
                <div className="container">
                    <h2>Formación Académica</h2>
                    <div className={styles.credentialsList}>
                        <div className={styles.credentialItem}>
                            <div className={styles.credentialIcon}>🎓</div>
                            <div className={styles.credentialInfo}>
                                <h3>Especialización en Terapia Cognitivo Conductual</h3>
                                <p>Universidad de Chile</p>
                            </div>
                        </div>
                        <div className={styles.credentialItem}>
                            <div className={styles.credentialIcon}>📚</div>
                            <div className={styles.credentialInfo}>
                                <h3>Diplomado en Neurociencia Cognitiva</h3>
                                <p>Pontificia Universidad Católica de Chile</p>
                            </div>
                        </div>
                        <div className={styles.credentialItem}>
                            <div className={styles.credentialIcon}>🧩</div>
                            <div className={styles.credentialInfo}>
                                <h3>Certificación ADOS-2</h3>
                                <p>Evaluación diagnóstica de autismo</p>
                            </div>
                        </div>
                        <div className={styles.credentialItem}>
                            <div className={styles.credentialIcon}>📊</div>
                            <div className={styles.credentialInfo}>
                                <h3>Acreditación WISC-V</h3>
                                <p>Evaluación de inteligencia</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.experience}>
                <div className="container">
                    <div className={styles.experienceContent}>
                        <div className={styles.experienceText}>
                            <h2>Experiencia Profesional</h2>
                            <p>
                                A lo largo de mi carrera he trabajado en diversos contextos clínicos y
                                educativos, desde centros de salud públicos hasta clínicas privadas.
                                Esta diversidad me ha permitido desarrollar una comprensión profunda de
                                las necesidades de diferentes poblaciones.
                            </p>
                            <p>
                                Actualmente me dedico exclusivamente a la atención online, lo que me
                                permite llegar a pacientes en todo Chile y el extranjero, manteniendo
                                la misma calidad y calidez que una sesión presencial.
                            </p>
                            <div className={styles.stats}>
                                <div className={styles.stat}>
                                    <span className={styles.statNumber}>500+</span>
                                    <span className={styles.statLabel}>Pacientes atendidos</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statNumber}>7+</span>
                                    <span className={styles.statLabel}>Años de experiencia</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statNumber}>100%</span>
                                    <span className={styles.statLabel}>Online</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.ctaSection}>
                <div className="container">
                    <div className={styles.ctaCard}>
                        <h2>¿Listo para dar el primer paso?</h2>
                        <p>
                            Agendar una sesión es simple. Elige el horario que mejor te acomode
                            y comencemos a trabajar juntos en tu bienestar.
                        </p>
                        <Link href="/agendar" className="btn-primary btn-lg">
                            Agendar mi primera sesión
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

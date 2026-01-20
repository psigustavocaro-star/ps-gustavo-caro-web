import Image from 'next/image';
import styles from './About.module.css';

export default function About() {
    return (
        <section id="sobre-mi" className={styles.about}>
            <div className={`container ${styles.aboutContent}`}>
                <div className={styles.imageContainer}>
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
                    <div className={styles.floatingCard}>
                        <span className={styles.floatingTitle}>Especialista en TCC</span>
                        <p className={styles.floatingText}>Salud Mental con experiencia clínica en diversas zonas de nuestro país.</p>
                    </div>
                </div>

                <div className={styles.textContent}>
                    <span className={styles.subtitle}>Mi Enfoque Humano y Científico</span>
                    <h2 className={styles.sectionTitle}>Entender tu mente para sanar tu corazón.</h2>
                    <p className={styles.text}>
                        Como psicólogo clínico con un fuerte <strong>enfoque TCC</strong> (Cognitivo Conductual), mi práctica se centra en herramientas concretas y efectivas. He tenido la oportunidad de trabajar en diversas zonas de Chile, lo que me ha dado una visión amplia y empática de las distintas realidades de salud mental.
                    </p>
                    <p className={styles.text}>
                        Mi compromiso con cada paciente es absoluto. No eres un número, eres una persona buscando equilibrio y bienestar. Mi especialización en salud mental me permite acompañarte con la rigurosidad técnica necesaria, pero siempre desde la calidez y el respeto profundo.
                    </p>

                    <div className={styles.advantageGrid}>
                        <div className={styles.advantageItem}>
                            <span className={styles.advantageTitle}>Especialización</span>
                            <p className={styles.advantageText}>Formación continua en salud mental y abordaje de diversas crisis emocionales.</p>
                        </div>
                        <div className={styles.advantageItem}>
                            <span className={styles.advantageTitle}>Seguridad Emocional</span>
                            <p className={styles.advantageText}>Un espacio donde te sientas validado, escuchado y profundamente respetado.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

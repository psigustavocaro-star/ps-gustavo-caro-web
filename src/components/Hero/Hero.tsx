import Image from 'next/image';
import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.decoration}></div>
            <div className={`container ${styles.heroContent}`}>
                <div className={styles.textContent}>
                    <div className={styles.topBadge}>
                        <span className={styles.heartIcon}>💖</span>
                        <span className={styles.badgeText}>Tu salud emocional es prioridad</span>
                    </div>
                    <h1 className={styles.title}>
                        Tu bienestar merece un espacio <span>seguro</span> y profesional.
                    </h1>
                    <p className={styles.description}>
                        Hola, soy Gustavo Caro, Psicólogo Clínico con <strong>Enfoque TCC</strong>. Especialista en salud mental con experiencia trabajando en diversas zonas de Chile. Mi compromiso es brindarte un espacio seguro y humano para tu bienestar.
                    </p>
                    <div className={styles.actions}>
                        <Link href="#agendar" className="btn-primary">
                            Agendar sesión ahora
                        </Link>
                        <Link href="#sobre-mi" className="btn-outline">
                            Conoce mi enfoque
                        </Link>
                    </div>
                    <div className={styles.trustFooter}>
                        <span className={styles.trustItem}>✓ Escucha activa sin juicios</span>
                        <span className={styles.trustItem}>✓ Rigor científico</span>
                        <span className={styles.trustItem}>✓ Procesos 100% humanos</span>
                    </div>
                </div>

                <div className={styles.imageWrapper}>
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
                </div>
            </div>
        </section>
    );
}

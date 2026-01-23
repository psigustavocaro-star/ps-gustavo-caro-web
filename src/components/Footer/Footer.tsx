'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    const [year, setYear] = useState(2026);

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.footerContent}>
                    <div className={styles.brand}>
                        <h3>Ps. Gustavo Caro<span className={styles.logoDot}>.</span></h3>
                        <p className={styles.description}>
                            Psicólogo Clínico con especialización en Salud Mental y <strong>Enfoque TCC</strong>.
                            Experiencia en diversas zonas de Chile y alto compromiso con el bienestar del paciente.
                        </p>
                    </div>

                    <div className={styles.footerLinks}>
                        <h4>Navegación</h4>
                        <ul className={styles.linkList}>
                            <li><Link href="/" className={styles.linkItem}>Inicio</Link></li>
                            <li><Link href="/#sobre-mi" className={styles.linkItem}>Sobre mí</Link></li>
                            <li><Link href="/blog" className={styles.linkItem}>Blog</Link></li>
                            <li><Link href="/#servicios" className={styles.linkItem}>Servicios</Link></li>
                            <li><Link href="/#agendar" className={styles.linkItem}>Agendar sesión</Link></li>
                        </ul>
                    </div>

                    <div className={styles.footerLinks}>
                        <h4>Legal</h4>
                        <ul className={styles.linkList}>
                            <li><Link href="/aviso-legal" className={styles.linkItem}>Aviso Legal</Link></li>
                            <li><Link href="/privacidad" className={styles.linkItem}>Política de Privacidad</Link></li>
                            <li><Link href="/cookies" className={styles.linkItem}>Política de Cookies</Link></li>
                        </ul>
                    </div>

                    <div className={styles.contactInfo}>
                        <h4>Contacto</h4>
                        <p>📧 contacto@psgustavocaro.cl</p>
                        <p>📍 Atención 100% Online</p>
                        <p>🇨🇱 Santiago, Chile</p>
                    </div>
                </div>

                <div className={styles.bottomBar}>
                    <p>© {year} Ps. Gustavo Caro. Todos los derechos reservados.</p>
                    <div className={styles.legalLinks}>
                        <p>No atender urgencias por este medio. En caso de crisis llame al *4141.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

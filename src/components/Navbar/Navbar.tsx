'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Magnetic from '../Common/Magnetic';
import styles from './Navbar.module.css';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Cerrar menú al hacer click en un link
    const closeMenu = () => setIsMenuOpen(false);

    // Evitar scroll cuando el menú está abierto
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMenuOpen]);

    return (
        <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
            {/* Elementos Bokeh para el efecto de espejo moderno */}
            <div className={styles.bokehContainer}>
                <div className={styles.bokehItem}></div>
                <div className={styles.bokehItem}></div>
                <div className={styles.bokehItem}></div>
            </div>

            <div className={`container ${styles.navContainer}`}>
                <div className={styles.left}>
                    <Link href="/" className={styles.logo} onClick={closeMenu}>
                        <Image src="/icon.png?v=5" alt="Logo Ps. Gustavo Caro" width={44} height={44} className={styles.logoImage} />
                        Ps. Gustavo Caro<span className={styles.logoDot}>.</span>
                    </Link>
                </div>

                {/* Desktop Menu */}
                <ul className={styles.navLinks}>
                    <li><Link href="/#sobre-mi" className={styles.navLink}>Sobre mí</Link></li>
                    <li><Link href="/#servicios" className={styles.navLink}>Servicios</Link></li>
                    <li><Link href="/blog" className={styles.navLink}>Blog</Link></li>
                    <li><Link href="/calendario" className={styles.navLink}>Disponibilidad</Link></li>
                    <li><Link href="/#faq" className={styles.navLink}>FAQ</Link></li>
                    <li><Link href="/#contacto" className={styles.navLink}>Contacto</Link></li>
                </ul>

                <div className={styles.navActions}>
                    <Magnetic>
                        <Link href="/agendar" className={styles.cta} onClick={closeMenu}>
                            Agendar sesión
                        </Link>
                    </Magnetic>

                    {/* Hamburger Button for Mobile */}
                    <button
                        className={`${styles.hamburger} ${isMenuOpen ? styles.open : ''}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.isOpen : ''}`}>
                <div className={styles.mobileMenuContent}>
                    <ul className={styles.mobileNavLinks}>
                        <li><Link href="/#sobre-mi" onClick={closeMenu}>Sobre mí</Link></li>
                        <li><Link href="/#servicios" onClick={closeMenu}>Servicios</Link></li>
                        <li><Link href="/blog" onClick={closeMenu}>Blog</Link></li>
                        <li><Link href="/calendario" onClick={closeMenu}>Disponibilidad</Link></li>
                        <li><Link href="/#faq" onClick={closeMenu}>FAQ</Link></li>
                        <li><Link href="/#contacto" onClick={closeMenu}>Contacto</Link></li>
                    </ul>

                    <div className={styles.mobileCtaWrapper}>
                        <Link href="/agendar" className={styles.mobileCta} onClick={closeMenu}>
                            Agendar sesión ahora
                        </Link>
                        <p className={styles.mobileFooterText}>Reserva tu hora online</p>
                    </div>
                </div>
            </div>
        </nav>
    );
}

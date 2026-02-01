import Link from 'next/link';
import Magnetic from '../Common/Magnetic';
import styles from './Navbar.module.css';

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            {/* Elementos Bokeh para el efecto de espejo moderno */}
            <div className={styles.bokehContainer}>
                <div className={styles.bokehItem}></div>
                <div className={styles.bokehItem}></div>
                <div className={styles.bokehItem}></div>
            </div>

            <div className={`container ${styles.navContainer}`}>
                <Link href="/" className={styles.logo}>
                    Ps. Gustavo Caro<span className={styles.logoDot}>.</span>
                </Link>

                <ul className={styles.navLinks}>
                    <li><Link href="/#sobre-mi" className={styles.navLink}>Sobre mí</Link></li>
                    <li><Link href="/#servicios" className={styles.navLink}>Servicios</Link></li>
                    <li><Link href="/blog" className={styles.navLink}>Blog</Link></li>
                    <li><Link href="/calendario" className={styles.navLink}>Disponibilidad</Link></li>
                    <li><Link href="/#faq" className={styles.navLink}>FAQ</Link></li>
                    <li><Link href="/#contacto" className={styles.navLink}>Contacto</Link></li>
                </ul>

                <Magnetic>
                    <Link href="#agendar" className={styles.cta}>
                        Agendar sesión
                    </Link>
                </Magnetic>
            </div>
        </nav>
    );
}

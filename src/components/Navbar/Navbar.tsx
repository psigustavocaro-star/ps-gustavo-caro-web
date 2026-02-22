
'use client';

import Link from 'next/link';
import Magnetic from '../Common/Magnetic';
import styles from './Navbar.module.css';
import Sidebar from '../Sidebar/Sidebar';

export default function Navbar() {
    return (
        <>
            <nav className={styles.navbar}>
                {/* Bokeh background elements - Ventana de cristal */}
                <div className={styles.bokehContainer}>
                    <div className={styles.bokehItem}></div>
                    <div className={styles.bokehItem}></div>
                    <div className={styles.bokehItem}></div>
                </div>

                <div className={`container ${styles.navContainer}`}>
                    <div className={styles.left}>
                        <Link href="/" className={styles.logo}>
                            Ps. Gustavo Caro<span className={styles.logoDot}>.</span>
                        </Link>
                    </div>

                    <ul className={styles.navLinks}>
                        <li><Link href="/#sobre-mi" className={styles.navLink}>Sobre mí</Link></li>
                        <li><Link href="/#servicios" className={styles.navLink}>Servicios</Link></li>
                        <li><Link href="/#blog" className={styles.navLink}>Blog</Link></li>
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
            {/* Sidebar ahora es un Dock Flotante permanente */}
            <Sidebar />
        </>
    );
}

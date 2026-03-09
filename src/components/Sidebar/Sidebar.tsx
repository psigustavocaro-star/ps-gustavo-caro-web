
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import styles from './Sidebar.module.css';

const navLinks = [
    {
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
        href: '/',
        label: 'Inicio'
    },
    {
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
        href: '/agendar',
        label: 'Agendar Sesión'
    },
    {
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
        href: '/#sobre-mi',
        label: 'Sobre mí'
    },
    {
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.4A2.4 2.4 0 1 1 7.2 4.8 2.4 2.4 0 1 1 4.8 2.4Z" /><path d="M4.8 19.2a2.4 2.4 0 1 1 2.4 2.4 2.4 2.4 0 1 1-2.4-2.4Z" /><path d="M19.2 4.8a2.4 2.4 0 1 1 2.4-2.4 2.4 2.4 0 1 1-2.4 2.4Z" /><path d="M19.2 19.2a2.4 2.4 0 1 1 2.4 2.4 2.4 2.4 0 1 1-2.4-2.4Z" /><path d="M12 12a2.4 2.4 0 1 1 2.4 2.4 2.4 2.4 0 1 1-2.4-2.4Z" /><circle cx="12" cy="12" r="9" /></svg>,
        href: '/#servicios',
        label: 'Servicios'
    },
    {
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
        href: '/#contacto',
        label: 'Contacto',
        isAction: true
    },
    {
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
        href: '/#blog',
        label: 'Blog Académico'
    },
];

export default function Sidebar() {
    const [showContact, setShowContact] = useState(false);

    const toggleContact = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowContact(!showContact);
    };

    const closeContact = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowContact(false);
    };

    return (
        <motion.aside
            className={styles.floatingDock}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
        >
            <nav className={styles.nav}>
                <ul className={styles.links}>
                    {navLinks.map((link) => (
                        <li key={link.label} className={styles.linkWrapper}>
                            {link.isAction ? (
                                <button
                                    onClick={toggleContact}
                                    className={`${styles.dockLink} ${showContact ? styles.activeLink : ''}`}
                                    title={link.label}
                                    type="button"
                                >
                                    <div className={styles.iconWrapper}>
                                        {link.icon}
                                    </div>
                                    <span className={styles.tooltip}>{link.label}</span>
                                </button>
                            ) : (
                                <Link href={link.href} className={styles.dockLink} title={link.label}>
                                    <div className={styles.iconWrapper}>
                                        {link.icon}
                                    </div>
                                    <span className={styles.tooltip}>{link.label}</span>
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Popover fuera del li para evitar conflictos de eventos */}
            <AnimatePresence>
                {showContact && (
                    <motion.div
                        className={styles.popover}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.popoverHeader}>
                            <h4>Contacto Directo</h4>
                            <button
                                onClick={closeContact}
                                className={styles.closeBtn}
                                type="button"
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.popoverContent}>
                            <p className={styles.popoverEmail}>📧 psi.gustavocaro@gmail.com</p>
                            <div className={styles.popoverActions}>
                                <a
                                    href={`https://wa.me/56922409953?text=${encodeURIComponent("Hola Gustavo, me gustaría realizar una consulta rápida.")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.whatsappBtn}
                                >
                                    Escribir por WhatsApp
                                </a>
                                <div className={styles.divider}></div>
                                <p className={styles.reminder}>¿Quieres asegurar un espacio hoy?</p>
                                <Link
                                    href="/agendar"
                                    className={styles.bookingBtn}
                                    onClick={() => setShowContact(false)}
                                >
                                    Reservar ahora en la web
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.aside>
    );
}

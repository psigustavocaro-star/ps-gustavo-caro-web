'use client';

import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import styles from './mi-cuenta.module.css';
import { motion } from 'framer-motion';

function MiCuentaContent() {
    const [email, setEmail] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Mock login for now - in a real app, this would verify a code sent to email
            const res = await fetch(`/api/bookings/user?email=${email}`);
            const data = await res.json();
            if (data.success && data.patient) {
                setUserData(data.patient);
                setIsAuthenticated(true);
            } else {
                alert('No encontramos registros con ese correo. Asegúrate de haber agendado antes.');
            }
        } catch (err) {
            alert('Error al conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className={styles.loginWrapper}>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.loginCard}
                >
                    <div className={styles.loginHeader}>
                        <span className={styles.loginIcon}>🔐</span>
                        <h1>Acceso Pacientes</h1>
                        <p>Ingresa tu correo para ver tus sesiones y documentos.</p>
                    </div>
                    <form onSubmit={handleLogin} className={styles.loginForm}>
                        <div className={styles.inputGroup}>
                            <label>Correo Electrónico</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="tu@email.com"
                                required 
                            />
                        </div>
                        <button type="submit" className={styles.loginBtn} disabled={loading}>
                            {loading ? 'Verificando...' : 'Entrar a mi Portal'}
                        </button>
                    </form>
                    <p className={styles.loginFooter}>
                        ¿Aún no eres paciente? <a href="/agendar">Agenda tu primera sesión</a>
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.dashHeader}>
                <div className={styles.welcome}>
                    <h1>Hola, {userData.firstName || userData.name} 👋</h1>
                    <p>Bienvenido a tu espacio de bienestar personal.</p>
                </div>
                <div className={styles.headerActions}>
                    <button onClick={() => setIsAuthenticated(false)} className={styles.logoutBtn}>Cerrar Sesión</button>
                </div>
            </header>

            <div className={styles.dashGrid}>
                {/* Main Content */}
                <div className={styles.mainCol}>
                    <section className={styles.nextSession}>
                        <div className={styles.sectionHeader}>
                            <h2>Próxima Sesión</h2>
                            <span className={styles.liveTag}>En Vivo</span>
                        </div>
                        <div className={styles.sessionCard}>
                            <div className={styles.sessionTime}>
                                <span className={styles.date}>15 Mayo</span>
                                <span className={styles.hour}>16:00 hrs</span>
                            </div>
                            <div className={styles.sessionDetails}>
                                <h3>Sesión de Psicoterapia Online</h3>
                                <p>Ps. Gustavo Caro</p>
                                <button className={styles.joinBtn}>Unirse a la videollamada</button>
                            </div>
                        </div>
                    </section>

                    <section className={styles.history}>
                        <div className={styles.sectionHeader}>
                            <h2>Mis Sesiones Pasadas</h2>
                            <a href="#" className={styles.seeAll}>Ver todo</a>
                        </div>
                        <div className={styles.historyList}>
                            {userData.bookings?.map((b: any, i: number) => (
                                <div key={i} className={styles.historyItem}>
                                    <div className={styles.historyIcon}>✅</div>
                                    <div className={styles.historyInfo}>
                                        <span className={styles.historyDate}>{new Date(b.appointmentDate || b.createdAt).toLocaleDateString()}</span>
                                        <span className={styles.historyType}>{b.serviceType}</span>
                                    </div>
                                    {b.invoiceUrl ? (
                                        <a 
                                            href={b.invoiceUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className={styles.invoiceBtn}
                                            style={{ textDecoration: 'none', color: 'inherit' }}
                                        >
                                            Boleta 📥
                                        </a>
                                    ) : (
                                        <button className={styles.invoiceBtn} disabled title="Boleta aún no disponible">Pendiente</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className={styles.sideCol}>
                    <div className={styles.progressCard}>
                        <h3>Tu Progreso</h3>
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: '65%' }}></div>
                        </div>
                        <p>Has completado 4 sesiones este mes. ¡Excelente trabajo!</p>
                    </div>

                    <div className={styles.resourceCard}>
                        <h3>Recursos para ti</h3>
                        <div className={styles.resourceItem}>
                            <span>📑</span>
                            <p>Guía de ejercicios de respiración</p>
                        </div>
                        <div className={styles.resourceItem}>
                            <span>🎧</span>
                            <p>Audio: Meditación para la ansiedad</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MiCuentaPage() {
    return (
        <main className={styles.page}>
            <Navbar />
            <div className="container">
                <Suspense fallback={<div>Cargando...</div>}>
                    <MiCuentaContent />
                </Suspense>
            </div>
            <Footer />
        </main>
    );
}

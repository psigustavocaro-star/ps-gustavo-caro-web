'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './AdminDashboard.module.css';
import Link from 'next/link';

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [bookings, setBookings] = useState<any[]>([]);
    const [newsletter, setNewsletter] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'bookings' | 'newsletter'>('bookings');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.toLowerCase() === 'psi.gustavocaro@gmail.com' && password === 'gudaxgudax1.') {
            setIsAuthenticated(true);
            fetchData();
        } else {
            alert('Credenciales incorrectas');
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/data');
            const data = await res.json();
            if (data.success) {
                setBookings(data.bookings);
                setNewsletter(data.newsletter || []);
            }
        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Estadísticas rápidas
    const stats = useMemo(() => {
        const totalBookings = bookings.length;
        const totalRevenue = bookings
            .filter(b => b.status === 'PAID')
            .reduce((sum, b) => sum + (b.amount || 0), 0);
        const newPatients = bookings.filter(b => {
             const createdDate = new Date(b.createdAt);
             const now = new Date();
             return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
        }).length;
        const totalSubs = newsletter.length;

        return { totalBookings, totalRevenue, newPatients, totalSubs };
    }, [bookings, newsletter]);

    if (!isAuthenticated) {
        return (
            <div className={styles.loginContainer}>
                <div className={styles.loginCard}>
                    <div className={styles.loginHeader}>
                        <div className={styles.logoCircle}>GC</div>
                        <h1 className={styles.loginTitle}>Acceso Profesional</h1>
                        <p className={styles.loginDesc}>Ingresa tus credenciales para administrar la clínica.</p>
                    </div>
                    <form onSubmit={handleLogin} className={styles.loginForm}>
                        <div className={styles.inputGroup}>
                            <label>Email</label>
                            <input
                                type="email"
                                className={styles.input}
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Contraseña</label>
                            <input
                                type="password"
                                className={styles.input}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className={styles.loginBtn}>Entrar al Sistema →</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarBrand}>
                    <div className={styles.logoMini}>GC</div>
                    <span>Administración</span>
                </div>
                <nav className={styles.sidebarNav}>
                    <button 
                        className={`${styles.navItem} ${activeTab === 'bookings' ? styles.navActive : ''}`}
                        onClick={() => setActiveTab('bookings')}
                    >
                        👥 Pacientes
                    </button>
                    <button 
                        className={`${styles.navItem} ${activeTab === 'newsletter' ? styles.navActive : ''}`}
                        onClick={() => setActiveTab('newsletter')}
                    >
                        📧 Newsletter
                    </button>
                    <Link href="/" className={styles.navItem}>
                        🏠 Volver al Sitio
                    </Link>
                </nav>
                <div className={styles.sidebarFooter}>
                    <button onClick={() => setIsAuthenticated(false)} className={styles.logoutBtn}>
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.mainHeader}>
                    <div className={styles.welcomeInfo}>
                        <h1 className={styles.mainTitle}>Hola, Gustavo 👋</h1>
                        <p className={styles.mainSubtitle}>Aquí tienes un resumen de tu actividad clínica.</p>
                    </div>
                    <div className={styles.headerActions}>
                        <button onClick={fetchData} className={styles.refreshBtn} title="Sincronizar">
                            🔄
                        </button>
                    </div>
                </header>

                <section className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Total Pacientes</span>
                        <div className={styles.statValue}>{stats.totalBookings}</div>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Ingresos Estimados</span>
                        <div className={styles.statValue}>${stats.totalRevenue.toLocaleString('es-CL')}</div>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Pacientes este Mes</span>
                        <div className={styles.statValue}>{stats.newPatients}</div>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Suscriptores</span>
                        <div className={styles.statValue}>{stats.totalSubs}</div>
                    </div>
                </section>

                <div className={styles.contentWrapper}>
                    {isLoading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner}></div>
                            <p>Actualizando registros...</p>
                        </div>
                    ) : activeTab === 'bookings' ? (
                        <div className={styles.dataList}>
                            <div className={styles.listHeader}>
                                <h2>Registros de Agendamiento</h2>
                                <p>Lista de todos los pacientes que han reservado o pagado.</p>
                            </div>
                            <div className={styles.tableResponsive}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Paciente</th>
                                            <th>Cita y Pago</th>
                                            <th>Servicio</th>
                                            <th>Detalles Clínicos</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map((b) => (
                                            <tr key={b.id}>
                                                <td className={styles.patientCell}>
                                                    <div className={styles.patientMain}>
                                                        <strong>{b.name}</strong>
                                                        <span>{b.email}</span>
                                                        {b.phone && <span className={styles.phoneLink}>📞 {b.phone}</span>}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.dateInfo}>
                                                        <strong>{new Date((b.appointmentDate || b.createdAt) as string).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}</strong>
                                                        <span className={`${styles.statusBadge} ${styles[b.status.toLowerCase()]}`}>
                                                            {b.status === 'PAID' ? 'PAGADO ✓' : 'PENDIENTE'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={styles.serviceBadge}>{b.serviceType}</span>
                                                </td>
                                                <td className={styles.detailsCell}>
                                                    <div className={styles.detailsBox}>
                                                        <em>{b.reason || b.details || 'Sin motivo especificado'}</em>
                                                        {b.anamnesis && (
                                                            <div className={styles.anamnesisPill}>
                                                                🧬 <strong>{b.anamnesis.age} años</strong> · Med: {b.anamnesis.medications}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.dataList}>
                            <div className={styles.listHeader}>
                                <h2>Base de Datos Newsletter</h2>
                                <p>Clientes interesados en recibir contenido educativo.</p>
                            </div>
                            <div className={styles.tableResponsive}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Suscriptor</th>
                                            <th>Progreso</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {newsletter.map((n) => (
                                            <tr key={n.id}>
                                                <td>
                                                    <div className={styles.patientMain}>
                                                        <strong>{n.name || 'Invitado'}</strong>
                                                        <span>{n.email}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.progressInfo}>
                                                        <span>Email {n.currentStep} de 24</span>
                                                        <div className={styles.progressBar}>
                                                            <div className={styles.progressFill} style={{ width: `${(n.currentStep / 24) * 100}%` }}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`${styles.statusBadge} ${n.active ? styles.paid : styles.failed}`}>
                                                        {n.active ? 'ACTIVO' : 'DADO DE BAJA'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

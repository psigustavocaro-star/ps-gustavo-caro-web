'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './AdminDashboard.module.css';
import Link from 'next/link';

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [bookings, setBookings] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [newsletter, setNewsletter] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'patients' | 'bookings' | 'newsletter' | 'marketing'>('patients');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);

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
                setBookings(data.bookings || []);
                setPatients(data.patients || []);
                setNewsletter(data.newsletter || []);
                setTemplates(data.templates || []);
            }
        } catch (err) {
            console.error('Fetch Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = useMemo(() => {
        const totalBookings = bookings.length;
        const totalRevenue = bookings
            .filter(b => b.status === 'PAID')
            .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
        const newPatients = bookings.filter(b => {
             const createdDate = new Date(b.createdAt);
             const now = new Date();
             return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
        }).length;
        const totalSubs = newsletter.length;
        return { totalBookings, totalRevenue, newPatients, totalSubs };
    }, [bookings, newsletter]);

    useEffect(() => {
        if (isAuthenticated) {
            const sidebars = document.querySelectorAll('[class*="Sidebar_sidebar"]');
            sidebars.forEach((el: any) => el.style.display = 'none');
            return () => {
                sidebars.forEach((el: any) => el.style.display = '');
            };
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className={styles.loginWrapper}>
                <div className={styles.loginCard}>
                    <div className={styles.loginLogo}>GC</div>
                    <h1>Panel Clínico Pro</h1>
                    <p>Introduce tus credenciales para acceder al sistema.</p>
                    <form onSubmit={handleLogin} className={styles.loginForm}>
                        <div className={styles.inputBox}>
                            <label>Email Profesional</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" required />
                        </div>
                        <div className={styles.inputBox}>
                            <label>Contraseña</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                        </div>
                        <button type="submit" className={styles.primaryButton}>Iniciar Sesión Segura</button>
                    </form>
                    <div className={styles.loginFooter}>
                        <Link href="/">← Volver al sitio principal</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.adminMain}>
            <aside className={styles.sideNav}>
                <div className={styles.navHeader}>
                    <div className={styles.logoSmall}>GC</div>
                    <div className={styles.navTitle}>
                        <span>Gustavo Caro</span>
                        <small>Psicólogo Clínico</small>
                    </div>
                </div>
                <nav className={styles.navList}>
                    <button className={activeTab === 'patients' ? styles.active : ''} onClick={() => setActiveTab('patients')}>👥 Pacientes</button>
                    <button className={activeTab === 'bookings' ? styles.active : ''} onClick={() => setActiveTab('bookings')}>📅 Agendas</button>
                    <button className={activeTab === 'marketing' ? styles.active : ''} onClick={() => setActiveTab('marketing')}>✍️ Contenido</button>
                    <button className={activeTab === 'newsletter' ? styles.active : ''} onClick={() => setActiveTab('newsletter')}>📧 Newsletter</button>
                </nav>
                <button onClick={() => setIsAuthenticated(false)} className={styles.logoutAction}>Cerrar Sesión</button>
            </aside>

            <main className={styles.contentArea}>
                <header className={styles.contentHeader}>
                    <div>
                        <h1>{activeTab === 'patients' ? 'Fichas de Pacientes' : activeTab === 'bookings' ? 'Resumen de Agendas' : activeTab === 'marketing' ? 'Gestión de Contenido' : 'Comunidad Newsletter'}</h1>
                        <p>Gestión y administración de datos clínicos en tiempo real.</p>
                    </div>
                    <button onClick={fetchData} className={styles.syncBtn}>
                        {isLoading ? 'Sincronizando...' : 'Sincronizar Datos'}
                    </button>
                </header>

                <div className={styles.dashboardStats}>
                    <div className={styles.statBox}>
                        <span className={styles.label}>Sesiones</span>
                        <span className={styles.value}>{stats.totalBookings}</span>
                        <div className={styles.indicator} style={{background: '#06b6d4'}}></div>
                    </div>
                    <div className={styles.statBox}>
                        <span className={styles.label}>Ingresos Est.</span>
                        <span className={styles.value}>${stats.totalRevenue.toLocaleString('es-CL')}</span>
                        <div className={styles.indicator} style={{background: '#10b981'}}></div>
                    </div>
                    <div className={styles.statBox}>
                        <span className={styles.label}>Pacientes (Mes)</span>
                        <span className={styles.value}>{stats.newPatients}</span>
                        <div className={styles.indicator} style={{background: '#facc15'}}></div>
                    </div>
                    <div className={styles.statBox}>
                        <span className={styles.label}>Suscriptores</span>
                        <span className={styles.value}>{stats.totalSubs}</span>
                        <div className={styles.indicator} style={{background: '#a855f7'}}></div>
                    </div>
                </div>

                <div className={styles.mainGrid}>
                    {activeTab === 'patients' ? (
                        <div className={styles.tableWrapper}>
                            <table className={styles.proTable}>
                                <thead>
                                    <tr>
                                        <th>Paciente</th>
                                        <th>Sesiones</th>
                                        <th>Estado</th>
                                        <th>Inversión</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patients.map((p) => (
                                        <tr key={p.email}>
                                            <td>
                                                <strong>{p.name}</strong>
                                                <small>{p.email}</small>
                                            </td>
                                            <td>{p.bookings.length}</td>
                                            <td><span className={styles.statusOk}>{p.newsletter ? 'Suscrito' : 'Paciente'}</span></td>
                                            <td>${p.totalSpent.toLocaleString('es-CL')}</td>
                                            <td><button className={styles.viewBtn} onClick={() => setSelectedPatient(p)}>Ver Ficha</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : activeTab === 'bookings' ? (
                        <div className={styles.tableWrapper}>
                            <table className={styles.proTable}>
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Fecha</th>
                                        <th>Servicio</th>
                                        <th>Pago</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((b) => (
                                        <tr key={b.id}>
                                            <td>{b.name}</td>
                                            <td>{new Date((b.appointmentDate || b.createdAt) as string).toLocaleDateString()}</td>
                                            <td>{b.serviceType}</td>
                                            <td><span className={b.status === 'PAID' ? styles.statusOk : styles.statusPending}>{b.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className={styles.emptyState}>Sección en desarrollo o sin datos disponibles.</div>
                    )}
                </div>
            </main>

            {selectedPatient && (
                <div className={styles.overlay} onClick={() => setSelectedPatient(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2>Ficha Paciente</h2>
                        <div className={styles.modalScroll}>
                           <p><strong>Email:</strong> {selectedPatient.email}</p>
                           <hr />
                           <h3>Historial de Sesiones</h3>
                           <ul>
                               {selectedPatient.bookings.map((b: any) => (
                                   <li key={b.id}>{new Date((b.appointmentDate || b.createdAt) as string).toLocaleDateString()} - {b.serviceType}</li>
                               ))}
                           </ul>
                        </div>
                        <button className={styles.closeBtn} onClick={() => setSelectedPatient(null)}>Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

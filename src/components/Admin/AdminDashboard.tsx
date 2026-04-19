'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './AdminDashboard.module.css';
import Link from 'next/link';

type Theme = 'obsidian' | 'light' | 'emerald';

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [theme, setTheme] = useState<Theme>('obsidian');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [bookings, setBookings] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [newsletter, setNewsletter] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'patients' | 'bookings' | 'newsletter' | 'marketing'>('patients');
    const [isLoading, setIsLoading] = useState(false);

    // Template Editor State
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [tempTitle, setTempTitle] = useState('');
    const [tempContent, setTempContent] = useState('');

    // Selected Patient View
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
            console.log('ADMIN DATA RECEIVED:', data);
            if (data.success) {
                setBookings(data.bookings || []);
                setPatients(data.patients || []);
                setNewsletter(data.newsletter || []);
                setTemplates(data.templates || []);
            } else {
                console.error('API Error:', data.error);
                // Si falla por tabla inexistente (como templates), igual dejamos que cargue lo demás
            }
        } catch (err) {
            console.error('Fetch Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveTemplate = async () => {
        if (!tempTitle || !tempContent) return alert('Título y contenido son requeridos');
        try {
            const res = await fetch('/api/admin/marketing/template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingTemplate?.id, title: tempTitle, content: tempContent })
            });
            if (res.ok) {
                setEditingTemplate(null);
                setTempTitle('');
                setTempContent('');
                fetchData();
            }
        } catch (e) {
            alert('Error al guardar');
        }
    };

    const handleSendNewsletter = async (templateId: string) => {
        const recipients = newsletter.filter(n => n.active).map(n => n.email);
        if (recipients.length === 0) return alert('No hay destinatarios activos');
        
        if (!confirm(`¿Enviar este correo a ${recipients.length} suscriptores?`)) return;

        try {
            const res = await fetch('/api/admin/marketing/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId, recipientEmails: recipients })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Envío completado: ${data.summary.success} exitosos, ${data.summary.failed} fallidos.`);
            }
        } catch (e) {
            alert('Error en el envío');
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

    const globalStyles = `
        #admin-panel h1, #admin-panel h2, #admin-panel h3, #admin-panel h4, #admin-panel h5, #admin-panel h6,
        #admin-panel strong, #admin-panel span, #admin-panel label, #admin-panel p,
        #admin-login-root h1, #admin-login-root h2, #admin-login-root h3, #admin-login-root p, 
        #admin-login-root label, #admin-login-root span, #admin-login-root div, #admin-login-root strong {
            color: white !important;
        }
        #admin-panel [class*="mainSubtitle"],
        #admin-panel [class*="statLabel"],
        #admin-panel [class*="breadcrumb"],
        #admin-login-root p {
            color: rgba(255,255,255,0.7) !important;
        }
        #admin-panel table th {
            color: rgba(255,255,255,0.5) !important;
        }
    `;

    if (!isAuthenticated) {
        return (
            <div className={`${styles.loginContainer} ${styles[theme]}`} id="admin-login-root">
                <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
                <div className={styles.bokehBackground}>
                    <div className={styles.bokehCircle}></div>
                    <div className={styles.bokehCircle}></div>
                    <div className={styles.bokehCircle}></div>
                </div>
                <div className={styles.loginCard}>
                    <div className={styles.loginHeader}>
                        <div className={styles.logoCircle} style={{ color: '#ffffff' }}>GC</div>
                        <h1 className={styles.loginTitle} style={{ color: '#ffffff' }}>Sistema de Gestión Caro</h1>
                        <p className={styles.loginDesc} style={{ color: '#94a3b8' }}>Identificación profesional requerida.</p>
                    </div>
                    <form onSubmit={handleLogin} className={styles.loginForm}>
                        <div className={styles.inputGroup}>
                            <label style={{ color: '#ffffff', display: 'block', marginBottom: '8px' }}>Usuario Maestro</label>
                            <input
                                type="email"
                                className={styles.input}
                                placeholder="psi.gustavocaro@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ color: '#ffffff' }}
                                autoFocus
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label style={{ color: '#ffffff', display: 'block', marginBottom: '8px' }}>Clave de Acceso</label>
                            <input
                                type="password"
                                className={styles.input}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ color: '#ffffff' }}
                                required
                            />
                        </div>
                        <button type="submit" className={styles.loginBtn}>Entrar al Panel →</button>
                    </form>
                    <div className={styles.loginFooter}>
                        <Link href="/" style={{ color: '#94a3b8' }}>← Volver a la Web Principal</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.dashboard} ${styles[theme]}`} id="admin-panel">
            <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
            
            <div className={styles.bokehBackground}>
                <div className={styles.bokehCircle}></div>
                <div className={styles.bokehCircle}></div>
                <div className={styles.bokehCircle}></div>
            </div>
            
            <aside className={styles.sidebar}>
                <div className={styles.sidebarBrand}>
                    <div className={styles.logoMini}>GC</div>
                    <div className={styles.brandText}>
                        <span>Admin Pro</span>
                        <small>{theme.toUpperCase()} MODE</small>
                    </div>
                </div>
                
                <nav className={styles.sidebarNav}>
                    <div className={styles.navGroup}>Gestión</div>
                    <button className={`${styles.navItem} ${activeTab === 'patients' ? styles.navActive : ''}`} onClick={() => setActiveTab('patients')}>
                        <span className={styles.navIcon}>🧠</span> Pacientes
                    </button>
                    <button className={`${styles.navItem} ${activeTab === 'bookings' ? styles.navActive : ''}`} onClick={() => setActiveTab('bookings')}>
                        <span className={styles.navIcon}>📅</span> Agenda
                    </button>
                    
                    <div className={styles.navGroup}>Marketing</div>
                    <button className={`${styles.navItem} ${activeTab === 'marketing' ? styles.navActive : ''}`} onClick={() => setActiveTab('marketing')}>
                        <span className={styles.navIcon}>✍️</span> Blog & Mail
                    </button>
                    <button className={`${styles.navItem} ${activeTab === 'newsletter' ? styles.navActive : ''}`} onClick={() => setActiveTab('newsletter')}>
                        <span className={styles.navIcon}>📣</span> Newsletter
                    </button>

                    <div className={styles.navGroup}>Personalización</div>
                    <div className={styles.themeSwitcher}>
                        <button onClick={() => setTheme('obsidian')} className={theme === 'obsidian' ? styles.themeActive : ''} title="Obsidian">🌙</button>
                        <button onClick={() => setTheme('light')} className={theme === 'light' ? styles.themeActive : ''} title="Light">☀️</button>
                        <button onClick={() => setTheme('emerald')} className={theme === 'emerald' ? styles.themeActive : ''} title="Emerald">🌲</button>
                    </div>
                </nav>

                <div className={styles.sidebarFooter}>
                    <button onClick={() => setIsAuthenticated(false)} className={styles.logoutBtn}>Cerrar Sesión 🔒</button>
                </div>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.mainHeader}>
                    <div className={styles.welcomeInfo}>
                        <div className={styles.breadcrumb}>Dashboard / {activeTab}</div>
                        <h1 className={styles.mainTitle}>Hola, Gustavo Caro</h1>
                        <p className={styles.mainSubtitle}>Bienvenido a tu centro de mando clínico personalizado.</p>
                    </div>
                    <div className={styles.headerActions}>
                        <button onClick={fetchData} className={styles.refreshBtn}>
                            <span className={isLoading ? styles.spinning : ''}>🔄</span> Sincronizar
                        </button>
                    </div>
                </header>

                <section className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{background: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4'}}>📅</div>
                        <div className={styles.statInfo}>
                            <span className={styles.statLabel}>Total Reservas</span>
                            <div className={styles.statValue}>{stats.totalBookings}</div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80'}}>💰</div>
                        <div className={styles.statInfo}>
                            <span className={styles.statLabel}>Ingresos</span>
                            <div className={styles.statValue}>${stats.totalRevenue.toLocaleString('es-CL')}</div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{background: 'rgba(234, 179, 8, 0.2)', color: '#facc15'}}>👥</div>
                        <div className={styles.statInfo}>
                            <span className={styles.statLabel}>Pacientes Mes</span>
                            <div className={styles.statValue}>{stats.newPatients}</div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7'}}>📧</div>
                        <div className={styles.statInfo}>
                            <span className={styles.statLabel}>Suscriptores</span>
                            <div className={styles.statValue}>{stats.totalSubs}</div>
                        </div>
                    </div>
                </section>

                <div className={styles.contentWrapper}>
                    {isLoading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner}></div>
                            <p>Accediendo a la red segura...</p>
                        </div>
                    ) : activeTab === 'patients' ? (
                        <div className={styles.dataList}>
                            <div className={styles.listHeader}>
                                <h2>Base de Datos de Pacientes</h2>
                                <p>Gestión avanzada de fichas y permanencia.</p>
                            </div>
                            <div className={styles.tableResponsive}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Identidad</th>
                                            <th>Atenciones</th>
                                            <th>Estado</th>
                                            <th>Inversión</th>
                                            <th>Ficha</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {patients.map((p) => (
                                            <tr key={p.email}>
                                                <td>
                                                    <div className={styles.patientMain}>
                                                        <strong>{p.name}</strong>
                                                        <span>{p.email}</span>
                                                    </div>
                                                </td>
                                                <td><span className={styles.badge}>{p.bookings.length} sesiones</span></td>
                                                <td>
                                                    <span className={`${styles.statusBadge} ${p.newsletter ? styles.paid : styles.pending}`}>
                                                        {p.newsletter ? 'ACTIVO' : 'MANUAL'}
                                                    </span>
                                                </td>
                                                <td><strong>${p.totalSpent.toLocaleString('es-CL')}</strong></td>
                                                <td><button className={styles.actionBtn} onClick={() => setSelectedPatient(p)}>Ficha</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : activeTab === 'marketing' ? (
                        <div className={styles.dataList}>
                            <div className={styles.listHeader}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h2>Editor de Blog & Newsletter</h2>
                                        <p>Crea contenido de alto impacto para tu comunidad.</p>
                                    </div>
                                    <button className={styles.loginBtn} style={{ width: 'auto', padding: '12px 24px' }} onClick={() => { setEditingTemplate({}); setTempTitle(''); setTempContent(''); }}>+ Nuevo Post</button>
                                </div>
                            </div>
                            {editingTemplate ? (
                                <div className={styles.editorBox}>
                                    <input className={styles.input} value={tempTitle} onChange={(e) => setTempTitle(e.target.value)} placeholder="Título del Artículo..." />
                                    <textarea className={styles.textarea} value={tempContent} onChange={(e) => setTempContent(e.target.value)} placeholder="Escribe aquí tu contenido profesional..." />
                                    <div className={styles.editorActions}>
                                        <button onClick={() => setEditingTemplate(null)} className={styles.logoutBtn}>Cancelar</button>
                                        <button onClick={handleSaveTemplate} className={styles.loginBtn} style={{ width: 'auto' }}>Publicar & Guardar</button>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.templateGrid}>
                                    {templates.map(t => (
                                        <div key={t.id} className={styles.templateCard}>
                                            <div className={styles.cardHeader}>ARTICLE / NEWS</div>
                                            <h3>{t.title}</h3>
                                            <p>{t.content.substring(0, 120)}...</p>
                                            <div className={styles.templateFooter}>
                                                <button onClick={() => { setEditingTemplate(t); setTempTitle(t.title); setTempContent(t.content); }}>Editar</button>
                                                <button className={styles.sendBtn} onClick={() => handleSendNewsletter(t.id)}>🚀 Enviar x Mail</button>
                                            </div>
                                        </div>
                                    ))}
                                    {templates.length === 0 && <p>Únete a la conversación creando tu primer contenido.</p>}
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'bookings' ? (
                        <div className={styles.dataList}>
                            <div className={styles.listHeader}>
                                <h2>Agenda Cronológica</h2>
                                <p>Control total sobre las citas individuales.</p>
                            </div>
                            <div className={styles.tableResponsive}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Paciente</th>
                                            <th>Cita</th>
                                            <th>Estado</th>
                                            <th>Servicio</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map((b) => (
                                            <tr key={b.id}>
                                                <td><div className={styles.patientMain}><strong>{b.name}</strong><span>{b.email}</span></div></td>
                                                <td><div className={styles.dateInfo}><strong>{new Date((b.appointmentDate || b.createdAt) as string).toLocaleDateString('es-CL')}</strong></div></td>
                                                <td><span className={`${styles.statusBadge} ${styles[b.status.toLowerCase()]}`}>{b.status}</span></td>
                                                <td><span className={styles.badge}>{b.serviceType}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.dataList}>
                            <div className={styles.listHeader}>
                                <h2>Comunidad Newsletter</h2>
                                <p>Seguimiento de suscriptores y envío de secuencias.</p>
                            </div>
                            <div className={styles.tableResponsive}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Suscriptor</th>
                                            <th>Progreso Secuencia (1-24)</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {newsletter.map((n) => (
                                            <tr key={n.id}>
                                                <td><div className={styles.patientMain}><strong>{n.name || 'Invitado'}</strong><span>{n.email}</span></div></td>
                                                <td>
                                                    <div className={styles.progressInfo}>
                                                        <span>Email {n.currentStep} de 24</span>
                                                        <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${(n.currentStep / 24) * 100}%` }}></div></div>
                                                    </div>
                                                </td>
                                                <td><span className={`${styles.statusBadge} ${n.active ? styles.paid : styles.failed}`}>{n.active ? 'ACTIVO' : 'UNSUBSCRIBE'}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {selectedPatient && (
                <div className={styles.modalOverlay} onClick={() => setSelectedPatient(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <header className={styles.modalHeader}>
                            <h2>Ficha Paciente: {selectedPatient.name}</h2>
                            <button onClick={() => setSelectedPatient(null)}>✕</button>
                        </header>
                        <div className={styles.modalBody}>
                            <div className={styles.infoGrid}>
                                <div><strong>Email:</strong> {selectedPatient.email}</div>
                                <div><strong>Teléfono:</strong> {selectedPatient.phone || '-'}</div>
                                <div><strong>Sesiones:</strong> {selectedPatient.bookings.length}</div>
                                <div><strong>Total:</strong> ${selectedPatient.totalSpent.toLocaleString('es-CL')}</div>
                            </div>
                            <div className={styles.modalSection}>
                                <h3>🧬 Historial de Agenda</h3>
                                <div className={styles.miniTable}>
                                    {selectedPatient.bookings.map((b: any) => (
                                        <div key={b.id} className={styles.miniTableRow}>
                                            <span>{new Date((b.appointmentDate || b.createdAt) as string).toLocaleDateString()}</span>
                                            <span>{b.serviceType}</span>
                                            <span className={styles.badge}>{b.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

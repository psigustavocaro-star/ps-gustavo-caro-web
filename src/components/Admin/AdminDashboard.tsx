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
            if (data.success) {
                setBookings(data.bookings || []);
                setPatients(data.patients || []);
                setNewsletter(data.newsletter || []);
                setTemplates(data.templates || []);
            }
        } catch (err) {
            console.error('Error fetching admin data:', err);
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
                        className={`${styles.navItem} ${activeTab === 'patients' ? styles.navActive : ''}`}
                        onClick={() => setActiveTab('patients')}
                    >
                        👥 Fichas Pacientes
                    </button>
                    <button 
                        className={`${styles.navItem} ${activeTab === 'bookings' ? styles.navActive : ''}`}
                        onClick={() => setActiveTab('bookings')}
                    >
                        📅 Citas Individuales
                    </button>
                    <button 
                        className={`${styles.navItem} ${activeTab === 'marketing' ? styles.navActive : ''}`}
                        onClick={() => setActiveTab('marketing')}
                    >
                        📝 Blog & Educativo
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
                        <h1 className={styles.mainTitle}>Gestión Clínica 👋</h1>
                        <p className={styles.mainSubtitle}>Resumen y herramientas profesionales para Gustavo.</p>
                    </div>
                    <div className={styles.headerActions}>
                        <button onClick={fetchData} className={styles.refreshBtn} title="Sincronizar">
                            🔄
                        </button>
                    </div>
                </header>

                <section className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Total Historico</span>
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
                    ) : activeTab === 'patients' ? (
                        <div className={styles.dataList}>
                            <div className={styles.listHeader}>
                                <h2>Base de Datos de Pacientes</h2>
                                <p>Historial clínico y frecuencia de atención agrupada por persona.</p>
                            </div>
                            <div className={styles.tableResponsive}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Paciente</th>
                                            <th>Atenciones</th>
                                            <th>Estado</th>
                                            <th>Total Invertido</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {patients.map((p) => (
                                            <tr key={p.email}>
                                                <td className={styles.patientCell}>
                                                    <div className={styles.patientMain}>
                                                        <strong>{p.name}</strong>
                                                        <span>{p.email}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={styles.badge}>{p.bookings.length} sesiones</span>
                                                </td>
                                                <td>
                                                    {p.newsletter ? (
                                                        <span className={`${styles.statusBadge} ${styles.paid}`}>NEWSLETTER OK</span>
                                                    ) : (
                                                        <span className={`${styles.statusBadge} ${styles.pending}`}>NO NEWSLETTER</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <strong>${p.totalSpent.toLocaleString('es-CL')}</strong>
                                                </td>
                                                <td>
                                                    <button 
                                                        className={styles.actionBtn}
                                                        onClick={() => setSelectedPatient(p)}
                                                    >
                                                        Ver Historial
                                                    </button>
                                                </td>
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
                                        <h2>Blog & Contenido Educativo</h2>
                                        <p>Crea contenido de valor para tus pacientes y envíalo manualmente.</p>
                                    </div>
                                    <button 
                                        className={styles.loginBtn} 
                                        style={{ width: 'auto', padding: '10px 20px' }}
                                        onClick={() => {
                                            setEditingTemplate({});
                                            setTempTitle('');
                                            setTempContent('');
                                        }}
                                    >
                                        + Nuevo Contenido
                                    </button>
                                </div>
                            </div>

                            {editingTemplate ? (
                                <div className={styles.editorBox}>
                                    <div className={styles.inputGroup}>
                                        <label>Título del Email / Nota</label>
                                        <input 
                                            className={styles.input} 
                                            value={tempTitle}
                                            onChange={(e) => setTempTitle(e.target.value)}
                                            placeholder="Ej: 5 Consejos para manejar la ansiedad"
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Cuerpo del Contenido (Texto Largo)</label>
                                        <textarea 
                                            className={styles.textarea} 
                                            style={{ minHeight: '300px' }}
                                            value={tempContent}
                                            onChange={(e) => setTempContent(e.target.value)}
                                            placeholder="Escribe aquí tu contenido educativo..."
                                        />
                                    </div>
                                    <div className={styles.editorActions}>
                                        <button onClick={() => setEditingTemplate(null)} className={styles.logoutBtn} style={{ background: '#f1f5f9', color: '#64748b', border: 'none' }}>Cancelar</button>
                                        <button onClick={handleSaveTemplate} className={styles.loginBtn} style={{ width: 'auto' }}>Guardar Contenido</button>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.templateGrid}>
                                    {templates.map(t => (
                                        <div key={t.id} className={styles.templateCard}>
                                            <h3>{t.title}</h3>
                                            <p>{t.content.substring(0, 150)}...</p>
                                            <div className={styles.templateFooter}>
                                                <button onClick={() => {
                                                    setEditingTemplate(t);
                                                    setTempTitle(t.title);
                                                    setTempContent(t.content);
                                                }}>Editar</button>
                                                <button 
                                                    className={styles.sendBtn}
                                                    onClick={() => handleSendNewsletter(t.id)}
                                                >
                                                    🚀 Enviar Newsletter
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {templates.length === 0 && <p className={styles.emptyLabel}>No has creado contenido educativo aún.</p>}
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'bookings' ? (
                        <div className={styles.dataList}>
                            <div className={styles.listHeader}>
                                <h2>Registros Cronológicos</h2>
                                <p>Citas ordenadas por fecha de creación.</p>
                            </div>
                            <div className={styles.tableResponsive}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Paciente</th>
                                            <th>Cita y Pago</th>
                                            <th>Servicio</th>
                                            <th>Detalles</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map((b) => (
                                            <tr key={b.id}>
                                                <td className={styles.patientCell}>
                                                    <div className={styles.patientMain}>
                                                        <strong>{b.name}</strong>
                                                        <span>{b.email}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.dateInfo}>
                                                        <strong>{new Date((b.appointmentDate || b.createdAt) as string).toLocaleDateString('es-CL')}</strong>
                                                        <span className={`${styles.statusBadge} ${styles[b.status.toLowerCase()]}`}>
                                                            {b.status === 'PAID' ? 'PAGADO ✓' : 'PENDIENTE'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>{b.serviceType}</td>
                                                <td>{b.reason || '-'}</td>
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

            {/* Modal de Historial de Paciente */}
            {selectedPatient && (
                <div className={styles.modalOverlay} onClick={() => setSelectedPatient(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <header className={styles.modalHeader}>
                            <h2>Ficha Clínica: {selectedPatient.name}</h2>
                            <button onClick={() => setSelectedPatient(null)}>✕</button>
                        </header>
                        
                        <div className={styles.modalBody}>
                            <section className={styles.modalSection}>
                                <h3>👤 Información General</h3>
                                <div className={styles.infoGrid}>
                                    <div><strong>Email:</strong> {selectedPatient.email}</div>
                                    <div><strong>Teléfono:</strong> {selectedPatient.phone || '-'}</div>
                                    <div><strong>Total sesiones:</strong> {selectedPatient.bookings.length}</div>
                                    <div><strong>Total invertido:</strong> ${selectedPatient.totalSpent.toLocaleString('es-CL')}</div>
                                </div>
                            </section>

                            {selectedPatient.anamnesis && (
                                <section className={styles.modalSection}>
                                    <h3>🧬 Anamnesis / Ficha</h3>
                                    <div className={styles.anamnesisCard}>
                                        <p><strong>Edad:</strong> {selectedPatient.anamnesis.age} años</p>
                                        <p><strong>Medicamentos:</strong> {selectedPatient.anamnesis.medications}</p>
                                        <p><strong>Historial:</strong> {selectedPatient.anamnesis.history}</p>
                                    </div>
                                </section>
                            )}

                            <section className={styles.modalSection}>
                                <h3>📅 Historial de Citas</h3>
                                <div className={styles.miniTable}>
                                    {selectedPatient.bookings.map((b: any) => (
                                        <div key={b.id} className={styles.miniTableRow}>
                                            <span className={styles.miniDate}>{new Date((b.appointmentDate || b.createdAt) as string).toLocaleDateString()}</span>
                                            <span className={styles.miniLabel}>{b.serviceType}</span>
                                            <span className={`${styles.statusBadge} ${styles[b.status.toLowerCase()]}`}>{b.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

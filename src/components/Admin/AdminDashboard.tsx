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
    const [newsletterSubs, setNewsletterSubs] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'patients' | 'bookings' | 'newsletter' | 'marketing'>('patients');
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    const handleUpdatePatient = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/patients', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData),
            });
            const data = await res.json();
            if (data.success) {
                alert('Paciente actualizado');
                setIsEditing(false);
                fetchData();
            }
        } catch (err) { alert('Error al actualizar'); }
        finally { setIsLoading(false); }
    };

    const handleDeletePatient = async (email: string) => {
        if (!confirm('¿Estás seguro de eliminar TODO el historial de este paciente? Esta acción no se puede deshacer.')) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/patients?email=${email}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                alert('Paciente eliminado');
                setSelectedPatient(null);
                fetchData();
            }
        } catch (err) { alert('Error al eliminar'); }
        finally { setIsLoading(false); }
    };

    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

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
                setNewsletterSubs(data.newsletter || []);
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
        const activeSubscribers = newsletterSubs.length;
        const recurringRate = patients.length > 0 ? (patients.filter(p => p.bookings.length > 1).length / patients.length) * 100 : 0;
        return { totalBookings, totalRevenue, activeSubscribers, recurringRate: Math.round(recurringRate) };
    }, [bookings, patients, newsletterSubs]);

    if (!isAuthenticated) {
        return (
            <div className={styles.loginWrapper}>
                <div className={styles.loginCard}>
                    <div className={styles.loginLogo}>GC</div>
                    <h1>Acceso Profesional</h1>
                    <p>Gestiona tu clínica con orden y elegancia.</p>
                    <form onSubmit={handleLogin} className={styles.loginForm}>
                        <input className={styles.inputMain} style={{marginBottom: '15px'}} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Maestro" required />
                        <input className={styles.inputMain} style={{marginBottom: '25px'}} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" required />
                        <button type="submit" className={styles.primaryButton}>Entrar al Panel</button>
                    </form>
                    <div style={{marginTop: '30px'}}>
                        <Link href="/" style={{color: '#64748b', fontSize: '0.9rem'}}>← Salir de administración</Link>
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
                        <span>Admin Gustavo</span>
                        <small>Gestión Clínica</small>
                    </div>
                </div>
                <nav className={styles.navList}>
                    <button className={activeTab === 'patients' ? styles.active : ''} onClick={() => setActiveTab('patients')}>
                        <span>👥</span> Pacientes
                    </button>
                    <button className={activeTab === 'bookings' ? styles.active : ''} onClick={() => setActiveTab('bookings')}>
                        <span>📅</span> Calendario
                    </button>
                    <button className={activeTab === 'newsletter' ? styles.active : ''} onClick={() => setActiveTab('newsletter')}>
                        <span>📧</span> Newsletter
                    </button>
                    <button className={activeTab === 'marketing' ? styles.active : ''} onClick={() => setActiveTab('marketing')}>
                        <span>✍️</span> Blog Editorial
                    </button>
                </nav>
                <button onClick={() => setIsAuthenticated(false)} className={styles.logoutAction}>Cerrar Sesión</button>
            </aside>

            <main className={styles.contentArea}>
                <header className={styles.contentHeader}>
                    <div>
                        <h1>{activeTab === 'patients' ? 'Historial Clínico' : activeTab === 'bookings' ? 'Agenda Próxima' : activeTab === 'newsletter' ? 'Campaña Newsletter' : 'Editor de Blog'}</h1>
                        <p>{isLoading ? 'Sincronizando registros...' : 'Última actualización: hoy'}</p>
                    </div>
                    <button onClick={fetchData} className={styles.syncBtn}>Actualizar</button>
                </header>

                <div className={styles.dashboardStats}>
                    <div className={styles.statBox}>
                        <span className={styles.label}>Reservas</span>
                        <span className={styles.value}>{stats.totalBookings}</span>
                    </div>
                    <div className={styles.statBox}>
                        <span className={styles.label}>Suscripciones</span>
                        <span className={styles.value}>{stats.activeSubscribers}</span>
                    </div>
                    <div className={styles.statBox}>
                        <span className={styles.label}>Retención</span>
                        <span className={styles.value}>{stats.recurringRate}%</span>
                    </div>
                    <div className={styles.statBox}>
                        <span className={styles.label}>Ingresos</span>
                        <span className={styles.value}>${stats.totalRevenue.toLocaleString('es-CL')}</span>
                    </div>
                </div>

                <div className={styles.mainGrid}>
                    {activeTab === 'patients' ? (
                        <div className={styles.tableWrapper}>
                            <table className={styles.proTable}>
                                <thead>
                                    <tr>
                                        <th>Paciente</th>
                                        <th>Correo</th>
                                        <th>Sesiones</th>
                                        <th>Estado</th>
                                        <th>Gestión</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patients.map((p) => (
                                        <tr key={p.email}>
                                            <td><strong>{p.name}</strong></td>
                                            <td>{p.email}</td>
                                            <td>{p.bookings.length} sesiones</td>
                                            <td><span className={styles.statusOk}>{p.newsletter ? 'Suscrito' : 'Paciente'}</span></td>
                                            <td><button className={styles.viewBtn} onClick={() => setSelectedPatient(p)}>Ver datos</button></td>
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
                                        <th>Servicio</th>
                                        <th>Fecha</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((b) => (
                                        <tr key={b.id}>
                                            <td><strong>{b.name}</strong></td>
                                            <td>{b.serviceType}</td>
                                            <td>{new Date(b.appointmentDate || b.createdAt).toLocaleDateString('es-CL')}</td>
                                            <td><span className={b.status === 'PAID' ? styles.statusOk : styles.statusPending}>{b.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : activeTab === 'newsletter' || activeTab === 'marketing' ? (
                        <div className={styles.editorWrapper}>
                            <h3 style={{marginBottom: '20px', color: '#f1f5f9'}}>
                                {activeTab === 'newsletter' ? 'Gestión de Newsletter' : 'Gestión de Blog'}
                            </h3>
                            
                            {/* List of existing items */}
                            <div style={{marginBottom: '40px', display: 'grid', gap: '10px'}}>
                                <div className={styles.dataItem} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <span>Ejemplo de {activeTab === 'newsletter' ? 'Boletín' : 'Post'}: Salud Mental 2024</span>
                                    <div style={{display: 'flex', gap: '8px'}}>
                                        {activeTab === 'newsletter' && <button className={styles.viewBtn}>Enviar Ahora</button>}
                                        <button className={styles.syncBtn} style={{padding: '5px 12px'}}>Editar</button>
                                        <button className={styles.syncBtn} style={{padding: '5px 12px', color: '#ef4444'}}>Eliminar</button>
                                    </div>
                                </div>
                            </div>

                            <hr style={{opacity: 0.05, marginBottom: '40px'}} />

                            <div className={styles.inputGroup}>
                                <label>Crear Nuevo {activeTab === 'newsletter' ? 'Correo' : 'Post'}</label>
                                <input className={styles.inputMain} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Escribe el título aquí..." />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Cuerpo del Contenido</label>
                                <textarea className={styles.textAreaMain} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Redacta con estilo profesional..." />
                            </div>
                            <div style={{display: 'flex', gap: '15px'}}>
                                <button className={styles.primaryButton} style={{width: 'auto', padding: '12px 30px'}}>
                                    {activeTab === 'newsletter' ? 'Programar Envío' : 'Publicar en Blog'}
                                </button>
                                <button className={styles.syncBtn}>Guardar como Borrador</button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </main>

            {selectedPatient && (
                <div className={styles.overlay} onClick={() => { setSelectedPatient(null); setIsEditing(false); }}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>{isEditing ? 'Editar Paciente' : 'Información del Paciente'}</h2>
                        
                        {isEditing ? (
                            <>
                                <div className={styles.formGrid}>
                                    <div className={styles.inputGroup}>
                                        <label>Primer Nombre</label>
                                        <input className={styles.inputMain} value={editData.firstName} onChange={e => setEditData({...editData, firstName: e.target.value})} />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Segundo Nombre</label>
                                        <input className={styles.inputMain} value={editData.secondName} onChange={e => setEditData({...editData, secondName: e.target.value})} />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Apellido Paterno</label>
                                        <input className={styles.inputMain} value={editData.firstSurname} onChange={e => setEditData({...editData, firstSurname: e.target.value})} />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Apellido Materno</label>
                                        <input className={styles.inputMain} value={editData.secondSurname} onChange={e => setEditData({...editData, secondSurname: e.target.value})} />
                                    </div>
                                </div>
                                <div className={styles.formGrid}>
                                    <div className={styles.inputGroup}>
                                        <label>País</label>
                                        <select className={styles.inputMain} value={editData.country || 'Chile'} onChange={e => setEditData({...editData, country: e.target.value})}>
                                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>RUT / ID</label>
                                        <input className={styles.inputMain} value={editData.rut} onChange={e => setEditData({...editData, rut: e.target.value})} />
                                    </div>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Dirección</label>
                                    <input className={styles.inputMain} value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} />
                                </div>
                                <div className={styles.formGrid}>
                                    <div className={styles.inputGroup}>
                                        <label>Región</label>
                                        {editData.country === 'Chile' ? (
                                            <select className={styles.inputMain} value={editData.region} onChange={e => setEditData({...editData, region: e.target.value})}>
                                                <option value="">Selecciona Región...</option>
                                                {CHILE_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        ) : (
                                            <input className={styles.inputMain} value={editData.region} onChange={e => setEditData({...editData, region: e.target.value})} placeholder="Estado/Provincia" />
                                        )}
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Comuna / Ciudad</label>
                                        <input className={styles.inputMain} value={editData.commune} onChange={e => setEditData({...editData, commune: e.target.value})} />
                                    </div>
                                </div>
                                <div style={{display: 'flex', gap: '10px', marginTop: '30px'}}>
                                    <button className={styles.primaryButton} onClick={handleUpdatePatient} disabled={isLoading}>
                                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                    <button className={styles.syncBtn} onClick={() => setIsEditing(false)}>Cancelar</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={styles.dataGroup}>
                                    <h4>Identificación Legal</h4>
                                    <div className={styles.dataItem}>Nombre: <strong>{selectedPatient.firstName} {selectedPatient.secondName}</strong></div>
                                    <div className={styles.dataItem}>Apellidos: <strong>{selectedPatient.firstSurname} {selectedPatient.secondSurname}</strong></div>
                                    <div className={styles.dataItem}>RUT: <strong>{selectedPatient.rut}</strong></div>
                                </div>

                                <div className={styles.dataGroup}>
                                    <h4>Ubicación y Contacto</h4>
                                    <div className={styles.dataItem}>Dirección: <strong>{selectedPatient.address}</strong></div>
                                    <div className={styles.dataItem}>Ubicación: <strong>{selectedPatient.commune}, {selectedPatient.region} ({selectedPatient.country})</strong></div>
                                    <div className={styles.dataItem}>Email: <strong>{selectedPatient.email}</strong></div>
                                </div>

                                <div className={styles.dataGroup}>
                                    <h4>Historial de Citas</h4>
                                    <div style={{maxHeight: '200px', overflowY: 'auto'}}>
                                        {selectedPatient.bookings.map((b: any) => {
                                            const date = new Date(b.appointmentDate || b.createdAt);
                                            const isUpcoming = date > new Date();
                                            const dateStr = date.toLocaleDateString('es-CL');
                                            const timeStr = date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
                                            
                                            return (
                                                <div key={b.id} className={styles.dataItem} style={{borderLeft: `4px solid ${isUpcoming ? '#0ea5e9' : '#10b981'}`}}>
                                                    <strong>{dateStr} a las {timeStr}</strong> — {b.serviceType} 
                                                    <span style={{float: 'right', fontSize: '0.75rem'}}>{isUpcoming ? 'Próxima' : 'Realizada'}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className={styles.dataGroup}>
                                    <h4>Acciones Rápidas</h4>
                                    <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                                        <button className={styles.viewBtn} onClick={() => { setEditData(selectedPatient); setIsEditing(true); }}>Editar Datos</button>
                                        <button className={styles.syncBtn} onClick={() => handleDeletePatient(selectedPatient.email)} style={{color: '#ef4444'}}>Eliminar Paciente</button>
                                        <button className={styles.syncBtn} onClick={() => setSelectedPatient(null)}>Cerrar Ventana</button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

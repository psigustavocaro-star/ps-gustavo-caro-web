'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './AdminDashboard.module.css';
import Link from 'next/link';

const CHILE_REGIONS = [
    'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 
    'Valparaíso', 'Metropolitana de Santiago', 'O\'Higgins', 'Maule', 
    'Ñuble', 'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'
];

const COUNTRIES = ['Chile', 'México', 'Colombia', 'España', 'Perú', 'Argentina', 'Otro'];

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
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [templates, setTemplates] = useState<any[]>([]);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

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
                alert('✓ Paciente actualizado correctamente');
                setIsEditing(false);
                setSelectedPatient(editData);
                fetchData();
            } else {
                alert('Error: ' + data.error);
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

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.toLowerCase() === 'psi.gustavocaro@gmail.com' && password === 'gudaxgudax1.') {
            setIsAuthenticated(true);
            fetchData();
        } else {
            alert('Credenciales incorrectas');
        }
    };

    const handleSaveTemplate = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/newsletter/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    title, 
                    content, 
                    id: editingTemplate?.id 
                }),
            });
            const data = await res.json();
            if (data.success) {
                alert('Newsletter guardado');
                setEditingTemplate(null);
                setTitle('');
                setContent('');
                fetchData();
            }
        } catch (err) { alert('Error al guardar'); }
        finally { setIsLoading(false); }
    };

    const handleSendNewsletter = async (templateId: string, target: 'all' | 'specific', specificEmail?: string) => {
        if (target === 'all' && !confirm('¿Enviar este newsletter a TODOS los suscriptores activos?')) return;
        
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/newsletter/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId, target, specificEmail }),
            });
            const data = await res.json();
            if (data.success) {
                alert(`✓ Newsletter enviado a ${data.count} destinatarios`);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (err) { alert('Error al enviar'); }
        finally { setIsLoading(false); }
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!confirm('¿Eliminar este formato de newsletter?')) return;
        try {
            await fetch(`/api/admin/newsletter/templates?id=${id}`, { method: 'DELETE' });
            fetchData();
        } catch (e) {}
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
                    ) : activeTab === 'newsletter' ? (
                        <div className={styles.newsletterLayout}>
                            <div className={styles.newsletterSidebar}>
                                <div className={styles.subscriberHeader}>
                                    <h3>Suscriptores ({newsletterSubs.length})</h3>
                                    <p>Personas que reciben tus actualizaciones.</p>
                                </div>
                                <div className={styles.subscriberList}>
                                    {newsletterSubs.length === 0 ? (
                                        <p style={{opacity: 0.5, padding: '20px'}}>No hay suscriptores aún.</p>
                                    ) : (
                                        newsletterSubs.map((s: any) => (
                                            <div key={s.id} className={styles.subscriberItem}>
                                                <div className={styles.subInfo}>
                                                    <span className={styles.subEmail}>{s.email}</span>
                                                    <small className={styles.subDate}>Desde: {new Date(s.createdAt).toLocaleDateString()}</small>
                                                </div>
                                                <button className={styles.deleteSub} onClick={() => handleDeletePatient(s.email)}>✕</button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className={styles.newsletterContent}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px'}}>
                                    <h2 style={{color: '#f8fafc', fontSize: '1.5rem'}}>Campaña Editorial</h2>
                                    {editingTemplate && (
                                        <button className={styles.syncBtn} onClick={() => {setEditingTemplate(null); setTitle(''); setContent('');}}>Nueva Plantilla</button>
                                    )}
                                </div>

                                {/* Editor Profesional */}
                                <div className={styles.editorContainer}>
                                    <div className={styles.editorToolbar}>
                                        <button onClick={() => document.execCommand('bold', false)} title="Negrita"><b>B</b></button>
                                        <button onClick={() => document.execCommand('italic', false)} title="Cursiva"><i>I</i></button>
                                        <button onClick={() => {
                                            const url = prompt('URL de la imagen:');
                                            if (url) document.execCommand('insertImage', false, url);
                                        }} title="Insertar Imagen">🖼️</button>
                                        <button onClick={() => {
                                            const url = prompt('Enlace (URL):');
                                            if (url) document.execCommand('createLink', false, url);
                                        }} title="Insertar Enlace">🔗</button>
                                        <div style={{flex: 1}}></div>
                                        <span style={{fontSize: '0.8rem', opacity: 0.5}}>Editor Visual</span>
                                    </div>
                                    
                                    <input 
                                        className={styles.editorTitleInput} 
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)} 
                                        placeholder="Título del boletín o artículo..." 
                                    />

                                    <div 
                                        id="rich-editor"
                                        className={styles.richEditor}
                                        contentEditable
                                        onInput={(e: any) => setContent(e.currentTarget.innerHTML)}
                                        dangerouslySetInnerHTML={{ __html: content }}
                                    />
                                </div>

                                <div className={styles.editorActions}>
                                    <button className={styles.primaryButton} style={{width: 'auto', padding: '12px 40px'}} onClick={handleSaveTemplate} disabled={isLoading}>
                                        {isLoading ? 'Guardando...' : editingTemplate ? 'Actualizar Plantilla' : 'Guardar y Publicar'}
                                    </button>
                                </div>

                                <h3 style={{marginTop: '40px', marginBottom: '20px', fontSize: '1.1rem', opacity: 0.8}}>Plantillas Guardadas</h3>
                                <div className={styles.templatesGrid}>
                                    {templates.map((t: any) => (
                                        <div key={t.id} className={styles.templateCard}>
                                            <div className={styles.templateInfo}>
                                                <strong>{t.title}</strong>
                                                <small>{new Date(t.createdAt).toLocaleDateString()}</small>
                                            </div>
                                            <div className={styles.templateActions}>
                                                <button className={styles.actionBtn} onClick={() => handleSendNewsletter(t.id, 'all')}>Difundir a Todos</button>
                                                <button className={styles.actionBtn} style={{background: 'rgba(255,255,255,0.05)'}} onClick={() => {
                                                    setEditingTemplate(t);
                                                    setTitle(t.title);
                                                    setContent(t.content);
                                                    // Necesitamos forzar la actualización del div contentEditable si es necesario
                                                    const ed = document.getElementById('rich-editor');
                                                    if(ed) ed.innerHTML = t.content;
                                                }}>Editar</button>
                                                <button className={styles.deleteBtn} onClick={() => handleDeleteTemplate(t.id)}>✕</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'marketing' ? (
                        <div className={styles.editorWrapper}>
                            {/* Reusaremos el mismo estilo del editor pero enfocado a Blog */}
                            <h2 style={{color: '#f8fafc', marginBottom: '20px'}}>Editor de Contenido (Blog)</h2>
                            <p style={{opacity: 0.6, marginBottom: '30px'}}>Escribe artículos de largo alcance para mejorar tu posicionamiento y ayudar a tus pacientes.</p>
                            
                            <div className={styles.editorContainer}>
                                <input 
                                    className={styles.editorTitleInput} 
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)} 
                                    placeholder="Título del Artículo..." 
                                />
                                <div 
                                    className={styles.richEditor}
                                    contentEditable
                                    onInput={(e: any) => setContent(e.currentTarget.innerHTML)}
                                    dangerouslySetInnerHTML={{ __html: content }}
                                />
                            </div>
                            <button className={styles.primaryButton} style={{marginTop: '20px', width: 'auto'}} onClick={handleSaveTemplate}>
                                Publicar en Blog
                            </button>
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
                                    <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center'}}>
                                        <button className={styles.primaryButton} style={{width: 'auto', padding: '10px 20px'}} onClick={() => { setEditData(selectedPatient); setIsEditing(true); }}>Editar Datos</button>
                                        
                                        <select 
                                            className={styles.inputMain} 
                                            style={{width: '180px', height: '42px', padding: '0 10px', fontSize: '0.85rem'}}
                                            onChange={(e) => {
                                                if(e.target.value) handleSendNewsletter(e.target.value, 'specific', selectedPatient.email);
                                            }}
                                        >
                                            <option value="">Enviar Newsletter...</option>
                                            {templates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                                        </select>

                                        <button className={styles.syncBtn} onClick={() => handleDeletePatient(selectedPatient.email)} style={{color: '#ef4444'}}>Eliminar de Raíz</button>
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

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
                <div className={styles.movingBackground}></div>
                <div className={styles.loginCard}>
                    <div className={styles.pulseLogo}>
                        <div className={styles.logoCore}>GC</div>
                        <div className={styles.pulseRing}></div>
                    </div>
                    <h1>Elite Clinical Access</h1>
                    <p>Gestiona tu clínica con tecnología de vanguardia y elegancia absoluta.</p>
                    <form onSubmit={handleLogin} className={styles.loginForm}>
                        <div className={styles.inputGroup}>
                           <input className={styles.inputMain} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Identificador Maestro" required />
                        </div>
                        <div className={styles.inputGroup}>
                           <input className={styles.inputMain} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Clave de Seguridad" required />
                        </div>
                        <button type="submit" className={styles.primaryButton}>Desbloquear Panel</button>
                    </form>
                    <div style={{marginTop: '40px'}}>
                        <Link href="/" className={styles.exitLink}>← Volver al Sitio Público</Link>
                    </div>
                </div>
            </div>
        );
    }

    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [aiPrompt, setAiPrompt] = useState('');

    const generateAIContent = async () => {
        if (!aiPrompt) return alert('Escribe un tema para la IA');
        setIsLoading(true);
        // Simulación de IA de alto nivel para el MVP
        setTimeout(() => {
            const aiSuggestions: any = {
                'ansiedad': { title: 'Manejando la Ansiedad en el Trabajo', content: '<h2>Estrategias Prácticas</h2><p>La ansiedad laboral es un desafío común...</p><ul><li>Respira...</li><li>Prioriza...</li></ul><img src="https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0" />' },
                'depresion': { title: 'Luz en la Oscuridad: Comprendiendo la Depresión', content: '<h2>Un camino de sanación</h2><p>La depresión no es solo tristeza...</p>' }
            };
            const result = aiSuggestions[aiPrompt.toLowerCase()] || { 
                title: `Reflexiones sobre ${aiPrompt}`, 
                content: `<p>Generando contenido profesional sobre ${aiPrompt}...</p><p>Este es un borrador inteligente para ayudarte a empezar.</p>` 
            };
            setTitle(result.title);
            setContent(result.content);
            const ed = document.getElementById('rich-editor');
            if(ed) ed.innerHTML = result.content;
            setIsLoading(false);
        }, 1500);
    };

    const handleSendToSelected = async () => {
        if (selectedRecipients.length === 0) return alert('Selecciona al menos un destinatario');
        setIsLoading(true);
        try {
            for (const email of selectedRecipients) {
                await fetch('/api/admin/newsletter/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ templateId: editingTemplate?.id || 'new', target: 'specific', specificEmail: email }),
                });
            }
            alert(`✓ Enviado con éxito a ${selectedRecipients.length} personas`);
            setSelectedRecipients([]);
        } catch (e) { alert('Error al enviar'); }
        finally { setIsLoading(false); }
    };

    return (
        <div className={styles.adminMain}>
            <aside className={styles.sideNav}>
                <div className={styles.navHeader}>
                    <div className={styles.logoSmall}>GC</div>
                    <div className={styles.navTitle}>
                        <span>Admin Gustavo</span>
                        <small>Elite Clinical CRM</small>
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
                        <span>📧</span> Comunicación & Blog
                    </button>
                </nav>
                <button onClick={() => setIsAuthenticated(false)} className={styles.logoutAction}>Cerrar Sesión</button>
            </aside>

            <main className={styles.contentArea}>
                <header className={styles.contentHeader}>
                    <div>
                        <h1>{activeTab === 'patients' ? 'Historial Clínico' : activeTab === 'bookings' ? 'Agenda Próxima' : 'Campaña & Editorial'}</h1>
                        <p>{isLoading ? 'Analizando datos...' : 'Panel de alto rendimiento activo'}</p>
                    </div>
                    <button onClick={fetchData} className={styles.syncBtn}>Sincronizar Panel</button>
                </header>

                <div className={styles.dashboardStats}>
                    <div className={styles.statBox}>
                        <span className={styles.label}>Reservas</span>
                        <span className={styles.value}>{stats.totalBookings}</span>
                    </div>
                    <div className={styles.statBox}>
                        <span className={styles.label}>Suscriptores</span>
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
                                        <th>Origen</th>
                                        <th>Gestión</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patients.map((p) => (
                                        <tr key={p.email}>
                                            <td><strong>{p.name}</strong></td>
                                            <td>{p.email}</td>
                                            <td>{p.bookings.length} sesiones</td>
                                            <td><span className={styles.statusOk}>{p.newsletter ? 'Newsletter' : 'Clínico'}</span></td>
                                            <td><button className={styles.viewBtn} onClick={() => setSelectedPatient(p)}>Ver ficha</button></td>
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
                        <div className={styles.editorialLayout}>
                            <div className={styles.editorialMain}>
                                <div className={styles.editorToolbar}>
                                    <button onClick={() => document.execCommand('bold')}><b>B</b></button>
                                    <button onClick={() => document.execCommand('italic')}><i>I</i></button>
                                    <button onClick={() => {
                                        const url = prompt('URL Imagen:');
                                        if(url) document.execCommand('insertImage', false, url);
                                    }}>🖼️</button>
                                    <div className={styles.aiHelper}>
                                        <input placeholder="Tema para IA..." value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
                                        <button onClick={generateAIContent}>Generar con IA</button>
                                    </div>
                                </div>
                                <input 
                                    className={styles.editorTitleInput} 
                                    placeholder="Título Impactante..." 
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                                <div 
                                    id="rich-editor"
                                    className={styles.richEditor}
                                    contentEditable
                                    onInput={(e: any) => setContent(e.currentTarget.innerHTML)}
                                    dangerouslySetInnerHTML={{ __html: content }}
                                />
                                <div className={styles.editorFooter}>
                                    <button className={styles.primaryButton} onClick={handleSaveTemplate}>
                                        {editingTemplate ? 'Actualizar Plantilla' : 'Guardar y Publicar'}
                                    </button>
                                    {selectedRecipients.length > 0 && (
                                        <button className={styles.syncBtn} onClick={handleSendToSelected}>
                                            Enviar a {selectedRecipients.length} seleccionados
                                        </button>
                                    )}
                                </div>
                            </div>
                            <aside className={styles.editorialSidebar}>
                                <div className={styles.sidebarSection}>
                                    <h4>Destinatarios ({newsletterSubs.length})</h4>
                                    <div className={styles.checkList}>
                                        {newsletterSubs.map((s: any) => (
                                            <label key={s.id} className={styles.checkItem}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedRecipients.includes(s.email)}
                                                    onChange={(e) => {
                                                        if(e.target.checked) setSelectedRecipients([...selectedRecipients, s.email]);
                                                        else setSelectedRecipients(selectedRecipients.filter(r => r !== s.email));
                                                    }}
                                                />
                                                <span>{s.email}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.sidebarSection}>
                                    <h4>Campañas Realizadas</h4>
                                    <div className={styles.templateList}>
                                        {templates.map(t => (
                                            <div key={t.id} className={styles.templateItem}>
                                                <span>{t.title}</span>
                                                <div className={styles.itemActions}>
                                                    <button onClick={() => { setEditingTemplate(t); setTitle(t.title); setContent(t.content); const ed = document.getElementById('rich-editor'); if(ed) ed.innerHTML = t.content; }}>✏️</button>
                                                    <button onClick={() => handleDeleteTemplate(t.id)}>✕</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </aside>
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

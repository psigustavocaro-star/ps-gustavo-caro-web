'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import styles from './AdminDashboard.module.css';
import { blogPosts } from '@/lib/data/blog';
import { newsletterSequence } from '@/lib/config/newsletter-content';

const CHILE_REGIONS = [
    'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 
    'Valparaíso', 'Metropolitana de Santiago', 'O\'Higgins', 'Maule', 
    'Ñuble', 'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'
];

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [bookings, setBookings] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [newsletterSubs, setNewsletterSubs] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'patients' | 'bookings' | 'newsletter' | 'marketing'>('patients');
    const [profilePic, setProfilePic] = useState<string | null>(null);

    useEffect(() => {
        const savedPic = localStorage.getItem('adminProfilePic');
        if (savedPic) setProfilePic(savedPic);
    }, []);

    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [templates, setTemplates] = useState<any[]>([]);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    
    const editorRef = useRef<HTMLDivElement>(null);

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
        } catch (err) { console.error("Sync Error:", err); } 
        finally { setIsLoading(false); }
    };

    const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setProfilePic(base64);
                localStorage.setItem('adminProfilePic', base64);
            };
            reader.readAsDataURL(file);
        }
    };

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
                alert('✨ Ficha del paciente actualizada con éxito');
                setIsEditing(false);
                setSelectedPatient(editData);
                fetchData();
            }
        } catch (err) { alert('Error de conexión'); }
        finally { setIsLoading(false); }
    };

    const handleDeletePatient = async (emailToDel: string) => {
        if (!confirm(`¿Estás ABSOLUTAMENTE SEGURO de querer eliminar todo el historial y cuenta de ${emailToDel}? Esto no se puede deshacer.`)) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/patients?email=${encodeURIComponent(emailToDel)}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                alert('🗑️ Paciente eliminado por completo del sistema');
                setSelectedPatient(null);
                fetchData();
            } else {
                alert('No se pudo eliminar: ' + data.error);
            }
        } catch (err) { alert('Error al procesar eliminación'); }
        finally { setIsLoading(false); }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.toLowerCase() === 'psi.gustavocaro@gmail.com' && password === 'gudaxgudax1.') {
            setIsAuthenticated(true);
            fetchData();
        } else {
            alert('Datos incorrectos. Por favor, intenta de nuevo.');
        }
    };

    const toggleSelectAll = () => {
        if (selectedRecipients.length === newsletterSubs.length && newsletterSubs.length > 0) {
            setSelectedRecipients([]);
        } else {
            setSelectedRecipients(newsletterSubs.map(s => s.email));
        }
    };

    const handleSendToAll = async () => {
        if (!title || !content) return alert('Selecciona o crea un texto primero 💌');
        if (!confirm(`¿Enviar a todos tus ${newsletterSubs.length} pacientes?`)) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/newsletter/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId: editingTemplate?.id || null, target: 'all', customTitle: title, customContent: content }),
            });
            const data = await res.json();
            if (data.success) {
                alert(`🚀 ¡Correo enviado a ${data.count} personas!`);
            } else {
                alert(`❌ Error al enviar el correo: ${data.error}`);
            }
        } catch (err) { alert('Hubo un error de red al intentar enviar'); }
        finally { setIsLoading(false); }
    };

    const handleSendToSelected = async () => {
        if (!title || !content) return alert('Selecciona un correo o post primero 💌');
        if (selectedRecipients.length === 0) return alert('Debes marcar al menos un paciente');
        setIsLoading(true);
        let successCount = 0;
        try {
            for (const email of selectedRecipients) {
                const res = await fetch('/api/admin/newsletter/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ templateId: editingTemplate?.id || null, target: 'specific', specificEmail: email, customTitle: title, customContent: content }),
                });
                const data = await res.json();
                if (data.success) {
                    successCount++;
                } else {
                    console.error("Error sending to", email, data.error);
                }
            }
            if (successCount === selectedRecipients.length) {
                alert(`✅ Enviado con éxito a ${successCount} pacientes.`);
                setSelectedRecipients([]);
            } else if (successCount > 0) {
                alert(`⚠️ Enviado parcialmente. Llegó a ${successCount} de ${selectedRecipients.length} pacientes.`);
            } else {
                alert(`❌ No se pudo enviar ningún correo. Verifica si configuraste las claves de envío.`);
            }
        } catch (err) { alert('Ocurrió un error en el envío de red'); }
        finally { setIsLoading(false); }
    };

    const handleSaveTemplate = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/newsletter/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, id: editingTemplate?.id }),
            });
            const data = await res.json();
            if (data.success) {
                alert('💾 Borrador de correo guardado perfectamente');
                fetchData();
            }
        } catch (err) { alert('No pudimos guardarlo en este momento'); }
        finally { setIsLoading(false); }
    };

    if (!isAuthenticated) {
        return (
            <div className={styles.authContainer}>
                <div className={styles.authBlob}></div>
                <div className={styles.authBox}>
                    <span className={styles.authIcon}>👋</span>
                    <h1>¡Hola Gustavo!</h1>
                    <p>Inicia sesión para entrar a tu clínica digital.</p>
                    <form onSubmit={handleLogin}>
                        <input className={styles.authInput} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Correo electrónico" required />
                        <input className={styles.authInput} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Tu contraseña" required />
                        <button type="submit" className={styles.authSubmit}>Entrar a la Clínica</button>
                    </form>
                    <div style={{ marginTop: '24px' }}>
                        <a href="/" style={{ color: '#06b6d4', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>
                            ← Regresar a la página principal
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.adminMain}>
            <div className={styles.ambientAura}></div>
            
            <aside className={styles.sideNav}>
                <div className={styles.navHeader}>
                    <label className={styles.profileUploadBox} title="Haz clic para subir tu foto">
                        <input type="file" accept="image/*" style={{display: 'none'}} onChange={handleProfilePicChange} />
                        {profilePic ? (
                            <img src={profilePic} alt="Tú" className={styles.profileImg} />
                        ) : (
                            <span className={styles.dogAvatar}>🐕</span>
                        )}
                    </label>
                    <span className={styles.navTitle}>Clínica Gustavo</span>
                    <span className={styles.navSubtitle}>Panel Principal</span>
                </div>
                
                <nav className={styles.navList}>
                    <button className={activeTab === 'patients' ? styles.active : ''} onClick={() => setActiveTab('patients')}>👥 Mis Pacientes</button>
                    <button className={activeTab === 'bookings' ? styles.active : ''} onClick={() => setActiveTab('bookings')}>🗓️ Calendario</button>
                    <button className={activeTab === 'newsletter' ? styles.active : ''} onClick={() => setActiveTab('newsletter')}>💌 Newsletter</button>
                    <button className={activeTab === 'marketing' ? styles.active : ''} onClick={() => setActiveTab('marketing')}>✍️ Mi Blog</button>
                </nav>
                
                <button onClick={() => setIsAuthenticated(false)} className={styles.logoutAction}>Cerrar Sesión</button>
            </aside>

            <main className={styles.contentArea}>
                <header className={styles.contentHeader}>
                    <div>
                        <h1>{activeTab === 'patients' ? 'Mis Pacientes' : activeTab === 'bookings' ? 'Mi Agenda' : activeTab === 'newsletter' ? 'Newsletter' : 'Mi Blog'}</h1>
                        <p>Trabajando para mantener la salud mental al alcance de todos.</p>
                    </div>
                    <button onClick={fetchData} className={styles.syncBtn}>🔄 Actualizar Datos</button>
                </header>

                <div className={styles.dashboardStats}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>🧑‍⚕️</div>
                        <div className={styles.statInfo}>
                            <h3>Pacientes Registrados</h3>
                            <p>{patients.length}</p>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>📅</div>
                        <div className={styles.statInfo}>
                            <h3>Citas Totales</h3>
                            <p>{bookings.length}</p>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>🌟</div>
                        <div className={styles.statInfo}>
                            <h3>Lectores Conectados</h3>
                            <p>{newsletterSubs.length}</p>
                        </div>
                    </div>
                </div>

                <div className={styles.listContainer}>
                    {activeTab === 'patients' && (
                        <table className={styles.friendlyTable}>
                            <thead><tr><th>Nombre</th><th>Correo</th><th>Etiqueta</th><th>Ficha</th></tr></thead>
                            <tbody>{patients.map(p => (
                                <tr key={p.email}>
                                    <td>{[p.firstName, p.secondName, p.firstSurname, p.secondSurname].filter(Boolean).join(' ')}</td>
                                    <td>{p.email}</td>
                                    <td><span className={`${styles.badge} ${p.newsletter ? styles.badgeCalypso : styles.badgeGeneric}`}>{p.newsletter ? 'Lector' : 'Paciente'}</span></td>
                                    <td><button className={styles.actionBtn} onClick={() => { setSelectedPatient(p); setIsEditing(false); }}>Abrir Ficha</button></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    )}

                    {activeTab === 'bookings' && (
                        <table className={styles.friendlyTable}>
                            <thead><tr><th>Paciente</th><th>Fecha de Cita</th><th>Tipo de Servicio</th><th>Situación</th></tr></thead>
                            <tbody>{bookings.map(b => (
                                <tr key={b.id}>
                                    <td>{b.name}</td>
                                    <td>{new Date(b.appointmentDate || b.createdAt).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                                    <td>{b.serviceType}</td>
                                    <td><span className={`${styles.badge} ${styles.badgeCalypso}`}>{b.status}</span></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    )}

                    {(activeTab === 'newsletter' || activeTab === 'marketing') && (
                        <div className={styles.studioLayout}>
                            <div className={styles.editorPanel}>
                                <div className={styles.studioToolbar}>
                                    <button onClick={() => document.execCommand('bold')} title="Negrita"><b>B</b></button>
                                    <button onClick={() => document.execCommand('italic')} title="Cursiva"><i>I</i></button>
                                </div>
                                <input className={styles.editorTitle} value={title} onChange={e => setTitle(e.target.value)} placeholder="Título del escrito..." />
                                <div ref={editorRef} className={styles.richText} contentEditable onInput={(e: any) => setContent(e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{ __html: content }} />
                                
                                <div className={styles.editorActions}>
                                    <button className={styles.primaryBtn} onClick={handleSaveTemplate}>💾 Guardar Cambios</button>
                                    
                                    <button className={styles.syncBtn} onClick={handleSendToAll} style={{color: '#22d3ee', borderColor: '#22d3ee'}}>🚀 Enviar a todos</button>
                                    {selectedRecipients.length > 0 && <button className={styles.syncBtn} onClick={handleSendToSelected}>📨 Enviar a los {selectedRecipients.length} marcados</button>}
                                </div>
                            </div>
                            
                            <aside className={styles.sidePanel}>
                                <div className={styles.panelCard}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 20px 0'}}>
                                        <h4 style={{margin: 0}}>👥 Tus Lectores</h4>
                                        <button onClick={toggleSelectAll} style={{background: 'transparent', border: 'none', color: '#06b6d4', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600}}>
                                            {selectedRecipients.length === newsletterSubs.length && newsletterSubs.length > 0 ? 'Desmarcar todos' : 'Marcar todos'}
                                        </button>
                                    </div>
                                    <div className={styles.audienceList}>
                                        {newsletterSubs.map(s => (
                                            <label key={s.id} className={styles.audienceItem}>
                                                <input type="checkbox" checked={selectedRecipients.includes(s.email)} onChange={e => {
                                                    if(e.target.checked) setSelectedRecipients([...selectedRecipients, s.email]);
                                                    else setSelectedRecipients(selectedRecipients.filter(r => r !== s.email));
                                                }} />
                                                <span>{s.email}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className={styles.panelCard}>
                                    <h4>📚 {activeTab === 'newsletter' ? 'Textos de Newsletter' : 'Artículos de Blog Publicados'}</h4>
                                    <div className={styles.draftList} style={{maxHeight: '300px', overflowY: 'auto', paddingRight: '8px'}}>
                                        {activeTab === 'marketing' && blogPosts.map(bp => (
                                            <div key={bp.slug} className={styles.draftCard} onClick={() => { setEditingTemplate({ id: null }); setTitle(bp.title); setContent(bp.content); if(editorRef.current) editorRef.current.innerHTML = bp.content; }}>
                                                <h5>[Blog] {bp.title}</h5>
                                            </div>
                                        ))}
                                        {activeTab === 'newsletter' && newsletterSequence.map(seq => (
                                            <div key={`seq-${seq.id}`} className={styles.draftCard} onClick={() => { setEditingTemplate({ id: null }); setTitle(seq.subject); setContent(seq.content('[Nombre del Paciente]')); if(editorRef.current) editorRef.current.innerHTML = seq.content('[Nombre del Paciente]'); }}>
                                                <h5>[Pre-escrito] {seq.subject}</h5>
                                            </div>
                                        ))}
                                        {activeTab === 'newsletter' && templates.map(t => (
                                            <div key={t.id} className={styles.draftCard} onClick={() => { setEditingTemplate(t); setTitle(t.title); setContent(t.content); if(editorRef.current) editorRef.current.innerHTML = t.content; }}>
                                                <h5>[Borrador] {t.title}</h5>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </aside>
                        </div>
                    )}
                </div>
            </main>

            {selectedPatient && (
                <div className={styles.modalOverlay} onClick={() => setSelectedPatient(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{isEditing ? '✏️ Editando Perfil' : '📋 Perfil del Paciente'}</h2>
                            <button className={styles.closeIcon} onClick={() => setSelectedPatient(null)}>✖</button>
                        </div>
                        
                        {isEditing ? (
                            <div className={styles.dataGrid}>
                                <div className={styles.dataField}><label>Nombre Principal</label><input value={editData.firstName} onChange={e => setEditData({...editData, firstName: e.target.value})} /></div>
                                <div className={styles.dataField}><label>Segundo Nombre</label><input value={editData.secondName || ''} onChange={e => setEditData({...editData, secondName: e.target.value})} /></div>
                                <div className={styles.dataField}><label>Primer Apellido</label><input value={editData.firstSurname} onChange={e => setEditData({...editData, firstSurname: e.target.value})} /></div>
                                <div className={styles.dataField}><label>Segundo Apellido</label><input value={editData.secondSurname || ''} onChange={e => setEditData({...editData, secondSurname: e.target.value})} /></div>
                                <div className={styles.dataField}><label>Nº de RUT</label><input value={editData.rut} onChange={e => setEditData({...editData, rut: e.target.value})} /></div>
                                <div className={styles.dataField}><label>Correo Electrónico</label><input value={editData.email} disabled style={{opacity: 0.5}} /></div>
                                <div className={styles.dataField}><label>Dirección</label><input value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} /></div>
                                <div className={styles.dataField}><label>Región de Residencia</label>
                                    <select value={editData.region} onChange={e => setEditData({...editData, region: e.target.value})}><option value="">Elegir Región...</option>{CHILE_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}</select>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className={styles.dataGrid}>
                                    <div className={styles.dataField}><label>Identidad</label><span>{[selectedPatient.firstName, selectedPatient.secondName, selectedPatient.firstSurname, selectedPatient.secondSurname].filter(Boolean).join(' ')}</span></div>
                                    <div className={styles.dataField}><label>Identificador (RUT)</label><span>{selectedPatient.rut || 'Aún no registrado'}</span></div>
                                    <div className={styles.dataField}><label>Residencia</label><span>{selectedPatient.address || 'Sin detalles'}</span></div>
                                    <div className={styles.dataField}><label>Ubicación</label><span>{selectedPatient.region ? `${selectedPatient.region}, ${selectedPatient.country}` : 'Desconocida'}</span></div>
                                </div>
                                
                                <div className={styles.sessionsBox}>
                                    <h3>📅 Historial Médico ({selectedPatient.bookings.length} citas)</h3>
                                    {selectedPatient.bookings.length > 0 ? (
                                        <div className={styles.sessionsScroll}>
                                            {selectedPatient.bookings.map((b: any, i: number) => (
                                                <div key={b.id || i} className={styles.sessionLine}>
                                                    <span className={styles.sessionDate}>{new Date(b.appointmentDate || b.createdAt).toLocaleDateString('es-CL')}</span>
                                                    <span className={styles.sessionService}>{b.serviceType}</span>
                                                    <span className={styles.sessionTag}>{b.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{color: '#94a3b8', fontSize: '0.9rem'}}>No hay citas registradas todavía.</p>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        <div className={styles.modalActions}>
                            {isEditing ? (
                                <>
                                    <button className={styles.primaryBtn} onClick={handleUpdatePatient}>💾 Guardar Todo</button>
                                    <button className={styles.syncBtn} onClick={() => setIsEditing(false)}>Volver Atrás</button>
                                </>
                            ) : (
                                <>
                                    <button className={styles.primaryBtn} onClick={() => { setEditData(selectedPatient); setIsEditing(true); }}>✏️ Actualizar Datos</button>
                                    <button className={styles.syncBtn} style={{backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)'}} onClick={() => handleDeletePatient(selectedPatient.email)}>🗑️ Eliminar Paciente</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

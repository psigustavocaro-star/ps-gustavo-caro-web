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

    const monthlyEarnings = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        return bookings
            .filter(b => {
                const date = new Date(b.appointmentDate || b.createdAt);
                return b.status === 'PAID' && 
                       date.getMonth() === currentMonth && 
                       date.getFullYear() === currentYear;
            })
            .reduce((sum, b) => sum + (Number(b.amount) || 0), 0)
            .toLocaleString('es-CL');
    }, [bookings]);

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

    const formatRutForDisplay = (rut?: string) => {
        if (!rut) return 'Aún no registrado';
        const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
        if (cleanRut.length < 2) return rut;
        return `${cleanRut.slice(0, -1)}-${cleanRut.slice(-1)}`;
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

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <div className={`${styles.adminMain} ${isMobileMenuOpen ? styles.menuOpen : ''}`}>
            <div className={styles.ambientAura}></div>
            
            {/* Botón menú móvil */}
            <button 
                className={styles.mobileToggle} 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Menu"
            >
                {isMobileMenuOpen ? '✕' : '☰'}
            </button>

            {/* Overlay para cerrar en móvil */}
            {isMobileMenuOpen && <div className={styles.navOverlay} onClick={() => setIsMobileMenuOpen(false)}></div>}

            <aside className={`${styles.sideNav} ${isMobileMenuOpen ? styles.sideNavOpen : ''}`}>
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
                    <button className={activeTab === 'patients' ? styles.active : ''} onClick={() => { setActiveTab('patients'); setIsMobileMenuOpen(false); }}>👥 Mis Pacientes</button>
                    <button className={activeTab === 'bookings' ? styles.active : ''} onClick={() => { setActiveTab('bookings'); setIsMobileMenuOpen(false); }}>🗓️ Calendario</button>
                    <button className={activeTab === 'newsletter' ? styles.active : ''} onClick={() => { setActiveTab('newsletter'); setIsMobileMenuOpen(false); }}>💌 Newsletter</button>
                    <button className={activeTab === 'marketing' ? styles.active : ''} onClick={() => { setActiveTab('marketing'); setIsMobileMenuOpen(false); }}>✍️ Mi Blog</button>
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
                        <div className={styles.statIcon}>💰</div>
                        <div className={styles.statInfo}>
                            <h3>Ganancias del Mes</h3>
                            <p>${monthlyEarnings}</p>
                        </div>
                    </div>
                </div>

                <div className={styles.listContainer}>
                    {activeTab === 'patients' && (
                        <div className={styles.responsiveList}>
                            {/* Vista para Desktop */}
                            <table className={styles.friendlyTable}>
                                <thead><tr><th>Nombre</th><th>Correo</th><th>Etiqueta</th><th>Ficha</th></tr></thead>
                                <tbody>{patients.map(p => {
                                    const fullName = [p.firstName, p.secondName, p.firstSurname, p.secondSurname].filter(Boolean).join(' ').trim();
                                    const displayName = fullName || p.name || 'Sin Nombre';
                                    return (
                                    <tr key={p.email}>
                                        <td>{displayName}</td>
                                        <td>{p.email}</td>
                                        <td><span className={`${styles.badge} ${p.newsletter ? styles.badgeCalypso : styles.badgeGeneric}`}>{p.newsletter ? 'Lector' : 'Paciente'}</span></td>
                                        <td><button className={styles.actionBtn} onClick={() => { setSelectedPatient(p); setIsEditing(false); }}>Abrir Ficha</button></td>
                                    </tr>
                                    )
                                })}</tbody>
                            </table>
                            {/* Vista para Móvil (Cards) */}
                            <div className={styles.mobileCards}>
                                {patients.map(p => {
                                    const fullName = [p.firstName, p.secondName, p.firstSurname, p.secondSurname].filter(Boolean).join(' ').trim();
                                    const displayName = fullName || p.name || 'Sin Nombre';
                                    return (
                                        <div key={p.email} className={styles.mobileCard}>
                                            <div className={styles.cardInfo}>
                                                <strong>{displayName}</strong>
                                                <span>{p.email}</span>
                                                <span className={`${styles.badge} ${p.newsletter ? styles.badgeCalypso : styles.badgeGeneric}`}>{p.newsletter ? 'Lector' : 'Paciente'}</span>
                                            </div>
                                            <button className={styles.actionBtn} onClick={() => { setSelectedPatient(p); setIsEditing(false); }}>Ver Ficha</button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'bookings' && (
                        <div className={styles.responsiveList}>
                            <table className={styles.friendlyTable}>
                                <thead><tr><th>Paciente</th><th>Fecha de Cita</th><th>Tipo de Servicio</th><th>Monto</th><th>Situación</th></tr></thead>
                                <tbody>{bookings.map(b => (
                                    <tr key={b.id}>
                                        <td>{b.name}</td>
                                        <td>{new Date(b.appointmentDate || b.createdAt).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })} - {new Date(b.appointmentDate || b.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td>{b.serviceType}</td>
                                        <td style={{fontWeight: 700, color: '#0f172a'}}>${(Number(b.amount) || 0).toLocaleString('es-CL')}</td>
                                        <td><span className={`${styles.badge} ${styles.badgeCalypso}`}>{b.status}</span></td>
                                    </tr>
                                ))}</tbody>
                            </table>
                            <div className={styles.mobileCards}>
                                {bookings.map(b => (
                                    <div key={b.id} className={styles.mobileCard}>
                                        <div className={styles.cardInfo}>
                                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                                <strong>{b.name}</strong>
                                                <span style={{fontWeight: 800, color: '#0891b2'}}>${(Number(b.amount) || 0).toLocaleString('es-CL')}</span>
                                            </div>
                                            <span>{new Date(b.appointmentDate || b.createdAt).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })} - {new Date(b.appointmentDate || b.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span className={styles.cardSubtitle}>{b.serviceType}</span>
                                        </div>
                                        <span className={`${styles.badge} ${styles.badgeCalypso}`}>{b.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
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
                            <div className={styles.editForm}>
                                <div className={styles.formSection}>
                                    <h3>Información Personal</h3>
                                    <div className={styles.dataGrid}>
                                        <div className={styles.dataField}><label>Nombre Principal</label><input value={editData.firstName} onChange={e => setEditData({...editData, firstName: e.target.value})} /></div>
                                        <div className={styles.dataField}><label>Segundo Nombre</label><input value={editData.secondName || ''} onChange={e => setEditData({...editData, secondName: e.target.value})} /></div>
                                        <div className={styles.dataField}><label>Primer Apellido</label><input value={editData.firstSurname} onChange={e => setEditData({...editData, firstSurname: e.target.value})} /></div>
                                        <div className={styles.dataField}><label>Segundo Apellido</label><input value={editData.secondSurname || ''} onChange={e => setEditData({...editData, secondSurname: e.target.value})} /></div>
                                    </div>
                                </div>
                                
                                <div className={styles.formSection}>
                                    <h3>Contacto y Ubicación</h3>
                                    <div className={styles.dataGrid}>
                                        <div className={styles.dataField}><label>Nº de RUT</label><input value={editData.rut} onChange={e => setEditData({...editData, rut: e.target.value})} /></div>
                                        <div className={styles.dataField}><label>Correo Electrónico</label><input value={editData.email} disabled style={{opacity: 0.5}} /></div>
                                        <div className={styles.dataField}><label>Teléfono</label><input value={editData.phone || ''} onChange={e => setEditData({...editData, phone: e.target.value})} /></div>
                                        <div className={styles.dataField}><label>Dirección y Comuna</label><input value={editData.address || ''} onChange={e => setEditData({...editData, address: e.target.value})} placeholder="Ej: Las Lilas 123, Providencia" /></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.profileDetails}>
                                <div className={styles.profileHeader}>
                                    <div className={styles.patientAvatarLarge}>
                                        {selectedPatient.firstName?.[0] || selectedPatient.name?.[0] || 'P'}
                                    </div>
                                    <div className={styles.patientMainInfo}>
                                        <h3>{[selectedPatient.firstName, selectedPatient.secondName, selectedPatient.firstSurname, selectedPatient.secondSurname].filter(Boolean).join(' ').trim() || selectedPatient.name || 'Sin Nombre'}</h3>
                                        <span className={styles.patientEmail}>{selectedPatient.email}</span>
                                        <div className={styles.patientBadges}>
                                            <span className={`${styles.badge} ${styles.badgeCalypso}`}>Activo</span>
                                            <span className={`${styles.badge} ${styles.badgeGeneric}`}>{selectedPatient.rut ? 'RUT Verificado' : 'RUT Pendiente'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.infoTabs}>
                                    <div className={styles.infoGrid}>
                                        <div className={styles.infoCard}>
                                            <span className={styles.infoLabel}>RUT</span>
                                            <span className={styles.infoValue}>{formatRutForDisplay(selectedPatient.rut)}</span>
                                        </div>
                                        <div className={styles.infoCard}>
                                            <span className={styles.infoLabel}>Teléfono</span>
                                            <span className={styles.infoValue}>{selectedPatient.phone || 'No registrado'}</span>
                                        </div>
                                        <div className={styles.infoCard}>
                                            <span className={styles.infoLabel}>Ubicación</span>
                                            <span className={styles.infoValue}>{[selectedPatient.address, selectedPatient.commune, selectedPatient.region].filter(Boolean).join(', ') || 'Sin dirección'}</span>
                                        </div>
                                        <div className={styles.infoCard}>
                                            <span className={styles.infoLabel}>Próxima Cita</span>
                                            <span className={styles.infoValue}>Pendiente</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={styles.sessionsBox}>
                                    <div className={styles.sessionsHeader}>
                                        <h3>📋 Historial de Atenciones</h3>
                                        <span className={styles.sessionCount}>{selectedPatient.bookings.length} sesiones</span>
                                    </div>
                                    {selectedPatient.bookings.length > 0 ? (
                                        <div className={styles.sessionsScroll}>
                                            {selectedPatient.bookings.map((b: any, i: number) => (
                                                <div key={b.id || i} className={styles.sessionItem}>
                                                    <div className={styles.sessionIcon}>🗓️</div>
                                                    <div className={styles.sessionMain}>
                                                        <span className={styles.sessionDate}>{new Date(b.appointmentDate || b.createdAt).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                                                        <span className={styles.sessionService}>{b.serviceType}</span>
                                                    </div>
                                                    <div className={styles.sessionMeta}>
                                                        <span className={styles.sessionAmount}>${(Number(b.amount) || 0).toLocaleString('es-CL')}</span>
                                                        <div style={{display: 'flex', gap: '4px', alignItems: 'center'}}>
                                                            {b.invoiceUrl ? (
                                                                <span className={styles.invoiceCheck} title="Boleta subida">🧾✅</span>
                                                            ) : (
                                                                <button 
                                                                    className={styles.uploadInvoiceMini} 
                                                                    onClick={() => {
                                                                        const url = prompt('Pega el link de la boleta del SII o el Base64:');
                                                                        if (url) {
                                                                            fetch(`/api/admin/bookings/${b.id}/invoice`, {
                                                                                method: 'POST',
                                                                                headers: { 'Content-Type': 'application/json' },
                                                                                body: JSON.stringify({ invoiceUrl: url })
                                                                            }).then(res => res.json()).then(data => {
                                                                                if(data.success) {
                                                                                    alert('Boleta vinculada con éxito');
                                                                                    fetchData();
                                                                                }
                                                                            });
                                                                        }
                                                                    }}
                                                                    title="Vincular Boleta SII"
                                                                >
                                                                    ➕🧾
                                                                </button>
                                                            )}
                                                            <span className={`${styles.statusBadge} ${b.status === 'PAID' ? styles.statusPaid : styles.statusPending}`}>{b.status}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className={styles.emptySessions}>
                                            <span className={styles.emptyIcon}>📂</span>
                                            <p>No hay citas registradas todavía en el sistema.</p>
                                        </div>
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
                                    <button className={styles.primaryBtn} onClick={() => { 
                                        let newFirstName = selectedPatient.firstName;
                                        let newSecondName = selectedPatient.secondName;
                                        let newFirstSurname = selectedPatient.firstSurname;
                                        let newSecondSurname = selectedPatient.secondSurname;
                                        
                                        if (!newFirstName && selectedPatient.name) {
                                            const parts = selectedPatient.name.trim().split(/\s+/);
                                            if (parts.length === 1) {
                                                newFirstName = parts[0];
                                            } else if (parts.length === 2) {
                                                newFirstName = parts[0];
                                                newFirstSurname = parts[1];
                                            } else if (parts.length === 3) {
                                                newFirstName = parts[0];
                                                newFirstSurname = parts[1];
                                                newSecondSurname = parts[2];
                                            } else if (parts.length >= 4) {
                                                newFirstName = parts[0];
                                                newSecondName = parts[1];
                                                newFirstSurname = parts[2];
                                                newSecondSurname = parts.slice(3).join(' ');
                                            }
                                        }
                                        
                                        setEditData({
                                            ...selectedPatient,
                                            firstName: newFirstName || '',
                                            secondName: newSecondName || '',
                                            firstSurname: newFirstSurname || '',
                                            secondSurname: newSecondSurname || ''
                                        }); 
                                        setIsEditing(true); 
                                    }}>✏️ Actualizar Datos</button>
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

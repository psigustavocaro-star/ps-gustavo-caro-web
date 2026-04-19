'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [aiPrompt, setAiPrompt] = useState('');
    
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
                alert('✓ Base de datos actualizada');
                setIsEditing(false);
                setSelectedPatient(editData);
                fetchData();
            }
        } catch (err) { alert('Error de red'); }
        finally { setIsLoading(false); }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.toLowerCase() === 'psi.gustavocaro@gmail.com' && password === 'gudaxgudax1.') {
            setIsAuthenticated(true);
            fetchData();
        } else {
            alert('Acceso Denegado');
        }
    };

    const generateAIContent = async () => {
        if (!aiPrompt) return alert('Especifica el tema clínico');
        setIsLoading(true);
        setTimeout(() => {
            const library: any = {
                'ansiedad': { t: 'Protocolos de Manejo Cognitivo para Ansiedad', c: '<h2>Enfoque Clínico</h2><p>La ansiedad clínica requiere una intervención estructurada...</p><ul><li>Regulación autonómica</li><li>Reestructuración del pensamiento</li><li>Exposición sistemática</li></ul><img src="https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0" />' },
                'depresion': { t: 'Actualización en Activación Conductual', c: '<h2>Estrategias Avanzadas</h2><p>La depresión mayor se aborda desde la activación progresiva.</p><p>Establecer metas de baja fricción es crítico para el éxito terapéutico inicial.</p>' }
            };
            const match = library[aiPrompt.toLowerCase()] || { t: `Reflexión: ${aiPrompt}`, c: `<h2>Marco Teórico: ${aiPrompt}</h2><p>Contenido generado para facilitar tu escritura profesional...</p>` };
            setTitle(match.t);
            setContent(match.c);
            if (editorRef.current) editorRef.current.innerHTML = match.c;
            setIsLoading(false);
        }, 1200);
    };

    const handleSendToAll = async () => {
        if (!editingTemplate) return alert('Primero selecciona o guarda una plantilla');
        if (!confirm(`¿Enviar "${editingTemplate.title}" a TODOS los ${newsletterSubs.length} suscriptores?`)) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/newsletter/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId: editingTemplate.id, target: 'all' }),
            });
            const data = await res.json();
            if (data.success) alert(`✓ Campaña masiva iniciada. Enviado a ${data.count} personas.`);
        } catch (err) { alert('Error en el servicio de envío'); }
        finally { setIsLoading(false); }
    };

    const handleSendToSelected = async () => {
        if (!editingTemplate) return alert('Guarda o selecciona una plantilla primero');
        if (selectedRecipients.length === 0) return alert('Selecciona destinatarios en la barra lateral');
        setIsLoading(true);
        try {
            for (const email of selectedRecipients) {
                await fetch('/api/admin/newsletter/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ templateId: editingTemplate.id, target: 'specific', specificEmail: email }),
                });
            }
            alert(`✓ Enviado con éxito a ${selectedRecipients.length} destinatarios seleccionados.`);
            setSelectedRecipients([]);
        } catch (err) { alert('Error en el envío segmentado'); }
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
                alert('✓ Guardado correctamente');
                fetchData();
            }
        } catch (err) { alert('Falla en persistencia'); }
        finally { setIsLoading(false); }
    };

    if (!isAuthenticated) {
        return (
            <div className={styles.authWrapper}>
                <div className={styles.authAmbient}></div>
                <div className={styles.authCard}>
                    <div className={styles.authBadge}>GC</div>
                    <h1>Executive Panel</h1>
                    <form onSubmit={handleLogin}>
                        <input className={styles.inputMain} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
                        <input className={styles.inputMain} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Clave" required />
                        <button type="submit" className={styles.authBtn}>Desbloquear Suite</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.adminMain}>
            <div className={styles.ambientAura}></div>
            
            <aside className={styles.sideNav}>
                <div className={styles.navHeader}>
                    <div className={styles.logoSquare}>
                        <span className={styles.dogAvatar}>🐕</span>
                    </div>
                    <span className={styles.navTitle} style={{color: '#fff', fontSize: '0.9rem', fontWeight: 700}}>ELITE CRM</span>
                </div>
                <nav className={styles.navList}>
                    <button className={activeTab === 'patients' ? styles.active : ''} onClick={() => setActiveTab('patients')}>Pacientes</button>
                    <button className={activeTab === 'bookings' ? styles.active : ''} onClick={() => setActiveTab('bookings')}>Calendario</button>
                    <button className={activeTab === 'newsletter' ? styles.active : ''} onClick={() => setActiveTab('newsletter')}>Newsletter</button>
                    <button className={activeTab === 'marketing' ? styles.active : ''} onClick={() => setActiveTab('marketing')}>Blog Editorial</button>
                </nav>
                <button onClick={() => setIsAuthenticated(false)} className={styles.logoutAction}>Cerrar Sesión</button>
            </aside>

            <main className={styles.contentArea}>
                <header className={styles.contentHeader} style={{marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h1>{activeTab === 'patients' ? 'Historial Clínico' : activeTab === 'bookings' ? 'Agenda Clínica' : activeTab === 'newsletter' ? 'Newsletter Masivo' : 'Suite Editorial'}</h1>
                    <button onClick={fetchData} className={styles.syncBtn}>Sincronizar Panel</button>
                </header>

                <div className={styles.dashboardStats}>
                    <div className={styles.statBox}><span className={styles.label}>Base Pacientes</span><span className={styles.value}>{patients.length}</span></div>
                    <div className={styles.statBox}><span className={styles.label}>Total Citas</span><span className={styles.value}>{bookings.length}</span></div>
                    <div className={styles.statBox}><span className={styles.label}>Newsletter Subs</span><span className={styles.value}>{newsletterSubs.length}</span></div>
                </div>

                <div className={styles.mainGrid}>
                    {activeTab === 'patients' && (
                        <table className={styles.proTable}>
                            <thead><tr><th>Identidad</th><th>Email</th><th>Origen</th><th style={{textAlign: 'right'}}>Acción</th></tr></thead>
                            <tbody>{patients.map(p => (
                                <tr key={p.email}>
                                    <td><strong>{[p.firstName, p.secondName, p.firstSurname, p.secondSurname].filter(Boolean).join(' ')}</strong></td>
                                    <td>{p.email}</td>
                                    <td><span className={styles.statusOk}>{p.newsletter ? 'Newsletter' : 'Clínico'}</span></td>
                                    <td style={{textAlign: 'right'}}><button className={styles.actionBtn} onClick={() => { setSelectedPatient(p); setIsEditing(false); }}>Ver Ficha</button></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    )}

                    {activeTab === 'bookings' && (
                        <table className={styles.proTable}>
                            <thead><tr><th>Paciente</th><th>Fecha</th><th>Servicio</th><th>Estado</th></tr></thead>
                            <tbody>{bookings.map(b => (
                                <tr key={b.id}>
                                    <td><strong>{b.name}</strong></td>
                                    <td>{new Date(b.appointmentDate || b.createdAt).toLocaleDateString('es-CL')}</td>
                                    <td>{b.serviceType}</td>
                                    <td><span className={styles.statusOk} style={{background: 'transparent'}}>{b.status}</span></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    )}

                    {(activeTab === 'newsletter' || activeTab === 'marketing') && (
                        <div className={styles.editorialStudio}>
                            <div className={styles.studioMain}>
                                <div className={styles.studioToolbar}>
                                    <button onClick={() => document.execCommand('bold')}>B</button>
                                    <button onClick={() => document.execCommand('italic')}>I</button>
                                    <div className={styles.aiScribe}>
                                        <input placeholder="Tema para la IA..." value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
                                        <button onClick={generateAIContent}>Escribir</button>
                                    </div>
                                </div>
                                <input className={styles.titleInput} value={title} onChange={e => setTitle(e.target.value)} placeholder="Introduce el título..." />
                                <div ref={editorRef} className={styles.editor} contentEditable onInput={(e: any) => setContent(e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{ __html: content }} />
                                <div className={styles.editorFooter}>
                                    <button className={styles.primaryBtn} onClick={handleSaveTemplate}>Guardar Cambios</button>
                                    {activeTab === 'newsletter' && (
                                        <>
                                            <button className={styles.syncBtn} onClick={handleSendToAll} style={{color: '#10b981'}}>Enviar a TODOS</button>
                                            {selectedRecipients.length > 0 && <button className={styles.syncBtn} onClick={handleSendToSelected}>Enviar a {selectedRecipients.length} seleccionados</button>}
                                        </>
                                    )}
                                </div>
                            </div>
                            <aside className={styles.editorialStudioSidebar}>
                                <div className={styles.sidebarGroup}>
                                    <h4>{activeTab === 'newsletter' ? 'Lista de Audiencia' : 'Borradores'}</h4>
                                    {activeTab === 'newsletter' && (
                                        <div className={styles.checkList}>
                                            {newsletterSubs.map(s => (
                                                <label key={s.id} className={styles.checkItem}>
                                                    <input type="checkbox" checked={selectedRecipients.includes(s.email)} onChange={e => {
                                                        if(e.target.checked) setSelectedRecipients([...selectedRecipients, s.email]);
                                                        else setSelectedRecipients(selectedRecipients.filter(r => r !== s.email));
                                                    }} />
                                                    <span>{s.email}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    <div className={styles.archiveItems}>
                                        {templates.map(t => (
                                            <div key={t.id} className={styles.archiveItem} onClick={() => { setEditingTemplate(t); setTitle(t.title); setContent(t.content); if(editorRef.current) editorRef.current.innerHTML = t.content; }}>
                                                <h5>{t.title}</h5>
                                                <p style={{fontSize: '0.7rem'}}>{new Date().toLocaleDateString()}</p>
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
                <div className={styles.overlay} onClick={() => setSelectedPatient(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>{isEditing ? 'Editar Ficha' : 'Ficha Clínica Expandida'}</h2>
                        {isEditing ? (
                            <div className={styles.formGrid}>
                                <div className={styles.inputGroup}><label>Primer Nombre</label><input className={styles.inputMain} value={editData.firstName} onChange={e => setEditData({...editData, firstName: e.target.value})} /></div>
                                <div className={styles.inputGroup}><label>Segundo Nombre</label><input className={styles.inputMain} value={editData.secondName || ''} onChange={e => setEditData({...editData, secondName: e.target.value})} /></div>
                                <div className={styles.inputGroup}><label>Apellido Paterno</label><input className={styles.inputMain} value={editData.firstSurname} onChange={e => setEditData({...editData, firstSurname: e.target.value})} /></div>
                                <div className={styles.inputGroup}><label>Apellido Materno</label><input className={styles.inputMain} value={editData.secondSurname || ''} onChange={e => setEditData({...editData, secondSurname: e.target.value})} /></div>
                                <div className={styles.inputGroup}><label>RUT</label><input className={styles.inputMain} value={editData.rut} onChange={e => setEditData({...editData, rut: e.target.value})} /></div>
                                <div className={styles.inputGroup}><label>Email</label><input className={styles.inputMain} value={editData.email} disabled /></div>
                                <div className={styles.inputGroup}><label>Dirección</label><input className={styles.inputMain} value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} /></div>
                                <div className={styles.inputGroup}><label>Región</label>
                                    <select className={styles.inputMain} value={editData.region} onChange={e => setEditData({...editData, region: e.target.value})}><option value="">Selección...</option>{CHILE_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}</select>
                                </div>
                                <button className={styles.primaryBtn} onClick={handleUpdatePatient}>Guardar Cambios</button>
                                <button className={styles.syncBtn} onClick={() => setIsEditing(false)}>Cancelar</button>
                            </div>
                        ) : (
                            <div>
                                <div className={styles.dataGroup}>
                                    <h4>Identificación</h4>
                                    <div className={styles.dataRow}><label>Nombre Completo</label><span>{[selectedPatient.firstName, selectedPatient.secondName, selectedPatient.firstSurname, selectedPatient.secondSurname].filter(Boolean).join(' ')}</span></div>
                                    <div className={styles.dataRow}><label>RUT</label><span>{selectedPatient.rut || 'No registra'}</span></div>
                                </div>
                                <div className={styles.dataGroup}>
                                    <h4>Ubicación</h4>
                                    <div className={styles.dataRow}><label>Dirección</label><span>{selectedPatient.address || 'No registra'}</span></div>
                                    <div className={styles.dataRow}><label>Región/Comuna</label><span>{selectedPatient.region}, {selectedPatient.commune} ({selectedPatient.country})</span></div>
                                </div>
                                <div className={styles.dataGroup}>
                                    <h4>Historial</h4>
                                    <div className={styles.dataRow}><label>Sesiones Totales</label><span>{selectedPatient.bookings.length}</span></div>
                                </div>
                                <div style={{display: 'flex', gap: '10px', marginTop: '30px'}}>
                                    <button className={styles.primaryBtn} onClick={() => { setEditData(selectedPatient); setIsEditing(true); }}>Editar Expediente</button>
                                    <button className={styles.syncBtn} onClick={() => setSelectedPatient(null)}>Cerrar</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

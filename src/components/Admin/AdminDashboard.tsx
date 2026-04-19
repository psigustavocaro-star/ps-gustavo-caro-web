'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [templates, setTemplates] = useState<any[]>([]);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
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

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.toLowerCase() === 'psi.gustavocaro@gmail.com' && password === 'gudaxgudax1.') {
            setIsAuthenticated(true);
            fetchData();
        } else {
            alert('Credenciales inválidas');
        }
    };

    const generateAIContent = async () => {
        if (!aiPrompt) return alert('Especifica un tema clínico');
        setIsLoading(true);
        
        setTimeout(() => {
            const library: any = {
                'ansiedad': { t: 'Protocolos de Manejo Cognitivo para Ansiedad', c: '<h2>Enfoque Clínico</h2><p>La ansiedad clínica requiere una intervención estructurada...</p><ul><li>Regulación autonómica</li><li>Reestructuración del pensamiento</li><li>Exposición sistemática</li></ul>' },
                'depresion': { t: 'Actualización en Activación Conductual', c: '<h2>Estrategias Avanzadas</h2><p>La depresión mayor se aborda desde la activación progresiva.</p><p>Establecer metas de baja fricción es crítico para el éxito terapéutico inicial.</p>' }
            };

            const data = library[aiPrompt.toLowerCase()] || { 
                t: `Análisis Profesional: ${aiPrompt}`, 
                c: `<h2>Marco Teórico sobre ${aiPrompt}</h2><p>Generando borrador ejecutivo para facilitar tu redacción sobre ${aiPrompt}.</p><p>Este contenido está diseñado para ser la base de una comunicación profesional de alto impacto en tu blog o newsletter.</p>` 
            };

            setTitle(data.t);
            setContent(data.c);
            if (editorRef.current) editorRef.current.innerHTML = data.c;
            setIsLoading(false);
        }, 1000);
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
                alert('✓ Contenido guardado en la suite');
                setTitle(''); setContent(''); setEditingTemplate(null);
                if (editorRef.current) editorRef.current.innerHTML = '';
                fetchData();
            }
        } catch (err) { alert('Error de persistencia'); }
        finally { setIsLoading(false); }
    };

    if (!isAuthenticated) {
        return (
            <div className={styles.authWrapper}>
                <div className={styles.authAmbient}></div>
                <div className={styles.authCard}>
                    <div className={styles.authBadge}>GC</div>
                    <h1>Executive Access</h1>
                    <p>Introduce tus credenciales para acceder a la suite profesional.</p>
                    <form onSubmit={handleLogin}>
                        <input className={styles.inputField} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Corporativo" required />
                        <input className={styles.inputField} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Clave Maestra" required />
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
                    <div className={styles.logoSquare}>GC</div>
                    <span className={styles.navTitle}>Elite CRM</span>
                </div>
                <nav className={styles.navList}>
                    <button className={activeTab === 'patients' ? styles.active : ''} onClick={() => setActiveTab('patients')}>Pacientes</button>
                    <button className={activeTab === 'bookings' ? styles.active : ''} onClick={() => setActiveTab('bookings')}>Calendario</button>
                    <button className={activeTab === 'newsletter' ? styles.active : ''} onClick={() => setActiveTab('newsletter')}>Newsletter</button>
                    <button className={activeTab === 'marketing' ? styles.active : ''} onClick={() => setActiveTab('marketing')}>Blog Editorial</button>
                </nav>
                <button onClick={() => setIsAuthenticated(false)} className={styles.logoutAction}>Salir del sistema</button>
            </aside>

            <main className={styles.contentArea}>
                <header className={styles.contentHeader}>
                    <div>
                        <h1>{activeTab === 'patients' ? 'Gestión de Pacientes' : activeTab === 'bookings' ? 'Agenda Próxima' : activeTab === 'newsletter' ? 'Lista de Difusión' : 'Estudio de Redacción'}</h1>
                        <p>{isLoading ? 'Actualizando suite...' : 'Infraestructura profesional activa'}</p>
                    </div>
                    <button onClick={fetchData} className={styles.syncBtn}>Sincronizar Suite</button>
                </header>

                <div className={styles.dashboardStats}>
                    <div className={styles.statBox}><span className={styles.label}>Base de Datos</span><span className={styles.value}>{patients.length} pacientes</span></div>
                    <div className={styles.statBox}><span className={styles.label}>Sesiones</span><span className={styles.value}>{bookings.length} totales</span></div>
                    <div className={styles.statBox}><span className={styles.label}>Alcance</span><span className={styles.value}>{newsletterSubs.length} suscriptores</span></div>
                </div>

                <div className={styles.mainGrid}>
                    {activeTab === 'patients' && (
                        <table className={styles.proTable}>
                            <thead><tr><th>Identificador</th><th>Canal</th><th>Estado</th><th style={{textAlign: 'right'}}>Acción</th></tr></thead>
                            <tbody>{patients.map(p => (
                                <tr key={p.email}>
                                    <td><strong>{p.name}</strong></td>
                                    <td>{p.email}</td>
                                    <td><span className={`${styles.statusBadge} ${styles.statusOk}`}>Control Activo</span></td>
                                    <td style={{textAlign: 'right'}}><button className={styles.actionBtn} onClick={() => setSelectedPatient(p)}>Ficha Ejecutiva</button></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    )}

                    {activeTab === 'bookings' && (
                        <table className={styles.proTable}>
                            <thead><tr><th>Paciente</th><th>Fecha</th><th>Servicio</th><th>Status</th></tr></thead>
                            <tbody>{bookings.map(b => (
                                <tr key={b.id}>
                                    <td><strong>{b.name}</strong></td>
                                    <td>{new Date(b.appointmentDate || b.createdAt).toLocaleDateString('es-CL')}</td>
                                    <td>{b.serviceType}</td>
                                    <td style={{fontSize: '0.7rem'}}>{b.status}</td>
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
                                        <input placeholder="Tema clínico para IA..." value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
                                        <button onClick={generateAIContent}>{isLoading ? '...' : 'Generar'}</button>
                                    </div>
                                </div>
                                <input className={styles.titleInput} value={title} onChange={e => setTitle(e.target.value)} placeholder="Introduce el título aquí..." />
                                <div 
                                    ref={editorRef}
                                    className={styles.editor} 
                                    contentEditable 
                                    onInput={(e: any) => setContent(e.currentTarget.innerHTML)}
                                    dangerouslySetInnerHTML={{ __html: content }} 
                                />
                                <div className={styles.editorFooter}>
                                    <button className={styles.actionBtn} style={{padding: '12px 32px'}} onClick={handleSaveTemplate}>Guardar en Archivo</button>
                                </div>
                            </div>
                            <aside className={styles.studioSidebar}>
                                <div className={styles.sidebarGroup}>
                                    <h4>Historial de Artículos</h4>
                                    <div className={styles.archiveItems}>
                                        {templates.map(t => (
                                            <div key={t.id} className={styles.archiveItem} onClick={() => { setEditingTemplate(t); setTitle(t.title); setContent(t.content); if(editorRef.current) editorRef.current.innerHTML = t.content; }}>
                                                <h5>{t.title}</h5>
                                                <p>{new Date().toLocaleDateString()} • {t.content.replace(/<[^>]*>/g, '').slice(0, 30)}...</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {activeTab === 'newsletter' && (
                                    <div className={styles.sidebarGroup} style={{marginTop: '48px'}}>
                                        <h4>Lista de Suscriptores</h4>
                                        <div style={{opacity: 0.5}}>
                                            {newsletterSubs.map(s => <p key={s.id} style={{fontSize: '0.75rem', marginBottom: '8px'}}>{s.email}</p>)}
                                        </div>
                                    </div>
                                )}
                            </aside>
                        </div>
                    )}
                </div>
            </main>

            {selectedPatient && (
                <div className={styles.overlay} onClick={() => setSelectedPatient(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>Ficha Ejecutiva</h2>
                        <div className={styles.dataRow}><label>Identidad</label><span>{selectedPatient.name}</span></div>
                        <div className={styles.dataRow}><label>Contacto</label><span>{selectedPatient.email}</span></div>
                        <div className={styles.dataRow}><label>Historial Clínico</label><span>{selectedPatient.bookings.length} Sesiones</span></div>
                        <button className={styles.authBtn} style={{marginTop: '48px'}} onClick={() => setSelectedPatient(null)}>Cerrar Expediente</button>
                    </div>
                </div>
            )}
        </div>
    );
}

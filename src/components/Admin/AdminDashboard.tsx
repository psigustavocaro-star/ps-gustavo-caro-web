'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import styles from './AdminDashboard.module.css';
import Link from 'next/link';

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
        } catch (err) { console.error(err); } 
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

    const generateAIContent = async () => {
        console.log("Generating AI for:", aiPrompt);
        if (!aiPrompt) return alert('Por favor ingresa un tema (Ej: Ansiedad, Depresión)');
        setIsLoading(true);
        
        // Simulación de delay de IA
        setTimeout(() => {
            const aiLibrary: any = {
                'ansiedad': { title: 'Estrategias Maestras contra la Ansiedad', content: '<h2>Control Mental</h2><p>La ansiedad moderna requiere un enfoque holístico. Aquí tienes 3 pasos clave...</p><ul><li>Respiración diafragmática profunda.</li><li>Identificación de disparadores cognitivos.</li><li>Exposición gradual controlada.</li></ul>' },
                'depresion': { title: 'El Camino de la Resiliencia Emocional', content: '<h2>Reencontrando la Luz</h2><p>Superar la depresión es un proceso de micro-victorias diarias.</p><p>Es fundamental establecer rutinas de autocuidado y buscar apoyo clínico especializado.</p>' }
            };

            const match = aiLibrary[aiPrompt.toLowerCase()] || { 
                title: `Perspectivas Clínicas sobre ${aiPrompt}`, 
                content: `<h2>Borrador de Trabajo: ${aiPrompt}</h2><p>Este es un análisis preliminar generado para facilitar tu escritura profesional sobre ${aiPrompt}.</p><p>Recuerda añadir tu experiencia personal y casos clínicos (resguardando identidad) para mayor impacto.</p>` 
            };

            setTitle(match.title);
            setContent(match.content);
            if (editorRef.current) {
                editorRef.current.innerHTML = match.content;
            }
            setIsLoading(false);
            console.log("AI Generation Complete");
        }, 1200);
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
                alert('✓ Publicación guardada en el sistema');
                setTitle(''); setContent(''); setEditingTemplate(null);
                if (editorRef.current) editorRef.current.innerHTML = '';
                fetchData();
            }
        } catch (err) { alert('Error al guardar'); }
        finally { setIsLoading(false); }
    };

    if (!isAuthenticated) {
        return (
            <div className={styles.loginWrapper}>
                <div className={styles.loginCard}>
                    <div className={styles.pulseLogo}>GC</div>
                    <h1>Módulo Administrativo</h1>
                    <p>Ingresa tus credenciales maestras para continuar.</p>
                    <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                        <input className={styles.inputMain} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Maestro" required />
                        <input className={styles.inputMain} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Clave de Seguridad" required />
                        <button type="submit" className={styles.primaryButton}>Desbloquear Panel</button>
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
                    <span className={styles.logoText}>Gustavo Caro</span>
                    <span className={styles.logoSub}>Clinical Suite</span>
                </div>
                <nav className={styles.navList}>
                    <button className={activeTab === 'patients' ? styles.active : ''} onClick={() => setActiveTab('patients')}>👤 Pacientes</button>
                    <button className={activeTab === 'bookings' ? styles.active : ''} onClick={() => setActiveTab('bookings')}>📅 Agenda</button>
                    <button className={activeTab === 'newsletter' ? styles.active : ''} onClick={() => setActiveTab('newsletter')}>📧 Newsletter</button>
                    <button className={activeTab === 'marketing' ? styles.active : ''} onClick={() => setActiveTab('marketing')}>✍️ Blog Editorial</button>
                </nav>
                <button onClick={() => setIsAuthenticated(false)} className={styles.logoutAction}>Cerrar Sesión</button>
            </aside>

            <main className={styles.contentArea}>
                <header className={styles.contentHeader}>
                    <div>
                        <h1>{activeTab === 'patients' ? 'Historial Clínico' : activeTab === 'bookings' ? 'Agenda Clínica' : activeTab === 'newsletter' ? 'Centro de Noticias' : 'Estudio de Redacción'}</h1>
                        <p>{isLoading ? 'Analizando infraestructura...' : 'Sincronización segura activa'}</p>
                    </div>
                    <button onClick={fetchData} className={styles.syncBtn}>Sincronizar Datos</button>
                </header>

                <div className={styles.dashboardStats}>
                    <div className={styles.statBox}><span className={styles.label}>Pacientes Activos</span><span className={styles.value}>{patients.length}</span></div>
                    <div className={styles.statBox}><span className={styles.label}>Citas Registradas</span><span className={styles.value}>{bookings.length}</span></div>
                    <div className={styles.statBox}><span className={styles.label}>Lista de Difusión</span><span className={styles.value}>{newsletterSubs.length}</span></div>
                </div>

                <div className={styles.mainGrid}>
                    {activeTab === 'patients' && (
                        <table className={styles.proTable}>
                            <thead><tr><th>Paciente</th><th>Contacto</th><th>Status</th><th>Acción</th></tr></thead>
                            <tbody>{patients.map(p => (
                                <tr key={p.email}>
                                    <td><strong>{p.name}</strong></td>
                                    <td>{p.email}</td>
                                    <td><span className={styles.statusOk}>Activo</span></td>
                                    <td><button className={styles.viewBtn} onClick={() => setSelectedPatient(p)}>Gestionar Ficha</button></td>
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
                                    <td>{b.status}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    )}

                    {(activeTab === 'newsletter' || activeTab === 'marketing') && (
                        <div className={styles.editorialLayout}>
                            <div className={styles.editorialMain}>
                                <div className={styles.editorToolbar}>
                                    <button onClick={() => document.execCommand('bold')}>B</button>
                                    <button onClick={() => document.execCommand('italic')}>I</button>
                                    <button onClick={() => document.execCommand('insertUnorderedList')}>•</button>
                                    <div className={styles.aiHelper}>
                                        <input placeholder="Escribe un tema para la IA..." value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
                                        <button onClick={generateAIContent}>{isLoading ? '...' : 'Generar'}</button>
                                    </div>
                                </div>
                                <input className={styles.editorTitleInput} value={title} onChange={e => setTitle(e.target.value)} placeholder="Introduce un título impactante..." />
                                <div 
                                    ref={editorRef}
                                    className={styles.richEditor} 
                                    contentEditable 
                                    onInput={(e: any) => setContent(e.currentTarget.innerHTML)}
                                    dangerouslySetInnerHTML={{ __html: content }} 
                                />
                                <div className={styles.editorFooter}>
                                    <button className={styles.primaryButton} onClick={handleSaveTemplate}>Guardar Publicación</button>
                                </div>
                            </div>
                            <aside className={styles.editorialSidebar}>
                                <div className={styles.sidebarSection}>
                                    <h4>Archivo de Contenido</h4>
                                    <div className={styles.archiveList}>
                                        {templates.map(t => (
                                            <div key={t.id} className={styles.archiveItem} onClick={() => { setEditingTemplate(t); setTitle(t.title); setContent(t.content); if(editorRef.current) editorRef.current.innerHTML = t.content; }}>
                                                <h5>{t.title}</h5>
                                                <span>{new Date().toLocaleDateString()} • {t.content.slice(0, 40)}...</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {activeTab === 'newsletter' && (
                                    <div className={styles.sidebarSection}>
                                        <h4>Lista de Difusión</h4>
                                        <div className={styles.archiveList}>
                                            {newsletterSubs.map(s => (
                                                <div key={s.id} className={styles.archiveItem} style={{padding: '12px 20px'}}>
                                                    <h5>{s.email}</h5>
                                                </div>
                                            ))}
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
                        <h2 className={styles.modalTitle}>Ficha Clínica</h2>
                        <div className={styles.dataItem}>Nombre Completo: <strong>{selectedPatient.name}</strong></div>
                        <div className={styles.dataItem}>Canal de Comunicación: <strong>{selectedPatient.email}</strong></div>
                        <div className={styles.dataItem}>Historial: <strong>{selectedPatient.bookings.length} Sesiones</strong></div>
                        <button className={styles.primaryButton} style={{width: '100%', marginTop: '30px'}} onClick={() => setSelectedPatient(null)}>Cerrar Expediente</button>
                    </div>
                </div>
            )}
        </div>
    );
}

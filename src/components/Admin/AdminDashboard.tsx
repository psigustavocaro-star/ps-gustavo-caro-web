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
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [aiPrompt, setAiPrompt] = useState('');

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
        if (!confirm('¿Estás seguro de eliminar TODO el historial de este paciente?')) return;
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
                alert('Contenido guardado');
                setEditingTemplate(null);
                setTitle('');
                setContent('');
                fetchData();
            }
        } catch (err) { alert('Error al guardar'); }
        finally { setIsLoading(false); }
    };

    const handleSendNewsletter = async (templateId: string, target: 'all' | 'specific', specificEmail?: string) => {
        if (target === 'all' && !confirm('¿Enviar este newsletter a TODOS?')) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/newsletter/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId, target, specificEmail }),
            });
            const data = await res.json();
            if (data.success) alert(`✓ Enviado a ${data.count} destinatarios`);
            else alert('Error: ' + data.error);
        } catch (err) { alert('Error al enviar'); }
        finally { setIsLoading(false); }
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!confirm('¿Eliminar esta plantilla?')) return;
        try {
            await fetch(`/api/admin/newsletter/templates?id=${id}`, { method: 'DELETE' });
            fetchData();
        } catch (e) {}
    };

    const generateAIContent = async () => {
        if (!aiPrompt) return alert('Escribe un tema');
        setIsLoading(true);
        setTimeout(() => {
            const aiSuggestions: any = {
                'ansiedad': { title: 'Manejando la Ansiedad', content: '<h2>Estrategias</h2><p>La ansiedad se puede gestionar...</p>' },
                'depresion': { title: 'Luz en la Depresión', content: '<h2>Sanación</h2><p>El camino es gradual...</p>' }
            };
            const result = aiSuggestions[aiPrompt.toLowerCase()] || { title: `Sobre ${aiPrompt}`, content: `<p>Contenido generado sobre ${aiPrompt}...</p>` };
            setTitle(result.title);
            setContent(result.content);
            const ed = document.getElementById('rich-editor');
            if(ed) ed.innerHTML = result.content;
            setIsLoading(false);
        }, 1000);
    };

    const handleSendToSelected = async () => {
        if (selectedRecipients.length === 0) return alert('Selecciona destinatarios');
        setIsLoading(true);
        try {
            for (const email of selectedRecipients) {
                await fetch('/api/admin/newsletter/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ templateId: editingTemplate?.id || 'new', target: 'specific', specificEmail: email }),
                });
            }
            alert(`✓ Enviado a ${selectedRecipients.length} personas`);
            setSelectedRecipients([]);
        } catch (e) { alert('Error'); }
        finally { setIsLoading(false); }
    };

    const stats = useMemo(() => {
        const totalBookings = bookings.length;
        const totalRevenue = bookings.filter(b => b.status === 'PAID').reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
        const activeSubscribers = newsletterSubs.length;
        return { totalBookings, totalRevenue, activeSubscribers };
    }, [bookings, newsletterSubs]);

    if (!isAuthenticated) {
        return (
            <div className={styles.loginWrapper}>
                <div className={styles.movingBackground}></div>
                <div className={styles.loginCard}>
                    <div className={styles.pulseLogo}>
                        <div className={styles.logoCore}>GC</div>
                        <div className={styles.pulseRing}></div>
                    </div>
                    <h1>Elite Access</h1>
                    <p>Tecnología de vanguardia para tu gestión clínica.</p>
                    <form onSubmit={handleLogin}>
                        <input className={styles.inputMain} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
                        <input className={styles.inputMain} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Clave" required />
                        <button type="submit" className={styles.primaryButton}>Entrar al Sistema</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.adminMain}>
            <aside className={styles.sideNav}>
                <div className={styles.navHeader}>
                    <div className={styles.logoSmall}>GC</div>
                    <div className={styles.navTitle}><span>Admin</span><small>Elite CRM</small></div>
                </div>
                <nav className={styles.navList}>
                    <button className={activeTab === 'patients' ? styles.active : ''} onClick={() => setActiveTab('patients')}>👥 Pacientes</button>
                    <button className={activeTab === 'bookings' ? styles.active : ''} onClick={() => setActiveTab('bookings')}>📅 Calendario</button>
                    <button className={activeTab === 'newsletter' ? styles.active : ''} onClick={() => setActiveTab('newsletter')}>📧 Newsletter</button>
                    <button className={activeTab === 'marketing' ? styles.active : ''} onClick={() => setActiveTab('marketing')}>✍️ Blog</button>
                </nav>
                <button onClick={() => setIsAuthenticated(false)} className={styles.logoutAction}>Salir</button>
            </aside>

            <main className={styles.contentArea}>
                <header className={styles.contentHeader}>
                    <h1>{activeTab === 'patients' ? 'Pacientes' : activeTab === 'bookings' ? 'Agenda' : activeTab === 'newsletter' ? 'Newsletter' : 'Blog'}</h1>
                    <button onClick={fetchData} className={styles.syncBtn}>Sincronizar</button>
                </header>

                <div className={styles.dashboardStats}>
                    <div className={styles.statBox}><span className={styles.label}>Citas</span><span className={styles.value}>{stats.totalBookings}</span></div>
                    <div className={styles.statBox}><span className={styles.label}>Suscriptores</span><span className={styles.value}>{stats.activeSubscribers}</span></div>
                    <div className={styles.statBox}><span className={styles.label}>Ingresos</span><span className={styles.value}>${stats.totalRevenue.toLocaleString()}</span></div>
                </div>

                <div className={styles.mainGrid}>
                    {activeTab === 'patients' && (
                        <table className={styles.proTable}>
                            <thead><tr><th>Nombre</th><th>Email</th><th>Sesiones</th><th>Gestión</th></tr></thead>
                            <tbody>
                                {patients.map(p => (
                                    <tr key={p.email}>
                                        <td><strong>{p.name}</strong></td>
                                        <td>{p.email}</td>
                                        <td>{p.bookings.length}</td>
                                        <td><button className={styles.viewBtn} onClick={() => setSelectedPatient(p)}>Ficha</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {activeTab === 'bookings' && (
                        <table className={styles.proTable}>
                            <thead><tr><th>Nombre</th><th>Fecha</th><th>Status</th></tr></thead>
                            <tbody>
                                {bookings.map(b => (
                                    <tr key={b.id}>
                                        <td><strong>{b.name}</strong></td>
                                        <td>{new Date(b.appointmentDate || b.createdAt).toLocaleDateString()}</td>
                                        <td><span className={b.status === 'PAID' ? styles.statusOk : styles.statusPending}>{b.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {(activeTab === 'newsletter' || activeTab === 'marketing') && (
                        <div className={styles.editorialLayout}>
                            <div className={styles.editorialMain}>
                                <div className={styles.editorToolbar}>
                                    <button onClick={() => document.execCommand('bold')}>B</button>
                                    <button onClick={() => document.execCommand('italic')}>I</button>
                                    <div className={styles.aiHelper}>
                                        <input placeholder="IA Topic..." value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
                                        <button onClick={generateAIContent}>AI</button>
                                    </div>
                                </div>
                                <input className={styles.editorTitleInput} value={title} onChange={e => setTitle(e.target.value)} placeholder="Título..." />
                                <div id="rich-editor" className={styles.richEditor} contentEditable onInput={(e: any) => setContent(e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{ __html: content }} />
                                <div className={styles.editorFooter}>
                                    <button className={styles.primaryButton} onClick={handleSaveTemplate}>Guardar</button>
                                    {activeTab === 'newsletter' && selectedRecipients.length > 0 && (
                                        <button className={styles.syncBtn} onClick={handleSendToSelected}>Enviar a {selectedRecipients.length}</button>
                                    )}
                                </div>
                            </div>
                            <aside className={styles.editorialSidebar}>
                                {activeTab === 'newsletter' && (
                                    <div className={styles.sidebarSection}>
                                        <h4>Destinatarios</h4>
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
                                    </div>
                                )}
                                <div className={styles.sidebarSection}>
                                    <h4>Guardados</h4>
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
                    )}
                </div>
            </main>

            {selectedPatient && (
                <div className={styles.overlay} onClick={() => { setSelectedPatient(null); setIsEditing(false); }}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>{isEditing ? 'Editar' : 'Ficha'}</h2>
                        {isEditing ? (
                            <div className={styles.formGrid}>
                                <div className={styles.inputGroup}><label>Nombre</label><input className={styles.inputMain} value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} /></div>
                                <div className={styles.inputGroup}><label>Email</label><input className={styles.inputMain} value={editData.email} disabled /></div>
                                <button className={styles.primaryButton} onClick={handleUpdatePatient}>Guardar</button>
                            </div>
                        ) : (
                            <div>
                                <div className={styles.dataGroup}><h4>Datos</h4><div className={styles.dataItem}>Nombre: <strong>{selectedPatient.name}</strong></div><div className={styles.dataItem}>Email: <strong>{selectedPatient.email}</strong></div></div>
                                <div className={styles.dataGroup}><h4>Citas</h4>{selectedPatient.bookings.map((b: any) => <div key={b.id} className={styles.dataItem}>{new Date(b.appointmentDate || b.createdAt).toLocaleDateString()} - {b.serviceType}</div>)}</div>
                                <button className={styles.primaryButton} onClick={() => { setEditData(selectedPatient); setIsEditing(true); }}>Editar</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

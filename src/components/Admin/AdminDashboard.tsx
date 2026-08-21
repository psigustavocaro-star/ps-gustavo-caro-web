'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './AdminDashboard.module.css';
import { blogPosts } from '@/lib/data/blog';
import { newsletterSequence } from '@/lib/config/newsletter-content';
import { getInvoiceSessionSlots, getIssuedInvoiceSessionIds, stampIssuedInvoiceSessionIds } from '@/lib/invoice-sessions';

const getBookingStatusLabel = (status?: string) => {
    const normalizedStatus = (status || '').toUpperCase();
    if (normalizedStatus === 'PAID') return 'Pagado';
    if (normalizedStatus === 'PENDING') return 'Pendiente';
    if (normalizedStatus === 'FAILED') return 'Fallido';
    return status || 'Sin estado';
};

const getPaymentDate = (booking: any) => new Date(booking.paidAt || booking.createdAt);

const getServiceDisplayName = (serviceType?: string) => {
    const names: Record<string, string> = {
        primeraConsulta: 'Primera consulta',
        sesion: 'Psicoterapia individual',
        packSesiones: 'Pack de 4 sesiones',
        evalTDAH: 'Evaluación de TDAH',
        evalAutismo: 'Evaluación TEA (Autismo)',
        evalInteligencia: 'Evaluación intelectual',
        evalEmocional: 'Evaluación socioemocional',
    };

    return names[serviceType || ''] || serviceType || 'Servicio';
};

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
        // Re-hydrate session on refresh
        fetch('/api/auth/admin/me', { credentials: 'include' })
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (d?.authenticated) {
                    setIsAuthenticated(true);
                    fetchData();
                }
            })
            .catch(() => {});
    }, []);

    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [patientConsents, setPatientConsents] = useState<any[]>([]);
    const [loadingConsents, setLoadingConsents] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [showPreviousMonths, setShowPreviousMonths] = useState(false);
    
    const editorRef = useRef<HTMLDivElement>(null);

    // Carga histórico de consentimientos al abrir el detalle del paciente
    useEffect(() => {
        if (!selectedPatient?.email) {
            setPatientConsents([]);
            return;
        }
        setLoadingConsents(true);
        fetch(`/api/admin/consent-log?email=${encodeURIComponent(selectedPatient.email)}`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : null)
            .then(d => setPatientConsents(d?.consents || []))
            .catch(() => setPatientConsents([]))
            .finally(() => setLoadingConsents(false));
    }, [selectedPatient?.email]);

    const handleDownloadArcoExport = () => {
        if (!selectedPatient?.email) return;
        const url = `/api/admin/arco-export?email=${encodeURIComponent(selectedPatient.email)}`;
        window.open(url, '_blank');
    };

    const consentTypeLabel = (t: string) => {
        if (t === 'privacy') return '🛡️ Política de privacidad';
        if (t === 'newsletter') return '📧 Newsletter';
        if (t === 'cookies') return '🍪 Cookies';
        return t;
    };

    const consentContextLabel = (c?: string | null) => {
        if (!c) return '';
        if (c === 'booking-flow') return 'Agendamiento (Flow)';
        if (c === 'booking-flow-free') return 'Agendamiento gratuito';
        if (c === 'booking-flow-paypal') return 'Agendamiento (PayPal)';
        if (c === 'newsletter-double-optin') return 'Doble opt-in email';
        return c;
    };

    const currentMonthKey = useMemo(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }, []);

    const monthlyEarnings = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        return bookings
            .filter(b => {
                const date = getPaymentDate(b);
                return (b.status || '').toUpperCase() === 'PAID' &&
                       date.getMonth() === currentMonth &&
                       date.getFullYear() === currentYear;
            })
            .reduce((sum, b) => sum + (Number(b.amount) || 0), 0)
            .toLocaleString('es-CL');
    }, [bookings]);

    const earningsHistory = useMemo(() => {
        const monthlyMap = new Map<string, { key: string; label: string; total: number; count: number; date: Date }>();

        bookings
            .filter(b => (b.status || '').toUpperCase() === 'PAID')
            .forEach(b => {
                const paidDate = getPaymentDate(b);
                if (Number.isNaN(paidDate.getTime())) return;

                const key = `${paidDate.getFullYear()}-${String(paidDate.getMonth() + 1).padStart(2, '0')}`;
                const existing = monthlyMap.get(key) || {
                    key,
                    label: paidDate.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }),
                    total: 0,
                    count: 0,
                    date: new Date(paidDate.getFullYear(), paidDate.getMonth(), 1),
                };

                existing.total += Number(b.amount) || 0;
                existing.count += 1;
                monthlyMap.set(key, existing);
            });

        return Array.from(monthlyMap.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [bookings]);

    const previousMonths = useMemo(() => (
        earningsHistory.filter(month => month.key !== currentMonthKey)
    ), [currentMonthKey, earningsHistory]);

    const calendarEntries = useMemo<any[]>(() => (
        bookings.flatMap<any>((booking: any) => {
            const sessionSlots = getInvoiceSessionSlots(booking);

            if (sessionSlots.length <= 1) {
                return [{ booking, session: null, sessionCount: 1 }];
            }

            return sessionSlots.map((session) => ({ booking, session, sessionCount: sessionSlots.length }));
        }).sort((first, second) => {
            const firstDate = first.session?.date || first.booking.appointmentDate || first.booking.createdAt;
            const secondDate = second.session?.date || second.booking.appointmentDate || second.booking.createdAt;
            const firstTime = first.session && !first.session.date ? Number.MAX_SAFE_INTEGER : Date.parse(firstDate);
            const secondTime = second.session && !second.session.date ? Number.MAX_SAFE_INTEGER : Date.parse(secondDate);
            return firstTime - secondTime;
        })
    ), [bookings]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/data');
            const data = await res.json();
            if (data.success) {
                setBookings(data.bookings || []);
                setPatients(data.patients || []);
                setNewsletterSubs((data.newsletter || []).filter((sub: any) => sub.active !== false));
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
        } catch { alert('Error de conexión'); }
        finally { setIsLoading(false); }
    };

    const updateBookingInState = (updatedBooking: any) => {
        setBookings(currentBookings => currentBookings.map(booking => (
            booking.id === updatedBooking.id ? { ...booking, ...updatedBooking } : booking
        )));
        setPatients(currentPatients => currentPatients.map((patient: any) => {
            if (!patient.bookings?.some((booking: any) => booking.id === updatedBooking.id)) {
                return patient;
            }

            return {
                ...patient,
                bookings: patient.bookings.map((booking: any) => (
                    booking.id === updatedBooking.id ? { ...booking, ...updatedBooking } : booking
                )),
            };
        }));
        setSelectedPatient((currentPatient: any) => {
            if (!currentPatient?.bookings) return currentPatient;
            return {
                ...currentPatient,
                bookings: currentPatient.bookings.map((booking: any) => (
                    booking.id === updatedBooking.id ? { ...booking, ...updatedBooking } : booking
                )),
            };
        });
    };

    const handleToggleSiiReceipt = async (booking: any, issued: boolean) => {
        if (issued && getIssuedInvoiceSessionIds(booking).length > 0 && !confirm('Esto marcará una boleta única para todo el proceso y borrará las marcas por sesión. ¿Continuar?')) {
            return;
        }

        const previousBooking = { ...booking };
        const optimisticBooking = {
            ...booking,
            siiReceiptIssued: issued,
            siiReceiptIssuedAt: issued ? new Date().toISOString() : null,
        };

        updateBookingInState(optimisticBooking);

        try {
            const res = await fetch(`/api/admin/bookings/${encodeURIComponent(booking.id)}/sii-receipt`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ issued }),
            });
            const data = await res.json();

            if (!data.success) {
                updateBookingInState(previousBooking);
                alert(data.error || 'No se pudo actualizar la boleta SII');
                return;
            }

            updateBookingInState(data.booking);
        } catch {
            updateBookingInState(previousBooking);
            alert('Error de conexión al actualizar la boleta SII');
        }
    };

    const handleToggleSessionReceipt = async (booking: any, sessionId: string, issued: boolean) => {
        if (booking.siiReceiptIssued && !confirm('Esta reserva está marcada con boleta única. Al registrar una sesión por separado se cambiará a modalidad por sesión. ¿Continuar?')) {
            return;
        }

        const previousBooking = { ...booking };
        const currentSessionIds = getIssuedInvoiceSessionIds(booking);
        const optimisticBooking = {
            ...booking,
            siiReceiptIssued: false,
            siiReceiptIssuedAt: null,
            details: stampIssuedInvoiceSessionIds(
                booking.details,
                issued
                    ? Array.from(new Set([...currentSessionIds, sessionId]))
                    : currentSessionIds.filter((id) => id !== sessionId),
            ),
        };

        updateBookingInState(optimisticBooking);

        try {
            const res = await fetch(`/api/admin/bookings/${encodeURIComponent(booking.id)}/sii-receipt`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ issued, sessionId }),
            });
            const data = await res.json();

            if (!data.success) {
                updateBookingInState(previousBooking);
                alert(data.error || 'No se pudo actualizar la boleta de esta sesión');
                return;
            }

            updateBookingInState(data.booking);
        } catch {
            updateBookingInState(previousBooking);
            alert('Error de conexión al actualizar la boleta de esta sesión');
        }
    };

    const renderSiiReceiptToggle = (booking: any) => {
        const sessionSlots = getInvoiceSessionSlots(booking);
        const issuedSessionCount = getIssuedInvoiceSessionIds(booking).filter((id) => sessionSlots.some((session) => session.id === id)).length;
        const hasMultipleSessions = sessionSlots.length > 1;

        return (
        <label className={`${styles.receiptToggle} ${booking.siiReceiptIssued ? styles.receiptToggleOn : ''}`}>
            <input
                type="checkbox"
                checked={Boolean(booking.siiReceiptIssued)}
                onChange={event => handleToggleSiiReceipt(booking, event.target.checked)}
            />
            <span className={styles.receiptCheck}>{booking.siiReceiptIssued ? '✓' : ''}</span>
            <span>
                <strong>{hasMultipleSessions ? 'Boleta única' : 'Boleta SII'}</strong>
                <small>{booking.siiReceiptIssued ? 'Emitida' : hasMultipleSessions ? `${issuedSessionCount}/${sessionSlots.length} por sesión` : 'Por emitir'}</small>
            </span>
        </label>
        );
    };

    const renderCalendarReceiptToggle = (booking: any, session: any) => {
        if (!session) return renderSiiReceiptToggle(booking);

        if (booking.siiReceiptIssued) {
            return <span className={styles.sessionInvoiceStatus}>Boleta unica emitida</span>;
        }

        const hasDate = Boolean(session.date);
        const issued = getIssuedInvoiceSessionIds(booking).includes(session.id);

        return (
            <label className={styles.sessionInvoiceControl}>
                <input
                    type="checkbox"
                    checked={issued}
                    disabled={!hasDate}
                    onChange={event => handleToggleSessionReceipt(booking, session.id, event.target.checked)}
                />
                <span>{issued ? 'Boleta emitida' : hasDate ? 'Marcar boleta' : 'Pendiente de agendar'}</span>
            </label>
        );
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
        } catch { alert('Error al procesar eliminación'); }
        finally { setIsLoading(false); }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });
            if (res.ok) {
                setIsAuthenticated(true);
                setPassword('');
                fetchData();
            } else {
                const data = await res.json().catch(() => ({ error: 'Error' }));
                alert(data.error || 'Credenciales inválidas');
            }
        } catch {
            alert('Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/admin/logout', { method: 'POST', credentials: 'include' });
        } catch {}
        setIsAuthenticated(false);
        setBookings([]);
        setPatients([]);
        setNewsletterSubs([]);
    };

    const formatRutForDisplay = (rut?: string) => {
        if (!rut) return 'Aún no registrado';
        const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
        if (cleanRut.length < 2) return rut;
        return `${cleanRut.slice(0, -1)}-${cleanRut.slice(-1)}`;
    };

    const getPaidBookings = (patientBookings: any[] = []) => (
        patientBookings.filter((booking) => (booking.status || '').toUpperCase() === 'PAID')
    );

    const openPatientFromBooking = (booking: any) => {
        const bookingEmail = booking.email?.trim().toLowerCase();
        const patient = patients.find((candidate) => candidate.email?.trim().toLowerCase() === bookingEmail);

        if (!patient) {
            alert('No se encontró una ficha asociada a esta reserva. Actualiza los datos e inténtalo nuevamente.');
            return;
        }

        setSelectedPatient(patient);
        setIsEditing(false);
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
        const activeRecipientCount = newsletterSubs.filter(sub => sub.active !== false).length;
        if (activeRecipientCount === 0) return alert('No hay pacientes activos en la lista de newsletter');
        if (!confirm(`¿Enviar a todos tus ${activeRecipientCount} pacientes?`)) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/newsletter/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId: editingTemplate?.id || null, target: 'all', customTitle: title, customContent: content }),
            });
            const data = await res.json();
            if (data.success) {
                alert(`🚀 ¡Correo enviado a ${data.sentCount ?? data.count} personas!`);
            } else if (data.partial) {
                alert(`⚠️ Envío parcial: llegó a ${data.sentCount} de ${data.count} personas. Fallaron ${data.failedCount}.`);
            } else {
                alert(`❌ Error al enviar el correo: ${data.error}`);
            }
        } catch { alert('Hubo un error de red al intentar enviar'); }
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
                if (data.success || data.partial) {
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
        } catch { alert('Ocurrió un error en el envío de red'); }
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
        } catch { alert('No pudimos guardarlo en este momento'); }
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
                        <button type="submit" className={styles.authSubmit} disabled={isLoading}>{isLoading ? 'Verificando...' : 'Entrar a la Clínica'}</button>
                    </form>
                    <div style={{ marginTop: '24px' }}>
                        <Link href="/" style={{ color: '#06b6d4', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>
                            ← Regresar a la página principal
                        </Link>
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
                            <Image src={profilePic} alt="Tú" className={styles.profileImg} width={96} height={96} unoptimized />
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

                <div className={styles.publicLinks}>
                    <span>Ir a la web</span>
                    <div>
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Inicio</Link>
                        <Link href="/agendar" onClick={() => setIsMobileMenuOpen(false)}>Agendar</Link>
                        <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
                        <Link href="/sobre-mi" onClick={() => setIsMobileMenuOpen(false)}>Sobre mí</Link>
                    </div>
                </div>
                
                <button onClick={handleLogout} className={styles.logoutAction}>Cerrar Sesión</button>
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
                            <h3>Citas Pagadas</h3>
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

                <div className={styles.historyLauncher}>
                    <div>
                        <span>Historial de ingresos</span>
                        <p>El mes actual se mantiene arriba; los meses cerrados quedan archivados aquí.</p>
                    </div>
                    <button
                        className={styles.historyToggle}
                        onClick={() => setShowPreviousMonths(current => !current)}
                        disabled={previousMonths.length === 0}
                    >
                        {showPreviousMonths ? 'Ocultar meses anteriores' : 'Ver meses anteriores'}
                    </button>
                </div>

                {showPreviousMonths && (
                    <section className={styles.earningsHistory}>
                        <div className={styles.historyHeader}>
                            <div>
                                <span>Meses anteriores</span>
                                <h2>Historial mensual detallado</h2>
                            </div>
                            <small>Ordenado desde el mes más reciente.</small>
                        </div>
                        {previousMonths.length > 0 ? (
                            <div className={styles.historyGrid}>
                                {previousMonths.map(month => (
                                <div key={`${month.date.getFullYear()}-${month.date.getMonth()}`} className={styles.historyItem}>
                                    <span>{month.label}</span>
                                    <strong>${month.total.toLocaleString('es-CL')}</strong>
                                    <small>{month.count} pago{month.count === 1 ? '' : 's'} confirmado{month.count === 1 ? '' : 's'}</small>
                                    <em>Promedio ${(Math.round(month.total / Math.max(month.count, 1))).toLocaleString('es-CL')} por pago</em>
                                </div>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.emptyHistory}>Todavía no hay meses anteriores con pagos confirmados.</p>
                        )}
                    </section>
                )}

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
                            <p className={styles.calendarIntro}>Cada cita y sesión se ordena por fecha para que puedas revisar sus boletas a tiempo.</p>
                            <table className={styles.friendlyTable}>
                                <thead><tr><th>Paciente</th><th>Fecha de Cita</th><th>Tipo de Servicio</th><th>Monto</th><th>Situación</th><th>Boleta</th><th>Ficha</th></tr></thead>
                                <tbody>{calendarEntries.map(({ booking, session, sessionCount }) => {
                                    const date = session?.date || booking.appointmentDate || booking.createdAt;
                                    const hasDate = Boolean(session?.date || booking.appointmentDate);
                                    const amount = session ? (Number(booking.amount) || 0) / sessionCount : Number(booking.amount) || 0;

                                    return (
                                        <tr key={session ? `${booking.id}-${session.id}` : booking.id}>
                                            <td>{booking.name}</td>
                                            <td>{hasDate ? <>{new Date(date).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })} - {new Date(date).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</> : <span className={styles.pendingDate}>Pendiente de agendar</span>}</td>
                                            <td>
                                                <span>{getServiceDisplayName(booking.serviceType)}</span>
                                                {session && <small className={styles.calendarSessionMeta}>Sesion {session.number} de {sessionCount}</small>}
                                            </td>
                                            <td style={{fontWeight: 700, color: '#0f172a'}}>${amount.toLocaleString('es-CL')}{session && <small className={styles.calendarSessionMeta}>por sesion</small>}</td>
                                            <td><span className={`${styles.badge} ${styles.badgeCalypso}`}>{getBookingStatusLabel(booking.status)}</span></td>
                                            <td>{renderCalendarReceiptToggle(booking, session)}</td>
                                            <td><button className={styles.bookingPatientBtn} onClick={() => openPatientFromBooking(booking)}>Abrir ficha</button></td>
                                        </tr>
                                    );
                                })}</tbody>
                            </table>
                            <div className={styles.mobileCards}>
                                {calendarEntries.map(({ booking, session, sessionCount }) => {
                                    const date = session?.date || booking.appointmentDate || booking.createdAt;
                                    const hasDate = Boolean(session?.date || booking.appointmentDate);
                                    const amount = session ? (Number(booking.amount) || 0) / sessionCount : Number(booking.amount) || 0;

                                    return (
                                    <div key={session ? `${booking.id}-${session.id}` : booking.id} className={styles.mobileCard}>
                                        <div className={styles.cardInfo}>
                                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                                <strong>{booking.name}</strong>
                                                <span style={{fontWeight: 800, color: '#0891b2'}}>${amount.toLocaleString('es-CL')}{session ? ' por sesion' : ''}</span>
                                            </div>
                                            <span>{hasDate ? <>{new Date(date).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })} - {new Date(date).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</> : 'Pendiente de agendar'}</span>
                                            <span className={styles.cardSubtitle}>{getServiceDisplayName(booking.serviceType)}{session ? ` · Sesion ${session.number} de ${sessionCount}` : ''}</span>
                                        </div>
                                        <div className={styles.mobileBookingFooter}>
                                            <span className={`${styles.badge} ${styles.badgeCalypso}`}>{getBookingStatusLabel(booking.status)}</span>
                                            {renderCalendarReceiptToggle(booking, session)}
                                            <button className={styles.bookingPatientBtn} onClick={() => openPatientFromBooking(booking)}>Abrir ficha</button>
                                        </div>
                                    </div>
                                    );
                                })}
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
                            <div className={styles.dataGrid}>
                                <div className={styles.dataField}><label>Nombre Principal</label><input value={editData.firstName} onChange={e => setEditData({...editData, firstName: e.target.value})} /></div>
                                <div className={styles.dataField}><label>Segundo Nombre</label><input value={editData.secondName || ''} onChange={e => setEditData({...editData, secondName: e.target.value})} /></div>
                                <div className={styles.dataField}><label>Primer Apellido</label><input value={editData.firstSurname} onChange={e => setEditData({...editData, firstSurname: e.target.value})} /></div>
                                <div className={styles.dataField}><label>Segundo Apellido</label><input value={editData.secondSurname || ''} onChange={e => setEditData({...editData, secondSurname: e.target.value})} /></div>
                                <div className={styles.dataField}><label>Nº de RUT</label><input value={editData.rut} onChange={e => setEditData({...editData, rut: e.target.value})} /></div>
                                <div className={styles.dataField}><label>Correo Electrónico</label><input value={editData.email} disabled style={{opacity: 0.5}} /></div>
                                <div className={styles.dataField}><label>Teléfono</label><input value={editData.phone || ''} onChange={e => setEditData({...editData, phone: e.target.value})} /></div>
                                <div className={styles.dataField}><label>Dirección y Comuna</label><input value={editData.address || ''} onChange={e => setEditData({...editData, address: e.target.value})} placeholder="Ej: Las Lilas 123, Providencia" /></div>
                            </div>
                        ) : (
                            <div>
                                <div className={styles.dataGrid}>
                                    <div className={styles.dataField}><label>Identidad</label><span>{[selectedPatient.firstName, selectedPatient.secondName, selectedPatient.firstSurname, selectedPatient.secondSurname].filter(Boolean).join(' ').trim() || selectedPatient.name || 'Sin Nombre'}</span></div>
                                    <div className={styles.dataField}><label>Identificador (RUT)</label><span>{formatRutForDisplay(selectedPatient.rut)}</span></div>
                                    <div className={styles.dataField}><label>Correo Electrónico</label><span>{selectedPatient.email || 'No especificado'}</span></div>
                                    <div className={styles.dataField}><label>Contacto Telefónico</label><span>{selectedPatient.phone || 'No especificado'}</span></div>
                                    <div className={styles.dataField}><label>Residencia</label><span>{[selectedPatient.address, selectedPatient.commune, selectedPatient.region].filter(Boolean).join(', ') || 'Sin detalles'}</span></div>
                                </div>
                                
                                <div className={styles.sessionsBox}>
                                    <h3>🛡️ Consentimientos registrados ({patientConsents.length})</h3>
                                    {loadingConsents ? (
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', padding: '8px 0' }}>Cargando...</p>
                                    ) : patientConsents.length === 0 ? (
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', padding: '8px 0' }}>
                                            No hay consentimientos registrados aún. (Los consentimientos empiezan a registrarse desde la última actualización del sitio.)
                                        </p>
                                    ) : (
                                        <div className={styles.sessionsScroll}>
                                            {patientConsents.map((c: any) => (
                                                <div key={c.id} className={styles.sessionLine} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>{consentTypeLabel(c.type)}</div>
                                                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                                            Versión política: {c.version} · Contexto: {consentContextLabel(c.context) || '—'}
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: '0.78rem', color: '#334155', textAlign: 'right' }}>
                                                        <div>{new Date(c.createdAt).toLocaleString('es-CL')}</div>
                                                        {c.ip && <div style={{ color: '#94a3b8' }}>IP: {c.ip}</div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div style={{ marginTop: 12 }}>
                                        <button
                                            className={styles.syncBtn}
                                            style={{ backgroundColor: 'rgba(8, 145, 178, 0.1)', color: '#0891b2', borderColor: 'rgba(8, 145, 178, 0.2)' }}
                                            onClick={handleDownloadArcoExport}
                                        >
                                            📥 Descargar datos personales (JSON ARCO)
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.sessionsBox}>
                                    <h3>💳 Historial de pagos ({getPaidBookings(selectedPatient.bookings).length})</h3>
                                    {getPaidBookings(selectedPatient.bookings).length > 0 ? (
                                        <div className={styles.sessionsScroll}>
                                            {getPaidBookings(selectedPatient.bookings).map((b: any, i: number) => {
                                                const invoiceSessions = getInvoiceSessionSlots(b);
                                                const issuedSessionIds = getIssuedInvoiceSessionIds(b);
                                                const hasMultipleSessions = invoiceSessions.length > 1;

                                                if (!hasMultipleSessions) {
                                                    return (
                                                        <div key={b.id || i} className={styles.sessionLine}>
                                                            <div style={{display: 'flex', flexDirection: 'column'}}>
                                                                <span className={styles.sessionDate}>{new Date(b.appointmentDate || b.createdAt).toLocaleDateString('es-CL')}</span>
                                                                <span className={styles.sessionService}>{b.serviceType}</span>
                                                            </div>
                                                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                                                                <span style={{fontWeight: 800, fontSize: '0.9rem', color: '#0f172a'}}>${(Number(b.amount) || 0).toLocaleString('es-CL')}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                const amountPerSession = Math.round((Number(b.amount) || 0) / invoiceSessions.length);

                                                return (
                                                    <div key={b.id || i} className={styles.invoiceBookingGroup}>
                                                        <div className={styles.invoiceBookingHeader}>
                                                            <div>
                                                                <strong>{b.serviceType}</strong>
                                                                <span>{invoiceSessions.length} sesiones incluidas</span>
                                                            </div>
                                                            <strong>${(Number(b.amount) || 0).toLocaleString('es-CL')}</strong>
                                                        </div>
                                                        <label className={styles.invoiceModeToggle}>
                                                            <input
                                                                type="checkbox"
                                                                checked={Boolean(b.siiReceiptIssued)}
                                                                onChange={(event) => handleToggleSiiReceipt(b, event.target.checked)}
                                                            />
                                                            <span>Boleta única para todo el proceso</span>
                                                        </label>
                                                        <div className={styles.sessionReceiptList}>
                                                            {invoiceSessions.map((session) => {
                                                                const issuedForSession = issuedSessionIds.includes(session.id);
                                                                const sessionLabel = session.date
                                                                    ? `${new Date(session.date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })} · Sesión ${session.number}`
                                                                    : `Sesión ${session.number}`;

                                                                return (
                                                                    <label key={session.id} className={`${styles.sessionReceipt} ${issuedForSession || b.siiReceiptIssued ? styles.sessionReceiptOn : ''}`}>
                                                                        <span>
                                                                            <strong>{sessionLabel}</strong>
                                                                            <small>${amountPerSession.toLocaleString('es-CL')} aprox.</small>
                                                                        </span>
                                                                        {b.siiReceiptIssued ? (
                                                                            <em>Incluida en boleta única</em>
                                                                        ) : (
                                                                            <span className={styles.sessionReceiptControl}>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={issuedForSession}
                                                                                    onChange={(event) => handleToggleSessionReceipt(b, session.id, event.target.checked)}
                                                                                />
                                                                                <span>{issuedForSession ? 'Boleta emitida' : 'Marcar boleta'}</span>
                                                                            </span>
                                                                        )}
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p style={{color: '#94a3b8', fontSize: '0.9rem'}}>No hay pagos registrados todavía.</p>
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

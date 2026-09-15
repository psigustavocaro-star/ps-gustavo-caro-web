'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './AdminDashboard.module.css';
import { blogPosts } from '@/lib/data/blog';
import { newsletterSequence } from '@/lib/config/newsletter-content';
import {
    getCompletedSessionNumbers,
    getIncludedSessionCount,
    getInvoiceSessionSlots,
    getIssuedInvoiceSessionIds,
    getSessionAlignedAppointmentDates,
    stampCompletedSessionNumbers,
    stampIssuedInvoiceSessionIds,
} from '@/lib/invoice-sessions';
import Requests from '@/app/admingustavo/solicitudes/requests';
import AdminDateTimePicker from './AdminDateTimePicker';

const getBookingStatusLabel = (status?: string) => {
    const normalizedStatus = (status || '').toUpperCase();
    if (normalizedStatus === 'PAID') return 'Pagado';
    if (normalizedStatus === 'PENDING') return 'Pendiente';
    if (normalizedStatus === 'FAILED') return 'Fallido';
    return status || 'Sin estado';
};

const getScheduledRevenueEntries = (booking: any) => {
    const sessions = getInvoiceSessionSlots(booking);
    const amountPerSession = (Number(booking.amount) || 0) / sessions.length;

    return sessions
        .filter(session => session.date)
        .map(session => ({ date: new Date(session.date as string), amount: amountPerSession }));
};

const getRescheduleState = (booking: any, appointmentIndex: number) => {
    const cancellation = booking.appointmentCancellations?.find((item: any) =>
        item.appointmentIndex === appointmentIndex && !item.rebookedAt
    );

    if (!cancellation) return { awaiting: false, needsAttention: false };

    // Un enlace de reprogramación solo es válido cuando el evento anterior ya
    // está cancelado en Cal.com y el paciente efectivamente recibió su correo.
    // Antes, un intento fallido se veía como si estuviera listo.
    return {
        awaiting: Boolean(cancellation.calCancelledAt && cancellation.emailSentAt),
        needsAttention: !cancellation.calCancelledAt || !cancellation.emailSentAt,
    };
};

const toDateTimeLocal = (value: string) => {
    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

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

const manualServiceOptions = [
    { value: 'sesion', label: 'Psicoterapia individual', price: 36000 },
    { value: 'primeraConsulta', label: 'Primera consulta', price: 0 },
    { value: 'packSesiones', label: 'Pack de 4 sesiones', price: 140000 },
    { value: 'evalTDAH', label: 'Evaluación TDAH', price: 135000 },
    { value: 'evalAutismo', label: 'Evaluación TEA (Autismo)', price: 220000 },
    { value: 'evalWiscV', label: 'Evaluación WISC-V', price: 135000 },
    { value: 'evalInteligencia', label: 'Evaluación intelectual', price: 160000 },
    { value: 'evalNeuropsicologica', label: 'Evaluación neuropsicológica', price: 135000 },
    { value: 'evalEmocional', label: 'Evaluación socioemocional', price: 140000 },
];

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [bookings, setBookings] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [newsletterSubs, setNewsletterSubs] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'newsletter' | 'marketing' | 'requests'>('overview');
    const [agendaView, setAgendaView] = useState<'scheduled' | 'completed'>('scheduled');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [contentPreview, setContentPreview] = useState(false);
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
    const [preheader, setPreheader] = useState('');
    const [content, setContent] = useState('');
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [campaignView, setCampaignView] = useState<'drafts' | 'sent' | 'planned'>('drafts');
    const [contentPosts, setContentPosts] = useState<any[]>([]);
    const [articleDraft, setArticleDraft] = useState({ slug: '', title: '', excerpt: '', category: 'Salud Mental', image: '/images/blog/ansiedad.jpg', keywords: '', status: 'DRAFT' });
    const [showPreviousMonths, setShowPreviousMonths] = useState(false);
    const [rescheduleModal, setRescheduleModal] = useState<{ mode: 'day' | 'individual'; booking?: any; appointmentIndex?: number; label?: string } | null>(null);
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleReason, setRescheduleReason] = useState('');
    const [dateEditModal, setDateEditModal] = useState<{ booking: any; appointmentIndex: number; label: string } | null>(null);
    const [editedAppointmentDate, setEditedAppointmentDate] = useState('');
    const [manualBookingModal, setManualBookingModal] = useState(false);
    const [manualBooking, setManualBooking] = useState({ name: '', email: '', phone: '', serviceType: 'sesion', amount: '36000', completedSessions: 0, appointmentDates: [''], sendEmail: true });
    
    const editorRef = useRef<HTMLDivElement>(null);
    const articleEditorRef = useRef<HTMLDivElement>(null);

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
            .filter(b => (b.status || '').toUpperCase() === 'PAID')
            .flatMap(getScheduledRevenueEntries)
            .filter(({ date }) => date.getMonth() === currentMonth && date.getFullYear() === currentYear)
            .reduce((sum, session) => sum + session.amount, 0)
            .toLocaleString('es-CL');
    }, [bookings]);

    const earningsHistory = useMemo(() => {
        const monthlyMap = new Map<string, { key: string; label: string; total: number; count: number; date: Date }>();

        bookings
            .filter(b => (b.status || '').toUpperCase() === 'PAID')
            .flatMap(getScheduledRevenueEntries)
            .forEach(({ date, amount }) => {
                if (Number.isNaN(date.getTime())) return;

                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const existing = monthlyMap.get(key) || {
                    key,
                    label: date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }),
                    total: 0,
                    count: 0,
                    date: new Date(date.getFullYear(), date.getMonth(), 1),
                };

                existing.total += amount;
                existing.count += 1;
                monthlyMap.set(key, existing);
            });

        return Array.from(monthlyMap.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [bookings]);

    const previousMonths = useMemo(() => (
        earningsHistory.filter(month => month.key !== currentMonthKey)
    ), [currentMonthKey, earningsHistory]);

    const manualIncludedSessions = getIncludedSessionCount(manualBooking.serviceType);
    const manualRemainingSessions = manualIncludedSessions - manualBooking.completedSessions;

    const allCalendarEntries = useMemo<any[]>(() => (
        bookings.flatMap<any>((booking: any) => {
            const sessionSlots = getInvoiceSessionSlots(booking);
            return sessionSlots.map((session) => ({ booking, session, sessionCount: sessionSlots.length }));
        }).sort((first, second) => {
            const firstDate = first.session?.date || first.booking.appointmentDate || first.booking.createdAt;
            const secondDate = second.session?.date || second.booking.appointmentDate || second.booking.createdAt;
            const firstTime = first.session && !first.session.date ? Number.MAX_SAFE_INTEGER : Date.parse(firstDate);
            const secondTime = second.session && !second.session.date ? Number.MAX_SAFE_INTEGER : Date.parse(secondDate);
            const firstIsPending = first.session && !first.session.date;
            const secondIsPending = second.session && !second.session.date;

            if (firstIsPending) return 1;
            if (secondIsPending) return -1;
            return secondTime - firstTime;
        })
    ), [bookings]);

    const calendarEntries = useMemo(
        () => allCalendarEntries.filter(({ session }) => agendaView === 'completed' ? session.completed : !session.completed),
        [agendaView, allCalendarEntries],
    );

    const overviewMetrics = useMemo(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const end = start + 86_400_000;
        const scheduled = allCalendarEntries.filter(({ session }) => !session.completed && session.date);
        const today = scheduled.filter(({ session }) => {
            const time = Date.parse(session.date);
            return time >= start && time < end;
        });
        const next = scheduled
            .filter(({ session }) => Date.parse(session.date) >= now.getTime())
            .sort((first, second) => Date.parse(first.session.date) - Date.parse(second.session.date))
            .slice(0, 5);
        const needsAttention = scheduled.filter(({ booking, session }) => (
            getRescheduleState(booking, session.appointmentIndex ?? 0).needsAttention
        )).length;
        return { today, next, needsAttention };
    }, [allCalendarEntries]);
    const editorialPosts = useMemo(() => {
        const managedBySlug = new Map(contentPosts.map((post) => [post.slug, post]));
        const staticPosts = blogPosts.map((post) => {
            const managed = managedBySlug.get(post.slug);
            return {
                ...post,
                ...(managed || {}),
                status: managed?.status || 'PUBLISHED',
                date: managed?.publishedAt || post.date,
            };
        });
        const newPosts = contentPosts.filter((post) => !blogPosts.some((staticPost) => staticPost.slug === post.slug));
        return [...newPosts, ...staticPosts].sort((a, b) => Date.parse(String(b.updatedAt || b.date)) - Date.parse(String(a.updatedAt || a.date)));
    }, [contentPosts]);

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
                setContentPosts(data.contentPosts || []);
                setLastUpdated(new Date());
            }
        } catch (err) { console.error("Sync Error:", err); } 
        finally { setIsLoading(false); }
    };

    useEffect(() => {
        if (!isAuthenticated) return;
        const interval = window.setInterval(() => { void fetchData(); }, 60_000);
        return () => window.clearInterval(interval);
        // fetchData deliberately uses only current setters and is refreshed once a minute.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

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

    const openDayReschedule = () => {
        setRescheduleDate(new Date().toISOString().slice(0, 10));
        setRescheduleReason('');
        setRescheduleModal({ mode: 'day' });
    };

    const openIndividualReschedule = (booking: any, appointmentIndex: number, date?: string) => {
        setRescheduleDate(date ? new Date(date).toISOString().slice(0, 10) : '');
        setRescheduleReason('');
        setRescheduleModal({
            mode: 'individual', booking, appointmentIndex,
            label: `${booking.name || 'Paciente'}${date ? ` · ${new Date(date).toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}` : ''}`,
        });
    };

    const openDateEdit = (booking: any, appointmentIndex: number, date: string) => {
        setEditedAppointmentDate(toDateTimeLocal(date));
        setDateEditModal({ booking, appointmentIndex, label: `${booking.name || 'Paciente'} · ${new Date(date).toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}` });
    };

    const submitDateEdit = async () => {
        if (!dateEditModal || !editedAppointmentDate) return;
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/bookings/${dateEditModal.booking.id}/appointment`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentIndex: dateEditModal.appointmentIndex, appointmentDate: new Date(editedAppointmentDate).toISOString() }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || 'No fue posible modificar la fecha.');
            alert('Fecha actualizada. Cal.com envió la invitación actualizada al paciente.');
            setDateEditModal(null);
            fetchData();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'No fue posible modificar la fecha.');
        } finally {
            setIsLoading(false);
        }
    };

    const submitReschedule = async () => {
        if (!rescheduleModal) return;
        if (rescheduleModal.mode === 'day' && !/^\d{4}-\d{2}-\d{2}$/.test(rescheduleDate)) {
            alert('Selecciona una fecha para continuar.');
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/appointment-cancellations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rescheduleModal.mode === 'day'
                    ? { date: rescheduleDate, reason: rescheduleReason }
                    : { bookingId: rescheduleModal.booking.id, appointmentIndex: rescheduleModal.appointmentIndex, reason: rescheduleReason }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || 'No fue posible iniciar la reprogramación.');
            const summary = data.summary;
            const failures = summary.failed ? `\n\nHubo ${summary.failed} caso(s) que no se pudo completar. Puedes volver a intentarlo: no se duplicarán los correos ya enviados.` : '';
            alert(`Listo: ${summary.cancelled} evento(s) cancelado(s) en Cal.com y ${summary.emailed} correo(s) enviado(s) para ${summary.affected} sesión(es).${failures}`);
            setRescheduleModal(null);
            fetchData();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'No fue posible iniciar la reprogramación.');
        } finally {
            setIsLoading(false);
        }
    };

    const openManualBooking = () => {
        setManualBooking({ name: '', email: '', phone: '', serviceType: 'sesion', amount: '36000', completedSessions: 0, appointmentDates: [''], sendEmail: true });
        setManualBookingModal(true);
    };

    const updateManualDate = (index: number, value: string) => {
        setManualBooking(current => ({ ...current, appointmentDates: current.appointmentDates.map((date, itemIndex) => itemIndex === index ? value : date) }));
    };

    const submitManualBooking = async () => {
        const appointmentDates = manualBooking.appointmentDates.filter(Boolean).map(date => new Date(date).toISOString());
        if (!manualBooking.name.trim() || !manualBooking.email.trim() || !appointmentDates.length) {
            alert('Completa el nombre, correo y al menos una fecha para continuar.');
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/manual-bookings', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...manualBooking, appointmentDates }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || 'No fue posible registrar el pago.');
            alert(`Pago registrado como pagado. ${data.scheduledInCal ? `${data.scheduledInCal} cita(s) creada(s) en Cal.com.` : 'La cita quedó registrada en la agenda.'}`);
            setManualBookingModal(false);
            fetchData();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'No fue posible registrar el pago.');
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
        const sessionSlots = getInvoiceSessionSlots(booking);
        const optimisticBooking = {
            ...booking,
            siiReceiptIssued: issued,
            siiReceiptIssuedAt: issued ? new Date().toISOString() : null,
            details: stampCompletedSessionNumbers(
                stampIssuedInvoiceSessionIds(booking.details, []),
                issued ? sessionSlots.map((session) => session.number) : [],
            ),
            appointmentDates: booking.appointmentDates?.length ? getSessionAlignedAppointmentDates(booking) : booking.appointmentDates,
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
        const sessionNumber = Number(sessionId.replace('session-', ''));
        const currentCompletedNumbers = getCompletedSessionNumbers(booking);
        const optimisticBooking = {
            ...booking,
            siiReceiptIssued: false,
            siiReceiptIssuedAt: null,
            details: stampCompletedSessionNumbers(
                stampIssuedInvoiceSessionIds(
                    booking.details,
                    issued
                        ? Array.from(new Set([...currentSessionIds, sessionId]))
                        : currentSessionIds.filter((id) => id !== sessionId),
                ),
                issued
                    ? Array.from(new Set([...currentCompletedNumbers, sessionNumber]))
                    : currentCompletedNumbers.filter((number) => number !== sessionNumber),
            ),
            appointmentDates: booking.appointmentDates?.length ? getSessionAlignedAppointmentDates(booking) : booking.appointmentDates,
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
        if (!session || getInvoiceSessionSlots(booking).length === 1) return renderSiiReceiptToggle(booking);

        if (booking.siiReceiptIssued) {
            return <span className={styles.sessionInvoiceStatus}>Boleta unica emitida</span>;
        }

        const hasDate = Boolean(session.date);
        const issued = getIssuedInvoiceSessionIds(booking).includes(session.id);

        return (
            <label className={`${styles.receiptToggle} ${issued ? styles.receiptToggleOn : ''} ${!hasDate ? styles.receiptToggleDisabled : ''}`}>
                <input
                    type="checkbox"
                    checked={issued}
                    disabled={!hasDate}
                    onChange={event => handleToggleSessionReceipt(booking, session.id, event.target.checked)}
                />
                <span className={styles.receiptCheck}>{issued ? '✓' : ''}</span>
                <span>
                    <strong>Boleta SII</strong>
                    <small>{issued ? 'Emitida' : hasDate ? 'Por emitir' : 'Pendiente de agendar'}</small>
                </span>
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
                body: JSON.stringify({ templateId: editingTemplate?.id || null, target: 'all', customTitle: title, customPreheader: preheader, customContent: content }),
            });
            const data = await res.json();
            if (data.success) {
                alert(`🚀 ¡Correo enviado a ${data.sentCount ?? data.count} personas!`);
                setEditingTemplate(data.campaign);
                setCampaignView('sent');
                fetchData();
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
        try {
            const res = await fetch('/api/admin/newsletter/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId: editingTemplate?.id || null, target: 'specific', specificEmails: selectedRecipients, customTitle: title, customPreheader: preheader, customContent: content }),
            });
            const data = await res.json();
            if (data.success) {
                alert(`✅ Enviado con éxito a ${data.sentCount} pacientes.`);
                setSelectedRecipients([]);
                setEditingTemplate(data.campaign);
                setCampaignView('sent');
                fetchData();
            } else if (data.partial) {
                alert(`⚠️ Enviado parcialmente. Llegó a ${data.sentCount} de ${data.count} pacientes.`);
                setEditingTemplate(data.campaign);
                setCampaignView('sent');
                fetchData();
            } else {
                alert(`❌ ${data.error || 'No se pudo enviar ningún correo. Verifica las claves de envío.'}`);
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
                body: JSON.stringify({ title, preheader, content, id: editingTemplate?.id }),
            });
            const data = await res.json();
            if (data.success) {
                alert('💾 Borrador de correo guardado perfectamente');
                setEditingTemplate(data.template);
                setCampaignView('drafts');
                fetchData();
            }
        } catch { alert('No pudimos guardarlo en este momento'); }
        finally { setIsLoading(false); }
    };

    const openNewCampaign = () => {
        setEditingTemplate(null);
        setTitle('');
        setPreheader('');
        setContent('');
        setSelectedRecipients([]);
        setContentPreview(false);
        if (editorRef.current) editorRef.current.innerHTML = '';
    };

    const openArticle = (post: any) => {
        setArticleDraft({
            slug: post.slug || '', title: post.title || '', excerpt: post.excerpt || '',
            category: post.category || 'Salud Mental', image: post.image || '/images/blog/ansiedad.jpg',
            keywords: Array.isArray(post.keywords) ? post.keywords.join(', ') : '', status: post.status || 'DRAFT',
        });
        requestAnimationFrame(() => { if (articleEditorRef.current) articleEditorRef.current.innerHTML = post.content || ''; });
    };

    const openNewArticle = () => {
        setArticleDraft({ slug: '', title: '', excerpt: '', category: 'Salud Mental', image: '/images/blog/ansiedad.jpg', keywords: '', status: 'DRAFT' });
        if (articleEditorRef.current) articleEditorRef.current.innerHTML = '';
    };

    const saveArticle = async (status: 'DRAFT' | 'PUBLISHED') => {
        const articleContent = articleEditorRef.current?.innerHTML || '';
        if (!articleDraft.slug || !articleDraft.title || !articleDraft.excerpt || !articleContent) {
            alert('Completa título, enlace, resumen y contenido para guardar.');
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/content', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...articleDraft, content: articleContent, status }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || 'No fue posible guardar el artículo.');
            setArticleDraft(current => ({ ...current, status }));
            alert(status === 'PUBLISHED' ? 'Artículo publicado y disponible en el sitio.' : 'Borrador editorial guardado.');
            fetchData();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'No fue posible guardar el artículo.');
        } finally { setIsLoading(false); }
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
            {rescheduleModal && (
                <div className={styles.modalOverlay} onMouseDown={() => !isLoading && setRescheduleModal(null)}>
                    <div className={`${styles.modalContent} ${styles.rescheduleModal}`} onMouseDown={event => event.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div>
                                <span className={styles.rescheduleEyebrow}>{rescheduleModal.mode === 'day' ? 'Agenda del día' : 'Sesión individual'}</span>
                                <h2>{rescheduleModal.mode === 'day' ? 'Reagendar una jornada' : 'Reagendar esta sesión'}</h2>
                            </div>
                            <button className={styles.closeIcon} onClick={() => setRescheduleModal(null)} disabled={isLoading} aria-label="Cerrar">✕</button>
                        </div>
                        <p className={styles.rescheduleDescription}>
                            {rescheduleModal.mode === 'day'
                                ? 'Elige el día que no atenderás. Verás canceladas las sesiones de esa fecha y cada paciente recibirá su enlace privado para escoger una nueva hora.'
                                : `Se cancelará únicamente la sesión de ${rescheduleModal.label}. La persona recibirá su enlace privado para reagendar.`}
                        </p>
                        {rescheduleModal.mode === 'day' && (
                            <label className={styles.rescheduleField}>
                                <span>Fecha a reagendar</span>
                                <AdminDateTimePicker value={rescheduleDate} onChange={setRescheduleDate} withTime={false} ariaLabel="Fecha a reagendar" />
                            </label>
                        )}
                        <label className={styles.rescheduleField}>
                            <span>Mensaje adicional <em>opcional</em></span>
                            <textarea value={rescheduleReason} onChange={event => setRescheduleReason(event.target.value)} placeholder="Por ejemplo: tendré un compromiso impostergable." maxLength={300} />
                        </label>
                        <div className={styles.modalActions}>
                            <button className={styles.syncBtn} onClick={() => setRescheduleModal(null)} disabled={isLoading}>Volver</button>
                            <button className={styles.primaryBtn} onClick={submitReschedule} disabled={isLoading}>
                                {isLoading ? 'Enviando…' : 'Confirmar y enviar enlaces'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {dateEditModal && (
                <div className={styles.modalOverlay} onMouseDown={() => !isLoading && setDateEditModal(null)}>
                    <div className={`${styles.modalContent} ${styles.dateEditModal}`} onMouseDown={event => event.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div><span className={styles.rescheduleEyebrow}>Corrección administrativa</span><h2>Modificar fecha</h2></div>
                            <button className={styles.closeIcon} onClick={() => setDateEditModal(null)} disabled={isLoading} aria-label="Cerrar">✕</button>
                        </div>
                        <p className={styles.rescheduleDescription}>Cambiarás la fecha de {dateEditModal.label}. Cal.com moverá la cita y actualizará la invitación del paciente.</p>
                        <label className={styles.rescheduleField}><span>Nueva fecha y hora</span><AdminDateTimePicker value={editedAppointmentDate} onChange={setEditedAppointmentDate} ariaLabel="Nueva fecha y hora" /></label>
                        <div className={styles.modalActions}>
                            <button className={styles.syncBtn} onClick={() => setDateEditModal(null)} disabled={isLoading}>Volver</button>
                            <button className={styles.primaryBtn} onClick={submitDateEdit} disabled={isLoading}>{isLoading ? 'Actualizando…' : 'Guardar nueva fecha'}</button>
                        </div>
                    </div>
                </div>
            )}
            {manualBookingModal && (
                <div className={styles.modalOverlay} onMouseDown={() => !isLoading && setManualBookingModal(false)}>
                    <div className={`${styles.modalContent} ${styles.manualBookingModal}`} onMouseDown={event => event.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div>
                                <span className={styles.rescheduleEyebrow}>Pago recibido por transferencia</span>
                                <h2>Registrar paciente y cita</h2>
                            </div>
                            <button className={styles.closeIcon} onClick={() => setManualBookingModal(false)} disabled={isLoading} aria-label="Cerrar">✕</button>
                        </div>
                        <p className={styles.rescheduleDescription}>El monto se propone automáticamente según el servicio, pero puedes corregirlo. Las fechas futuras se crearán también en Cal.com para bloquear la agenda y enviar la invitación correspondiente.</p>
                        <div className={styles.manualFormGrid}>
                            <label className={styles.rescheduleField}><span>Nombre completo</span><input value={manualBooking.name} onChange={event => setManualBooking(current => ({ ...current, name: event.target.value }))} placeholder="Nombre del paciente" /></label>
                            <label className={styles.rescheduleField}><span>Correo electrónico</span><input type="email" value={manualBooking.email} onChange={event => setManualBooking(current => ({ ...current, email: event.target.value }))} placeholder="paciente@correo.cl" /></label>
                            <label className={styles.rescheduleField}><span>Teléfono <em>opcional</em></span><input type="tel" value={manualBooking.phone} onChange={event => setManualBooking(current => ({ ...current, phone: event.target.value }))} placeholder="+56 9 ..." /></label>
                            <label className={styles.rescheduleField}><span>Servicio</span><select value={manualBooking.serviceType} onChange={event => { const option = manualServiceOptions.find(item => item.value === event.target.value); const sessionCount = getIncludedSessionCount(event.target.value); setManualBooking(current => ({ ...current, serviceType: event.target.value, amount: String(option?.price ?? current.amount), completedSessions: 0, appointmentDates: Array.from({ length: sessionCount }, () => '') })); }}>{manualServiceOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                            <label className={styles.rescheduleField}><span>Monto pagado (CLP)</span><input type="number" min="0" step="1" value={manualBooking.amount} onChange={event => setManualBooking(current => ({ ...current, amount: event.target.value }))} /></label>
                            {manualIncludedSessions > 1 && <label className={styles.rescheduleField}><span>Sesiones ya realizadas</span><select value={manualBooking.completedSessions} onChange={event => { const completedSessions = Number(event.target.value); const remaining = manualIncludedSessions - completedSessions; setManualBooking(current => ({ ...current, completedSessions, appointmentDates: current.appointmentDates.slice(0, remaining).concat(Array(Math.max(remaining - current.appointmentDates.length, 0)).fill('')) })); }}>{Array.from({ length: manualIncludedSessions }, (_, index) => <option key={index} value={index}>{index === 0 ? 'Ninguna aún' : `${index} de ${manualIncludedSessions} realizadas`}</option>)}</select></label>}
                        </div>
                        <div className={styles.manualDates}>
                            <div className={styles.manualDatesHeader}><span>{manualIncludedSessions > 1 ? `Fechas pendientes · sesiones ${manualBooking.completedSessions + 1} a ${manualIncludedSessions}` : 'Fecha agendada'}</span>{manualBooking.appointmentDates.length < manualRemainingSessions && <button type="button" onClick={() => setManualBooking(current => ({ ...current, appointmentDates: [...current.appointmentDates, ''] }))}>+ Añadir fecha</button>}</div>
                            {manualBooking.appointmentDates.map((date, index) => <div className={styles.manualDateRow} key={index}><label>{manualIncludedSessions > 1 ? `Sesión ${manualBooking.completedSessions + index + 1} de ${manualIncludedSessions}` : 'Sesión'}</label><AdminDateTimePicker value={date} onChange={value => updateManualDate(index, value)} ariaLabel={`Fecha y hora de la sesión ${index + 1}`} /><button type="button" onClick={() => setManualBooking(current => ({ ...current, appointmentDates: current.appointmentDates.length === 1 ? [''] : current.appointmentDates.filter((_, itemIndex) => itemIndex !== index) }))} aria-label="Quitar fecha">✕</button></div>)}
                        </div>
                        <label className={styles.manualEmailOption}><input type="checkbox" checked={manualBooking.sendEmail} onChange={event => setManualBooking(current => ({ ...current, sendEmail: event.target.checked }))} /> Enviar confirmación de pago al paciente</label>
                        <div className={styles.modalActions}>
                            <button className={styles.syncBtn} onClick={() => setManualBookingModal(false)} disabled={isLoading}>Volver</button>
                            <button className={styles.primaryBtn} onClick={submitManualBooking} disabled={isLoading}>{isLoading ? 'Registrando…' : 'Registrar como pagado'}</button>
                        </div>
                    </div>
                </div>
            )}
            
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
                            <span className={styles.dogAvatar}>GC</span>
                        )}
                        <span className={styles.profileEdit}>Cambiar</span>
                    </label>
                    <span className={styles.navTitle}>Clínica Gustavo</span>
                    <span className={styles.navSubtitle}>Panel Principal</span>
                </div>
                
                <nav className={styles.navList}>
                    <button className={activeTab === 'overview' ? styles.active : ''} onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }}><span className={styles.navIcon}>⌂</span> Hoy</button>
                    <button className={activeTab === 'bookings' ? styles.active : ''} onClick={() => { setActiveTab('bookings'); setIsMobileMenuOpen(false); }}><span className={styles.navIcon}>□</span> Agenda</button>
                    <button className={activeTab === 'requests' ? styles.active : ''} onClick={() => { setActiveTab('requests'); setIsMobileMenuOpen(false); }}><span className={styles.navIcon}>↗</span> Solicitudes</button>
                    <button className={activeTab === 'newsletter' ? styles.active : ''} onClick={() => { setActiveTab('newsletter'); setIsMobileMenuOpen(false); }}><span className={styles.navIcon}>✉</span> Comunicaciones</button>
                    <button className={activeTab === 'marketing' ? styles.active : ''} onClick={() => { setActiveTab('marketing'); setIsMobileMenuOpen(false); }}><span className={styles.navIcon}>◇</span> Contenido</button>
                </nav>

                <div className={styles.publicLinks}>
                    <Link href="/" target="_blank" onClick={() => setIsMobileMenuOpen(false)}>Ver sitio público <span>↗</span></Link>
                </div>
                
                <button onClick={handleLogout} className={styles.logoutAction}>Cerrar Sesión</button>
            </aside>

            <main className={styles.contentArea}>
                <header className={styles.contentHeader}>
                    <div>
                        <span className={styles.pageEyebrow}>{activeTab === 'overview' ? 'Resumen operativo' : activeTab === 'bookings' ? 'Atención clínica' : activeTab === 'requests' ? 'Gestión de pacientes' : activeTab === 'newsletter' ? 'Relación con tu comunidad' : 'Biblioteca editorial'}</span>
                        <h1>{activeTab === 'overview' ? 'Hoy' : activeTab === 'bookings' ? 'Agenda' : activeTab === 'newsletter' ? 'Comunicaciones' : activeTab === 'requests' ? 'Solicitudes' : 'Contenido'}</h1>
                        <p>{activeTab === 'overview' ? 'Lo importante de tu consulta, ordenado en un solo lugar.' : activeTab === 'bookings' ? 'Sesiones, pagos, boletas y cambios de fecha.' : activeTab === 'requests' ? 'Decisiones pendientes y solicitudes ya resueltas.' : activeTab === 'newsletter' ? 'Prepara y envía correos con una vista previa clara.' : 'Revisa la presencia editorial de tu sitio.'}</p>
                    </div>
                    <div className={styles.syncStatus}>
                        <span className={styles.syncDot}></span>
                        <div><strong>Sincronización automática</strong><small>{isLoading ? 'Actualizando…' : lastUpdated ? `Actualizado a las ${lastUpdated.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}` : 'Preparando datos'}</small></div>
                        <button onClick={fetchData} disabled={isLoading} aria-label="Actualizar ahora" title="Actualizar ahora">↻</button>
                    </div>
                </header>

                {activeTab === 'overview' && <>
                <div className={styles.dashboardStats}>
                    <div className={styles.statCard}>
                        <div className={styles.statInfo}>
                            <h3>Sesiones de hoy</h3>
                            <p>{overviewMetrics.today.length}</p>
                            <small>{overviewMetrics.today.length ? 'Jornada activa' : 'Sin sesiones para hoy'}</small>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statInfo}>
                            <h3>Pacientes registrados</h3>
                            <p>{patients.length}</p>
                            <small>Ficha disponible desde Agenda</small>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statInfo}>
                            <h3>Ingresos agendados del mes</h3>
                            <p>${monthlyEarnings}</p>
                            <small>Pagos distribuidos por sesión</small>
                        </div>
                    </div>
                </div>

                <section className={styles.overviewGrid}>
                    <article className={styles.todayPanel}>
                        <div className={styles.sectionHeading}>
                            <div><span>Agenda inmediata</span><h2>Próximas sesiones</h2></div>
                            <button onClick={() => setActiveTab('bookings')}>Ver agenda completa</button>
                        </div>
                        {overviewMetrics.next.length ? <div className={styles.nextSessionList}>{overviewMetrics.next.map(({ booking, session }) => (
                            <button key={`${booking.id}-${session.id}`} className={styles.nextSessionRow} onClick={() => setActiveTab('bookings')}>
                                <span className={styles.nextSessionDate}><strong>{new Date(session.date).toLocaleDateString('es-CL', { day: '2-digit' })}</strong><small>{new Date(session.date).toLocaleDateString('es-CL', { month: 'short' })}</small></span>
                                <span><strong>{booking.name}</strong><small>{getServiceDisplayName(booking.serviceType)} · Sesión {session.number} de {getInvoiceSessionSlots(booking).length}</small></span>
                                <time>{new Date(session.date).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })}</time>
                            </button>
                        ))}</div> : <div className={styles.emptyOverview}>No hay sesiones futuras agendadas.</div>}
                    </article>
                    <aside className={styles.attentionPanel}>
                        <span>Atención</span>
                        <h2>{overviewMetrics.needsAttention}</h2>
                        <p>{overviewMetrics.needsAttention === 1 ? 'reagendamiento necesita revisión.' : 'reagendamientos necesitan revisión.'}</p>
                        <button onClick={() => setActiveTab('bookings')}>Revisar en Agenda</button>
                    </aside>
                </section>

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
                                    <small>{month.count} {month.count === 1 ? 'sesión pagada' : 'sesiones pagadas'}</small>
                                    <em>Promedio ${(Math.round(month.total / Math.max(month.count, 1))).toLocaleString('es-CL')} por sesión</em>
                                </div>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.emptyHistory}>Todavía no hay meses anteriores con pagos confirmados.</p>
                        )}
                    </section>
                )}
                </>}

                {activeTab !== 'overview' && <div className={styles.listContainer}>
                    {activeTab === 'requests' && <Requests />}

                    {activeTab === 'bookings' && (
                        <div className={styles.responsiveList}>
                            <div className={styles.agendaTopbar}>
                                <div className={styles.segmentedControl} aria-label="Vista de agenda">
                                    <button className={agendaView === 'scheduled' ? styles.segmentActive : ''} onClick={() => setAgendaView('scheduled')}>Programadas <span>{allCalendarEntries.filter(({ session }) => !session.completed).length}</span></button>
                                    <button className={agendaView === 'completed' ? styles.segmentActive : ''} onClick={() => setAgendaView('completed')}>Realizadas <span>{allCalendarEntries.filter(({ session }) => session.completed).length}</span></button>
                                </div>
                                <div className={styles.agendaActions}><button className={styles.transferBtn} onClick={openManualBooking} disabled={isLoading}>＋ Registrar transferencia</button><button className={styles.actionBtn} onClick={openDayReschedule} disabled={isLoading}>Reagendar jornada</button></div>
                            </div>
                            <p className={styles.calendarIntro}>{agendaView === 'scheduled' ? 'Aquí están las sesiones próximas, pasadas por confirmar y pendientes de fecha.' : 'Historial de sesiones que marcaste como realizadas, aunque su orden no sea correlativo.'}</p>
                            <table className={`${styles.friendlyTable} ${styles.agendaTable}`}>
                                <colgroup>
                                    <col style={{ width: '16%' }} /><col style={{ width: '12%' }} /><col style={{ width: '15%' }} /><col style={{ width: '10%' }} />
                                    <col style={{ width: '10%' }} /><col style={{ width: '15%' }} /><col style={{ width: '11%' }} /><col style={{ width: '11%' }} />
                                </colgroup>
                                <thead><tr><th>Paciente</th><th>Fecha de Cita</th><th>Tipo de Servicio</th><th>Monto</th><th>Situación</th><th>Boleta</th><th>Acción</th><th>Ficha</th></tr></thead>
                                <tbody>{calendarEntries.map(({ booking, session, sessionCount }) => {
                                    const date = session?.date || booking.appointmentDate || booking.createdAt;
                                    const hasDate = Boolean(session?.date || booking.appointmentDate);
                                    const amount = session ? (Number(booking.amount) || 0) / sessionCount : Number(booking.amount) || 0;
                                    const appointmentIndex = session?.appointmentIndex ?? 0;
                                    const rescheduleState = getRescheduleState(booking, appointmentIndex);

                                    return (
                                        <tr key={session ? `${booking.id}-${session.id}` : booking.id}>
                                            <td><span className={styles.agendaPatientName}>{booking.name}</span></td>
                                            <td>{hasDate ? <span className={styles.agendaDate}><strong>{new Date(date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}</strong><small>{new Date(date).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })} h</small></span> : <span className={styles.pendingDate}>Pendiente de agendar</span>}</td>
                                            <td>
                                                <span>{getServiceDisplayName(booking.serviceType)}</span>
                                                {session && <small className={styles.calendarSessionMeta}>Sesion {session.number} de {sessionCount}</small>}
                                            </td>
                                            <td style={{fontWeight: 700, color: '#0f172a'}}>${amount.toLocaleString('es-CL')}{session && <small className={styles.calendarSessionMeta}>por sesion</small>}</td>
                                            <td><div className={styles.agendaStatus}><span className={`${styles.badge} ${session.completed ? styles.badgeCompleted : styles.badgeCalypso}`}>{session.completed ? 'Realizada' : hasDate ? 'Programada' : 'Sin fecha'}</span>{rescheduleState.awaiting && <span className={styles.awaitingReschedule}>Esperando nueva fecha</span>}{rescheduleState.needsAttention && <span className={styles.rescheduleAttention}>Reagendamiento por completar</span>}</div></td>
                                            <td>{renderCalendarReceiptToggle(booking, session)}</td>
                                            <td>{hasDate && !session.completed && <div className={styles.agendaActionGroup}><button className={styles.editDateBtn} onClick={() => openDateEdit(booking, appointmentIndex, String(date))}>Editar fecha</button><button className={styles.reschedulePatientBtn} onClick={() => openIndividualReschedule(booking, appointmentIndex, String(date))}>Reprogramar</button></div>}</td>
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
                                    const appointmentIndex = session?.appointmentIndex ?? 0;
                                    const rescheduleState = getRescheduleState(booking, appointmentIndex);

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
                                            <div className={styles.agendaStatus}><span className={`${styles.badge} ${session.completed ? styles.badgeCompleted : styles.badgeCalypso}`}>{session.completed ? 'Realizada' : hasDate ? 'Programada' : 'Sin fecha'}</span>{rescheduleState.awaiting && <span className={styles.awaitingReschedule}>Esperando nueva fecha</span>}{rescheduleState.needsAttention && <span className={styles.rescheduleAttention}>Reagendamiento por completar</span>}</div>
                                            {renderCalendarReceiptToggle(booking, session)}
                                            {hasDate && !session.completed && <div className={styles.agendaActionGroup}><button className={styles.editDateBtn} onClick={() => openDateEdit(booking, appointmentIndex, String(date))}>Editar fecha</button><button className={styles.reschedulePatientBtn} onClick={() => openIndividualReschedule(booking, appointmentIndex, String(date))}>Reprogramar</button></div>}
                                            <button className={styles.bookingPatientBtn} onClick={() => openPatientFromBooking(booking)}>Abrir ficha</button>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'newsletter' && (
                        <div className={styles.communicationHub}>
                            <section className={styles.campaignShelf}>
                                <div className={styles.sectionHeading}><div><span>Centro de campañas</span><h2>Correos con contexto e historial</h2></div><button onClick={openNewCampaign}>＋ Nueva comunicación</button></div>
                                <div className={styles.campaignTabs}>
                                    <button className={campaignView === 'drafts' ? styles.campaignTabActive : ''} onClick={() => setCampaignView('drafts')}>Borradores <span>{templates.filter(template => template.status === 'DRAFT').length}</span></button>
                                    <button className={campaignView === 'sent' ? styles.campaignTabActive : ''} onClick={() => setCampaignView('sent')}>Enviadas <span>{templates.filter(template => template.status && template.status !== 'DRAFT').length}</span></button>
                                    <button className={campaignView === 'planned' ? styles.campaignTabActive : ''} onClick={() => setCampaignView('planned')}>Ideas preparadas <span>{newsletterSequence.length}</span></button>
                                </div>
                                <div className={styles.campaignCards}>
                                    {campaignView === 'planned' && newsletterSequence.map(sequence => <button key={`seq-${sequence.id}`} className={styles.campaignCard} onClick={() => { const nextContent = sequence.content('[Nombre del Paciente]'); setEditingTemplate(null); setTitle(sequence.subject); setPreheader(sequence.preheader || ''); setContent(nextContent); setContentPreview(false); if (editorRef.current) editorRef.current.innerHTML = nextContent; }}><small>Idea preparada · {sequence.weekOf}</small><strong>{sequence.subject}</strong><em>{sequence.preheader || 'Lista para adaptar a tu comunidad.'}</em></button>)}
                                    {campaignView === 'drafts' && templates.filter(template => template.status === 'DRAFT').map(template => <button key={template.id} className={styles.campaignCard} onClick={() => { setEditingTemplate(template); setTitle(template.title); setPreheader(template.preheader || ''); setContent(template.content); setContentPreview(false); if (editorRef.current) editorRef.current.innerHTML = template.content; }}><small>Borrador · actualizado {new Date(template.updatedAt).toLocaleDateString('es-CL')}</small><strong>{template.title}</strong><em>{template.preheader || 'Sin texto de vista previa.'}</em></button>)}
                                    {campaignView === 'sent' && templates.filter(template => template.status && template.status !== 'DRAFT').map(template => <button key={template.id} className={styles.campaignCard} onClick={() => { setEditingTemplate(template); setTitle(template.title); setPreheader(template.preheader || ''); setContent(template.content); setContentPreview(true); }}><small>{template.status === 'SENT' ? 'Enviada' : template.status === 'PARTIAL' ? 'Envío parcial' : 'No enviada'} · {template.sentAt ? new Date(template.sentAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }) : 'sin fecha'}</small><strong>{template.title}</strong><em>{template.sentCount || 0} enviados de {template.recipientCount || 0} destinatarios</em></button>)}
                                    {((campaignView === 'drafts' && !templates.some(template => template.status === 'DRAFT')) || (campaignView === 'sent' && !templates.some(template => template.status && template.status !== 'DRAFT'))) && <p className={styles.emptyCampaigns}>Aún no hay campañas en esta sección.</p>}
                                </div>
                            </section>
                        <div className={styles.communicationWorkspace}>
                            <section className={styles.campaignComposer}>
                                <div className={styles.composerHeader}>
                                    <div><span>Campaña</span><h2>{editingTemplate?.id ? 'Editar borrador' : 'Nueva comunicación'}</h2></div>
                                    <div className={styles.previewSwitch}><button className={!contentPreview ? styles.segmentActive : ''} onClick={() => setContentPreview(false)}>Redactar</button><button className={contentPreview ? styles.segmentActive : ''} onClick={() => setContentPreview(true)}>Vista previa</button></div>
                                </div>
                                {!contentPreview ? <>
                                    <label className={styles.campaignField}><span>Asunto</span><input value={title} onChange={event => setTitle(event.target.value)} placeholder="Un asunto claro y cercano" /></label>
                                    <label className={styles.campaignField}><span>Texto de vista previa</span><input value={preheader} onChange={event => setPreheader(event.target.value)} placeholder="Una línea breve que acompaña el asunto en la bandeja de entrada" /></label>
                                    <div className={styles.studioToolbar}><span>Contenido del correo</span><div><button onClick={() => document.execCommand('bold')} title="Negrita"><b>B</b></button><button onClick={() => document.execCommand('italic')} title="Cursiva"><i>I</i></button></div></div>
                                    <div ref={editorRef} className={styles.richText} contentEditable suppressContentEditableWarning onInput={(event: any) => setContent(event.currentTarget.innerHTML)} dangerouslySetInnerHTML={{ __html: content }} data-placeholder="Escribe aquí el mensaje para tus lectores…" />
                                </> : <div className={styles.emailPreview}><div className={styles.emailChrome}><span></span><span></span><span></span></div><div className={styles.emailPreviewBody}><small>Ps. Gustavo Caro</small><h2>{title || 'El asunto aparecerá aquí'}</h2><div dangerouslySetInnerHTML={{ __html: content || '<p>El contenido de tu correo aparecerá aquí.</p>' }} /></div></div>}
                                <div className={styles.editorActions}>
                                    <button className={styles.primaryBtn} onClick={handleSaveTemplate}>Guardar borrador</button>
                                    <button className={styles.sendPrimary} onClick={selectedRecipients.length ? handleSendToSelected : handleSendToAll}>{selectedRecipients.length ? `Enviar a ${selectedRecipients.length} seleccionados` : `Enviar a todos (${newsletterSubs.length})`}</button>
                                </div>
                            </section>
                            <aside className={styles.communicationSidebar}>
                                <section className={styles.audiencePanel}>
                                    <div className={styles.panelTitle}><div><span>Audiencia</span><strong>{newsletterSubs.length} lectores con suscripción activa</strong></div><button onClick={toggleSelectAll}>{selectedRecipients.length === newsletterSubs.length && newsletterSubs.length ? 'Limpiar' : 'Seleccionar todos'}</button></div>
                                    <p>{selectedRecipients.length ? `Enviarás solo a ${selectedRecipients.length} personas seleccionadas.` : 'Sin selección manual, el envío llegará a toda la audiencia activa.'}</p>
                                    <div className={styles.audienceList}>{newsletterSubs.map(subscriber => <label key={subscriber.id} className={styles.audienceItem}><input type="checkbox" checked={selectedRecipients.includes(subscriber.email)} onChange={event => setSelectedRecipients(current => event.target.checked ? [...current, subscriber.email] : current.filter(email => email !== subscriber.email))} /><span>{subscriber.email}</span></label>)}</div>
                                </section>
                                <section className={styles.libraryPanel}><div className={styles.panelTitle}><div><span>Antes de enviar</span><strong>Checklist de campaña</strong></div></div><div className={styles.sendChecklist}><span>✓ Asunto y vista previa claros</span><span>✓ Audiencia visible y seleccionable</span><span>✓ Al enviar se guarda fecha, alcance y resultado</span></div></section>
                            </aside>
                        </div>
                        </div>
                    )}

                    {activeTab === 'marketing' && (
                        <div className={styles.contentWorkspace}>
                            <section className={styles.contentLibrary}>
                                <div className={styles.sectionHeading}><div><span>Biblioteca editorial</span><h2>Artículos y borradores</h2></div><button onClick={openNewArticle}>＋ Nuevo artículo</button></div>
                                <p className={styles.libraryIntro}>Abre una pieza para editarla de verdad: puedes guardar un borrador o publicarla en el sitio.</p>
                                <div className={styles.articleGrid}>{editorialPosts.map(post => <button key={post.slug} className={styles.articleCard} onClick={() => openArticle(post)}><span className={styles.articleImage}><Image src={post.image} alt="" fill sizes="(max-width: 900px) 100vw, 260px" /></span><span className={styles.articleMeta}><small>{post.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'} · {post.category}</small><strong>{post.title}</strong><em>{post.excerpt}</em></span></button>)}</div>
                            </section>
                            <aside className={styles.articleEditor}>
                                <div className={styles.composerHeader}><div><span>Editor</span><h2>{articleDraft.title || 'Nuevo artículo'}</h2></div><span className={`${styles.articleState} ${articleDraft.status === 'PUBLISHED' ? styles.articlePublished : ''}`}>{articleDraft.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}</span></div>
                                <label className={styles.campaignField}><span>Título</span><input value={articleDraft.title} onChange={event => setArticleDraft(current => ({ ...current, title: event.target.value }))} placeholder="Título del artículo" /></label>
                                <label className={styles.campaignField}><span>Enlace del artículo</span><input value={articleDraft.slug} onChange={event => setArticleDraft(current => ({ ...current, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))} placeholder="mi-articulo" /></label>
                                <label className={styles.campaignField}><span>Resumen</span><input value={articleDraft.excerpt} onChange={event => setArticleDraft(current => ({ ...current, excerpt: event.target.value }))} placeholder="Qué encontrará la persona lectora" /></label>
                                <div className={styles.articleMetaFields}><label className={styles.campaignField}><span>Categoría</span><select value={articleDraft.category} onChange={event => setArticleDraft(current => ({ ...current, category: event.target.value }))}>{['Salud Mental', 'Neurodiversidad', 'Ansiedad', 'Opinión', 'Recursos'].map(category => <option key={category}>{category}</option>)}</select></label><label className={styles.campaignField}><span>Imagen</span><input value={articleDraft.image} onChange={event => setArticleDraft(current => ({ ...current, image: event.target.value }))} placeholder="/imagen.png" /></label></div>
                                <label className={styles.campaignField}><span>Palabras clave</span><input value={articleDraft.keywords} onChange={event => setArticleDraft(current => ({ ...current, keywords: event.target.value }))} placeholder="ansiedad, bienestar, terapia" /></label>
                                <div className={styles.studioToolbar}><span>Cuerpo del artículo</span><div><button onClick={() => document.execCommand('bold')} title="Negrita"><b>B</b></button><button onClick={() => document.execCommand('italic')} title="Cursiva"><i>I</i></button></div></div>
                                <div ref={articleEditorRef} className={`${styles.richText} ${styles.articleRichText}`} contentEditable suppressContentEditableWarning data-placeholder="Desarrolla aquí el artículo…" />
                                <div className={styles.editorActions}><button className={styles.primaryBtn} onClick={() => saveArticle('DRAFT')}>Guardar borrador</button><button className={styles.sendPrimary} onClick={() => saveArticle('PUBLISHED')}>Publicar en el sitio</button></div>
                                {articleDraft.status === 'PUBLISHED' && articleDraft.slug && <Link className={styles.articleSiteLink} href={`/blog/${articleDraft.slug}`} target="_blank">Ver artículo publicado ↗</Link>}
                            </aside>
                        </div>
                    )}
                </div>}
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
                                                                    <div key={session.id} className={`${styles.sessionReceipt} ${issuedForSession || b.siiReceiptIssued ? styles.sessionReceiptOn : ''}`}>
                                                                        <span>
                                                                            <strong>{sessionLabel}</strong>
                                                                            <small>${amountPerSession.toLocaleString('es-CL')} aprox. · {session.completed ? 'Realizada' : session.date ? 'Programada' : 'Pendiente de fecha'}</small>
                                                                        </span>
                                                                        {b.siiReceiptIssued ? (
                                                                            <em>Incluida en boleta única</em>
                                                                        ) : (
                                                                            <label className={styles.sessionReceiptControl}>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={issuedForSession}
                                                                                    onChange={(event) => handleToggleSessionReceipt(b, session.id, event.target.checked)}
                                                                                />
                                                                                <span>{issuedForSession ? 'Boleta emitida' : 'Marcar boleta'}</span>
                                                                            </label>
                                                                        )}
                                                                    </div>
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

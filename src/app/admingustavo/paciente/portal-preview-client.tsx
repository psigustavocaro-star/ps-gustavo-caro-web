'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getInvoiceSessionSlots } from '@/lib/invoice-sessions';
import styles from './portal-preview.module.css';

const serviceNames: Record<string, string> = {
    sesion: 'Psicoterapia individual',
    packSesiones: 'Pack de sesiones',
    primeraConsulta: 'Primera consulta',
    evalTDAH: 'Evaluación TDAH',
    evalAutismo: 'Evaluación TEA',
};

const displayDate = (value: string) => new Intl.DateTimeFormat('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
}).format(new Date(value));

const shortDate = (value: string) => new Intl.DateTimeFormat('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric',
}).format(new Date(value));

export default function AdminPatientPortalPreview({ email }: { email: string }) {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!email) {
            setError('No se indicó un paciente para revisar.');
            return;
        }

        fetch(`/api/admin/patient-portal?email=${encodeURIComponent(email)}`, { credentials: 'include' })
            .then(async (response) => {
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'No fue posible abrir el portal.');
                setData(result);
            })
            .catch((reason: Error) => setError(reason.message));
    }, [email]);

    const sessions = useMemo(() => data?.bookings.flatMap((booking: any) =>
        getInvoiceSessionSlots(booking).map((slot) => ({
            booking,
            ...slot,
        })),
    ) || [], [data]);
    const upcoming = sessions
        .filter((item: any) => !item.completed && item.date && Date.parse(item.date) > Date.now())
        .sort((a: any, b: any) => Date.parse(a.date) - Date.parse(b.date));
    const completed = sessions.filter((item: any) => item.completed);
    const profileName = [data?.profile?.firstName, data?.profile?.secondName, data?.profile?.firstSurname, data?.profile?.secondSurname]
        .filter(Boolean).join(' ') || data?.bookings?.[0]?.name || 'Paciente';

    if (error) return <main className={styles.centered}><section><h1>No se pudo abrir la vista</h1><p>{error}</p><Link href="/admingustavo">Volver al panel</Link></section></main>;
    if (!data) return <main className={styles.centered}>Preparando la vista administrativa…</main>;

    return <main className={styles.preview}>
        <header className={styles.header}>
            <div><p>VISTA ADMINISTRATIVA · SOLO LECTURA</p><h1>Portal de {profileName}</h1><span>{data.email}</span></div>
            <Link className={styles.back} href="/admingustavo">← Volver al panel</Link>
        </header>

        {!data.hasPortalAccount && <div className={styles.warning}>Esta persona aún no tiene una cuenta de portal creada. Se muestra su información de agenda disponible.</div>}
        {data.mustChangePassword && <div className={styles.notice}>La persona aún debe definir o cambiar su contraseña del portal.</div>}

        <section className={styles.summary}>
            <article><small>PRÓXIMAS SESIONES</small><strong>{upcoming.length}</strong><span>programadas</span></article>
            <article><small>SESIONES REALIZADAS</small><strong>{completed.length}</strong><span>registradas</span></article>
            <article><small>SOLICITUDES</small><strong>{data.requests.length}</strong><span>en el portal</span></article>
        </section>

        <div className={styles.grid}>
            <section className={styles.card}>
                <p className={styles.eyebrow}>AGENDA QUE VE EL PACIENTE</p><h2>Próximas sesiones</h2>
                {upcoming.length ? <div className={styles.sessionList}>{upcoming.map((item: any) => <article className={styles.session} key={`${item.booking.id}-${item.id}`}>
                    <div className={styles.date}><b>{new Date(item.date).getDate()}</b><span>{new Intl.DateTimeFormat('es-CL', { month: 'short' }).format(new Date(item.date)).replace('.', '')}</span></div>
                    <div><h3>{serviceNames[item.booking.serviceType] || item.booking.serviceType}</h3><p>{item.total > 1 ? `Sesión ${item.number} de ${item.total} · ` : ''}{displayDate(item.date)}</p>{item.booking.meetUrl && <small>Enlace de Google Meet disponible</small>}</div>
                </article>)}</div> : <p className={styles.empty}>No hay sesiones futuras programadas.</p>}
            </section>

            <aside className={styles.side}>
                <section className={styles.card}><p className={styles.eyebrow}>PERFIL</p><h2>Datos visibles</h2><dl>
                    <div><dt>Nombre</dt><dd>{profileName}</dd></div>
                    <div><dt>Correo</dt><dd>{data.email}</dd></div>
                    <div><dt>Teléfono</dt><dd>{data.profile?.phone || data.bookings[0]?.phone || 'No registrado'}</dd></div>
                    <div><dt>Dirección</dt><dd>{[data.profile?.address, data.profile?.commune, data.profile?.region].filter(Boolean).join(', ') || 'No registrada'}</dd></div>
                </dl></section>
                <section className={styles.card}><p className={styles.eyebrow}>SOLICITUDES</p><h2>Estado</h2>{data.requests.length ? data.requests.slice(0, 5).map((request: any) => <div className={styles.request} key={request.id}><b>{request.type === 'CANCEL' ? 'Anulación' : 'Cambio de hora'}</b><span>{shortDate(request.appointmentDate)} · {request.status === 'PENDING' ? 'En revisión' : request.status === 'APPROVED' ? 'Aprobada' : 'No aprobada'}</span></div>) : <p className={styles.empty}>No hay solicitudes.</p>}</section>
            </aside>
        </div>

        <section className={styles.card}><p className={styles.eyebrow}>HISTORIAL</p><h2>Sesiones realizadas</h2>{completed.length ? <div className={styles.completed}>{completed.map((item: any) => <div key={`${item.booking.id}-${item.id}`}><span>✓</span><p><b>{serviceNames[item.booking.serviceType] || item.booking.serviceType}</b><small>Sesión {item.number} de {item.total} · Registrada como realizada</small></p></div>)}</div> : <p className={styles.empty}>Aún no hay sesiones registradas como realizadas.</p>}</section>

        <p className={styles.readOnly}>Esta vista no permite editar el perfil, cambiar contraseña ni enviar solicitudes en nombre del paciente.</p>
    </main>;
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CustomCalendar from '@/components/Booking/CustomCalendar';
import { formatClinicDate, formatClinicTime } from '@/lib/util/timezone';
import styles from './reschedule.module.css';

type State = 'loading' | 'ready' | 'invalid' | 'saving' | 'complete';

function dateKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function RescheduleClient({ token }: { token: string }) {
    const [state, setState] = useState<State>('loading');
    const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [confirmation, setConfirmation] = useState('');

    useEffect(() => {
        fetch(`/api/reagendar/${encodeURIComponent(token)}`, { cache: 'no-store' })
            .then(async response => ({ ok: response.ok, data: await response.json() }))
            .then(({ ok, data }) => {
                if (!ok || !data.success) {
                    setError(data.error || 'Este enlace no es válido.');
                    setState('invalid');
                    return;
                }
                const availabilityUrl = data.eventTypeId
                    ? `/api/bookings/occupied?eventTypeId=${data.eventTypeId}`
                    : '/api/bookings/occupied';
                return fetch(availabilityUrl, { cache: 'no-store' });
            })
            .then(async response => {
                if (!response) return;
                const data = await response.json();
                setOccupiedSlots(data.success ? data.occupiedSlots || [] : []);
                setState('ready');
            })
            .catch(() => {
                setError('No pudimos cargar los horarios. Inténtalo nuevamente.');
                setState('invalid');
            });
    }, [token]);

    const selectSlot = async (date: Date, time: string) => {
        setState('saving');
        setError('');
        try {
            const response = await fetch(`/api/reagendar/${encodeURIComponent(token)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: dateKey(date), time }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || 'No pudimos confirmar la hora.');
            setConfirmation(data.appointmentDate);
            setState('complete');
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : 'No pudimos confirmar la hora.');
            setState('ready');
        }
    };

    return (
        <main className={styles.page}>
            <section className={styles.card}>
                {state === 'loading' && <p>Estamos preparando los horarios disponibles…</p>}
                {state === 'invalid' && <>
                    <h1>Este enlace ya no está disponible</h1>
                    <p>{error}</p>
                    <p>Si necesitas ayuda, responde al correo que recibiste para que podamos coordinar contigo.</p>
                    <Link href="/" className={styles.secondaryButton}>Volver al inicio</Link>
                </>}
                {(state === 'ready' || state === 'saving') && <>
                    <span className={styles.eyebrow}>Reprogramación de sesión</span>
                    <h1>Elige una nueva hora</h1>
                    <p>Tu sesión y el pago ya están registrados. Solo selecciona el horario que te acomode; todas las horas se muestran en horario de Chile.</p>
                    {error && <p className={styles.error}>{error}</p>}
                    {state === 'saving' ? <p className={styles.saving}>Confirmando tu nueva hora…</p> : <CustomCalendar onSelectDateTime={selectSlot} bookedSlots={occupiedSlots} />}
                </>}
                {state === 'complete' && <>
                    <span className={styles.eyebrow}>Reprogramación confirmada</span>
                    <h1>¡Listo! Tu sesión fue reprogramada</h1>
                    <p>Quedó reservada para el <strong>{formatClinicDate(confirmation, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong> a las <strong>{formatClinicTime(confirmation)} hrs</strong>.</p>
                    <p>Te enviaremos la confirmación correspondiente. Gracias por tu comprensión.</p>
                    <Link href="/" className={styles.secondaryButton}>Volver al inicio</Link>
                </>}
            </section>
        </main>
    );
}

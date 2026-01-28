'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { useEffect, useState } from 'react';
import CustomCalendar from '@/components/Booking/CustomCalendar';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order') || 'N/A';
    const [booking, setBooking] = useState<{ serviceType: string, eventTypeId: string, name: string, email: string, appointmentDate?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [appointmentConfirmed, setAppointmentConfirmed] = useState(false);
    const [selectedDateTime, setSelectedDateTime] = useState<{ date: string; time: string } | null>(null);

    useEffect(() => {
        if (orderId && orderId !== 'N/A') {
            fetch(`/api/bookings/${orderId}`)
                .then(res => res.json())
                .then(data => {
                    setBooking(data);
                    // Si ya tiene fecha de cita, mostrar confirmación
                    if (data?.appointmentDate) {
                        setAppointmentConfirmed(true);
                        const dateObj = new Date(data.appointmentDate);
                        setSelectedDateTime({
                            date: dateObj.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                            time: dateObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
                        });
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error loading booking:', err);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [orderId]);

    // Handler cuando se selecciona fecha y hora
    const handleDateTimeSelection = async (date: Date, time: string) => {
        const dateObj = new Date(date);
        const [hours, minutes] = time.split(':').map(Number);
        dateObj.setHours(hours, minutes, 0, 0);

        // Guardar la cita en la base de datos
        try {
            const response = await fetch(`/api/bookings/${orderId}/schedule`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appointmentDate: dateObj.toISOString()
                })
            });

            if (response.ok) {
                setSelectedDateTime({
                    date: dateObj.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                    time: time
                });
                setAppointmentConfirmed(true);
            } else {
                alert('Error al confirmar la cita. Por favor intenta de nuevo.');
            }
        } catch (error) {
            console.error('Error scheduling appointment:', error);
            alert('Error de conexión. Por favor intenta de nuevo.');
        }
    };

    if (loading) {
        return <div className={styles.container}><div className={styles.card}>Cargando detalles de tu reserva...</div></div>;
    }

    // Si la cita ya está confirmada, mostrar resumen
    if (appointmentConfirmed && selectedDateTime) {
        return (
            <div className={styles.container}>
                <div className={`${styles.card} ${styles.largeCard}`}>
                    <div className={styles.successIcon}>🎉</div>
                    <h1 className={styles.title}>¡Cita Confirmada!</h1>

                    <div className={styles.appointmentDetails}>
                        <p className={styles.detailRow}>
                            <strong>📅 Fecha:</strong> {selectedDateTime.date}
                        </p>
                        <p className={styles.detailRow}>
                            <strong>⏰ Hora:</strong> {selectedDateTime.time} hrs
                        </p>
                        <p className={styles.detailRow}>
                            <strong>📧 Confirmación enviada a:</strong> {booking?.email}
                        </p>
                    </div>

                    <div className={styles.infoBox}>
                        <p>📧 <strong>Confirmación:</strong> Se ha enviado a {booking?.email}</p>
                        <p>📑 <strong>Boleta Electrónica:</strong> Adjunta en tu correo.</p>
                        <p>🔗 <strong>Link de sesión:</strong> Recibirás el enlace de Zoom 24 horas antes.</p>
                    </div>

                    <div className={styles.nextSteps}>
                        <h3>Siguiente paso (opcional pero recomendado):</h3>
                        <p>Para aprovechar al máximo nuestra sesión, puedes completar tu ficha clínica ahora.</p>
                        <Link href={`/pago/anamnesis?order=${orderId}`} className="btn-primary" style={{ display: 'inline-block', marginTop: '16px' }}>
                            Completar Anamnesis
                        </Link>
                    </div>

                    <div className={styles.orderInfo}>
                        <span>ID de Operación:</span>
                        <strong>{orderId}</strong>
                    </div>

                    <div className={styles.actions}>
                        <Link href="/" className="btn-outline">Volver al inicio</Link>
                    </div>
                </div>
            </div>
        );
    }

    // Mostrar calendario para seleccionar hora
    return (
        <div className={styles.container}>
            <div className={`${styles.card} ${styles.largeCard}`}>
                <div className={styles.successIcon}>✨</div>
                <h1 className={styles.title}>¡Pago Exitoso!</h1>

                <p className={styles.description}>
                    Hola <strong>{booking?.name || 'estimado paciente'}</strong>, tu pago ha sido procesado. Ahora, por favor <strong>selecciona el horario de tu cita</strong> abajo para finalizar la reserva.
                </p>

                <div className={styles.calendarSection}>
                    <CustomCalendar
                        onSelectDateTime={handleDateTimeSelection}
                        bookedSlots={[]}
                    />
                </div>

                <div className={styles.orderInfo}>
                    <span>ID de Operación:</span>
                    <strong>{orderId}</strong>
                </div>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <PaymentSuccessContent />
        </Suspense>
    );
}

'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { useEffect, useState } from 'react';
import Cal, { getCalApi } from "@calcom/embed-react";
import CalendarEmbed from '@/components/Booking/CalendarEmbed';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order') || 'N/A';
    const [booking, setBooking] = useState<{ serviceType: string, eventTypeId: string, name: string, email: string, appointmentDate?: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId && orderId !== 'N/A') {
            fetch(`/api/bookings/${orderId}`)
                .then(res => res.json())
                .then(data => {
                    setBooking(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error loading booking:', err);
                    setLoading(false);
                });
        }
    }, [orderId]);

    useEffect(() => {
        (async function () {
            const cal = await getCalApi();
            cal("ui", {
                theme: "light",
                styles: { branding: { brandColor: "#000000" } },
                hideEventTypeDetails: false,
                layout: "month_view"
            });
        })();
    }, []);

    if (loading) {
        return <div className={styles.container}><div className={styles.card}>Cargando detalles de tu reserva...</div></div>;
    }

    return (
        <div className={styles.container}>
            <div className={`${styles.card} ${styles.largeCard}`}>
                <div className={styles.successIcon}>✨</div>
                <h1 className={styles.title}>¡Pago Exitoso!</h1>

                <p className={styles.description}>
                    Hola <strong>{booking?.name}</strong>, tu pago ha sido procesado. Ahora, por favor <strong>selecciona el horario de tu cita</strong> abajo para finalizar la reserva.
                </p>

                <div className={styles.calendarSection}>
                    <CalendarEmbed
                        serviceType={booking?.serviceType as any}
                        name={booking?.name}
                        email={booking?.email}
                        height="600px"
                    />
                </div>

                <div className={styles.infoBox}>
                    <p>📧 <strong>Confirmación:</strong> Se enviará a {booking?.email} una vez elijas tu hora.</p>
                    <p>📑 <strong>Boleta Electrónica:</strong> Adjunta en tu correo.</p>
                </div>

                <div className={styles.nextSteps}>
                    <h3>Siguiente paso (opcional pero recomendado):</h3>
                    <p>Para aprovechar al máximo nuestra sesión, puedes completar tu ficha clínica ahora o más tarde desde tu correo.</p>
                    <Link href="/pago/anamnesis" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px' }}>
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

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <PaymentSuccessContent />
        </Suspense>
    );
}

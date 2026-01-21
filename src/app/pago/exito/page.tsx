'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { useEffect, useState } from 'react';
import Cal, { getCalApi } from "@calcom/embed-react";

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order') || 'N/A';
    const [booking, setBooking] = useState<{ serviceType: string, eventTypeId: string, name: string, email: string } | null>(null);
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
            <div className={`${styles.card} ${booking?.eventTypeId ? styles.largeCard : ''}`}>
                <div className={styles.successIcon}>✅</div>
                <h1 className={styles.title}>¡Pago Recibido con Éxito!</h1>

                {booking?.eventTypeId ? (
                    <div className={styles.calendarSection}>
                        <p className={styles.description}>
                            Para finalizar, <strong>asegura tu hora de atención</strong> seleccionando el horario que más te acomode:
                        </p>
                        <div className={styles.calendarWrapper}>
                            <Cal
                                calLink={booking.eventTypeId}
                                style={{ width: "100%", height: "100%", overflow: "scroll" }}
                                config={{
                                    name: booking.name,
                                    email: booking.email,
                                    theme: "light"
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <p className={styles.description}>
                            Tu pago ha sido confirmado exitosamente. Hemos enviado a tu correo electrónico:
                        </p>
                        <ul className={styles.list}>
                            <li>📅 Confirmación de tu reserva</li>
                            <li>🔗 Link de acceso (si aplica)</li>
                            <li>📑 Tu boleta de honorarios electrónica</li>
                        </ul>
                    </>
                )}

                <div className={styles.orderInfo}>
                    <span>Número de orden:</span>
                    <strong>{orderId}</strong>
                </div>
                <div className={styles.actions}>
                    <Link href="/" className="btn-primary">Volver al inicio</Link>
                    <Link href="/pago/anamnesis" className="btn-outline">Completar anamnesis</Link>
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

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
            <div className={styles.card}>
                <div className={styles.successIcon}>✨</div>
                <h1 className={styles.title}>¡Reserva Confirmada!</h1>

                <p className={styles.description}>
                    Hola <strong>{booking?.name}</strong>, tu pago ha sido procesado correctamente.
                </p>

                <div className={styles.infoBox}>
                    <p>📅 <strong>Cita Agendada:</strong> Revisa tu correo electrónico para ver los detalles del horario y el link de Google Meet.</p>
                    <p>📧 <strong>Correo de confirmación:</strong> Enviado a {booking?.email}</p>
                    <p>📑 <strong>Boleta Electrónica:</strong> Adjunta en tu correo.</p>
                </div>

                <div className={styles.nextSteps}>
                    <h3>Siguiente paso muy importante:</h3>
                    <p>Para aprovechar al máximo nuestra sesión, por favor completa tu ficha clínica (Anamnesis). Te tomará solo 3 minutos.</p>
                    <Link href="/pago/anamnesis" className="btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                        Completar Anamnesis ahora
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

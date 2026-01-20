'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order') || 'N/A';

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.successIcon}>✅</div>
                <h1 className={styles.title}>¡Pago Exitoso!</h1>
                <p className={styles.description}>
                    Tu cita ha sido confirmada exitosamente. Hemos enviado a tu correo electrónico:
                </p>
                <ul className={styles.list}>
                    <li>📅 Confirmación de tu cita con fecha y hora</li>
                    <li>🔗 Link de acceso a la videollamada</li>
                    <li>📑 Tu boleta de honorarios electrónica</li>
                </ul>
                <div className={styles.orderInfo}>
                    <span>Número de orden:</span>
                    <strong>{orderId}</strong>
                </div>
                <div className={styles.actions}>
                    <Link href="/" className="btn-primary">Volver al inicio</Link>
                    <Link href="/#agendar" className="btn-outline">Completar anamnesis</Link>
                </div>
                <p className={styles.note}>
                    Si no recibes el correo en los próximos minutos, revisa tu carpeta de spam o contáctame directamente.
                </p>
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

'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { isInPersonEvaluation } from '@/lib/config/pricing';
import { formatClinicDate, formatClinicTime } from '@/lib/util/timezone';
import styles from './page.module.css';

type BookingSummary = {
    serviceType: string;
    amount: number;
    status: string;
    eventTypeId: string;
    appointmentDate?: string;
};

const serviceNames: Record<string, string> = {
    evalWiscV: 'Evaluación Cognitiva WISC-V',
    evalTDAH: 'Evaluación de TDAH',
    evalNeuropsicologica: 'Evaluación Neurocognitiva',
};

const dateInputFromNow = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const formatPreferredDate = (value: string) => new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
}).format(new Date(`${value}T12:00:00`));

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order') || 'N/A';
    const [booking, setBooking] = useState<BookingSummary | null>(null);
    const [loading, setLoading] = useState(orderId !== 'N/A');
    const [selectedDateTime, setSelectedDateTime] = useState<{ date: string; time: string } | null>(null);
    const [preferredStart, setPreferredStart] = useState(() => dateInputFromNow(7));
    const [preferredEnd, setPreferredEnd] = useState(() => dateInputFromNow(14));

    useEffect(() => {
        if (orderId && orderId !== 'N/A') {
            fetch(`/api/bookings/${orderId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.error || !data.serviceType) {
                        setBooking(null);
                    } else {
                        setBooking(data);
                        if (data.appointmentDate && !isInPersonEvaluation(data.serviceType)) {
                            setSelectedDateTime({
                                date: formatClinicDate(data.appointmentDate, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                                time: formatClinicTime(data.appointmentDate),
                            });
                        }
                    }
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error loading booking:', error);
                    setBooking(null);
                    setLoading(false);
                });
        }
    }, [orderId]);

    if (loading) {
        return <div className={styles.container}><div className={styles.card}>Cargando detalles de tu reserva...</div></div>;
    }

    if (orderId === 'N/A' || !booking) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <h1 className={styles.title} style={{ color: 'var(--foreground)' }}>Enlace inválido</h1>
                    <p className={styles.invalidText}>No se ha encontrado ninguna transacción activa.</p>
                    <div className={styles.actions}>
                        <Link href="/" className="btn-primary">Volver al inicio</Link>
                    </div>
                </div>
            </div>
        );
    }

    const isPresentialEvaluation = isInPersonEvaluation(booking.serviceType);
    const serviceName = serviceNames[booking.serviceType] || 'Servicio psicológico';
    const hasValidRange = Boolean(preferredStart && preferredEnd && preferredEnd >= preferredStart);
    const whatsappMessage = hasValidRange
        ? `Hola Gustavo, acabo de pagar ${serviceName} por $${booking.amount.toLocaleString('es-CL')} CLP a través de la web.\n\nID de orden: ${orderId}\nRango de fechas preferido: entre el ${formatPreferredDate(preferredStart)} y el ${formatPreferredDate(preferredEnd)}.\n\nMe gustaría coordinar la atención presencial según la disponibilidad del centro. Quedo atento/a a tu confirmación.`
        : '';
    const whatsappUrl = `https://wa.me/56922409953?text=${encodeURIComponent(whatsappMessage)}`;

    return (
        <div className={styles.container}>
            <div className={`${styles.card} ${styles.largeCard}`}>
                <div className={styles.successIcon}>🎉</div>
                <h1 className={styles.title}>{isPresentialEvaluation ? '¡Pago confirmado! Ahora coordinemos' : '¡Pago y reserva confirmados!'}</h1>

                {isPresentialEvaluation ? (
                    <div className={styles.appointmentDetails}>
                        <p className={styles.detailRow}><strong>✓ Evaluación:</strong> {serviceName}</p>
                        <p className={styles.detailRow}><strong>✓ Monto pagado:</strong> ${booking.amount.toLocaleString('es-CL')} CLP</p>
                        <p className={styles.detailRow}><strong>✓ Modalidad:</strong> Presencial en Santiago</p>
                    </div>
                ) : selectedDateTime ? (
                    <div className={styles.appointmentDetails}>
                        <p className={styles.detailRow}><strong>📅 Fecha:</strong> {selectedDateTime.date}</p>
                        <p className={styles.detailRow}><strong>⏰ Hora:</strong> {selectedDateTime.time} hrs</p>
                        <p className={styles.detailRow}><strong>📧 Confirmación enviada a tu correo</strong></p>
                    </div>
                ) : (
                    <div className={styles.appointmentDetails}>
                        <p className={styles.detailRow}><strong>✓ Servicio adquirido exitosamente</strong></p>
                        <p className={styles.detailRow}><strong>📧 Confirmación enviada a tu correo</strong></p>
                    </div>
                )}

                {isPresentialEvaluation && (
                    <div className={styles.coordinationPanel}>
                        <span className={styles.coordinationEyebrow}>Último paso · coordinación por WhatsApp</span>
                        <h2>Elige un rango de fechas desde la próxima semana</h2>
                        <p>Usaremos este rango para revisar contigo la disponibilidad de la consulta presencial. La fecha definitiva queda confirmada cuando Gustavo te responda por WhatsApp.</p>
                        <div className={styles.dateRangeGrid}>
                            <label>
                                Desde
                                <input
                                    type="date"
                                    min={dateInputFromNow(7)}
                                    max={dateInputFromNow(35)}
                                    value={preferredStart}
                                    onChange={event => {
                                        const nextStart = event.target.value;
                                        setPreferredStart(nextStart);
                                        if (preferredEnd < nextStart) setPreferredEnd(nextStart);
                                    }}
                                />
                            </label>
                            <label>
                                Hasta
                                <input
                                    type="date"
                                    min={preferredStart || dateInputFromNow(7)}
                                    max={dateInputFromNow(35)}
                                    value={preferredEnd}
                                    onChange={event => setPreferredEnd(event.target.value)}
                                />
                            </label>
                        </div>
                        <button
                            type="button"
                            disabled={!hasValidRange}
                            className={styles.whatsappButton}
                            onClick={() => window.open(whatsappUrl, '_blank', 'noopener,noreferrer')}
                        >
                            Enviar pago y fechas por WhatsApp →
                        </button>
                        <small>El mensaje incluirá automáticamente la evaluación pagada, el monto, el número de orden y el rango seleccionado.</small>
                    </div>
                )}

                <div className={styles.infoBox}>
                    <p>📧 <strong>Confirmación:</strong> Revisa tu bandeja de entrada o spam.</p>
                    <p>📑 <strong>Boleta de honorarios:</strong> Será gestionada después de confirmado el pago.</p>
                    {isPresentialEvaluation ? (
                        <p>📍 <strong>Fecha y centro:</strong> Se confirman por WhatsApp según disponibilidad de la consulta.</p>
                    ) : (
                        <p>🔗 <strong>Link de sesión:</strong> Recibirás el enlace de videollamada 24 horas antes.</p>
                    )}
                </div>

                <div className={styles.orderInfo}>
                    <span>ID de Orden Flow:</span>
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

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './Booking.module.css';
import Cal, { getCalApi } from "@calcom/embed-react";
import CalendarEmbed from './CalendarEmbed';
import { calendarConfig } from '@/lib/config/services';

type BookingStep = 'intro' | 'reason' | 'contact' | 'schedule' | 'payment' | 'processing' | 'success' | 'anamnesis';

export default function Booking() {
    const [step, setStep] = useState<BookingStep>('intro');
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
    const [bookingDetails, setBookingDetails] = useState<{ date?: string; time?: string }>({});
    const [calBookingId, setCalBookingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        serviceType: 'sesion' as 'sesion' | 'planMensual' | 'evaluacion',
        reason: '',
        details: '',
        name: '',
        email: '',
        phone: '',
        newsletter: true,
        age: '',
        medications: '',
        history: ''
    });

    useEffect(() => {
        (async function () {
            const cal = await getCalApi();
            cal("on", {
                action: "bookingSuccessful",
                callback: (e: any) => {
                    console.log('Cal.com: Booking initiated (requires confirmation)', e);

                    // Capturar el ID único del agendamiento
                    const bookingId = e.data.bookingId;
                    setCalBookingId(bookingId);

                    // Capturar fecha y hora para el resumen
                    const startTime = e.data.booking.startTime;
                    if (startTime) {
                        const dateObj = new Date(startTime);
                        setBookingDetails({
                            date: dateObj.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                            time: dateObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
                        });
                    }

                    // Avanzar automáticamente al pago
                    setStep('payment');
                }
            });
        })();
    }, []);

    // Validar email
    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // Validar teléfono chileno (opcional)
    const isValidPhone = (phone: string) => {
        if (!phone) return true; // Es opcional
        return /^(\+?56)?(\s?)(9)(\s?)(\d{4})(\s?)(\d{4})$/.test(phone.replace(/\s/g, ''));
    };

    // Validar antes de continuar al pago
    const validateContact = () => {
        const newErrors: { name?: string; email?: string; phone?: string } = {};

        if (!formData.name.trim() || formData.name.trim().length < 3) {
            newErrors.name = 'Por favor ingresa tu nombre completo';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = 'Por favor ingresa un email válido (ej: tu@email.com)';
        }

        if (formData.phone && !isValidPhone(formData.phone)) {
            newErrors.phone = 'Formato inválido. Usa: +56 9 1234 5678';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleStartPayment = async () => {
        setIsProcessing(true);
        setStep('processing');

        try {
            const response = await fetch('/api/payments/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    name: formData.name,
                    serviceType: formData.serviceType,
                    motivo: formData.reason,
                    detalles: formData.details,
                    phone: formData.phone,
                    newsletter: formData.newsletter,
                    calBookingId: calBookingId, // Vincular el ID de Cal.com
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.paymentUrl) {
                    window.location.href = data.paymentUrl;
                } else {
                    alert(`Error: ${data.error || 'No se pudo generar la URL de pago'}`);
                    setStep('payment');
                }
            } else {
                let errorMsg = 'Error en el servidor';
                try {
                    const data = await response.json();
                    errorMsg = data.error || errorMsg;
                } catch (e) {
                    errorMsg = `Status ${response.status}: Error interno del servidor`;
                }
                alert(`[NUEVO CÓDIGO] Error al iniciar el pago: ${errorMsg}`);
                setStep('payment');
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            alert(`Error de conexión: ${error.message}`);
            setStep('payment');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleNext = () => {
        if (step === 'intro') setStep('reason');
        else if (step === 'reason') setStep('contact');
        else if (step === 'contact') {
            if (validateContact()) {
                setStep('schedule'); // Ver disponibilidad primero
            }
        }
        else if (step === 'schedule') setStep('payment'); // Luego pagar
        else if (step === 'success') setStep('anamnesis');
    };

    const handleBack = () => {
        if (step === 'reason') setStep('intro');
        else if (step === 'contact') setStep('reason');
        else if (step === 'schedule') setStep('contact');
        else if (step === 'payment') setStep('schedule');
    };

    const [isReasonOpen, setIsReasonOpen] = useState(false);
    const reasons = [
        { value: 'ansiedad', label: 'Ansiedad o Estrés' },
        { value: 'depresion', label: 'Estado de ánimo bajo' },
        { value: 'salud-mental', label: 'Salud Mental General' },
        { value: 'pareja', label: 'Terapia de Pareja' },
        { value: 'infantil', label: 'Atención Infantil / Adolescente' },
        { value: 'otro', label: 'Otro motivo' }
    ];

    const handleSelectReason = (value: string) => {
        setFormData({ ...formData, reason: value });
        setIsReasonOpen(false);
    };

    return (
        <section id="agendar" className={styles.booking} style={{ scrollMarginTop: '100px' }}>
            <div className="container">
                <div className={`${styles.bookingCard} ${step === 'schedule' ? styles.wideCard : ''}`}>
                    {step === 'intro' && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>¿Qué necesitas hoy?</h2>
                            <p className={styles.stepDesc}>Selecciona el tipo de servicio para comenzar tu agendamiento.</p>

                            <div className={styles.serviceSelector}>
                                <button
                                    className={`${styles.serviceOption} ${formData.serviceType === 'sesion' ? styles.active : ''}`}
                                    onClick={() => setFormData({ ...formData, serviceType: 'sesion' })}
                                >
                                    <strong>Sesión Individual</strong>
                                    <span>$40.000 (45 min)</span>
                                </button>
                                <button
                                    className={`${styles.serviceOption} ${formData.serviceType === 'planMensual' ? styles.active : ''}`}
                                    onClick={() => setFormData({ ...formData, serviceType: 'planMensual' })}
                                >
                                    <strong>Pack 4 Sesiones</strong>
                                    <span>$150.000 (Ahorro directo)</span>
                                </button>
                                <button
                                    className={`${styles.serviceOption} ${formData.serviceType === 'evaluacion' ? styles.active : ''}`}
                                    onClick={() => setFormData({ ...formData, serviceType: 'evaluacion' })}
                                >
                                    <strong>Evaluación</strong>
                                    <span>$150.000 (Proceso completo)</span>
                                </button>
                            </div>

                            <button onClick={handleNext} className="btn-primary">Continuar</button>
                        </div>
                    )}

                    {step === 'reason' && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>¿Cómo te sientes hoy?</h2>
                            <p className={styles.stepDesc}>Tus respuestas son 100% confidenciales.</p>

                            <div className={styles.formGroup}>
                                <label>Motivo principal de consulta</label>
                                <div className={styles.customSelectWrapper}>
                                    <div
                                        className={`${styles.customSelectTrigger} ${isReasonOpen ? styles.open : ''}`}
                                        onClick={() => setIsReasonOpen(!isReasonOpen)}
                                    >
                                        <span>
                                            {reasons.find(r => r.value === formData.reason)?.label || 'Selecciona una opción'}
                                        </span>
                                        <div className={styles.arrowIcon}></div>
                                    </div>

                                    {isReasonOpen && (
                                        <div className={styles.customSelectOptions}>
                                            {reasons.map((r) => (
                                                <div
                                                    key={r.value}
                                                    className={`${styles.customOption} ${formData.reason === r.value ? styles.selected : ''}`}
                                                    onClick={() => handleSelectReason(r.value)}
                                                >
                                                    {r.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Cuéntame brevemente qué te trae por acá</label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Libre de expresarte..."
                                    value={formData.details}
                                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                />
                            </div>
                            <div className={styles.buttonGroup}>
                                <button onClick={handleBack} className="btn-secondary">← Volver</button>
                                <button onClick={handleNext} className="btn-primary" disabled={!formData.reason}>Siguiente</button>
                            </div>
                        </div>
                    )}

                    {step === 'contact' && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>Tus datos de contacto</h2>
                            <p className={styles.stepDesc}>Para enviarte la confirmación y el link de la sesión.</p>
                            <div className={styles.formGroup}>
                                <label>Nombre completo *</label>
                                <input
                                    type="text"
                                    className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                                    placeholder="Tu nombre completo"
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData({ ...formData, name: e.target.value });
                                        if (errors.name) setErrors({ ...errors, name: undefined });
                                    }}
                                />
                                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email *</label>
                                <input
                                    type="email"
                                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                                    placeholder="tu@email.com"
                                    value={formData.email}
                                    onChange={(e) => {
                                        setFormData({ ...formData, email: e.target.value });
                                        if (errors.email) setErrors({ ...errors, email: undefined });
                                    }}
                                />
                                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Teléfono (opcional)</label>
                                <input
                                    type="tel"
                                    className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                                    placeholder="+56 9 1234 5678"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        setFormData({ ...formData, phone: e.target.value });
                                        if (errors.phone) setErrors({ ...errors, phone: undefined });
                                    }}
                                />
                                {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                            </div>
                            <div className={styles.formGroupCheckbox}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={formData.newsletter}
                                        onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
                                    />
                                    <span>Quiero recibir noticias, consejos de salud mental y novedades.</span>
                                </label>
                            </div>
                            <div className={styles.buttonGroup}>
                                <button onClick={handleBack} className="btn-secondary">← Volver</button>
                                <button onClick={handleNext} className="btn-primary">Ver disponibilidad</button>
                            </div>
                        </div>
                    )}

                    {step === 'schedule' && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>Selecciona tu horario</h2>
                            <p className={styles.stepDesc}>Elige el día y hora que más te acomode. <strong>Tu reserva se confirmará automáticamente tras el pago.</strong></p>

                            <div className={styles.calendarContainer}>
                                <CalendarEmbed
                                    serviceType={formData.serviceType}
                                    name={formData.name}
                                    email={formData.email}
                                    height="650px"
                                />
                            </div>

                            <div className={styles.infoNote}>
                                <p>💡 <strong>¿Cómo funciona?</strong> Al elegir tu hora, serás redirigido al pago. Una vez confirmado, recibirás el link de Google Meet y los detalles en tu email de inmediato.</p>
                            </div>

                            <div className={styles.buttonGroup}>
                                <button onClick={handleBack} className="btn-secondary">← Volver</button>
                            </div>
                        </div>
                    )}

                    {step === 'payment' && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>Confirma tu Reserva</h2>
                            <p className={styles.stepDesc}>Al completar el pago, tu cita quedará confirmada y recibirás un email con todos los detalles.</p>

                            <div className={styles.paymentBox}>
                                <div className={styles.priceRow}>
                                    <span>{
                                        formData.serviceType === 'sesion' ? 'Sesión de Psicoterapia Individual' :
                                            formData.serviceType === 'planMensual' ? 'Pack de 4 Sesiones Integrativas' :
                                                'Evaluación Clínica'
                                    }</span>
                                    <strong>{
                                        formData.serviceType === 'sesion' ? '$40.000' :
                                            formData.serviceType === 'planMensual' ? '$150.000' :
                                                '$150.000'
                                    }</strong>
                                </div>
                                <div className={styles.methodIcons}>
                                    💳 Tarjetas de Crédito/Débito · Webpay
                                </div>
                                <div className={styles.securityBadges}>
                                    <span>🔒 Pago seguro con Flow</span>
                                    <span>📑 Boleta automática</span>
                                </div>
                                <p className={styles.invoiceNote}>
                                    Tu boleta de honorarios electrónica será enviada automáticamente a tu email tras confirmar el pago.
                                </p>
                            </div>
                            <div className={styles.buttonGroup}>
                                <button onClick={handleBack} className="btn-secondary" disabled={isProcessing}>← Volver</button>
                                <button onClick={handleStartPayment} className="btn-primary" disabled={isProcessing}>
                                    {isProcessing ? 'Procesando...' : 'Pagar y Confirmar Cita'}
                                </button>
                            </div>
                            <p className={styles.disclaimer}>Al continuar aceptas los términos de servicio y política de privacidad.</p>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className={styles.stepContent}>
                            <div className={styles.loadingSpinner}></div>
                            <h2 className={styles.stepTitle}>Preparando tu pago...</h2>
                            <p className={styles.stepDesc}>Serás redirigido a la pasarela de pago segura.</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className={styles.stepContent}>
                            <div className={styles.successIcon}>✨</div>
                            <h2 className={styles.stepTitle}>¡Cita Agendada Exitosamente!</h2>
                            <p className={styles.stepDesc}>Se ha enviado un correo con el link de la sesión y tu boleta adjunta.</p>
                            <div className={styles.infoBox}>
                                <p><strong>📧 Revisa tu email:</strong> {formData.email}</p>
                                <p><strong>📑 Boleta:</strong> Enviada automáticamente</p>
                            </div>
                            <p className={styles.anamnesisPrompt}>Para ahorrar tiempo en la sesión, por favor completa estos datos clínicos adicionales:</p>
                            <button onClick={handleNext} className="btn-primary">Completar Anamnesis</button>
                        </div>
                    )}

                    {step === 'anamnesis' && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>Ficha Clínica (Anamnesis)</h2>
                            <p className={styles.stepDesc}>Esta información me ayudará a preparar mejor nuestra primera sesión.</p>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Edad</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>¿Tomas algún medicamento?</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Sí/No, cuáles..."
                                        value={formData.medications}
                                        onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Antecedentes familiares relevantes</label>
                                    <textarea
                                        className={styles.textarea}
                                        value={formData.history}
                                        onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    try {
                                        await fetch('/api/anamnesis', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(formData),
                                        });
                                        alert('¡Gracias! Datos guardados. Nos vemos pronto.');
                                        setStep('intro');
                                    } catch (e) {
                                        alert('Error al guardar. Por favor intenta de nuevo.');
                                    }
                                }}
                                className="btn-primary"
                            >
                                Enviar Ficha
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section >
    );
}

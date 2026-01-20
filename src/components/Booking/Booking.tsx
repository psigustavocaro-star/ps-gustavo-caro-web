'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './Booking.module.css';

type BookingStep = 'intro' | 'reason' | 'contact' | 'payment' | 'processing' | 'success' | 'anamnesis';

export default function Booking() {
    const [step, setStep] = useState<BookingStep>('intro');
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        serviceType: 'sesion' as 'sesion' | 'planMensual' | 'evaluacion',
        reason: '',
        details: '',
        name: '',
        email: '',
        phone: '',
        age: '',
        medications: '',
        history: ''
    });

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
                }),
            });

            const data = await response.json();

            if (data.success && data.paymentUrl) {
                // Redirigir a Flow para completar el pago
                window.location.href = data.paymentUrl;
            } else {
                alert('Error al iniciar el pago. Por favor intenta nuevamente.');
                setStep('payment');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Error de conexión. Por favor intenta nuevamente.');
            setStep('payment');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleNext = () => {
        if (step === 'intro') setStep('reason');
        else if (step === 'reason') setStep('contact');
        else if (step === 'contact') setStep('payment');
        else if (step === 'success') setStep('anamnesis');
    };

    return (
        <section id="agendar" className={styles.booking}>
            <div className="container">
                <div className={styles.bookingCard}>
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
                                    <span>$40.000 (50-60 min)</span>
                                </button>
                                <button
                                    className={`${styles.serviceOption} ${formData.serviceType === 'planMensual' ? styles.active : ''}`}
                                    onClick={() => setFormData({ ...formData, serviceType: 'planMensual' })}
                                >
                                    <strong>Pack 4 Sesiones</strong>
                                    <span>$115.000 (Ahorro directo)</span>
                                </button>
                                <button
                                    className={`${styles.serviceOption} ${formData.serviceType === 'evaluacion' ? styles.active : ''}`}
                                    onClick={() => setFormData({ ...formData, serviceType: 'evaluacion' })}
                                >
                                    <strong>Evaluación</strong>
                                    <span>Consultar proceso</span>
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
                                <select
                                    className={styles.input}
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                >
                                    <option value="">Selecciona una opción</option>
                                    <option value="ansiedad">Ansiedad o Estrés</option>
                                    <option value="depresion">Estado de ánimo bajo</option>
                                    <option value="salud-mental">Salud Mental General</option>
                                    <option value="pareja">Terapia de Pareja</option>
                                    <option value="infantil">Atención Infantil / Adolescente</option>
                                    <option value="otro">Otro motivo</option>
                                </select>
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
                            <button onClick={handleNext} className="btn-primary" disabled={!formData.reason}>Siguiente</button>
                        </div>
                    )}

                    {step === 'contact' && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>Tus datos de contacto</h2>
                            <p className={styles.stepDesc}>Para enviarte la confirmación y el link de la sesión.</p>
                            <div className={styles.formGroup}>
                                <label>Nombre completo</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="Tu nombre"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    className={styles.input}
                                    placeholder="tu@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Teléfono (opcional)</label>
                                <input
                                    type="tel"
                                    className={styles.input}
                                    placeholder="+56 9 1234 5678"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <button onClick={handleNext} className="btn-primary" disabled={!formData.name || !formData.email}>Continuar al pago</button>
                        </div>
                    )}

                    {step === 'payment' && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>Reserva y Pago Seguro</h2>
                            <p className={styles.stepDesc}>El valor de la sesión es de $40.000 CLP. El pago es 100% seguro.</p>
                            <div className={styles.paymentBox}>
                                <div className={styles.priceRow}>
                                    <span>{
                                        formData.serviceType === 'sesion' ? 'Sesión de Psicoterapia Individual' :
                                            formData.serviceType === 'planMensual' ? 'Pack de 4 Sesiones Integrativas' :
                                                'Evaluación Clínica'
                                    }</span>
                                    <strong>{
                                        formData.serviceType === 'sesion' ? '$40.000' :
                                            formData.serviceType === 'planMensual' ? '$115.000' :
                                                '$80.000'
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
                            <button onClick={handleStartPayment} className="btn-primary" disabled={isProcessing}>
                                {isProcessing ? 'Procesando...' : 'Pagar y Confirmar Cita'}
                            </button>
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
        </section>
    );
}

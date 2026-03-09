'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './Booking.module.css';
import CustomCalendar from './CustomCalendar';

type BookingStep = 'intro' | 'contact' | 'schedule' | 'payment' | 'processing' | 'success' | 'anamnesis';

export default function Booking() {
    const [step, setStep] = useState<BookingStep>('intro');
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string; rut?: string; address?: string; commune?: string }>({});
    const [bookingDetails, setBookingDetails] = useState<{ date?: string; time?: string }>({});
    const [calBookingId, setCalBookingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        serviceType: 'primeraConsulta' as 'primeraConsulta' | 'sesion' | 'packSesiones' | 'evalTDAH' | 'evalAutismo' | 'evalInteligencia' | 'evalNeuropsicologica' | 'evalEmocional' | 'evalFreeTDAH' | 'evalFreeAutismo' | 'evalFreeInteligencia' | 'evalFreeNeuro' | 'evalFreeEmocional' | '',
        reason: '',
        details: '',
        name: '',
        email: '',
        phone: '',
        rut: '',
        address: '',
        commune: '',
        newsletter: true,
        age: '',
        medications: '',
        history: '',
        rawStartTime: '', // Guardar el ISO string para la API
        calEventTypeId: null as number | null,
        coupon: ''
    });

    const [appliedCoupon, setAppliedCoupon] = useState<{ status: 'none' | 'valid' | 'invalid', discount: number }>({ status: 'none', discount: 0 });

    // Efecto para scroll automático al inicio de la sección cuando cambia el paso
    useEffect(() => {
        // No scrollear en el primer render ni cuando vuelve a intro desde afuera
        if (step !== 'intro') {
            const element = document.getElementById('agendar');
            if (element) {
                const offset = 100; // Ajuste para el navbar sticky
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    }, [step]);

    // Handler para cuando el usuario selecciona fecha y hora en el calendario custom
    const handleDateTimeSelection = (date: Date, time: string) => {
        const dateObj = new Date(date);
        const [hours, minutes] = time.split(':').map(Number);
        dateObj.setHours(hours, minutes, 0, 0);

        setBookingDetails({
            date: dateObj.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            time: time
        });

        setFormData(prev => ({
            ...prev,
            rawStartTime: dateObj.toISOString()
        }));

        // Redirigir siempre a rellenar datos de contacto después de escoger bloque horario.
        setStep('contact');
    };

    // Validar email
    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // Validar teléfono chileno (opcional)
    const isValidPhone = (phone: string) => {
        if (!phone) return true; // Es opcional
        return /^(\+?56)?(\s?)(9)(\s?)(\d{4})(\s?)(\d{4})$/.test(phone.replace(/\s/g, ''));
    };

    // Validar RUT chileno
    const isValidRut = (rut: string) => {
        if (!rut) return false;
        const cleanRut = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
        if (cleanRut.length < 8) return false;
        const cuerpo = cleanRut.slice(0, -1);
        const dv = cleanRut.slice(-1);
        let suma = 0;
        let multiplo = 2;
        for (let i = cuerpo.length - 1; i >= 0; i--) {
            suma += parseInt(cuerpo.charAt(i)) * multiplo;
            multiplo = multiplo === 7 ? 2 : multiplo + 1;
        }
        const dvEsperado = 11 - (suma % 11);
        const dvCalc = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
        return dv === dvCalc;
    };

    // Validar antes de continuar al pago
    const validateContact = () => {
        const newErrors: { name?: string; email?: string; phone?: string; rut?: string; address?: string; commune?: string } = {};

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

        if (!formData.rut.trim()) {
            newErrors.rut = 'El RUT es necesario para tu boleta de honorarios';
        } else if (!isValidRut(formData.rut)) {
            newErrors.rut = 'RUT inválido (usa formato: 12.345.678-9)';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Dirección requerida para la boleta';
        }

        if (!formData.commune.trim()) {
            newErrors.commune = 'Comuna requerida para la boleta';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleStartPayment = async () => {
        setIsProcessing(true);
        setStep('processing');

        const finalPrice = calculateFinalPrice();
        const isFree = formData.serviceType === 'primeraConsulta' || formData.serviceType.startsWith('evalFree') || finalPrice === 0;

        try {
            const response = await fetch(isFree ? '/api/payments/free' : '/api/payments/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    name: formData.name,
                    phone: formData.phone,
                    rut: formData.rut,
                    address: formData.address,
                    commune: formData.commune,
                    serviceType: formData.serviceType,
                    motivo: formData.reason || formData.details,
                    detalles: formData.details,
                    appointmentDate: formData.rawStartTime,
                    calEventTypeId: formData.calEventTypeId,
                    newsletter: formData.newsletter,
                    coupon: appliedCoupon.status === 'valid' ? formData.coupon : undefined
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (isFree && data.success) {
                    setStep('success');
                } else if (data.success && data.paymentUrl) {
                    window.location.href = data.paymentUrl;
                } else {
                    alert(`Error: ${data.error || 'No se pudo procesar la solicitud'}`);
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
                alert(`Error: ${errorMsg}`);
                setStep('payment');
            }
        } catch (error: any) {
            console.error('Booking error:', error);
            alert(`Error de conexión: ${error.message}`);
            setStep('payment');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleNext = () => {
        if (step === 'intro') setStep('schedule'); // De seleccionar servicio -> escoger horario directamente
        else if (step === 'schedule') setStep('contact'); // De horario -> datos personales
        else if (step === 'contact') {
            if (validateContact()) {
                setStep('payment'); // De datos personales -> confirmar y pagar
            }
        }
        else if (step === 'payment') setStep('processing');
        else if (step === 'success') setStep('anamnesis');
    };

    const handleBack = () => {
        if (step === 'schedule') setStep('intro');
        else if (step === 'contact') setStep('schedule');
        else if (step === 'payment') setStep('contact');
    };

    const calculateFinalPrice = () => {
        let basePrice = 0;
        switch (formData.serviceType) {
            case 'sesion': basePrice = 36000; break;
            case 'packSesiones': basePrice = 140000; break;
            case 'evalTDAH': basePrice = 180000; break;
            case 'evalAutismo': basePrice = 220000; break;
            case 'evalInteligencia': basePrice = 160000; break;
            case 'evalNeuropsicologica': basePrice = 240000; break;
            case 'evalEmocional': basePrice = 140000; break;
            default: basePrice = 0;
        }

        if (appliedCoupon.status === 'valid') {
            return Math.max(0, basePrice - appliedCoupon.discount);
        }
        return basePrice;
    };

    const handleApplyCoupon = () => {
        if (formData.coupon.toUpperCase() === 'TEST100') {
            setAppliedCoupon({ status: 'valid', discount: 1000000 }); // Descuento total
        } else if (formData.coupon.toUpperCase() === 'GUSTAVO10') {
            setAppliedCoupon({ status: 'valid', discount: 10000 });
        } else {
            setAppliedCoupon({ status: 'invalid', discount: 0 });
        }
    };
    const resetForm = () => {
        setFormData({
            serviceType: 'primeraConsulta',
            reason: '',
            details: '',
            name: '',
            email: '',
            phone: '',
            rut: '',
            address: '',
            commune: '',
            newsletter: true,
            age: '',
            medications: '',
            history: '',
            rawStartTime: '',
            calEventTypeId: null,
            coupon: ''
        });
        setAppliedCoupon({ status: 'none', discount: 0 });
        setErrors({});
        setStep('intro');
    };



    return (
        <section id="agendar" className={styles.booking} style={{ scrollMarginTop: '100px' }}>
            <div className="container">
                <div className={`${styles.bookingCard} ${step === 'schedule' ? styles.wideCard : ''} ${step === 'intro' ? styles.introCard : ''}`}>
                    {step === 'intro' && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>¿Qué necesitas hoy?</h2>
                            <p className={styles.stepDesc}>Selecciona el tipo de servicio para comenzar tu agendamiento.</p>

                            <div className={styles.formGroup}>
                                <label>Servicio a agendar *</label>
                                <select
                                    className={`${styles.input} ${styles.select}`}
                                    value={formData.serviceType}
                                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as any })}
                                >
                                    <option value="" disabled>Selecciona un servicio...</option>
                                    <optgroup label="Psicoterapia TCC">
                                        <option value="primeraConsulta">Primera Consulta Inicial (Gratis) - 20 min</option>
                                        <option value="sesion">Sesión Individual de Psicoterapia - $36.000</option>
                                        <option value="packSesiones">Pack 4 Sesiones Mensual - $140.000</option>
                                    </optgroup>
                                    <optgroup label="Evaluaciones Clínicas (Incluyen Entrevista Gratis)">
                                        <option value="evalFreeNeuro">Entrevista Inicial (OBLIGATORIA Evaluaciones) - GRATIS</option>
                                        <option value="evalTDAH">Paso 2: Evaluación TDAH Adulto - $180.000</option>
                                        <option value="evalAutismo">Paso 2: Evaluación Espectro Autista (TEA) - $220.000</option>
                                        <option value="evalNeuropsicologica">Paso 2: Evaluación Neuropsicológica Completa - $240.000</option>
                                        <option value="evalInteligencia">Paso 2: Evaluación Intelectual (WAIS/WISC) - $160.000</option>
                                        <option value="evalEmocional">Paso 2: Evaluación Socioemocional - $140.000</option>
                                    </optgroup>
                                </select>
                            </div>

                            <button
                                onClick={handleNext}
                                className="btn-primary"
                                disabled={formData.serviceType === ''}
                            >
                                Seleccionar Servicio para Continuar
                            </button>
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
                                <label>Motivo de consulta (opcional)</label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Cuéntame brevemente qué te trae por acá (Ansiedad, Terapia de pareja, etc.)"
                                    value={formData.details}
                                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                />
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
                            <div className={styles.formGroup}>
                                <label>RUT (Para tu boleta) *</label>
                                <input
                                    type="text"
                                    className={`${styles.input} ${errors.rut ? styles.inputError : ''}`}
                                    placeholder="12.345.678-9"
                                    value={formData.rut}
                                    onChange={(e) => {
                                        setFormData({ ...formData, rut: e.target.value });
                                        if (errors.rut) setErrors({ ...errors, rut: undefined });
                                    }}
                                />
                                {errors.rut && <span className={styles.errorText}>{errors.rut}</span>}
                            </div>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Domicilio (Dirección) *</label>
                                    <input
                                        type="text"
                                        className={`${styles.input} ${errors.address ? styles.inputError : ''}`}
                                        placeholder="Ej: Av. Providencia 1234, Depto 41"
                                        value={formData.address}
                                        onChange={(e) => {
                                            setFormData({ ...formData, address: e.target.value });
                                            if (errors.address) setErrors({ ...errors, address: undefined });
                                        }}
                                    />
                                    {errors.address && <span className={styles.errorText}>{errors.address}</span>}
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Comuna *</label>
                                    <input
                                        type="text"
                                        className={`${styles.input} ${errors.commune ? styles.inputError : ''}`}
                                        placeholder="Ej: Providencia"
                                        value={formData.commune}
                                        onChange={(e) => {
                                            setFormData({ ...formData, commune: e.target.value });
                                            if (errors.commune) setErrors({ ...errors, commune: undefined });
                                        }}
                                    />
                                    {errors.commune && <span className={styles.errorText}>{errors.commune}</span>}
                                </div>
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
                                <button onClick={handleNext} className="btn-primary">Continuar al resumen y pago</button>
                            </div>
                        </div>
                    )}

                    {step === 'schedule' && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>Selecciona tu horario</h2>
                            <p className={styles.stepDesc}>Elige el día y hora que mejor te acomode. <strong>Al confirmar, pasarás al pago.</strong></p>

                            <div className={styles.calendarContainer}>
                                <CustomCalendar
                                    onSelectDateTime={handleDateTimeSelection}
                                    bookedSlots={[]}
                                />
                            </div>
                        </div>
                    )}

                    {step === 'payment' && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>Confirma tu Reserva</h2>
                            <p className={styles.stepDesc}>Tu cita: <strong>{bookingDetails.date}</strong> a las <strong>{bookingDetails.time}</strong></p>

                            <div className={styles.paymentBox}>
                                <div className={styles.priceRow}>
                                    <span>{
                                        formData.serviceType === 'primeraConsulta' ? 'Primera Consulta (Gratis)' :
                                            formData.serviceType.startsWith('evalFree') ? 'Sesión Inicial de Evaluación' :
                                                formData.serviceType === 'sesion' ? 'Sesión de Psicoterapia Individual' :
                                                    formData.serviceType === 'packSesiones' ? 'Pack de 4 Sesiones' :
                                                        formData.serviceType === 'evalTDAH' ? 'Evaluación TDAH Adulto' :
                                                            formData.serviceType === 'evalAutismo' ? 'Evaluación TEA (Autismo)' :
                                                                formData.serviceType === 'evalInteligencia' ? 'Evaluación Intelectual' :
                                                                    formData.serviceType === 'evalNeuropsicologica' ? 'Evaluación Neuropsicológica Completa' :
                                                                        formData.serviceType === 'evalEmocional' ? 'Evaluación Socioemocional' :
                                                                            'Servicio'
                                    }</span>
                                    <strong>{
                                        `$${calculateFinalPrice().toLocaleString('es-CL')}`
                                    }</strong>
                                </div>

                                {!(formData.serviceType === 'primeraConsulta' || formData.serviceType.startsWith('evalFree')) && (
                                    <div className={styles.couponSection}>
                                        <div className={styles.couponInputWrapper}>
                                            <input
                                                type="text"
                                                placeholder="¿Tienes un cupón?"
                                                className={styles.couponInput}
                                                value={formData.coupon}
                                                onChange={(e) => setFormData({ ...formData, coupon: e.target.value })}
                                            />
                                            <button onClick={handleApplyCoupon} className={styles.couponBtn}>Aplicar</button>
                                        </div>
                                        {appliedCoupon.status === 'valid' && <span className={styles.couponSuccess}>✓ Cupón aplicado: -${appliedCoupon.discount.toLocaleString('es-CL')}</span>}
                                        {appliedCoupon.status === 'invalid' && <span className={styles.couponError}>× Cupón no válido</span>}
                                    </div>
                                )}
                                {formData.serviceType === 'primeraConsulta' || formData.serviceType.startsWith('evalFree') ? (
                                    <p className={styles.invoiceNote}>
                                        Esta es una sesión inicial gratuita. No se realizará ningún cargo a tus tarjetas. Al confirmar, recibirás el link de acceso en tu correo.
                                    </p>
                                ) : (
                                    <>
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
                                    </>
                                )}
                            </div>
                            <div className={styles.buttonGroup}>
                                <button onClick={handleBack} className="btn-secondary" disabled={isProcessing}>← Volver</button>
                                <button onClick={handleStartPayment} className="btn-primary" disabled={isProcessing}>
                                    {isProcessing ? 'Procesando...' :
                                        (formData.serviceType === 'primeraConsulta' || formData.serviceType.startsWith('evalFree') || calculateFinalPrice() === 0)
                                            ? 'Confirmar Agendamiento Gratis ✨'
                                            : 'Pagar con Flow 💳'}
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
                            <p className={styles.stepDesc}>
                                {calculateFinalPrice() === 0
                                    ? 'Se ha enviado un correo con los detalles y el link de acceso a tu sesión.'
                                    : 'Se ha enviado un correo con el link de la sesión y tu boleta adjunta.'}
                            </p>
                            <div className={styles.infoBox}>
                                <p><strong>📧 Revisa tu email:</strong> {formData.email}</p>
                                {calculateFinalPrice() > 0 && (
                                    <p><strong>📑 Boleta:</strong> Enviada automáticamente</p>
                                )}
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
                                        resetForm();
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

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './Booking.module.css';
import CustomCalendar from './CustomCalendar';

type BookingStep = 'intro' | 'reason' | 'contact' | 'schedule' | 'payment' | 'processing' | 'success' | 'anamnesis';

export default function Booking() {
    const [step, setStep] = useState<BookingStep>('intro');
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string; rut?: string; address?: string; commune?: string }>({});
    const [bookingDetails, setBookingDetails] = useState<{ date?: string; time?: string }>({});
    const [calBookingId, setCalBookingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        serviceType: 'sesion' as 'primeraConsulta' | 'sesion' | 'packSesiones' | 'evalTDAH' | 'evalAutismo' | 'evalInteligencia' | 'evalNeuropsicologica' | 'evalEmocional' | 'evalFreeTDAH' | 'evalFreeAutismo' | 'evalFreeInteligencia' | 'evalFreeNeuro' | 'evalFreeEmocional',
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
        if (step !== 'intro' || formData.reason !== '') {
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

        // Si es gratuito, ir directamente a éxito (procesando -> éxito)
        if (formData.serviceType === 'primeraConsulta' || formData.serviceType.startsWith('evalFree')) {
            setStep('payment'); // Mostramos confirmación antes, pero el botón dirá "Confirmar Gratis"
        } else {
            setStep('payment');
        }
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
                    motivo: formData.reason,
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
        if (step === 'intro') setStep('reason');
        else if (step === 'reason') setStep('contact');
        else if (step === 'contact') {
            if (validateContact()) {
                setStep('schedule'); // Ir al calendario primero
            }
        }
        else if (step === 'schedule') setStep('payment'); // Después del calendario, pagar
        else if (step === 'payment') setStep('processing'); // Procesar pago
        else if (step === 'success') setStep('anamnesis'); // Después del pago exitoso, anamnesis
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

    const calculateFinalPrice = () => {
        let basePrice = 0;
        switch (formData.serviceType) {
            case 'sesion': basePrice = 40000; break;
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
            serviceType: 'sesion',
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

    const handleSelectReason = (value: string) => {
        setFormData({ ...formData, reason: value });
        setIsReasonOpen(false);
    };

    return (
        <section id="agendar" className={styles.booking} style={{ scrollMarginTop: '100px' }}>
            <div className="container">
                <div className={`${styles.bookingCard} ${step === 'schedule' ? styles.wideCard : ''} ${step === 'intro' ? styles.introCard : ''}`}>
                    {step === 'intro' && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>¿Qué necesitas hoy?</h2>
                            <p className={styles.stepDesc}>Selecciona el tipo de servicio para comenzar tu agendamiento.</p>

                            {/* Sección: Psicoterapia */}
                            <div className={styles.serviceSection}>
                                <h3 className={styles.sectionLabel}>Psicoterapia TCC</h3>
                                <p className={styles.sectionNote}>Terapia basada en evidencia con seguimiento personalizado</p>
                                <div className={styles.serviceList}>
                                    <button
                                        className={`${styles.serviceItem} ${styles.highlight} ${formData.serviceType === 'primeraConsulta' ? styles.active : ''}`}
                                        onClick={() => setFormData({ ...formData, serviceType: 'primeraConsulta' as any })}
                                    >
                                        <div className={styles.serviceRadio}></div>
                                        <div className={styles.serviceMainInfo}>
                                            <div className={styles.serviceTopLine}>
                                                <strong>Primera Consulta (Gratis)</strong>
                                                <span className={`${styles.miniBadge} ${styles.free}`}>Reserva Directa</span>
                                            </div>
                                            <p className={styles.serviceDesc}>Sesión inicial de evaluación y encuadre (20 minutos). Se agenda directamente sin costo.</p>
                                        </div>
                                        <div className={styles.servicePricing}>
                                            <span className={styles.price}>GRATIS</span>
                                            <span className={styles.duration}>20 min</span>
                                        </div>
                                    </button>

                                    <button
                                        className={`${styles.serviceItem} ${formData.serviceType === 'sesion' ? styles.active : ''}`}
                                        onClick={() => setFormData({ ...formData, serviceType: 'sesion' })}
                                    >
                                        <div className={styles.serviceRadio}></div>
                                        <div className={styles.serviceMainInfo}>
                                            <div className={styles.serviceTopLine}>
                                                <strong>Sesión Individual</strong>
                                            </div>
                                            <p className={styles.serviceDesc}>TCC personalizada con asesoría vía email post-sesión.</p>
                                        </div>
                                        <div className={styles.servicePricing}>
                                            <span className={styles.price}>$40.000</span>
                                            <span className={styles.duration}>45 min</span>
                                        </div>
                                    </button>

                                    <button
                                        className={`${styles.serviceItem} ${formData.serviceType === 'packSesiones' ? styles.active : ''}`}
                                        onClick={() => setFormData({ ...formData, serviceType: 'packSesiones' as any })}
                                    >
                                        <div className={styles.serviceRadio}></div>
                                        <div className={styles.serviceMainInfo}>
                                            <div className={styles.serviceTopLine}>
                                                <strong>Pack 4 Sesiones</strong>
                                                <span className={`${styles.miniBadge} ${styles.save}`}>Ahorras $20.000</span>
                                            </div>
                                            <p className={styles.serviceDesc}>Proceso continuo con seguimiento y materiales.</p>
                                        </div>
                                        <div className={styles.servicePricing}>
                                            <span className={styles.price}>$140.000</span>
                                            <span className={styles.duration}>Mes completo</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Sección: Evaluaciones Neuropsicológicas */}
                            <div className={styles.serviceSection}>
                                <h3 className={styles.sectionLabel}>Evaluaciones Neuropsicológicas</h3>
                                <p className={styles.sectionNote}>Incluyen informe profesional impreso y digital</p>
                                <div className={styles.serviceList}>
                                    <div className={styles.specialSessionWrapper}>
                                        <h4 className={styles.specialSessionLabel}>Paso 1: Entrevista Inicial (Obligatoria)</h4>
                                        <button
                                            className={`${styles.serviceItem} ${styles.specialButton} ${formData.serviceType.startsWith('evalFree') ? styles.active : ''}`}
                                            onClick={() => setFormData({ ...formData, serviceType: 'evalFreeNeuro' as any })}
                                        >
                                            <div className={styles.serviceRadio}></div>
                                            <div className={styles.serviceMainInfo}>
                                                <div className={styles.serviceTopLine}>
                                                    <strong>Sesión Inicial Gratuita</strong>
                                                    <span className={`${styles.miniBadge} ${styles.free}`}>Agendamiento Especial</span>
                                                </div>
                                                <p className={styles.serviceDesc}>Obligatoria para todas las evaluaciones. Breve sesión (15-20 min) para anamnesis previa a iniciar el proceso pagado.</p>
                                            </div>
                                            <div className={styles.servicePricing}>
                                                <span className={styles.price}>GRATIS</span>
                                            </div>
                                        </button>
                                    </div>

                                    <h4 className={styles.specialSessionLabel}>Paso 2: Pack de Evaluación (Post-Entrevista)</h4>

                                    <button
                                        className={`${styles.serviceItem} ${formData.serviceType === 'evalTDAH' ? styles.active : ''}`}
                                        onClick={() => setFormData({ ...formData, serviceType: 'evalTDAH' as any })}
                                    >
                                        <div className={styles.serviceRadio}></div>
                                        <div className={styles.serviceMainInfo}>
                                            <div className={styles.serviceTopLine}>
                                                <strong>Evaluación TDAH Adulto</strong>
                                                <span className={`${styles.miniBadge} ${styles.pack}`}>Pack Pagado</span>
                                            </div>
                                            <p className={styles.serviceDesc}>Proceso completo después de la sesión inicial. Incluye Escalas ASRS, CAARS y pruebas CPT.</p>
                                        </div>
                                        <div className={styles.servicePricing}>
                                            <span className={styles.price}>$180.000</span>
                                            <span className={styles.duration}>4 sesiones</span>
                                        </div>
                                    </button>

                                    <button
                                        className={`${styles.serviceItem} ${formData.serviceType === 'evalAutismo' ? styles.active : ''}`}
                                        onClick={() => setFormData({ ...formData, serviceType: 'evalAutismo' as any })}
                                    >
                                        <div className={styles.serviceRadio}></div>
                                        <div className={styles.serviceMainInfo}>
                                            <div className={styles.serviceTopLine}>
                                                <strong>Evaluación TEA</strong>
                                                <span className={`${styles.miniBadge} ${styles.pack}`}>Pack Pagado</span>
                                            </div>
                                            <p className={styles.serviceDesc}>Proceso completo después de la sesión inicial. Incluye ADOS-2, ADI-R y análisis funcional.</p>
                                        </div>
                                        <div className={styles.servicePricing}>
                                            <span className={styles.price}>$220.000</span>
                                            <span className={styles.duration}>4 sesiones</span>
                                        </div>
                                    </button>

                                    <button
                                        className={`${styles.serviceItem} ${formData.serviceType === 'evalInteligencia' ? styles.active : ''}`}
                                        onClick={() => setFormData({ ...formData, serviceType: 'evalInteligencia' as any })}
                                    >
                                        <div className={styles.serviceRadio}></div>
                                        <div className={styles.serviceMainInfo}>
                                            <div className={styles.serviceTopLine}>
                                                <strong>Evaluación Intelectual</strong>
                                                <span className={`${styles.miniBadge} ${styles.pack}`}>Pack Pagado</span>
                                            </div>
                                            <p className={styles.serviceDesc}>Proceso completo después de la sesión inicial. Incluye WISC-V o WAIS-IV con perfil cognitivo.</p>
                                        </div>
                                        <div className={styles.servicePricing}>
                                            <span className={styles.price}>$160.000</span>
                                            <span className={styles.duration}>4 sesiones</span>
                                        </div>
                                    </button>

                                    <button
                                        className={`${styles.serviceItem} ${formData.serviceType === 'evalNeuropsicologica' ? styles.active : ''}`}
                                        onClick={() => setFormData({ ...formData, serviceType: 'evalNeuropsicologica' as any })}
                                    >
                                        <div className={styles.serviceRadio}></div>
                                        <div className={styles.serviceMainInfo}>
                                            <div className={styles.serviceTopLine}>
                                                <strong>Evaluación Neuropsicológica</strong>
                                                <span className={`${styles.miniBadge} ${styles.pack}`}>Pack Pagado</span>
                                            </div>
                                            <p className={styles.serviceDesc}>Proceso completo después de la sesión inicial. Incluye batería completa de funciones cognitivas.</p>
                                        </div>
                                        <div className={styles.servicePricing}>
                                            <span className={styles.price}>$240.000</span>
                                            <span className={styles.duration}>5 sesiones</span>
                                        </div>
                                    </button>

                                    <button
                                        className={`${styles.serviceItem} ${formData.serviceType === 'evalEmocional' ? styles.active : ''}`}
                                        onClick={() => setFormData({ ...formData, serviceType: 'evalEmocional' as any })}
                                    >
                                        <div className={styles.serviceRadio}></div>
                                        <div className={styles.serviceMainInfo}>
                                            <div className={styles.serviceTopLine}>
                                                <strong>Evaluación Socioemocional</strong>
                                                <span className={`${styles.miniBadge} ${styles.pack}`}>Pack Pagado</span>
                                            </div>
                                            <p className={styles.serviceDesc}>Proceso completo después de la sesión inicial. Incluye tests proyectivos e inventarios clínicos.</p>
                                        </div>
                                        <div className={styles.servicePricing}>
                                            <span className={styles.price}>$140.000</span>
                                            <span className={styles.duration}>4 sesiones</span>
                                        </div>
                                    </button>
                                </div>
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
                                <button onClick={handleNext} className="btn-primary">Seleccionar horario</button>
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

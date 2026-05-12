'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './Booking.module.css';
import CustomCalendar from './CustomCalendar';

const CHILE_REGIONS = [
    'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 
    'Valparaíso', 'Metropolitana de Santiago', 'O\'Higgins', 'Maule', 
    'Ñuble', 'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'
];

type BookingStep = 'intro' | 'contact' | 'schedule' | 'payment' | 'processing' | 'success';

export default function Booking() {
    const [step, setStep] = useState<BookingStep>('intro');
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState<{ firstName?: string; firstSurname?: string; secondSurname?: string; email?: string; phone?: string; rut?: string; address?: string; region?: string; commune?: string }>({});
    const [bookingDetails, setBookingDetails] = useState<{ date?: string; time?: string }>({});
    const [calBookingId, setCalBookingId] = useState<string | null>(null);
    const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        serviceType: 'sesion' as 'primeraConsulta' | 'sesion' | 'packSesiones' | 'evalTDAH' | 'evalAutismo' | 'evalInteligencia' | 'evalNeuropsicologica' | 'evalEmocional' | 'evalFreeTDAH' | 'evalFreeAutismo' | 'evalFreeInteligencia' | 'evalFreeNeuro' | 'evalFreeEmocional' | '',
        reason: '',
        details: '',
        firstName: '',
        secondName: '',
        firstSurname: '',
        secondSurname: '',
        name: '', // Full name concatenated
        email: '',
        phone: '',
        rut: '',
        address: '',
        region: '',
        commune: '',
        newsletter: true,
        rawStartTime: '',
        calEventTypeId: null as number | null,
        coupon: ''
    });

    const [appliedCoupon, setAppliedCoupon] = useState<{ status: 'none' | 'valid' | 'invalid', discount: number }>({ status: 'none', discount: 0 });

    // Fetch occupied slots from DB + Cal.com (Real Availability)
    useEffect(() => {
        const fetchOccupied = async () => {
            try {
                const url = formData.calEventTypeId 
                    ? `/api/bookings/occupied?eventTypeId=${formData.calEventTypeId}`
                    : '/api/bookings/occupied';
                
                const res = await fetch(url, { cache: 'no-store' });
                const data = await res.json();
                if (data.success) {
                    setOccupiedSlots(data.occupiedSlots);
                }
            } catch (err) {
                console.error('Error fetching occupied slots:', err);
            }
        };
        fetchOccupied();
    }, [formData.calEventTypeId]);

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

    // Efecto para mapear el Tipo de Servicio con su ID numérico de Cal.com
    useEffect(() => {
        const calEventMap: Record<string, number> = {
            'sesion': 4479069,
            'primeraConsulta': 4479069, // Si no tienes un ID para esta, usamos el mismo de sesión por ahora
            'packSesiones': 4479093,
            'evalTDAH': 4479069,
            'evalAutismo': 4479069,
            'evalInteligencia': 4479069,
            'evalNeuropsicologica': 4479069,
            'evalEmocional': 4479069
        };

        const targetId = calEventMap[formData.serviceType] || null;
        if (targetId !== formData.calEventTypeId) {
            setFormData(prev => ({ ...prev, calEventTypeId: targetId }));
        }
    }, [formData.serviceType]);

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
        const newErrors: { firstName?: string; firstSurname?: string; secondSurname?: string; email?: string; rut?: string; address?: string; region?: string; commune?: string } = {};

        if (!formData.firstName.trim()) newErrors.firstName = 'Primer nombre requerido';
        if (!formData.firstSurname.trim()) newErrors.firstSurname = 'Apellido paterno requerido';
        if (!formData.secondSurname.trim()) newErrors.secondSurname = 'Apellido materno requerido';

        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.rut.trim()) {
            newErrors.rut = 'RUT requerido';
        } else if (!isValidRut(formData.rut)) {
            newErrors.rut = 'RUT inválido';
        }

        if (!formData.address.trim()) newErrors.address = 'Dirección requerida';
        if (!formData.region.trim()) newErrors.region = 'Región requerida';
        if (!formData.commune.trim()) newErrors.commune = 'Comuna requerida';

        setErrors(newErrors as any);
        return Object.keys(newErrors).length === 0;
    };

    const handleStartPayment = async (paymentMethod: 'flow' | 'paypal' = 'flow') => {
        setIsProcessing(true);
        setStep('processing');

        const finalPrice = calculateFinalPrice();
        const isFree = formData.serviceType === 'primeraConsulta' || formData.serviceType.startsWith('evalFree') || finalPrice === 0;
        const paymentEndpoint = isFree
            ? '/api/payments/free'
            : paymentMethod === 'paypal'
                ? '/api/payments/paypal/create'
                : '/api/payments/create';

        try {
            const response = await fetch(paymentEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    name: formData.name,
                    firstName: formData.firstName,
                    secondName: formData.secondName,
                    firstSurname: formData.firstSurname,
                    secondSurname: formData.secondSurname,
                    phone: formData.phone,
                    rut: formData.rut,
                    address: formData.address,
                    region: formData.region,
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
        import('react').then(({ startTransition }) => {
            startTransition(() => {
                if (step === 'intro') setStep('schedule');
                else if (step === 'schedule') setStep('contact');
                else if (step === 'contact') {
                    if (validateContact()) {
                        setStep('payment');
                    }
                }
                else if (step === 'payment') setStep('processing');
            });
        });
    };

    const handleBack = () => {
        import('react').then(({ startTransition }) => {
            startTransition(() => {
                if (step === 'schedule') setStep('intro');
                else if (step === 'contact') setStep('schedule');
                else if (step === 'payment') setStep('contact');
            });
        });
    };

    const calculateFinalPriceWithoutCoupon = () => {
        switch (formData.serviceType) {
            case 'sesion': return 36000;
            case 'packSesiones': return 140000;
            case 'evalTDAH': return 180000;
            case 'evalAutismo': return 220000;
            case 'evalInteligencia': return 160000;
            case 'evalNeuropsicologica': return 240000;
            case 'evalEmocional': return 140000;
            default: return 0;
        }
    };

    const calculateFinalPrice = () => {
        const basePrice = calculateFinalPriceWithoutCoupon();
        if (appliedCoupon.status === 'valid') {
            return Math.max(0, basePrice - appliedCoupon.discount);
        }
        return basePrice;
    };

    const handleApplyCoupon = () => {
        const basePrice = calculateFinalPriceWithoutCoupon();
        const couponCode = formData.coupon.toUpperCase();

        if (couponCode === 'TEST100') {
            setAppliedCoupon({ status: 'valid', discount: basePrice > 350 ? basePrice - 350 : 0 });
        } else if (couponCode === 'GUSTAVO10') {
            setAppliedCoupon({ status: 'valid', discount: 10000 });
        } else if (couponCode === 'GUSTAVO0' || couponCode === 'PRUEBA0') {
            setAppliedCoupon({ status: 'valid', discount: basePrice });
        } else {
            setAppliedCoupon({ status: 'invalid', discount: 0 });
        }
    };
    const resetForm = () => {
        setFormData({
            serviceType: 'sesion',
            reason: '',
            details: '',
            firstName: '',
            secondName: '',
            firstSurname: '',
            secondSurname: '',
            name: '',
            email: '',
            phone: '',
            rut: '',
            address: '',
            region: '',
            commune: '',
            newsletter: true,
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
                    {/* Stepper Visual */}
                    {['intro', 'schedule', 'contact', 'payment'].includes(step) && (
                        <div className={styles.stepper}>
                            <div className={`${styles.step} ${step === 'intro' ? styles.activeStep : ''} ${['schedule', 'contact', 'payment', 'success'].includes(step) ? styles.completedStep : ''}`}>
                                <span className={styles.stepNumber}>1</span>
                                <span className={styles.stepLabel}>Servicio</span>
                            </div>
                            <div className={styles.stepLine}></div>
                            <div className={`${styles.step} ${step === 'schedule' ? styles.activeStep : ''} ${['contact', 'payment', 'success'].includes(step) ? styles.completedStep : ''}`}>
                                <span className={styles.stepNumber}>2</span>
                                <span className={styles.stepLabel}>Horario</span>
                            </div>
                            <div className={styles.stepLine}></div>
                            <div className={`${styles.step} ${step === 'contact' ? styles.activeStep : ''} ${['payment', 'success'].includes(step) ? styles.completedStep : ''}`}>
                                <span className={styles.stepNumber}>3</span>
                                <span className={styles.stepLabel}>Registro</span>
                            </div>
                            <div className={styles.stepLine}></div>
                            <div className={`${styles.step} ${step === 'payment' ? styles.activeStep : ''} ${['success'].includes(step) ? styles.completedStep : ''}`}>
                                <span className={styles.stepNumber}>4</span>
                                <span className={styles.stepLabel}>Pago</span>
                            </div>
                        </div>
                    )}

                    {step === 'intro' && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>¿Cómo te gustaría comenzar?</h2>
                            <p className={styles.stepDesc}>Selecciona el enfoque que mejor se adapte a tu situación actual.</p>

                            <div className={styles.serviceSection}>
                                <h3 className={styles.sectionLabel}>Servicios Clínicos Especializados</h3>
                                <p className={styles.sectionNote}>Atención individual o planes mensuales con beneficios.</p>
                            </div>

                            <div className={styles.serviceCards}>
                                <div 
                                    className={`${styles.serviceCard} ${formData.serviceType === 'sesion' ? styles.activeCard : ''}`}
                                    onClick={() => setFormData({ ...formData, serviceType: 'sesion' })}
                                >
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardIcon}>🧠</div>
                                        <div className={styles.cardBadge}>Individual</div>
                                    </div>
                                    <h3 className={styles.cardTitle}>Psicoterapia Individual</h3>
                                    <p className={styles.cardText}>Atención personalizada focalizada en tus procesos emocionales, ansiedad o bienestar general.</p>
                                    <div className={styles.cardPrice}>$36.000 <span>/ sesión</span></div>
                                </div>

                                <div 
                                    className={`${styles.serviceCard} ${formData.serviceType === 'packSesiones' ? styles.activeCard : ''}`}
                                    onClick={() => setFormData({ ...formData, serviceType: 'packSesiones' })}
                                >
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardIcon}>📦</div>
                                        <div className={styles.cardBadge}>Ahorro</div>
                                    </div>
                                    <h3 className={styles.cardTitle}>Pack 4 Sesiones</h3>
                                    <p className={styles.cardText}>Continuidad terapéutica asegurada con un plan mensual. Ideal para procesos profundos.</p>
                                    <div className={styles.cardPrice}>$140.000 <span>/ mes</span></div>
                                </div>
                            </div>

                            <div className={styles.footerActions}>
                                <button
                                    onClick={handleNext}
                                    className="btn-primary"
                                    disabled={formData.serviceType === ''}
                                >
                                    Continuar al Calendario →
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'contact' && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>Identificación del Paciente</h2>
                            <p className={styles.stepDesc}>Datos necesarios para tu boleta de honorarios y ficha clínica.</p>
                            
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Primer Nombre *</label>
                                    <input
                                        type="text"
                                        className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
                                        placeholder="Ej: Juan"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                    {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Segundo Nombre</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Ej: Alberto"
                                        value={formData.secondName}
                                        onChange={(e) => setFormData({ ...formData, secondName: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Primer Apellido *</label>
                                    <input
                                        type="text"
                                        className={`${styles.input} ${errors.firstSurname ? styles.inputError : ''}`}
                                        placeholder="Ej: Pérez"
                                        value={formData.firstSurname}
                                        onChange={(e) => setFormData({ ...formData, firstSurname: e.target.value })}
                                    />
                                    {errors.firstSurname && <span className={styles.errorText}>{errors.firstSurname}</span>}
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Segundo Apellido *</label>
                                    <input
                                        type="text"
                                        className={`${styles.input} ${errors.secondSurname ? styles.inputError : ''}`}
                                        placeholder="Ej: González"
                                        value={formData.secondSurname}
                                        onChange={(e) => setFormData({ ...formData, secondSurname: e.target.value })}
                                    />
                                    {errors.secondSurname && <span className={styles.errorText}>{errors.secondSurname}</span>}
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>RUT (Para tu boleta) *</label>
                                <input
                                    type="text"
                                    className={`${styles.input} ${errors.rut ? styles.inputError : ''}`}
                                    placeholder="12.345.678-9"
                                    value={formData.rut}
                                    onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                                />
                                {errors.rut && <span className={styles.errorText}>{errors.rut}</span>}
                            </div>

                            <div className={styles.formGroup}>
                                <label>Dirección (Calle y Número) *</label>
                                <input
                                    type="text"
                                    className={`${styles.input} ${errors.address ? styles.inputError : ''}`}
                                    placeholder="Ej: Av. Providencia 1234, Depto 41"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                                {errors.address && <span className={styles.errorText}>{errors.address}</span>}
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Región *</label>
                                    <select
                                        className={`${styles.input} ${errors.region ? styles.inputError : ''}`}
                                        value={formData.region}
                                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                    >
                                        <option value="">Selecciona Región...</option>
                                        {CHILE_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                    {errors.region && <span className={styles.errorText}>{errors.region}</span>}
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Comuna *</label>
                                    <input
                                        type="text"
                                        className={`${styles.input} ${errors.commune ? styles.inputError : ''}`}
                                        placeholder="Ej: Providencia"
                                        value={formData.commune}
                                        onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                                    />
                                    {errors.commune && <span className={styles.errorText}>{errors.commune}</span>}
                                </div>
                            </div>

                            <hr style={{margin: '30px 0', opacity: 0.1}} />

                            <div className={styles.formGroup}>
                                <label>Email de contacto *</label>
                                <input
                                    type="email"
                                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                                    placeholder="tu@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label>Teléfono (WhatsApp)</label>
                                <input
                                    type="tel"
                                    className={styles.input}
                                    placeholder="+56 9 1234 5678"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroupCheckbox}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={formData.newsletter}
                                        onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
                                    />
                                    <span>Quiero recibir noticias y recursos de salud mental.</span>
                                </label>
                            </div>

                            <div className={styles.buttonGroup}>
                                <button onClick={handleBack} className="btn-secondary">← Volver</button>
                                <button onClick={() => {
                                    const fullName = `${formData.firstName} ${formData.secondName} ${formData.firstSurname} ${formData.secondSurname}`.replace(/\s+/g, ' ').trim();
                                    setFormData(prev => ({ ...prev, name: fullName }));
                                    if(validateContact()) setStep('payment');
                                }} className="btn-primary">Siguiente</button>
                            </div>
                        </div>
                    )}

                    {step === 'schedule' && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>Selecciona tu horario</h2>
                            <div className={styles.appointmentSummary}>
                                <span className={styles.summaryLabel}>Servicio Seleccionado</span>
                                <div className={styles.summaryContent}>
                                    <p>{formData.serviceType === 'sesion' ? 'Psicoterapia Individual' : 'Pack 4 Sesiones'}</p>
                                </div>
                            </div>

                            <div className={styles.calendarContainer}>
                                <CustomCalendar
                                    onSelectDateTime={handleDateTimeSelection}
                                    bookedSlots={occupiedSlots}
                                />
                            </div>

                            <div className={styles.footerActions}>
                                <button onClick={handleBack} className="btn-secondary">← Cambiar Servicio</button>
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
                                                id="coupon"
                                                name="coupon"
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
                                        
                                        <div className={styles.infoBox} style={{marginTop: '20px', fontSize: '0.85rem'}}>
                                            <p><strong>Paciente:</strong> {formData.name}</p>
                                            <p><strong>Email:</strong> {formData.email}</p>
                                            <p><strong>RUT:</strong> {formData.rut}</p>
                                        </div>
                                        <p className={styles.invoiceNote}>
                                            Tras confirmar tu pago, el profesional recibirá una notificación para generar y enviarte manualmente tu boleta de honorarios a tu correo electrónico.
                                        </p>
                                        <div className={styles.securityBadges}>
                                            <span>🔒 Pago seguro con Flow</span>
                                            <span>🌎 PayPal internacional</span>
                                            <span>📑 Boleta Manual Electrónica</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className={styles.buttonGroup}>
                                <button onClick={handleBack} className="btn-secondary" disabled={isProcessing}>← Volver</button>
                                <button onClick={() => handleStartPayment('flow')} className="btn-primary" disabled={isProcessing}>
                                    {isProcessing ? 'Procesando...' :
                                        (formData.serviceType === 'primeraConsulta' || formData.serviceType.startsWith('evalFree') || calculateFinalPrice() === 0)
                                            ? 'Confirmar Agendamiento Gratis ✨'
                                            : 'Pagar con Flow (Webpay) 💳'}
                                </button>
                            </div>

                            {!(formData.serviceType === 'primeraConsulta' || formData.serviceType.startsWith('evalFree')) && (
                                <div className={styles.alternativePayment}>
                                    <span className={styles.altLabel}>¿Vives fuera de Chile?</span>
                                    <button
                                        type="button"
                                        className={styles.paypalButtonUnified}
                                        onClick={() => handleStartPayment('paypal')}
                                        disabled={isProcessing}
                                    >
                                        Pagar con PayPal (USD) 🌎
                                    </button>
                                </div>
                            )}

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
                            <button onClick={resetForm} className="btn-primary">Listo</button>
                        </div>
                    )}
                </div>
            </div>
        </section >
    );
}

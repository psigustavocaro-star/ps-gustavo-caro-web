'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './CustomCalendar.module.css';
import {
    weeklyAvailability,
    getAvailableSlotsForDay,
    isDateValid,
    isDateBlocked,
    MIN_ADVANCE_DAYS,
    MAX_ADVANCE_DAYS
} from '@/lib/config/availability';

const getLocalDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

interface CustomCalendarProps {
    onSelectDateTime: (date: Date, time: string) => void;
    bookedSlots?: string[]; // Formato: 'YYYY-MM-DD HH:MM'
}

export default function CustomCalendar({ onSelectDateTime, bookedSlots = [] }: CustomCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Obtener días del mes actual
    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days: (Date | null)[] = [];

        // Días vacíos antes del primer día del mes
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }

        // Días del mes
        for (let day = 1; day <= lastDay.getDate(); day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    }, [currentMonth]);

    // Verificar si un día tiene slots disponibles
    const isDayAvailable = (date: Date): boolean => {
        if (!isDateValid(date)) return false;

        const dayOfWeek = date.getDay();
        const dayConfig = weeklyAvailability[dayOfWeek];

        return dayConfig?.enabled && !isDateBlocked(date);
    };

    // Obtener slots disponibles para la fecha seleccionada
    const availableSlots = useMemo(() => {
        if (!selectedDate) return [];

        const dayOfWeek = selectedDate.getDay();
        const allSlots = getAvailableSlotsForDay(dayOfWeek);

        // Filtrar slots ya reservados
        const dateStr = getLocalDateKey(selectedDate);
        return allSlots.filter(slot => {
            const slotKey = `${dateStr} ${slot}`;
            return !bookedSlots.includes(slotKey);
        });
    }, [selectedDate, bookedSlots]);

    // Navegación del calendario
    const goToPrevMonth = () => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() - 1);

        const today = new Date();
        if (newMonth.getFullYear() > today.getFullYear() ||
            (newMonth.getFullYear() === today.getFullYear() && newMonth.getMonth() >= today.getMonth())) {
            setCurrentMonth(newMonth);
        }
    };

    const goToNextMonth = () => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + 1);

        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + MAX_ADVANCE_DAYS);

        if (newMonth <= maxDate) {
            setCurrentMonth(newMonth);
        }
    };

    // Seleccionar un día
    const handleDayClick = (date: Date | null) => {
        if (!date || !isDayAvailable(date)) return;

        setSelectedDate(date);
        setSelectedTime(null);
    };

    // Seleccionar hora
    const handleTimeClick = (time: string) => {
        setSelectedTime(time);
    };

    // Confirmar selección
    const handleConfirm = () => {
        if (selectedDate && selectedTime) {
            onSelectDateTime(selectedDate, selectedTime);
        }
    };

    // Determinar clases CSS para cada día
    const getDayClasses = (date: Date | null): string => {
        if (!date) return `${styles.dayCell} ${styles.dayEmpty}`;

        const classes = [styles.dayCell];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);

        // Es hoy
        if (compareDate.getTime() === today.getTime()) {
            classes.push(styles.dayToday);
        }

        // Es del pasado
        if (compareDate < today) {
            classes.push(styles.dayPast);
            return classes.join(' ');
        }

        // Está seleccionado
        if (selectedDate && compareDate.getTime() === new Date(selectedDate).setHours(0, 0, 0, 0)) {
            classes.push(styles.daySelected);
        } else if (isDayAvailable(date)) {
            classes.push(styles.dayAvailable);
        } else {
            classes.push(styles.dayUnavailable);
        }

        return classes.join(' ');
    };

    // Verificar si se puede ir al mes anterior
    const canGoPrev = () => {
        const today = new Date();
        return currentMonth.getFullYear() > today.getFullYear() ||
            (currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() > today.getMonth());
    };

    // Verificar si se puede ir al mes siguiente
    const canGoNext = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + MAX_ADVANCE_DAYS);
        const nextMonth = new Date(currentMonth);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth <= maxDate;
    };

    // Formatear fecha seleccionada
    const formatSelectedDate = () => {
        if (!selectedDate) return '';
        return selectedDate.toLocaleDateString('es-CL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    return (
        <div className={styles.calendarContainer}>
            {/* Header con navegación */}
            <div className={styles.calendarHeader}>
                <button
                    className={styles.navButton}
                    onClick={goToPrevMonth}
                    disabled={!canGoPrev()}
                    aria-label="Mes anterior"
                >
                    ‹
                </button>
                <span className={styles.monthTitle}>
                    {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button
                    className={styles.navButton}
                    onClick={goToNextMonth}
                    disabled={!canGoNext()}
                    aria-label="Mes siguiente"
                >
                    ›
                </button>
            </div>

            {/* Días de la semana */}
            <div className={styles.weekDays}>
                {weekDays.map(day => (
                    <span key={day} className={styles.weekDay}>{day}</span>
                ))}
            </div>

            {/* Grilla de días */}
            <div className={styles.daysGrid}>
                {calendarDays.map((date, index) => (
                    <button
                        key={index}
                        className={getDayClasses(date)}
                        onClick={() => handleDayClick(date)}
                        disabled={!date || !isDayAvailable(date)}
                    >
                        {date?.getDate()}
                    </button>
                ))}
            </div>

            {/* Selector de horarios */}
            {selectedDate && (
                <div className={styles.timeSlotsContainer}>
                    <h4 className={styles.timeSlotsTitle}>
                        🕐 Horarios disponibles para <span>{formatSelectedDate()}</span>
                        <small>Hora de Chile</small>
                    </h4>

                    {availableSlots.length > 0 ? (
                        <div className={styles.timeSlotsGrid}>
                            {availableSlots.map(slot => (
                                <button
                                    key={slot}
                                    className={`${styles.timeSlot} ${selectedTime === slot ? styles.timeSlotSelected : ''}`}
                                    onClick={() => handleTimeClick(slot)}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.noSlots}>
                            No hay horarios disponibles para este día
                        </p>
                    )}
                </div>
            )}

            {/* Resumen de selección */}
            {selectedDate && selectedTime && (
                <div className={styles.selectionSummary}>
                    <div className={styles.summaryInfo}>
                        <span className={styles.summaryDate}>{formatSelectedDate()}</span>
                        <span className={styles.summaryTime}>⏰ {selectedTime} hrs Chile</span>
                    </div>
                    <button
                        className={styles.confirmButton}
                        onClick={handleConfirm}
                    >
                        Confirmar hora ✓
                    </button>
                </div>
            )}
        </div>
    );
}

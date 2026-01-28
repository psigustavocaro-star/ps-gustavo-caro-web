/**
 * Configuración de disponibilidad para el sistema de agendamiento
 * Gustavo Caro - Psicólogo
 */

export interface TimeSlot {
    start: string; // Formato "HH:MM"
    end: string;
}

export interface DayAvailability {
    enabled: boolean;
    slots: TimeSlot[];
}

export interface AvailabilityConfig {
    [key: number]: DayAvailability; // 0 = Domingo, 1 = Lunes, etc.
}

// Duración de cada sesión en minutos
export const SESSION_DURATION = 50;

// Tiempo de descanso entre sesiones en minutos
export const BREAK_BETWEEN_SESSIONS = 10;

// Días de anticipación mínima para agendar (no se puede agendar para hoy)
export const MIN_ADVANCE_DAYS = 1;

// Días máximos hacia el futuro para mostrar disponibilidad
export const MAX_ADVANCE_DAYS = 30;

// Configuración de disponibilidad semanal
// Ajusta estos horarios según tu agenda real
export const weeklyAvailability: AvailabilityConfig = {
    0: { // Domingo
        enabled: false,
        slots: []
    },
    1: { // Lunes
        enabled: true,
        slots: [
            { start: '09:00', end: '13:00' },
            { start: '15:00', end: '19:00' }
        ]
    },
    2: { // Martes
        enabled: true,
        slots: [
            { start: '09:00', end: '13:00' },
            { start: '15:00', end: '19:00' }
        ]
    },
    3: { // Miércoles
        enabled: true,
        slots: [
            { start: '09:00', end: '13:00' },
            { start: '15:00', end: '19:00' }
        ]
    },
    4: { // Jueves
        enabled: true,
        slots: [
            { start: '09:00', end: '13:00' },
            { start: '15:00', end: '19:00' }
        ]
    },
    5: { // Viernes
        enabled: true,
        slots: [
            { start: '09:00', end: '13:00' },
            { start: '15:00', end: '17:00' }
        ]
    },
    6: { // Sábado
        enabled: false,
        slots: []
    }
};

// Fechas bloqueadas específicas (vacaciones, feriados, etc.)
// Formato: 'YYYY-MM-DD'
export const blockedDates: string[] = [
    // Ejemplo: '2026-02-14' para bloquear San Valentín
];

// Genera los slots de tiempo disponibles para un rango horario
export function generateTimeSlots(slot: TimeSlot): string[] {
    const slots: string[] = [];
    const [startHour, startMin] = slot.start.split(':').map(Number);
    const [endHour, endMin] = slot.end.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes + SESSION_DURATION <= endMinutes) {
        const hours = Math.floor(currentMinutes / 60);
        const mins = currentMinutes % 60;
        slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
        currentMinutes += SESSION_DURATION + BREAK_BETWEEN_SESSIONS;
    }

    return slots;
}

// Obtiene todos los slots disponibles para un día específico
export function getAvailableSlotsForDay(dayOfWeek: number): string[] {
    const dayConfig = weeklyAvailability[dayOfWeek];
    if (!dayConfig?.enabled) return [];

    const allSlots: string[] = [];
    for (const slot of dayConfig.slots) {
        allSlots.push(...generateTimeSlots(slot));
    }

    return allSlots.sort();
}

// Verifica si una fecha está bloqueada
export function isDateBlocked(date: Date): boolean {
    const dateStr = date.toISOString().split('T')[0];
    return blockedDates.includes(dateStr);
}

// Verifica si una fecha es válida para agendar
export function isDateValid(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + MIN_ADVANCE_DAYS);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + MAX_ADVANCE_DAYS);

    const dayOfWeek = date.getDay();
    const dayConfig = weeklyAvailability[dayOfWeek];

    return (
        date >= minDate &&
        date <= maxDate &&
        dayConfig?.enabled &&
        !isDateBlocked(date)
    );
}

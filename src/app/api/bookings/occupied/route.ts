import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAvailableSlotsForDay, MAX_ADVANCE_DAYS } from '@/lib/config/availability';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MAX_CAL_DAYS = MAX_ADVANCE_DAYS;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const eventTypeId = searchParams.get('eventTypeId');

        // 1. Obtener cierres y bloqueos desde DB local (citas pagadas).
        // No se filtra por appointmentDate: en un pack esa fecha puede ser una
        // sesión pasada mientras que las siguientes siguen estando agendadas.
        const [bookings, scheduleBlocks] = await Promise.all([
            prisma.booking.findMany({
            where: {
                status: 'PAID',
            },
            select: {
                appointmentDate: true,
                appointmentDates: true,
            }
            }),
            prisma.scheduleBlock.findMany({ select: { date: true, allDay: true, startTime: true, endTime: true } }),
        ]);

        const now = Date.now();
        const parseFutureDate = (value: unknown) => {
            if (typeof value !== 'string' || !value.trim()) return null;
            const timestamp = Date.parse(value);
            return Number.isNaN(timestamp) || timestamp < now ? null : new Date(timestamp);
        };

        const formatInSantiago = (date: Date) => {
            const santiagoDate = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'America/Santiago',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(date);
            
            return santiagoDate.replace(',', '');
        };

        const occupiedFromDB = bookings.flatMap(b => {
            const dates = b.appointmentDates?.length
                ? b.appointmentDates
                : b.appointmentDate ? [b.appointmentDate] : [];

            return dates.map(parseFutureDate).filter((date): date is Date => date !== null).map(formatInSantiago);
        });

        const finalOccupiedSlots = [...occupiedFromDB];
        const blockedDates = scheduleBlocks.filter(block => block.allDay).map(block => block.date);

        // Una franja bloquea cada sesión que se solape con ella. Así un cierre
        // de 18:45 a 19:30 también protege una sesión que empieza a las 18:30.
        scheduleBlocks.filter(block => !block.allDay && block.startTime && block.endTime).forEach((block) => {
            const day = new Date(`${block.date}T12:00:00`);
            getAvailableSlotsForDay(day.getDay()).forEach((slot) => {
                const [hour, minute] = slot.split(':').map(Number);
                const slotStart = hour * 60 + minute;
                const slotEnd = slotStart + 45;
                const [startHour, startMinute] = block.startTime!.split(':').map(Number);
                const [endHour, endMinute] = block.endTime!.split(':').map(Number);
                const blockStart = startHour * 60 + startMinute;
                const blockEnd = endHour * 60 + endMinute;
                if (slotStart < blockEnd && slotEnd > blockStart) finalOccupiedSlots.push(`${block.date} ${slot}`);
            });
        });

        // 2. Si hay eventTypeId, consultar disponibilidad REAL (incluyendo Google Calendar)
        const calKey = process.env.CALCOM_API_KEY;
        if (eventTypeId && calKey) {
            try {
                const startDate = new Date().toISOString().split('T')[0];
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + MAX_CAL_DAYS);
                const endDateStr = endDate.toISOString().split('T')[0];

                const url = `https://api.cal.com/v2/slots?eventTypeId=${eventTypeId}&start=${startDate}&end=${endDateStr}&timeZone=America/Santiago`;
                
                const calRes = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${calKey}`,
                        // El endpoint de slots se mantiene en la versión
                        // 2024-09-04. Con versiones recientes responde 404 y
                        // dejaba pasar horas que Cal.com no puede reservar.
                        'cal-api-version': '2024-09-04'
                    },
                    next: { revalidate: 0 }
                });
                
                const calData = await calRes.json();
                
                if (calRes.ok && calData.status === 'success') {
                    const availableSlots = calData.data as Record<string, { start: string }[]>;
                    
                    // Ahora recorremos cada día del rango para ver qué falta
                    for (let i = 0; i <= MAX_CAL_DAYS; i++) {
                        const date = new Date();
                        date.setDate(date.getDate() + i);
                        const dateStr = date.toISOString().split('T')[0];
                        
                        const dayOfWeek = date.getDay();
                        const theoreticalSlots = getAvailableSlotsForDay(dayOfWeek);
                        const realAvailableForDay = availableSlots[dateStr] || [];
                        
                        // Formateamos las horas reales para comparar (HH:mm)
                        const realTimes = realAvailableForDay.map(s => {
                            const d = new Date(s.start);
                            return new Intl.DateTimeFormat('en-GB', {
                                timeZone: 'America/Santiago',
                                hour: '2-digit',
                                minute: '2-digit',
                                hourCycle: 'h23'
                            }).format(d);
                        });

                        // Para cada slot teórico, si NO está en los reales, marcar como ocupado
                        for (const tSlot of theoreticalSlots) {
                            if (!realTimes.includes(tSlot)) {
                                finalOccupiedSlots.push(`${dateStr} ${tSlot}`);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching real availability from Cal.com:', err);
            }
        }

        // Combinar y eliminar duplicados
        const occupiedSlots = Array.from(new Set(finalOccupiedSlots));

        return NextResponse.json({ success: true, occupiedSlots, blockedDates: Array.from(new Set(blockedDates)) });
    } catch {
        return NextResponse.json({ success: false, error: 'Failed to fetch occupied slots' }, { status: 500 });
    }
}

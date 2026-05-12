import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAvailableSlotsForDay } from '@/lib/config/availability';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MAX_CAL_DAYS = 60; // Consultar 2 meses a Cal.com

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const eventTypeId = searchParams.get('eventTypeId');

        // 1. Obtener cierres y bloqueos desde DB local (Citas pagadas)
        const bookings = await prisma.booking.findMany({
            where: {
                status: 'PAID',
                appointmentDate: {
                    not: null,
                    gte: new Date().toISOString() // Solo futuras
                }
            },
            select: {
                appointmentDate: true
            }
        });

        const formatInSantiago = (dateStr: string | Date) => {
            const date = new Date(dateStr);
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

        const occupiedFromDB = bookings.map(b => {
            if (!b.appointmentDate) return null;
            return formatInSantiago(b.appointmentDate);
        }).filter((slot): slot is string => slot !== null);

        let finalOccupiedSlots = [...occupiedFromDB];

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

        return NextResponse.json({ success: true, occupiedSlots });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch occupied slots' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
    if (!session) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

    try {
        const pendingExpirationDate = new Date(Date.now() - 48 * 60 * 60 * 1000);

        await prisma.booking.updateMany({
            where: {
                status: { in: ['PENDING', 'pending'] },
                createdAt: { lt: pendingExpirationDate },
            },
            data: {
                status: 'FAILED',
                reason: 'Pago pendiente vencido automáticamente después de 48 horas.',
            },
        }).catch(() => null);

        const [rawBookings, appointmentCancellations] = await Promise.all([
            prisma.booking.findMany({ orderBy: { createdAt: 'desc' } }),
            prisma.appointmentCancellation.findMany({ orderBy: { createdAt: 'desc' } }).catch((error) => {
                // El historial es complementario: una incompatibilidad transitoria
                // nunca debe ocultar la agenda clínica ni sus pagos.
                console.error('Admin reschedule history error:', error);
                return [];
            }),
        ]);
        const cancellationsByBooking = new Map<string, typeof appointmentCancellations>();
        appointmentCancellations.forEach((item) => {
            const entries = cancellationsByBooking.get(item.bookingId) || [];
            entries.push(item);
            cancellationsByBooking.set(item.bookingId, entries);
        });
        const allBookings = rawBookings.map((booking) => ({
            ...booking,
            appointmentCancellations: cancellationsByBooking.get(booking.id) || [],
        }));

        const [newsletter, templates, contentPosts] = await Promise.all([
            prisma.newsletter.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []),
            prisma.emailTemplate.findMany({ orderBy: { updatedAt: 'desc' } }).catch(() => []),
            prisma.contentPost.findMany({ orderBy: { updatedAt: 'desc' } }).catch(() => []),
        ]);
        const bookings = allBookings.filter((booking) => (booking.status || '').toUpperCase() === 'PAID');

        const patientsMap = new Map();

        allBookings.forEach((b) => {
            if (!b.email) return;
            const email = b.email.toLowerCase().trim();
            if (!patientsMap.has(email)) {
                patientsMap.set(email, {
                    email,
                    name: b.name || 'Sin Nombre',
                    firstName: b.firstName || '',
                    secondName: b.secondName || '',
                    firstSurname: b.firstSurname || '',
                    secondSurname: b.secondSurname || '',
                    phone: b.phone || '',
                    rut: b.rut || '',
                    address: b.address || '',
                    region: b.region || '',
                    commune: b.commune || '',
                    country: b.country || 'Chile',
                    bookings: [],
                    newsletter: null,
                    totalSpent: 0
                });
            }
            const p = patientsMap.get(email);
            p.bookings.push(b);
            if (b.status === 'PAID') {
                p.totalSpent += (Number(b.amount) || 0);
            }
        });

        newsletter.forEach((n) => {
            if (!n.email) return;
            const email = n.email.toLowerCase().trim();
            const p = patientsMap.get(email);
            if (p) {
                p.newsletter = n;
            } else {
                patientsMap.set(email, {
                    email,
                    name: n.name || 'Suscriptor',
                    phone: '',
                    bookings: [],
                    newsletter: n,
                    totalSpent: 0
                });
            }
        });

        const patients = Array.from(patientsMap.values());

        return NextResponse.json({
            success: true,
            patients,
            bookings,
            newsletter,
            templates,
            contentPosts,
        });
    } catch (error) {
        console.error('Admin data error:', error);
        return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
    }
}

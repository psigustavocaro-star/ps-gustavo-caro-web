import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase();
    if (!email) return NextResponse.json({ error: 'Falta el correo del paciente.' }, { status: 400 });

    const [account, rawBookings, appointmentCancellations, requests] = await Promise.all([
        prisma.patientAccount.findUnique({
            where: { email },
            select: {
                email: true,
                mustChangePassword: true,
                rut: true,
                firstName: true,
                secondName: true,
                firstSurname: true,
                secondSurname: true,
                birthDate: true,
                gender: true,
                occupation: true,
                companion: true,
                address: true,
                country: true,
                region: true,
                commune: true,
                phone: true,
                educationLevel: true,
                emergencyContact: true,
            },
        }),
        prisma.booking.findMany({
            where: { email: { equals: email, mode: 'insensitive' }, status: 'PAID' },
            orderBy: { appointmentDate: 'asc' },
            select: {
                id: true,
                name: true,
                firstName: true,
                secondName: true,
                firstSurname: true,
                secondSurname: true,
                email: true,
                phone: true,
                serviceType: true,
                amount: true,
                appointmentDate: true,
                appointmentDates: true,
                details: true,
                meetUrl: true,
                siiReceiptIssued: true,
                createdAt: true,
            },
        }),
        prisma.appointmentCancellation.findMany({
            where: { booking: { email: { equals: email, mode: 'insensitive' } } },
            orderBy: { createdAt: 'desc' },
            select: { id: true, bookingId: true, appointmentIndex: true, originalAppointmentDate: true, rebookedAt: true, createdAt: true },
        }).catch(() => []),
        prisma.patientAppointmentRequest.findMany({
            where: { booking: { email: { equals: email, mode: 'insensitive' } } },
            orderBy: { createdAt: 'desc' },
            select: { id: true, appointmentIndex: true, appointmentDate: true, type: true, message: true, status: true, createdAt: true, reviewedAt: true, reviewNote: true },
        }),
    ]);

    const cancellationsByBooking = new Map<string, typeof appointmentCancellations>();
    appointmentCancellations.forEach((item) => {
        const current = cancellationsByBooking.get(item.bookingId) || [];
        current.push(item);
        cancellationsByBooking.set(item.bookingId, current);
    });

    const bookings = rawBookings.map((booking) => ({
        ...booking,
        appointmentCancellations: cancellationsByBooking.get(booking.id) || [],
    }));

    return NextResponse.json({
        email,
        hasPortalAccount: Boolean(account),
        mustChangePassword: account?.mustChangePassword || false,
        profile: account,
        bookings,
        requests,
    });
}

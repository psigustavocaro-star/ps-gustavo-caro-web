import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { isEmail, rateLimit, ipFromHeaders } from '@/lib/util/validation';

export const dynamic = 'force-dynamic';

// Normaliza RUT chileno: quita puntos, guiones, espacios y pasa a mayúscula
// (para el dígito verificador K).
function normalizeRut(input: string): string {
    return input.replace(/[.\s-]/g, '').toUpperCase();
}

// Devuelve datos previamente ingresados por el paciente si email+RUT coinciden
// con una reserva anterior (pagada o pendiente). Es un lookup de "auto-fill":
// nunca revela datos si el atacante solo conoce uno de los dos campos.
export async function POST(request: NextRequest) {
    const ip = ipFromHeaders(request.headers);
    // Rate limit ESTRICTO: 5 intentos por 15 minutos por IP.
    const rl = rateLimit(`lookup:${ip}`, 5, 15 * 60 * 1000);
    if (!rl.ok) {
        return NextResponse.json({ error: 'Demasiados intentos. Intenta más tarde.' }, { status: 429 });
    }

    try {
        const body = await request.json();
        const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
        const rutRaw = typeof body?.rut === 'string' ? body.rut : '';
        const rut = normalizeRut(rutRaw);

        if (!isEmail(email) || !rut || rut.length < 8) {
            return NextResponse.json({ found: false }, { status: 200 });
        }

        // Buscamos la reserva más reciente que coincida con email + RUT normalizado.
        // Comparamos RUT en Postgres normalizándolo también.
        const bookings = await prisma.booking.findMany({
            where: {
                email: { equals: email, mode: 'insensitive' },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        const match = bookings.find(b => normalizeRut(b.rut || '') === rut);

        if (!match) {
            // Nunca revelamos si el email existe: mismo shape que si no hubo match
            return NextResponse.json({ found: false });
        }

        return NextResponse.json({
            found: true,
            data: {
                firstName: match.firstName || '',
                secondName: match.secondName || '',
                firstSurname: match.firstSurname || '',
                secondSurname: match.secondSurname || '',
                phone: match.phone || '',
                rut: match.rut || '',
                address: match.address || '',
                region: match.region || '',
                commune: match.commune || '',
                country: match.country || 'Chile',
            },
        });
    } catch (error) {
        console.error('Lookup error:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}

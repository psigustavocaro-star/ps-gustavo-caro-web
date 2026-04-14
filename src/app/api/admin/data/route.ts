import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
    try {
        const bookings = await prisma.booking.findMany({
            orderBy: { createdAt: 'desc' }
        });

        const newsletter = await prisma.newsletter.findMany({
            orderBy: { createdAt: 'desc' }
        });

        const anamnesis = await prisma.anamnesis.findMany();
        
        const templates = await prisma.emailTemplate.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Agrupar por paciente (email)
        const patientsMap = new Map();

        bookings.forEach((b: any) => {
            const email = b.email.toLowerCase();
            if (!patientsMap.has(email)) {
                patientsMap.set(email, {
                    email,
                    name: b.name,
                    phone: b.phone,
                    bookings: [],
                    anamnesis: null,
                    newsletter: null,
                    totalSpent: 0
                });
            }
            const p = patientsMap.get(email);
            p.bookings.push(b);
            if (b.status === 'PAID') p.totalSpent += (b.amount || 0);
        });

        anamnesis.forEach((a: any) => {
            const email = a.email.toLowerCase();
            if (patientsMap.has(email)) {
                patientsMap.get(email).anamnesis = a;
            }
        });

        newsletter.forEach((n: any) => {
            const email = n.email.toLowerCase();
            if (patientsMap.has(email)) {
                patientsMap.get(email).newsletter = n;
            } else {
                // Caso que esté en newsletter pero nunca haya agendado
                patientsMap.set(email, {
                    email,
                    name: n.name || 'Suscriptor',
                    bookings: [],
                    anamnesis: null,
                    newsletter: n,
                    totalSpent: 0
                });
            }
        });

        const patients = Array.from(patientsMap.values());

        return NextResponse.json({
            success: true,
            patients,
            bookings: bookings.map((b: any) => ({
                ...b,
                anamnesis: anamnesis.find((a: any) => a.email.toLowerCase() === b.email.toLowerCase())
            })),
            newsletter,
            templates
        });
    } catch (error) {
        console.error('Admin API error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

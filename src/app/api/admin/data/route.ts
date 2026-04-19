import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
    console.log('ADMIN API: Start fetching data...');
    try {
        // Ejecutamos las consultas de forma segura e independiente
        const bookings = await prisma.booking.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []);
        const newsletter = await prisma.newsletter.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []);
        const anamnesis = await prisma.anamnesis.findMany().catch(() => []);
        const templates = await prisma.emailTemplate.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []);

        console.log(`ADMIN API: Records found - Bookings: ${bookings.length}, Newsletter: ${newsletter.length}`);

        // Agrupar por paciente (email)
        const patientsMap = new Map();

        bookings.forEach((b: any) => {
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
                    bookings: [],
                    anamnesis: null,
                    newsletter: null,
                    totalSpent: 0
                });
            }
            const p = patientsMap.get(email);
            p.bookings.push(b);
            // Solo sumar montos de pagos exitosos
            if (b.status === 'PAID') {
                p.totalSpent += (Number(b.amount) || 0);
            }
        });

        // Vincular Anamnesis
        anamnesis.forEach((a: any) => {
            if (!a.email) return;
            const email = a.email.toLowerCase().trim();
            const p = patientsMap.get(email);
            if (p) p.anamnesis = a;
        });

        // Vincular Newsletter y agregar suscriptores que nunca agendaron
        newsletter.forEach((n: any) => {
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
                anamnesis: anamnesis.find((a: any) => a.email && a.email.toLowerCase().trim() === b.email.toLowerCase().trim()) || null
            })),
            newsletter,
            templates
        });
    } catch (error: any) {
        console.error('ADMIN API FATAL ERROR:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Error interno del servidor',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

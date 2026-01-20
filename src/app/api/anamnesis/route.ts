import { NextRequest, NextResponse } from 'next/server';
import { sendAnamnesisData } from '@/lib/services/mail';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // Guardar en base de datos local
        const { default: prisma } = await import('@/lib/db');
        await prisma.anamnesis.create({
            data: {
                name: data.name,
                email: data.email,
                age: data.age?.toString() || '',
                medications: data.medications || '',
                history: data.history || '',
            }
        });

        await sendAnamnesisData({
            name: data.name,
            email: data.email,
            age: data.age,
            medications: data.medications,
            history: data.history,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Anamnesis submission error:', error);
        return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
    }
}

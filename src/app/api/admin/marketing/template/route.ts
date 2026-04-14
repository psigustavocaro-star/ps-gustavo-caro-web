import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Crear o actualizar un template
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, title, content } = body;

        console.log('MARKETING: Guardando template:', { id, title });

        if (id) {
            const updated = await prisma.emailTemplate.update({
                where: { id },
                data: { title, content }
            });
            return NextResponse.json({ success: true, data: updated });
        } else {
            const created = await prisma.emailTemplate.create({
                data: { title, content }
            });
            return NextResponse.json({ success: true, data: created });
        }
    } catch (error: any) {
        console.error('Template API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// Borrar un template
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ success: false, error: 'ID requerido' });

        await prisma.emailTemplate.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { title, content, id } = await request.json();
        
        if (!title || !content) {
            return NextResponse.json({ success: false, error: 'Título y contenido requeridos' }, { status: 400 });
        }

        if (id) {
            // Update
            const template = await prisma.emailTemplate.update({
                where: { id },
                data: { title, content }
            });
            return NextResponse.json({ success: true, template });
        } else {
            // Create
            const template = await prisma.emailTemplate.create({
                data: { title, content }
            });
            return NextResponse.json({ success: true, template });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });
        }

        await prisma.emailTemplate.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

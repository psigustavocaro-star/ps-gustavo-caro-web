import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import prisma from '@/lib/db';
import { publicAppUrl } from '@/lib/config/public-url';
import { sendPortalActivationEmail } from '@/lib/services/mail';

export async function POST(req: NextRequest) {
    const { email } = await req.json();
    const account = await prisma.patientAccount.findUnique({ where: { email: String(email || '').trim().toLowerCase() } });
    if (account) {
        const token = randomBytes(32).toString('base64url');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await prisma.patientAccount.update({
            where: { id: account.id },
            data: { resetTokenHash: createHash('sha256').update(token).digest('hex'), resetTokenExpiresAt: expiresAt },
        });
        await sendPortalActivationEmail({
            email: account.email,
            name: account.firstName || undefined,
            activationUrl: `${publicAppUrl()}/mi-cuenta?reset=${encodeURIComponent(token)}`,
            expiresAt,
        });
    }
    return NextResponse.json({ success: true });
}

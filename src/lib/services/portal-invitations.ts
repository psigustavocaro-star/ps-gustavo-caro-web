import { createHash, randomBytes } from 'crypto';
import prisma from '@/lib/db';
import { hashPatientPassword } from '@/lib/auth/patient-session';
import { publicAppUrl } from '@/lib/config/public-url';
import { sendPortalActivationEmail } from '@/lib/services/mail';

// Initial invitations are deliberately generous, while password-recovery
// links remain short-lived. Every link is still unique and single-use.
const ACTIVATION_HOURS = 30 * 24;

export async function preparePortalActivation(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) throw new Error('Correo inválido');

    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + ACTIVATION_HOURS * 60 * 60 * 1000);
    const resetTokenHash = createHash('sha256').update(token).digest('hex');
    const existing = await prisma.patientAccount.findUnique({ where: { email: normalizedEmail } });

    if (existing) {
        await prisma.patientAccount.update({
            where: { id: existing.id },
            data: { resetTokenHash, resetTokenExpiresAt: expiresAt, mustChangePassword: true },
        });
    } else {
        const booking = await prisma.booking.findFirst({
            where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
            orderBy: { createdAt: 'desc' },
        });
        // This password is never sent or shown. The recipient creates their
        // own password through the single-use activation link.
        const internalPassword = `activation-${randomBytes(32).toString('base64url')}`;
        await prisma.patientAccount.create({
            data: {
                email: normalizedEmail,
                passwordHash: hashPatientPassword(internalPassword),
                mustChangePassword: true,
                resetTokenHash,
                resetTokenExpiresAt: expiresAt,
                rut: booking?.rut || null,
                firstName: booking?.firstName || null,
                secondName: booking?.secondName || null,
                firstSurname: booking?.firstSurname || null,
                secondSurname: booking?.secondSurname || null,
                address: booking?.address || null,
                region: booking?.region || null,
                commune: booking?.commune || null,
                phone: booking?.phone || null,
            },
        });
    }

    return {
        activationUrl: `${publicAppUrl()}/mi-cuenta?reset=${encodeURIComponent(token)}`,
        expiresAt,
    };
}

export async function sendPortalActivation(email: string, name?: string) {
    const invitation = await preparePortalActivation(email);
    await sendPortalActivationEmail({
        email: email.trim().toLowerCase(),
        name,
        activationUrl: invitation.activationUrl,
        expiresAt: invitation.expiresAt,
    });
    return invitation;
}

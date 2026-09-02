type RescheduleLinkPayload = {
    bookingId: string;
    appointmentIndex: number;
    originalAppointmentDate: string;
    exp: number;
};

function base64urlEncode(value: string) {
    return Buffer.from(value).toString('base64url');
}

function base64urlDecode(value: string) {
    return Buffer.from(value, 'base64url').toString('utf8');
}

function secret() {
    const value = process.env.RESCHEDULE_LINK_SECRET || process.env.ADMIN_SESSION_SECRET;
    if (!value || value.length < 16) throw new Error('RESCHEDULE_LINK_SECRET no configurado');
    return value;
}

async function signature(payload: string) {
    const key = await crypto.subtle.importKey(
        'raw', new TextEncoder().encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    return Buffer.from(signed).toString('base64url');
}

function secureEquals(a: string, b: string) {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let index = 0; index < a.length; index++) result |= a.charCodeAt(index) ^ b.charCodeAt(index);
    return result === 0;
}

export async function createRescheduleToken(input: Omit<RescheduleLinkPayload, 'exp'> & { expiresInDays?: number }) {
    const payload: RescheduleLinkPayload = {
        ...input,
        exp: Date.now() + (input.expiresInDays || 21) * 24 * 60 * 60 * 1000,
    };
    const encoded = base64urlEncode(JSON.stringify(payload));
    return `${encoded}.${await signature(encoded)}`;
}

export async function verifyRescheduleToken(token: string): Promise<RescheduleLinkPayload | null> {
    const [encoded, providedSignature] = token.split('.');
    if (!encoded || !providedSignature) return null;
    const expectedSignature = await signature(encoded);
    if (!secureEquals(providedSignature, expectedSignature)) return null;

    try {
        const payload = JSON.parse(base64urlDecode(encoded)) as RescheduleLinkPayload;
        if (
            typeof payload.bookingId !== 'string' ||
            !Number.isInteger(payload.appointmentIndex) || payload.appointmentIndex < 0 ||
            typeof payload.originalAppointmentDate !== 'string' || Number.isNaN(Date.parse(payload.originalAppointmentDate)) ||
            typeof payload.exp !== 'number' || payload.exp < Date.now()
        ) return null;
        return payload;
    } catch {
        return null;
    }
}

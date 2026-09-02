import { createHmac, timingSafeEqual } from 'crypto';

type Payload = { email: string; exp: number };
const secret = () => process.env.PATIENT_PORTAL_SECRET || process.env.RESCHEDULE_LINK_SECRET || process.env.ADMIN_SESSION_SECRET || '';
const encode = (value: string) => Buffer.from(value).toString('base64url');
const decode = (value: string) => Buffer.from(value, 'base64url').toString('utf8');
const sign = (value: string) => createHmac('sha256', secret()).update(value).digest('base64url');

export function createPatientPortalToken(email: string) {
    const payload: Payload = { email: email.toLowerCase().trim(), exp: Date.now() + 30 * 24 * 60 * 60 * 1000 };
    const encoded = encode(JSON.stringify(payload));
    return `${encoded}.${sign(encoded)}`;
}

export function verifyPatientPortalToken(token: string): Payload | null {
    const [encoded, provided] = token.split('.');
    if (!encoded || !provided || !secret()) return null;
    const expected = sign(encoded);
    if (provided.length !== expected.length || !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) return null;
    try { const data = JSON.parse(decode(encoded)) as Payload; return typeof data.email === 'string' && data.exp > Date.now() ? data : null; } catch { return null; }
}

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

type BankData = { accountHolder: string; rut: string; bank: string; accountType: string; accountNumber: string; email: string };

function key() {
    const secret = process.env.REFUND_DATA_ENCRYPTION_KEY || process.env.RESCHEDULE_LINK_SECRET || process.env.ADMIN_SESSION_SECRET;
    if (!secret || secret.length < 16) throw new Error('No hay una clave segura configurada para datos de devolución');
    return createHash('sha256').update(secret).digest();
}

export function encryptRefundBankData(data: BankData) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key(), iv);
    const content = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
    return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${content.toString('base64url')}`;
}

export function decryptRefundBankData(value: string): BankData {
    const [ivValue, tagValue, contentValue] = value.split('.');
    const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(ivValue, 'base64url'));
    decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));
    return JSON.parse(Buffer.concat([decipher.update(Buffer.from(contentValue, 'base64url')), decipher.final()]).toString('utf8')) as BankData;
}

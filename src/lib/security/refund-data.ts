import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const key = () => createHash('sha256').update(process.env.PATIENT_PORTAL_SECRET || process.env.ADMIN_SESSION_SECRET || '').digest();

export function encryptRefundData(value: Record<string, string>) {
  if (!(process.env.PATIENT_PORTAL_SECRET || process.env.ADMIN_SESSION_SECRET)) throw new Error('Falta configurar la clave del portal.');
  const iv = randomBytes(12); const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${encrypted.toString('base64url')}`;
}
export function decryptRefundData(value: string): Record<string, string> {
  const [ivText, tagText, payload] = value.split('.');
  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(ivText, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(payload, 'base64url')), decipher.final()]).toString('utf8'));
}

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export const PATIENT_SESSION_COOKIE = 'patient_portal_session';
const secret = () => process.env.PATIENT_PORTAL_SECRET || process.env.RESCHEDULE_LINK_SECRET || process.env.ADMIN_SESSION_SECRET || '';
const sign = (value: string) => createHmac('sha256', secret()).update(value).digest('base64url');
export const hashPatientPassword = (password: string) => { const salt = randomBytes(16).toString('base64url'); return `${salt}:${scryptSync(password, salt, 64).toString('base64url')}`; };
export const verifyPatientPassword = (password: string, stored: string) => { const [salt, expected] = stored.split(':'); if (!salt || !expected) return false; const actual = scryptSync(password, salt, 64).toString('base64url'); return actual.length === expected.length && timingSafeEqual(Buffer.from(actual), Buffer.from(expected)); };
export const createPatientSession = (email: string) => { const body = Buffer.from(JSON.stringify({ email: email.toLowerCase(), exp: Date.now() + 30 * 86400000 })).toString('base64url'); return `${body}.${sign(body)}`; };
export const verifyPatientSession = (token?: string) => { if (!token || !secret()) return null; const [body, signature] = token.split('.'); if (!body || !signature || signature.length !== sign(body).length || !timingSafeEqual(Buffer.from(signature), Buffer.from(sign(body)))) return null; try { const p = JSON.parse(Buffer.from(body, 'base64url').toString()); return typeof p.email === 'string' && p.exp > Date.now() ? p.email : null; } catch { return null; } };

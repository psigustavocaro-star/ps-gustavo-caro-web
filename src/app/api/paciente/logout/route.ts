import { NextResponse } from 'next/server';
import { PATIENT_SESSION_COOKIE } from '@/lib/auth/patient-session';
export async function POST() { const r = NextResponse.json({ success: true }); r.cookies.set(PATIENT_SESSION_COOKIE, '', { path: '/', maxAge: 0 }); return r; }

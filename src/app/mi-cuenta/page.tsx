import { Suspense } from 'react';
import LoginClient from './login-client';

export default function PatientLoginPage() {
  return <Suspense fallback={<main style={{ minHeight: '100vh', padding: 40 }}>Cargando portal…</main>}><LoginClient /></Suspense>;
}

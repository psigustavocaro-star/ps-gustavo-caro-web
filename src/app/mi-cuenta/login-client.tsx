'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Navbar from '@/components/Navbar/Navbar';

const page: React.CSSProperties = { minHeight: '100vh', background: 'linear-gradient(135deg,#edf8f6,#f8faf8)', display: 'grid', placeItems: 'center', padding: '110px 20px 20px', fontFamily: 'var(--font-body)' };
const card: React.CSSProperties = { width: '100%', maxWidth: 440, background: '#fff', padding: 36, borderRadius: 24, boxShadow: '0 20px 60px #164e6330', border: '1px solid #d9ece7' };
const input: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: 14, marginTop: 12, borderRadius: 10, border: '1px solid #b9d8d3', fontSize: 15 };
const primary: React.CSSProperties = { width: '100%', boxSizing: 'border-box', display: 'block', textAlign: 'center', padding: 14, marginTop: 20, border: 0, borderRadius: 10, background: '#0b6e69', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none' };
const linkButton: React.CSSProperties = { display: 'block', margin: '16px auto 0', border: 0, background: 'none', color: '#0b6e69', fontWeight: 700 };

export default function Page() {
    const query = useSearchParams();
    const reset = query.get('reset');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>(reset ? 'reset' : 'login');
    const [error, setError] = useState('');
    const [passwordUpdated, setPasswordUpdated] = useState(false);
    const [recoverySent, setRecoverySent] = useState(false);

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        setError('');
        const endpoint = mode === 'login' ? '/api/paciente/login' : mode === 'forgot' ? '/api/paciente/forgot-password' : '/api/paciente/reset-password';
        const body = mode === 'login' ? { email, password } : mode === 'forgot' ? { email } : { token: reset, password };
        const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await response.json();
        if (!response.ok) return setError(data.error || 'No fue posible completar la acción.');
        if (mode === 'login') location.href = data.mustChangePassword ? '/mi-agenda?change=1' : '/mi-agenda';
        else if (mode === 'forgot') setRecoverySent(true);
        else setPasswordUpdated(true);
    }

    if (passwordUpdated) return <><Navbar /><main style={page}><section style={{ ...card, textAlign: 'center' }} aria-live="polite">
        <div style={{ width: 64, height: 64, margin: '0 auto 20px', borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#e4f6ef', color: '#17705b', fontSize: 34, fontWeight: 800 }}>✓</div>
        <div style={{ color: '#17705b', fontWeight: 800, letterSpacing: 1, fontSize: 12 }}>¡TODO LISTO!</div>
        <h1 style={{ color: '#173f43', margin: '10px 0 12px', fontSize: 28 }}>Tu contraseña fue actualizada</h1>
        <p style={{ color: '#527074', lineHeight: 1.6, margin: 0 }}>Tu acceso quedó protegido. Ya puedes ingresar con la contraseña que acabas de crear.</p>
        <a href="/mi-cuenta" style={primary}>Ingresar a mi nuevo portal</a>
        <p style={{ color: '#799295', fontSize: 13, lineHeight: 1.5, margin: '18px 0 0' }}>Tus datos personales y sesiones permanecen privados.</p>
    </section></main></>;

    return <><Navbar /><main style={page}><form onSubmit={submit} style={card}>
        <div style={{ color: '#0b6e69', fontWeight: 800, letterSpacing: 1, fontSize: 12 }}>PS. GUSTAVO CARO</div>
        <h1 style={{ color: '#173f43', margin: '10px 0' }}>{mode === 'forgot' ? 'Recupera tu acceso' : mode === 'reset' ? 'Crea tu nueva contraseña' : 'Tu espacio de sesiones'}</h1>
        <p style={{ color: '#5b6b6d', lineHeight: 1.5 }}>{mode === 'login' ? 'Ingresa para revisar tus citas y solicitar cambios con tranquilidad.' : mode === 'forgot' ? 'Te enviaremos un enlace privado para crear una nueva contraseña.' : 'Elige una contraseña de al menos 10 caracteres para proteger tu información.'}</p>
        {mode !== 'reset' && <input required type="email" placeholder="Correo electrónico" value={email} onChange={event => setEmail(event.target.value)} style={input} />}
        {mode !== 'forgot' && <input required type="password" minLength={10} placeholder="Contraseña" value={password} onChange={event => setPassword(event.target.value)} style={input} />}
        {error && <p role="alert" style={{ color: '#a04444', fontSize: 14 }}>{error}</p>}
        {recoverySent && <p aria-live="polite" style={{ color: '#17705b', background: '#eaf7f2', borderRadius: 10, padding: '12px 14px', fontSize: 14, lineHeight: 1.45 }}>Si existe una cuenta asociada, enviamos un enlace seguro a ese correo.</p>}
        <button style={primary}>{mode === 'login' ? 'Ingresar al portal' : mode === 'forgot' ? 'Enviar enlace seguro' : 'Guardar mi contraseña'}</button>
        {mode === 'login' && <button type="button" onClick={() => { setError(''); setMode('forgot'); }} style={linkButton}>Olvidé mi contraseña</button>}
        {mode === 'forgot' && <button type="button" onClick={() => { setRecoverySent(false); setError(''); setMode('login'); }} style={linkButton}>Volver a ingresar</button>}
    </form></main></>;
}

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function Inner() {
    const params = useSearchParams();
    const email = params.get('email') || '';
    const token = params.get('t') || '';
    const [status, setStatus] = useState<'sending' | 'ok' | 'already' | 'error'>('sending');

    useEffect(() => {
        if (!email || !token) {
            setStatus('error');
            return;
        }
        fetch('/api/newsletter/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, token }),
        })
            .then(async r => {
                if (r.ok) {
                    const data = await r.json();
                    setStatus(data.alreadyConfirmed ? 'already' : 'ok');
                } else {
                    setStatus('error');
                }
            })
            .catch(() => setStatus('error'));
    }, [email, token]);

    if (status === 'ok') {
        return (
            <>
                <p><strong>¡Listo!</strong> Tu suscripción quedó confirmada.</p>
                <p>Recibirás recursos de salud mental cada tanto. Puedes darte de baja en cualquier momento desde el link al pie de cada correo.</p>
                <p><Link href="/">Volver al inicio</Link></p>
            </>
        );
    }

    if (status === 'already') {
        return (
            <>
                <p>Tu correo <strong>{email}</strong> ya estaba confirmado. No hay nada más que hacer.</p>
                <p><Link href="/">Volver al inicio</Link></p>
            </>
        );
    }

    if (status === 'error') {
        return (
            <>
                <p>No pudimos confirmar tu suscripción con este enlace.</p>
                <p>Puede que el link haya expirado o ya haya sido usado. Si sigues teniendo problemas escríbenos a <strong>psi.gustavocaro@gmail.com</strong>.</p>
            </>
        );
    }

    return <p>Confirmando tu suscripción…</p>;
}

export default function ConfirmClient() {
    return (
        <Suspense fallback={<p>Cargando…</p>}>
            <Inner />
        </Suspense>
    );
}

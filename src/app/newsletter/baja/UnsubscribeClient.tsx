'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function Inner() {
    const params = useSearchParams();
    const email = params.get('email') || '';
    const token = params.get('t') || '';
    const [status, setStatus] = useState<'ready' | 'sending' | 'ok' | 'error'>(email && token ? 'ready' : 'error');

    useEffect(() => {
        if (email && token && status === 'ready') {
            // Auto-envío: si vino con email + token, confirmamos automáticamente
            // (equivale a "one-click unsubscribe" del RFC 8058)
            setStatus('sending');
            fetch('/api/newsletter/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token }),
            })
                .then(r => setStatus(r.ok ? 'ok' : 'error'))
                .catch(() => setStatus('error'));
        }
    }, [email, token, status]);

    if (status === 'ok') {
        return (
            <>
                <p>Listo, tu correo <strong>{email}</strong> ha sido eliminado de la lista de envíos.</p>
                <p>Ya no recibirás más newsletter de nuestra parte.</p>
                <p>Si esto fue un error, puedes volver a suscribirte desde el <Link href="/">inicio</Link>.</p>
            </>
        );
    }

    if (status === 'error') {
        return (
            <>
                <p>No pudimos procesar la baja con este enlace.</p>
                <p>
                    Por favor escríbenos a <strong>psi.gustavocaro@gmail.com</strong> con el asunto
                    &quot;Darme de baja&quot; y lo haremos manualmente.
                </p>
            </>
        );
    }

    return <p>Procesando tu solicitud de baja…</p>;
}

export default function UnsubscribeClient() {
    return (
        <Suspense fallback={<p>Cargando…</p>}>
            <Inner />
        </Suspense>
    );
}

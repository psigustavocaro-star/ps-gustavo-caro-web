'use client';

import { useState } from 'react';
import styles from './arco.module.css';

type RequestType = 'acceso' | 'rectificacion' | 'cancelacion' | 'oposicion' | 'portabilidad';

export default function ArcoForm() {
    const [type, setType] = useState<RequestType>('acceso');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [details, setDetails] = useState('');
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !name) return;
        setSending(true);
        setStatus('idle');
        try {
            const res = await fetch('/api/derechos-arco', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, email, name, details }),
            });
            if (res.ok) {
                setStatus('ok');
                setEmail('');
                setName('');
                setDetails('');
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        } finally {
            setSending(false);
        }
    };

    if (status === 'ok') {
        return (
            <section className={styles.successBox}>
                <h2>Solicitud recibida</h2>
                <p>
                    Recibimos tu solicitud y te responderemos por correo electrónico dentro de un plazo
                    máximo de 15 días hábiles.
                </p>
                <p>
                    Si no ves respuesta en tu bandeja de entrada, revisa la carpeta de spam o
                    escríbenos directamente a psi.gustavocaro@gmail.com.
                </p>
            </section>
        );
    }

    return (
        <section>
            <h2>Formulario de solicitud</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                    <label htmlFor="arco-type">Tipo de solicitud</label>
                    <select
                        id="arco-type"
                        value={type}
                        onChange={(e) => setType(e.target.value as RequestType)}
                        required
                    >
                        <option value="acceso">Acceso a mis datos</option>
                        <option value="rectificacion">Rectificar un dato incorrecto</option>
                        <option value="cancelacion">Cancelar / eliminar mis datos</option>
                        <option value="oposicion">Oponerme al tratamiento (baja del newsletter)</option>
                        <option value="portabilidad">Portabilidad de mis datos</option>
                    </select>
                </div>

                <div className={styles.field}>
                    <label htmlFor="arco-name">Nombre completo</label>
                    <input
                        id="arco-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        maxLength={200}
                        autoComplete="name"
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="arco-email">Correo electrónico registrado</label>
                    <input
                        id="arco-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        maxLength={254}
                        autoComplete="email"
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="arco-details">Detalles adicionales (opcional)</label>
                    <textarea
                        id="arco-details"
                        rows={4}
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        maxLength={2000}
                        placeholder="Si tu solicitud es de rectificación, indica qué dato debe corregirse."
                    />
                </div>

                {status === 'error' && (
                    <p className={styles.errorMsg}>No pudimos enviar tu solicitud. Intenta nuevamente o escríbenos a psi.gustavocaro@gmail.com.</p>
                )}

                <button type="submit" className="btn-primary" disabled={sending}>
                    {sending ? 'Enviando…' : 'Enviar solicitud'}
                </button>
            </form>
        </section>
    );
}

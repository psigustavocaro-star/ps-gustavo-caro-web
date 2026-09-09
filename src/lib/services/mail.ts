import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatAppointmentDate(date: string) {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return 'la fecha acordada';

    return new Intl.DateTimeFormat('es-CL', {
        timeZone: 'America/Santiago',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(parsed);
}

export function renderPortalActivationEmail(data: {
    name?: string;
    activationUrl: string;
    expiresAt: Date;
}) {
    const name = escapeHtml(data.name?.trim() || '');
    const activationUrl = escapeHtml(data.activationUrl);
    const expiresAt = new Intl.DateTimeFormat('es-CL', {
        timeZone: 'America/Santiago', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(data.expiresAt);

    return `<!doctype html>
<html lang="es"><body style="margin:0;padding:0;background:#edf3f2;color:#193d42;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Crea tu acceso privado para gestionar tus sesiones.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#edf3f2;padding:34px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 14px 38px rgba(22,65,69,.13);">
        <tr><td style="background:#0b6e69;padding:30px 42px 32px;background-image:linear-gradient(135deg,#075f61,#15969a);">
          <div style="font-size:12px;letter-spacing:1.8px;font-weight:700;color:#d8fbf7;text-transform:uppercase;">Ps. Gustavo Caro</div>
          <div style="margin-top:18px;display:inline-block;border:1px solid rgba(255,255,255,.38);border-radius:999px;padding:7px 11px;font-size:11px;letter-spacing:.8px;font-weight:700;color:#ffffff;text-transform:uppercase;">Nuevo · Portal del paciente</div>
          <h1 style="margin:18px 0 0;color:#ffffff;font-size:31px;line-height:1.18;letter-spacing:-.5px;">Tu espacio personal<br/>está listo para ti</h1>
        </td></tr>
        <tr><td style="padding:35px 42px 12px;">
          <p style="margin:0 0 16px;font-size:17px;line-height:1.6;">Hola${name ? ` ${name}` : ''},</p>
          <p style="margin:0;font-size:16px;line-height:1.65;color:#34555a;">Creamos un espacio privado para que puedas revisar tus sesiones, solicitar cambios cuando lo necesites y mantener tus datos de contacto al día.</p>
        </td></tr>
        <tr><td style="padding:22px 42px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
            <td width="33.33%" valign="top" style="padding:0 7px 0 0;"><div style="background:#f1f8f7;border-radius:12px;padding:15px 12px;min-height:75px;"><div style="font-size:18px;line-height:1">◷</div><div style="margin-top:8px;font-size:12px;line-height:1.35;font-weight:700;color:#225c5a;">Tus sesiones</div></div></td>
            <td width="33.33%" valign="top" style="padding:0 4px;"><div style="background:#f1f8f7;border-radius:12px;padding:15px 12px;min-height:75px;"><div style="font-size:18px;line-height:1">↔</div><div style="margin-top:8px;font-size:12px;line-height:1.35;font-weight:700;color:#225c5a;">Solicita cambios</div></div></td>
            <td width="33.33%" valign="top" style="padding:0 0 0 7px;"><div style="background:#f1f8f7;border-radius:12px;padding:15px 12px;min-height:75px;"><div style="font-size:18px;line-height:1">⌁</div><div style="margin-top:8px;font-size:12px;line-height:1.35;font-weight:700;color:#225c5a;">Acceso privado</div></div></td>
          </tr></table>
        </td></tr>
        <tr><td align="center" style="padding:28px 42px 18px;"><a href="${activationUrl}" style="display:inline-block;background:#d47a4c;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:15px 25px;border-radius:10px;box-shadow:0 5px 10px rgba(172,86,46,.18);">Crear mi acceso seguro</a></td></tr>
        <tr><td style="padding:0 42px 31px;"><div style="border-left:3px solid #9bd6cd;background:#f6fbfa;border-radius:0 10px 10px 0;padding:13px 15px;font-size:13px;line-height:1.55;color:#496669;"><strong style="color:#245a5a;">Un enlace, una sola vez.</strong><br/>Este acceso vence el ${escapeHtml(expiresAt)}. Al abrirlo podrás crear tu propia contraseña.</div></td></tr>
        <tr><td style="border-top:1px solid #dce9e7;padding:22px 42px 30px;"><p style="margin:0;font-size:12px;line-height:1.55;color:#647b7e;">No enviamos contraseñas por correo. No compartas este enlace. Si no esperabas este mensaje, puedes ignorarlo con tranquilidad.</p><p style="margin:14px 0 0;font-size:11px;line-height:1.45;color:#829397;word-break:break-all;">Si el botón no funciona, copia este enlace en tu navegador:<br/><a href="${activationUrl}" style="color:#397d7b;">${activationUrl}</a></p></td></tr>
      </table>
      <p style="max-width:620px;margin:18px auto 0;font-size:11px;line-height:1.5;color:#708487;">Ps. Gustavo Caro · Comunicación privada de acceso a tu portal.</p>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendPortalActivationEmail(data: {
    email: string;
    name?: string;
    activationUrl: string;
    expiresAt: Date;
}) {
    const response = await resend.emails.send({
        from: 'Ps. Gustavo Caro <contacto@psgustavocaro.cl>',
        to: data.email,
        subject: 'Crea tu acceso al portal de pacientes',
        html: renderPortalActivationEmail(data),
    });
    if (response.error) throw new Error(response.error.message || 'No fue posible enviar la invitación.');
    return response.data;
}

/**
 * Correo transaccional para una sesión cancelada por el profesional.
 * No lleva enlace de desuscripción porque es una comunicación sobre una cita ya reservada.
 */
export function renderProfessionalCancellationEmail(data: {
    patientName: string;
    appointmentDate: string;
    rescheduleUrl: string;
    reason?: string;
}) {
    const patientName = escapeHtml(data.patientName.trim() || '');
    const appointmentDate = escapeHtml(formatAppointmentDate(data.appointmentDate));
    const rescheduleUrl = escapeHtml(data.rescheduleUrl);
    const reason = escapeHtml(data.reason?.trim() || 'Por motivos de fuerza mayor');

    return `
        <div style="background:#f4f7f8;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#263238;line-height:1.6">
            <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 18px rgba(38,50,56,.08)">
                <div style="background:#0f6b78;padding:28px 36px;color:#ffffff">
                    <p style="margin:0 0 6px;font-size:14px;letter-spacing:.04em;text-transform:uppercase;opacity:.85">Ps. Gustavo Caro</p>
                    <h1 style="margin:0;font-size:25px;line-height:1.25">Necesitamos reprogramar tu sesión</h1>
                </div>
                <div style="padding:32px 36px">
                    <p style="margin-top:0">Hola${patientName ? ` ${patientName}` : ''},</p>
                    <p>Espero que estés bien. ${reason}, debo cancelar nuestra sesión agendada para el <strong style="text-transform:capitalize">${appointmentDate}</strong>.</p>
                    <p>Lamento sinceramente los inconvenientes que esto pueda causarte. Quiero que puedas elegir con tranquilidad una nueva hora que te acomode; el pago y tu reserva se mantienen sin cambios.</p>
                    <p style="text-align:center;margin:30px 0">
                        <a href="${rescheduleUrl}" style="display:inline-block;background:#0f6b78;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:9px">Elegir una nueva hora</a>
                    </p>
                    <p>Si ninguna de las alternativas te resulta conveniente, puedes responder directamente a este correo y buscamos una opción.</p>
                    <p style="margin-bottom:0">Gracias por tu comprensión.<br/>Un abrazo,<br/><strong>Ps. Gustavo Caro</strong></p>
                </div>
            </div>
            <p style="max-width:600px;margin:18px auto 0;text-align:center;font-size:12px;color:#64748b">Este es un aviso relacionado con una sesión que ya tienes agendada.</p>
        </div>
    `;
}

export async function sendProfessionalCancellationEmail(data: {
    patientName: string;
    email: string;
    appointmentDate: string;
    rescheduleUrl: string;
    reason?: string;
}) {
    const response = await resend.emails.send({
        from: 'Ps. Gustavo Caro <contacto@psgustavocaro.cl>',
        to: data.email,
        subject: 'Importante: debemos reprogramar tu sesión',
        html: renderProfessionalCancellationEmail(data),
    });

    if (response.error) {
        throw new Error(response.error.message || 'No fue posible enviar el correo de reprogramación');
    }

    return response.data;
}

export async function sendRescheduleConfirmationEmail(data: {
    patientName: string;
    email: string;
    appointmentDate: string;
}) {
    const name = escapeHtml(data.patientName.trim());
    const date = escapeHtml(formatAppointmentDate(data.appointmentDate));
    const response = await resend.emails.send({
        from: 'Ps. Gustavo Caro <contacto@psgustavocaro.cl>',
        to: data.email,
        subject: 'Confirmación de tu nueva hora',
        html: `
            <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:32px;color:#263238;line-height:1.6">
                <h1 style="color:#0f6b78">Tu nueva hora está confirmada</h1>
                <p>Hola${name ? ` ${name}` : ''},</p>
                <p>Tu sesión quedó reprogramada para el <strong style="text-transform:capitalize">${date}</strong>.</p>
                <p>Gracias por tu comprensión. Si necesitas ayuda, responde directamente a este correo.</p>
                <p>Un abrazo,<br/><strong>Ps. Gustavo Caro</strong></p>
            </div>
        `,
    });
    if (response.error) throw new Error(response.error.message || 'No fue posible enviar la confirmación');
    return response.data;
}

export async function sendBookingNotification(data: {
    name: string;
    email: string;
    phone?: string;
    reason: string;
    details: string;
    amount: number;
    orderId: string;
}) {
    const { name, email, phone, reason, details, amount, orderId } = data;

    try {
        await resend.emails.send({
            from: 'Reserva Ps. Gustavo Caro <notificaciones@psgustavocaro.cl>',
            to: 'psi.gustavocaro@gmail.com',
            subject: `🔔 Nueva Reserva Pendiente: ${name}`,
            html: `
                <h1>Nueva Intento de Reserva</h1>
                <p>Se ha iniciado un proceso de agendamiento en el sitio web.</p>
                <hr />
                <p><strong>Nombre:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Teléfono:</strong> ${phone || 'No proporcionado'}</p>
                <p><strong>Motivo:</strong> ${reason}</p>
                <p><strong>Detalles:</strong> ${details}</p>
                <hr />
                <p><strong>Monto:</strong> $${amount.toLocaleString('es-CL')}</p>
                <p><strong>ID Orden:</strong> ${orderId}</p>
                <p><em>Este correo es informativo. El pago aún no ha sido confirmado.</em></p>
            `,
        });
    } catch (error) {
        console.error('Error sending booking notification email:', error);
    }
}

export async function sendBookingConfirmation(data: {
    name: string;
    email: string;
    phone?: string;
    reason: string;
    details: string;
    amount: number;
    orderId: string;
    temporaryPassword?: string;
}) {
    const { name, email, phone, reason, details, amount, orderId, temporaryPassword } = data;

    try {
        // Enviar a Gustavo
        await resend.emails.send({
            from: 'Sistema Ps. Gustavo Caro <sistema@psgustavocaro.cl>',
            to: 'psi.gustavocaro@gmail.com',
            subject: `✅ PAGO CONFIRMADO: Reserva de ${name}`,
            html: `
                <h1>¡Pago Confirmado!</h1>
                <p>El paciente ha completado el pago de su sesión.</p>
                <hr />
                <h2>Datos del Paciente</h2>
                <p><strong>Nombre:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Teléfono:</strong> ${phone || 'No proporcionado'}</p>
                <p><strong>Motivo:</strong> ${reason}</p>
                <p><strong>Detalles:</strong> ${details}</p>
                <hr />
                <h2>Detalles del Pago</h2>
                <p><strong>Monto Pagado:</strong> $${amount.toLocaleString('es-CL')}</p>
                <p><strong>ID Orden:</strong> ${orderId}</p>
                <p><strong>Estado:</strong> Pagado</p>
            `,
        });

        // Enviar al Paciente
        await resend.emails.send({
            from: 'Ps. Gustavo Caro <contacto@psgustavocaro.cl>',
            to: email,
            subject: `Confirmación de Reserva - Ps. Gustavo Caro`,
            html: `
                <h1>Hola ${name},</h1>
                <p>Tu pago ha sido procesado exitosamente. He recibido tus datos y me pondré en contacto contigo a la brevedad para coordinar el link de nuestra sesión.</p>
                <p><strong>Detalles de tu reserva:</strong></p>
                <ul>
                    <li><strong>Servicio:</strong> Sesión de Psicoterapia Individual</li>
                    <li><strong>Monto:</strong> $${amount.toLocaleString('es-CL')}</li>
                    <li><strong>ID de Orden:</strong> ${orderId}</li>
                </ul>
                <p><strong>Tu portal de paciente:</strong> puedes revisar tus sesiones y solicitar cambios en <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://psgustavocaro.cl'}/mi-cuenta">Mi portal</a>.</p>
                ${temporaryPassword ? `<p>Tu contraseña temporal es: <strong>${escapeHtml(temporaryPassword)}</strong>. Por seguridad, se te pedirá cambiarla al ingresar por primera vez.</p>` : ''}
                <p>Si tienes alguna duda, puedes responderme directamente a este correo.</p>
                <p>Atentamente,<br />Ps. Gustavo Caro</p>
            `,
        });
    } catch (error) {
        console.error('Error sending confirmation emails:', error);
    }
}

export async function sendFreeBookingConfirmation(data: {
    name: string;
    email: string;
    phone?: string;
    reason: string;
    details: string;
    orderId: string;
    serviceType: string;
}) {
    const { name, email, phone, reason, details, orderId, serviceType } = data;
    
    // Mapeo dinámico de nombres de servicio
    const serviceNames: Record<string, string> = {
        'primeraConsulta': 'Primera Consulta Gratuita (20 min)',
        'sesion': 'Sesión de Psicoterapia Individual',
        'packSesiones': 'Pack de 4 Sesiones',
        'evalTDAH': 'Evaluación de TDAH Presencial',
        'evalAutismo': 'Evaluación TEA (Autismo)',
        'evalWiscV': 'Evaluación Cognitiva WISC-V Presencial',
        'evalInteligencia': 'Evaluación Intelectual',
        'evalNeuropsicologica': 'Evaluación Neurocognitiva Presencial',
        'evalEmocional': 'Evaluación Socioemocional'
    };

    const serviceName = serviceNames[serviceType] || 'Servicio Clínico (Agendado con Cupón)';

    try {
        // Enviar a Gustavo (Notificación de reserva para boleta y registro)
        await resend.emails.send({
            from: 'Sistema Ps. Gustavo Caro <sistema@psgustavocaro.cl>',
            to: 'psi.gustavocaro@gmail.com',
            subject: `🆓 PRUEBA/GRATIS: Nueva Reserva de ${name}`,
            html: `
                <h1>Nueva Reserva (Sin Pago / Cupón)</h1>
                <p>Un paciente ha agendado una sesión. Al ser sin costo (o prueba), debes registrar esto manualmente.</p>
                <hr />
                <h2>Datos del Paciente</h2>
                <p><strong>Nombre:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Teléfono:</strong> ${phone || 'No proporcionado'}</p>
                <p><strong>Motivo:</strong> ${reason}</p>
                <p><strong>Detalles:</strong> ${details}</p>
                <hr />
                <p><strong>Servicio:</strong> ${serviceName}</p>
                <p><strong>ID Orden:</strong> ${orderId}</p>
                <p><em>Si fue una prueba propia, puedes ignorar el envío de boleta.</em></p>
            `,
        });

        // Enviar al Paciente
        await resend.emails.send({
            from: 'Ps. Gustavo Caro <contacto@psgustavocaro.cl>',
            to: email,
            subject: `Confirmación de Reserva Gratuita - Ps. Gustavo Caro`,
            html: `
                <h1>Hola ${name},</h1>
                <p>Tu sesión gratuita ha sido agendada con éxito.</p>
                <p>He recibido tus datos y me pondré en contacto contigo pronto para enviarte el link de nuestra sesión de ${serviceType === 'primeraConsulta' ? '20' : '15-20'} minutos.</p>
                <p><strong>Detalles de tu reserva:</strong></p>
                <ul>
                    <li><strong>Servicio:</strong> ${serviceName}</li>
                    <li><strong>Costo:</strong> $0 (Gratis)</li>
                    <li><strong>ID de Reserva:</strong> ${orderId}</li>
                </ul>
                <p>Si tienes alguna consulta, puedes responder a este correo.</p>
                <p>Nos vemos pronto,<br />Ps. Gustavo Caro</p>
            `,
        });
    } catch (error) {
        console.error('Error sending free confirmation emails:', error);
    }
}

export async function sendNewsletterWelcome(email: string, name?: string) {
    try {
        const { newsletterSequence } = await import('@/lib/config/newsletter-content');
        const firstEmail = newsletterSequence[0];

        await resend.emails.send({
            from: 'Ps. Gustavo Caro <newsletter@psgustavocaro.cl>',
            to: email,
            subject: firstEmail.subject,
            html: firstEmail.content(name || 'amigo/a'),
        });

        // Actualizar en DB que ya recibió la bienvenida (paso 1)
        const { default: prisma } = await import('@/lib/db');
        await prisma.newsletter.update({
            where: { email },
            data: {
                currentStep: 1,
                lastSentAt: new Date()
            }
        });

    } catch (error) {
        console.error('Error sending newsletter welcome email:', error);
    }
}

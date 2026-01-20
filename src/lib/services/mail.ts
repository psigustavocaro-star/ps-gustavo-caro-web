import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
}) {
    const { name, email, phone, reason, details, amount, orderId } = data;

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

        // Enviar al Paciente (Opcional por ahora, pero recomendado)
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
                <p>Si tienes alguna duda, puedes responderme directamente a este correo.</p>
                <p>Atentamente,<br />Ps. Gustavo Caro</p>
            `,
        });
    } catch (error) {
        console.error('Error sending confirmation emails:', error);
    }
}

export async function sendAnamnesisData(data: {
    name: string;
    email: string;
    age: string;
    medications: string;
    history: string;
}) {
    const { name, email, age, medications, history } = data;

    try {
        await resend.emails.send({
            from: 'Ficha Clínica <sistema@psgustavocaro.cl>',
            to: 'psi.gustavocaro@gmail.com',
            subject: `🩺 Ficha Clínica (Anamnesis): ${name}`,
            html: `
                <h1>Datos Clínicos Adicionales</h1>
                <p>El paciente ha completado su ficha anticipada.</p>
                <hr />
                <p><strong>Paciente:</strong> ${name}</p>
                <p><strong>Edad:</strong> ${age}</p>
                <p><strong>Medicamentos:</strong> ${medications}</p>
                <p><strong>Antecedentes:</strong></p>
                <p>${history}</p>
                <hr />
                <p>Este documento es confidencial y para uso exclusivo del profesional.</p>
            `,
        });
    } catch (error) {
        console.error('Error sending anamnesis email:', error);
    }
}

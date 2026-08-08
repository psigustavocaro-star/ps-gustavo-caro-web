import type { Metadata } from 'next';
import SEOLanding from '@/components/SEOLanding/SEOLanding';

export const metadata: Metadata = {
    title: 'Psicologo online en Chile | Ps. Gustavo Caro',
    description: 'Psicoterapia online para adultos en Chile con enfoque cognitivo conductual. Agenda una sesion profesional, cercana y confidencial.',
    alternates: { canonical: '/psicologo-online-chile' },
    keywords: ['psicologo online chile', 'psicoterapia online', 'terapia cognitivo conductual online', 'psicologo por videollamada'],
};

export default function PsicologoOnlineChilePage() {
    return (
        <SEOLanding
            eyebrow="Psicoterapia online"
            title="Psicologo online en Chile para trabajar ansiedad, estres y procesos personales"
            description="Atencion psicologica online para adultos, con un enfoque claro, humano y orientado a herramientas practicas para tu vida cotidiana."
            service="Psicoterapia cognitivo conductual online"
            benefits={[
                'Necesitas apoyo profesional sin trasladarte.',
                'Buscas comprender patrones de pensamiento, emociones y conducta.',
                'Quieres trabajar ansiedad, animo, estres o dificultades relacionales.',
                'Prefieres un proceso estructurado, cercano y con objetivos claros.',
            ]}
            process={[
                'Agendas un horario disponible desde la pagina y completas tus datos de reserva.',
                'Tenemos una primera sesion para comprender tu motivo de consulta y definir objetivos.',
                'Trabajamos con herramientas psicologicas concretas, seguimiento y ajustes segun tu proceso.',
            ]}
            faqs={[
                {
                    question: 'La terapia online funciona igual que presencial?',
                    answer: 'Para muchos motivos de consulta en adultos, la psicoterapia online puede ser una alternativa efectiva cuando existe privacidad, conexion estable y compromiso con el proceso.',
                },
                {
                    question: 'Desde que ciudades puedo agendar?',
                    answer: 'Puedes agendar desde distintas zonas de Chile, siempre que cuentes con un espacio privado para la sesion.',
                },
                {
                    question: 'Como se realiza la sesion?',
                    answer: 'La sesion se realiza por videollamada en el horario reservado. Recibiras la informacion necesaria al confirmar tu agendamiento.',
                },
            ]}
        />
    );
}

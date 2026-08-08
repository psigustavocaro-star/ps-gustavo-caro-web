import type { Metadata } from 'next';
import SEOLanding from '@/components/SEOLanding/SEOLanding';

export const metadata: Metadata = {
    title: 'Primera sesion psicologica online: que esperar',
    description: 'Conoce cómo es una primera sesión psicológica online, qué información se conversa y cómo preparar tu motivo de consulta.',
    alternates: { canonical: '/primera-sesion-psicologica' },
    keywords: ['primera sesion psicologica', 'como es ir al psicologo', 'primera terapia online', 'agendar psicologo Chile'],
};

export default function PrimeraSesionPsicologicaPage() {
    return <SEOLanding
        eyebrow="Antes de agendar"
        title="Primera sesion psicologica online: que esperar"
        description="No necesitas tener una explicación perfecta de lo que te pasa. La primera sesión sirve para comprender tu motivo de consulta, resolver dudas y acordar una forma de trabajo posible."
        service="Entrevista clínica inicial"
        benefits={[
            'Quieres consultar, pero no sabes cómo explicar lo que te pasa.',
            'Tienes dudas sobre confidencialidad, modalidad online u objetivos.',
            'Buscas una primera orientación para decidir cómo continuar.',
            'Necesitas un espacio profesional, respetuoso y con un encuadre claro.',
        ]}
        details={[
            { title: 'Llegar como estás es suficiente', text: 'Puedes traer una situación actual, una sensación difícil de nombrar o una pregunta. El trabajo clínico parte justamente de ordenar esa experiencia.' },
            { title: 'Se conversa el encuadre', text: 'En la primera instancia se explican modalidad, confidencialidad, frecuencia posible, objetivos iniciales y cualquier duda relevante.' },
            { title: 'No hay obligación de seguir', text: 'La primera sesión también permite evaluar si este espacio te hace sentido. La decisión de continuar es informada y personal.' },
        ]}
        process={[
            'Agendas el servicio y recibes la información necesaria para conectarte.',
            'En la sesión exploramos el motivo de consulta, antecedentes relevantes y necesidades actuales.',
            'Al cierre definimos orientaciones iniciales y, si corresponde, una propuesta de continuidad.',
        ]}
        faqs={[
            { question: 'Que debo preparar?', answer: 'Nada es obligatorio. Si te ayuda, puedes anotar qué te llevó a consultar y qué esperas que cambie.' },
            { question: 'La atención es online?', answer: 'La modalidad y disponibilidad se indican al momento de agendar. Para una sesión online se necesita conexión estable y un espacio privado.' },
            { question: 'Puedo agendar si tengo dudas diagnosticas?', answer: 'Sí. La entrevista inicial permite definir si es adecuado iniciar psicoterapia, evaluación u otra orientación clínica.' },
        ]}
        relatedResources={[{ label: 'Descargar guia para la primera sesion', href: '/recursos' }, { label: 'Como prepararte para tu primera consulta', href: '/blog/como-preparar-primera-sesion-psicologica' }]}
    />;
}

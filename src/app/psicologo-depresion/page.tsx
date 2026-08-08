import type { Metadata } from 'next';
import SEOLanding from '@/components/SEOLanding/SEOLanding';

export const metadata: Metadata = {
    title: 'Psicologo para depresion y animo bajo en Chile',
    description: 'Psicoterapia online para animo bajo, perdida de interes, culpa, aislamiento y dificultad para retomar rutinas. Enfoque TCC para adultos en Chile.',
    alternates: { canonical: '/psicologo-depresion' },
    keywords: ['psicologo depresion Chile', 'terapia depresion online', 'animo bajo psicologo', 'terapia TCC depresion'],
};

export default function PsicologoDepresionPage() {
    return <SEOLanding
        eyebrow="Animo bajo y depresion"
        title="Psicologo para depresion, apatia y animo bajo"
        description="Un espacio para comprender lo que esta apagando tu energia, recuperar actividades importantes y avanzar sin reducir tu experiencia a una simple falta de voluntad."
        service="Psicoterapia para animo bajo y depresion"
        benefits={[
            'Sientes poco interes o energia para actividades que antes te importaban.',
            'Te cuesta sostener rutinas de sueno, alimentacion, estudio o trabajo.',
            'Notas aislamiento, culpa intensa, desesperanza o irritabilidad persistente.',
            'Quieres un plan gradual para volver a conectar con tu vida cotidiana.',
        ]}
        details={[
            { title: 'No todo animo bajo es igual', text: 'Una evaluacion inicial permite distinguir entre una reaccion esperable a un periodo dificil, un cuadro depresivo u otras variables que conviene considerar. El objetivo es entender antes de intervenir.' },
            { title: 'Volver a moverse de a poco', text: 'La activacion conductual trabaja con acciones pequeñas y posibles. No exige sentirse motivado primero: ayuda a reconstruir experiencias de logro, contacto y descanso.' },
            { title: 'Pedir apoyo a tiempo', text: 'Cuando aparecen ideas de muerte, daño o una crisis inmediata, se requiere apoyo de urgencia. Esta consulta no reemplaza servicios de emergencia.' },
        ]}
        process={[
            'Revisamos sintomas, historia, contexto actual y el impacto en tu funcionamiento diario.',
            'Definimos objetivos realistas y acciones graduales que se puedan practicar entre sesiones.',
            'Monitoreamos avances, obstaculos y necesidades de coordinación con otros profesionales cuando corresponde.',
        ]}
        faqs={[
            { question: 'Necesito un diagnostico para consultar?', answer: 'No. Puedes consultar por animo bajo, cansancio, aislamiento o perdida de interes aunque aun no tengas un diagnostico.' },
            { question: 'La terapia reemplaza tratamiento psiquiatrico?', answer: 'No necesariamente. Cuando corresponde, la psicoterapia puede complementarse con evaluación médica o psiquiátrica.' },
            { question: 'Que pasa si tengo una crisis?', answer: 'Ante riesgo inmediato o crisis de salud mental, contacta servicios de urgencia o lineas de apoyo. No se atienden urgencias por este medio.' },
        ]}
        relatedResources={[{ label: 'Guia para preparar tu primera sesion', href: '/recursos' }, { label: 'Como retomar terapia despues de una pausa', href: '/blog/cuando-retomar-terapia-despues-de-pausar' }]}
    />;
}

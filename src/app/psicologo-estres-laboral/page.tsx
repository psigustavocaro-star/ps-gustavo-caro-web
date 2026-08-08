import type { Metadata } from 'next';
import SEOLanding from '@/components/SEOLanding/SEOLanding';

export const metadata: Metadata = {
    title: 'Psicologo para estres laboral y burnout en Chile',
    description: 'Apoyo psicologico online para estres laboral, agotamiento, sobrecarga y burnout. Herramientas TCC para recuperar limites y energia.',
    alternates: { canonical: '/psicologo-estres-laboral' },
    keywords: ['psicologo estres laboral Chile', 'burnout terapia', 'agotamiento laboral psicologo', 'terapia online estres'],
};

export default function PsicologoEstresLaboralPage() {
    return <SEOLanding
        eyebrow="Estres laboral y burnout"
        title="Psicologo para estres laboral, sobrecarga y agotamiento"
        description="Trabajamos el impacto del trabajo en tu descanso, estado de animo y relaciones, con estrategias que consideren tanto tus habitos como los limites reales de tu contexto."
        service="Psicoterapia para estres laboral"
        benefits={[
            'Terminas la jornada sin energia y no logras desconectarte.',
            'Sientes irritabilidad, tension, culpa por descansar o temor a equivocarte.',
            'La autoexigencia esta ocupando demasiado espacio en tu vida.',
            'Necesitas recuperar prioridades y una forma mas sostenible de trabajar.',
        ]}
        details={[
            { title: 'El agotamiento tiene señales', text: 'Cambios en el sueño, cinismo, errores por cansancio, baja concentración o distancia afectiva pueden indicar sobrecarga. Conviene mirarlos antes de normalizarlos.' },
            { title: 'No se trata solo de organizarse', text: 'Las herramientas personales ayudan, pero no deben convertir un problema de condiciones laborales en una responsabilidad individual completa.' },
            { title: 'Limites que se puedan sostener', text: 'En terapia se pueden ensayar conversaciones, priorización y respuestas ante la urgencia, adaptadas a las restricciones reales de cada persona.' },
        ]}
        process={[
            'Mapeamos demandas, señales de sobrecarga y patrones de pensamiento que mantienen el desgaste.',
            'Priorizamos cambios concretos en descanso, tareas, comunicación y recuperación.',
            'Revisamos qué funciona y ajustamos el plan sin convertirlo en otra exigencia más.',
        ]}
        faqs={[
            { question: 'El burnout es lo mismo que estar cansado?', answer: 'No siempre. El cansancio puede mejorar con recuperación; el agotamiento sostenido suele afectar motivación, salud y funcionamiento de forma más amplia.' },
            { question: 'Puedo consultar aunque no quiera cambiar de trabajo?', answer: 'Sí. La consulta puede enfocarse en recursos y límites dentro de tu situación actual, sin asumir que la única salida sea renunciar.' },
            { question: 'La terapia es confidencial?', answer: 'La atención se realiza bajo confidencialidad profesional, con las excepciones legales y éticas que se explican al inicio del proceso.' },
        ]}
        relatedResources={[{ label: 'Plan de pausa para sobrecarga', href: '/recursos' }, { label: 'Burnout: señales tempranas', href: '/blog/burnout-en-chile-senales-tempranas' }]}
    />;
}

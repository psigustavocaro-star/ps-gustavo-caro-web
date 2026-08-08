import type { Metadata } from 'next';
import SEOLanding from '@/components/SEOLanding/SEOLanding';

export const metadata: Metadata = {
    title: 'Psicologo para autoestima y autoexigencia en Chile',
    description: 'Psicoterapia online para autoestima baja, perfeccionismo, culpa y autoexigencia. Enfoque TCC para adultos en Chile.',
    alternates: { canonical: '/psicologo-autoestima' },
    keywords: ['psicologo autoestima Chile', 'terapia autoexigencia', 'perfeccionismo psicologo', 'autoestima terapia online'],
};

export default function PsicologoAutoestimaPage() {
    return <SEOLanding
        eyebrow="Autoestima y autoexigencia"
        title="Psicologo para trabajar autoestima, perfeccionismo y critica interna"
        description="Un proceso para identificar la forma en que te hablas, comprender de donde viene esa exigencia y construir una relación más justa contigo sin dejar de lado tus metas."
        service="Psicoterapia para autoestima y perfeccionismo"
        benefits={[
            'Sientes que nada de lo que haces es suficiente.',
            'Te cuesta recibir reconocimiento o poner límites sin culpa.',
            'Postergas tareas por miedo a hacerlo mal o ser evaluado.',
            'Quieres avanzar con menos castigo interno y mayor flexibilidad.',
        ]}
        details={[
            { title: 'La critica interna puede parecer una estrategia', text: 'A veces la dureza se vuelve familiar porque promete evitar errores o rechazo. Explorar su función permite ensayar respuestas menos costosas.' },
            { title: 'Autoestima no es sentirse superior', text: 'Se trata de poder reconocerte con mayor precisión: capacidades, límites, errores y necesidades, sin convertir cada tropiezo en una condena personal.' },
            { title: 'Cambios observables', text: 'El trabajo puede traducirse en decisiones más claras, metas realistas, menos evitación y relaciones donde no tengas que ganarte permanentemente el lugar.' },
        ]}
        process={[
            'Identificamos reglas rígidas, comparaciones y situaciones que activan la critica interna.',
            'Trabajamos pensamientos, conductas de evitación y experiencias que refuercen una visión más equilibrada.',
            'Practicamos límites y metas ajustadas a la vida real, revisando el proceso sin perfeccionismo.',
        ]}
        faqs={[
            { question: 'La autoestima baja siempre viene de la infancia?', answer: 'La historia importa, pero también influyen experiencias actuales, vínculos, contexto laboral, comparaciones y momentos vitales.' },
            { question: 'Se puede trabajar perfeccionismo sin bajar mis estándares?', answer: 'Sí. El objetivo es diferenciar estándares útiles de reglas rígidas que generan bloqueo, culpa o agotamiento.' },
            { question: 'Cuanto dura un proceso?', answer: 'Depende del motivo de consulta y objetivos. En la primera etapa se conversa una propuesta de trabajo y se revisa periódicamente.' },
        ]}
        relatedResources={[{ label: 'Registro breve de ansiedad', href: '/recursos' }, { label: 'Autoexigencia y perfeccionismo', href: '/blog/autoexigencia-y-perfeccionismo' }]}
    />;
}

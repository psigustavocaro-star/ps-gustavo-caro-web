import type { Metadata } from 'next';
import SEOLanding from '@/components/SEOLanding/SEOLanding';

export const metadata: Metadata = {
    title: 'Evaluacion TDAH adulto en Chile | Ps. Gustavo Caro',
    description: 'Evaluacion psicologica para sospecha de TDAH en adultos. Entrevista, instrumentos clinicos, informe y devolucion profesional.',
    alternates: { canonical: '/evaluacion-tdah-adulto' },
    keywords: ['evaluacion tdah adulto chile', 'diagnostico tdah adultos', 'tdah adulto psicologo', 'evaluacion neuropsicologica tdah'],
};

export default function EvaluacionTDAHAdultoPage() {
    return (
        <SEOLanding
            eyebrow="Evaluacion TDAH"
            title="Evaluacion de TDAH en adultos con informe y devolucion profesional"
            description="Proceso clinico para explorar atencion, impulsividad, funciones ejecutivas e impacto cotidiano, integrando antecedentes y resultados de evaluacion."
            service="Evaluacion de TDAH adulto"
            benefits={[
                'Tienes dificultad persistente para organizarte, iniciar tareas o sostener atencion.',
                'Has sentido que funcionas con mucho esfuerzo para cumplir lo cotidiano.',
                'Necesitas claridad clinica para tomar decisiones sobre apoyo o tratamiento.',
                'Buscas un informe profesional con devolucion explicada.',
            ]}
            process={[
                'Comenzamos con entrevista y antecedentes relevantes de tu historia actual y pasada.',
                'Aplicamos instrumentos clinicos para evaluar sintomas, funciones ejecutivas e impacto funcional.',
                'Integramos resultados en un informe y realizamos una devolucion comprensible.',
            ]}
            faqs={[
                {
                    question: 'La evaluacion confirma automaticamente un diagnostico?',
                    answer: 'No automaticamente. El resultado depende de la integracion clinica entre antecedentes, sintomas, funcionamiento actual e instrumentos aplicados.',
                },
                {
                    question: 'Sirve si sospecho TDAH pero nunca fui evaluado?',
                    answer: 'Si. Muchas personas adultas consultan por primera vez al notar dificultades de organizacion, atencion o regulacion que han estado presentes por anos.',
                },
                {
                    question: 'Incluye informe?',
                    answer: 'Si. El proceso contempla informe profesional y una instancia de devolucion para explicar resultados y orientaciones.',
                },
            ]}
        />
    );
}

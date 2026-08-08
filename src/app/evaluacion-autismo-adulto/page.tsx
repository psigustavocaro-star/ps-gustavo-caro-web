import type { Metadata } from 'next';
import SEOLanding from '@/components/SEOLanding/SEOLanding';

export const metadata: Metadata = {
    title: 'Evaluacion autismo adulto | TEA adultos Chile',
    description: 'Evaluacion clinica para sospecha de autismo o TEA en adultos. Proceso profesional con entrevista, instrumentos, informe y devolucion.',
    alternates: { canonical: '/evaluacion-autismo-adulto' },
    keywords: ['evaluacion autismo adulto', 'evaluacion tea adultos chile', 'diagnostico tea adulto', 'autismo adultos psicologo'],
};

export default function EvaluacionAutismoAdultoPage() {
    return (
        <SEOLanding
            eyebrow="Evaluacion TEA"
            title="Evaluacion de autismo en adultos desde una mirada clinica y respetuosa"
            description="Proceso para explorar indicadores de TEA en la adultez, considerando historia de vida, comunicacion social, sensibilidad sensorial y funcionamiento cotidiano."
            service="Evaluacion TEA en adultos"
            benefits={[
                'Has sentido diferencias persistentes en lo social, sensorial o comunicacional.',
                'Buscas comprender tu historia con una mirada clinica y no patologizante.',
                'Necesitas orientaciones profesionales para adaptaciones, autocuidado o tratamiento.',
                'Quieres un proceso claro, con informe y devolucion explicada.',
            ]}
            process={[
                'Revisamos antecedentes personales, familiares, escolares, laborales y sociales.',
                'Aplicamos instrumentos clinicos y observamos patrones relevantes para la hipotesis diagnostica.',
                'Entregamos resultados, orientaciones y recomendaciones en una devolucion profesional.',
            ]}
            faqs={[
                {
                    question: 'Puedo evaluarme en adultez aunque nunca me hayan derivado?',
                    answer: 'Si. Muchas personas consultan en adultez tras reconocer patrones persistentes o recibir comentarios de su entorno.',
                },
                {
                    question: 'La evaluacion considera enmascaramiento?',
                    answer: 'El proceso puede explorar estrategias de compensacion o enmascaramiento cuando aparecen en la historia clinica de la persona.',
                },
                {
                    question: 'Recibire recomendaciones?',
                    answer: 'Si. La devolucion busca traducir los resultados en orientaciones utiles para la vida diaria, el trabajo, estudios o tratamiento.',
                },
            ]}
        />
    );
}

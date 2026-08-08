import type { Metadata } from 'next';
import SEOLanding from '@/components/SEOLanding/SEOLanding';

export const metadata: Metadata = {
    title: 'Psicologo para ansiedad | Terapia online Chile',
    description: 'Apoyo psicologico para ansiedad, preocupacion excesiva, estres y crisis de panico. Psicoterapia online con enfoque TCC.',
    alternates: { canonical: '/psicologo-ansiedad' },
    keywords: ['psicologo ansiedad', 'terapia ansiedad chile', 'ansiedad terapia online', 'psicologo crisis de panico'],
};

export default function PsicologoAnsiedadPage() {
    return (
        <SEOLanding
            eyebrow="Ansiedad y estres"
            title="Psicologo para ansiedad con enfoque cognitivo conductual"
            description="Un espacio para entender que esta sosteniendo la ansiedad, bajar la autoexigencia y practicar herramientas que puedas usar fuera de la sesion."
            service="Psicoterapia para ansiedad"
            benefits={[
                'Sientes preocupacion constante o dificultad para desconectarte.',
                'Notas sintomas fisicos como tension, ahogo, taquicardia o cansancio.',
                'Evitas situaciones por miedo, verguenza o anticipacion negativa.',
                'Quieres aprender estrategias para regularte y recuperar sensacion de control.',
            ]}
            process={[
                'Revisamos como aparece la ansiedad en tu cuerpo, pensamientos y rutinas.',
                'Identificamos gatillantes, ciclos de evitacion y formas de afrontamiento.',
                'Entrenamos herramientas graduales para responder con mas calma y claridad.',
            ]}
            faqs={[
                {
                    question: 'Necesito tener diagnostico para consultar?',
                    answer: 'No. Puedes consultar aunque solo tengas sospechas o estes pasando por un periodo de ansiedad, estres o sobrecarga.',
                },
                {
                    question: 'La terapia para ansiedad incluye tareas?',
                    answer: 'Cuando es pertinente, se proponen ejercicios simples entre sesiones para practicar herramientas en situaciones reales.',
                },
                {
                    question: 'Atiendes crisis de urgencia?',
                    answer: 'No se atienden urgencias por este medio. En una crisis inmediata se debe contactar servicios de emergencia o lineas de apoyo disponibles.',
                },
            ]}
        />
    );
}

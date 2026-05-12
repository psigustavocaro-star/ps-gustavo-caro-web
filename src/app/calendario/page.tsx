import type { Metadata } from 'next';
import CalendarClient from './CalendarClient';

export const metadata: Metadata = {
    title: 'Disponibilidad en Tiempo Real',
    description: 'Consulta los horarios disponibles para tus sesiones de psicoterapia online con Ps. Gustavo Caro.',
};

export default function CalendarPage() {
    return <CalendarClient />;
}

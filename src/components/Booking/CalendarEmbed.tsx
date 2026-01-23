'use client';

import { useState, useEffect } from "react";
import Cal from "@calcom/embed-react";
import { calendarConfig } from '@/lib/config/services';

interface CalendarEmbedProps {
    serviceType?: 'sesion' | 'planMensual' | 'evaluacion';
    name?: string;
    email?: string;
    height?: string;
}

export default function CalendarEmbed({
    serviceType = 'sesion',
    name = '',
    email = '',
    height = '600px'
}: CalendarEmbedProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const calLink = calendarConfig.calcom.eventTypes[serviceType];

    if (!isMounted) {
        return <div style={{ height, background: '#f8fafc', borderRadius: '12px' }} />;
    }

    if (!calLink) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed #ccc', borderRadius: '8px' }}>
                <p>Configuración de calendario pendiente (Event ID faltante).</p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height, overflow: 'hidden', borderRadius: '12px', background: '#f8fafc' }}>
            <Cal
                calLink={calLink}
                style={{ width: "100%", height: "100%", overflow: "scroll" }}
                config={{
                    name,
                    email,
                    theme: "light",
                }}
            />
        </div>
    );
}

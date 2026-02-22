'use client';

import { useState } from 'react';
import styles from './FAQ.module.css';

const faqs = [
    {
        q: "¿Cómo funciona la terapia online?",
        a: "La sesión se realiza a través de una plataforma de videollamada segura. Solo necesitas una conexión a internet estable, un espacio privado y un dispositivo con cámara y micrófono. La efectividad es equivalente a la terapia presencial, con la ventaja de la comodidad y ahorro de tiempo."
    },
    {
        q: "¿Qué pasa si no puedo asistir a mi cita?",
        a: "Se solicita avisar con al menos 24 horas de anticipación para reagendar o cancelar. Entiendo que pueden surgir imprevistos, por lo que siempre buscaremos una alternativa. Si no avisas con anticipación, se cobrará el valor de la sesión ya que ese espacio fue reservado exclusivamente para ti."
    },
    {
        q: "¿Cómo se realizan los pagos?",
        a: "El pago se realiza al momento de agendar a través de Flow (WebPay, tarjetas de crédito/débito). Para pacientes internacionales, también acepto PayPal. Recibirás confirmación inmediata y boleta electrónica."
    },
    {
        q: "¿Cuánto dura cada sesión?",
        a: "Las sesiones tienen una duración de 45 a 50 minutos. En la primera sesión (sesión de evaluación) podemos extendernos un poco más para conocer bien tu caso y definir objetivos de tratamiento."
    },
    {
        q: "¿Cuántas sesiones necesitaré?",
        a: "Depende de cada caso y de los objetivos que definamos juntos. La Terapia Cognitivo Conductual es un enfoque estructurado y orientado a resultados, generalmente con procesos de 8 a 16 sesiones. Siempre trabajamos con metas claras y revisamos el progreso."
    },
    {
        q: "¿Emites boleta de honorarios?",
        a: "Sí, emito boleta electrónica de honorarios por cada sesión. Te llegará automáticamente a tu correo electrónico. Algunas Isapres permiten reembolso parcial por psicoterapia; te recomiendo consultar con tu plan."
    },
    {
        q: "¿Es confidencial la información?",
        a: "Absolutamente. Como psicólogo, estoy sujeto al código de ética profesional que garantiza la confidencialidad total de lo conversado en sesión, salvo en situaciones excepcionales de riesgo vital según lo estipula la ley."
    },
    {
        q: "¿Atiendes emergencias o crisis?",
        a: "Mi práctica no incluye atención de emergencias. Si te encuentras en situación de crisis, por favor contacta al Fono Salud Responde (600 360 7777), la Línea de Prevención del Suicidio (*4141), o acude al servicio de urgencias más cercano."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className={styles.faq}>
            <div className="container">
                <div className={styles.header}>
                    <h2 className="section-title">Preguntas Frecuentes</h2>
                    <p>Resolvemos tus dudas sobre el proceso terapéutico online.</p>
                </div>

                <div className={styles.accordion}>
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div key={index} className={`${styles.item} ${isOpen ? styles.open : ''}`}>
                                <button
                                    className={styles.question}
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                >
                                    {faq.q}
                                    <span className={styles.icon}>{isOpen ? '−' : '+'}</span>
                                </button>
                                <div className={styles.answerWrapper}>
                                    <div className={styles.answer}>
                                        {faq.a}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

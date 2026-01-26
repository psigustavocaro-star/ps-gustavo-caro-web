'use client';

import { useState } from 'react';
import styles from './FAQ.module.css';

const faqs = [
    {
        q: "¿Cómo funciona la terapia online?",
        a: "La sesión se realiza a través de una plataforma de videollamada segura. Solo necesitas una conexión a internet estable, un espacio privado y un dispositivo con cámara y micrófono. La efectividad es equivalente a la terapia presencial, con la ventaja de la comodidad y ahorro de tiempo."
    },
    {
        q: "¿Cuál es la política de cancelación?",
        a: "Se solicita avisar con al menos 24 horas de anticipación para reagendar o cancelar una cita. De lo contrario, se cobrará el valor total de la sesión, ya que ese espacio fue reservado exclusivamente para ti."
    },
    {
        q: "¿Cómo se realizan los pagos?",
        a: "Para pacientes en Chile, el pago se realiza vía transferencia o mediante plataformas como Webpay/Mercado Pago antes de la sesión. Para pacientes internacionales, utilizamos Stripe (pago en USD o equivalente)."
    },
    {
        q: "¿Es confidencial la información?",
        a: "Absolutamente. Como psicólogo, estoy sujeto al código de ética profesional que garantiza la confidencialidad total de lo conversado en sesión, salvo en situaciones excepcionales de riesgo vital según lo estipula la ley."
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

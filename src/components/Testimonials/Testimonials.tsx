import Image from 'next/image';
import styles from './Testimonials.module.css';

const testimonials = [
    {
        name: "María Elena S.",
        text: "Encontrar a Gustavo fue un alivio. Su enfoque clínico con Terapia Cognitivo Conductual me dio herramientas reales y concretas para manejar mi ansiedad en el día a día.",
        image: "/images/testimonio-1.png",
        role: "Paciente Online"
    },
    {
        name: "Ricardo A.",
        text: "Es un profesional excelente. La comodidad de la atención online no le resta nada de calidez ni profundidad al proceso. Lo recomiendo 100%.",
        image: "/images/testimonio-2.png",
        role: "Paciente Online"
    },
    {
        name: "Javiera V.",
        text: "Como madre, valoro mucho su trabajo con adolescentes. Logró conectar con mi hija de una forma que otros profesionales no pudieron.",
        image: "/images/testimonio-3.png",
        role: "Madre de paciente"
    }
];

export default function Testimonials() {
    return (
        <section className={styles.testimonials}>
            <div className="container">
                <div className={styles.header}>
                    <h2 className="section-title">Voces de Confianza</h2>
                    <p className={styles.subtitle}>Experiencias reales de personas que han confiado en este espacio.</p>
                </div>
                <div className={styles.grid}>
                    {testimonials.map((t, i) => (
                        <div key={i} className={styles.card}>
                            <div className={styles.quoteIcon}>“</div>
                            <p className={styles.text}>{t.text}</p>
                            <div className={styles.footer}>
                                <Image src={t.image} alt={t.name} width={60} height={60} className={styles.avatar} />
                                <div className={styles.info}>
                                    <span className={styles.name}>{t.name}</span>
                                    <span className={styles.role}>{t.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

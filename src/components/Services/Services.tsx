import Link from 'next/link';
import styles from './Services.module.css';

const services = [
    {
        name: "Sesión Individual",
        price: "$40.000",
        description: "Psicoterapia online 50-60 min",
    },
    {
        name: "Pack de 4 Sesiones",
        price: "$115.000",
        description: "Prioridad y continuidad mensual",
        tag: "Más conveniente"
    },
    {
        name: "Evaluación Neuropsicológica",
        price: "Consultar",
        description: "WISC, WAIS, TDAH y más",
    }
];

export default function Services() {
    return (
        <section id="servicios" className={styles.services}>
            <div className="container">
                <div className={styles.header}>
                    <span className={styles.label}>Inversión en tu bienestar</span>
                    <h2 className={styles.title}>Tarifas transparentes</h2>
                    <p className={styles.subtitle}>Sin sorpresas. Valores claros para tu tranquilidad.</p>
                </div>

                <div className={styles.priceList}>
                    {services.map((service, index) => (
                        <div key={index} className={styles.priceItem}>
                            <div className={styles.serviceInfo}>
                                <span className={styles.serviceName}>{service.name}</span>
                                {service.tag && <span className={styles.tag}>{service.tag}</span>}
                                <span className={styles.serviceDesc}>{service.description}</span>
                            </div>
                            <div className={styles.priceValue}>{service.price}</div>
                        </div>
                    ))}
                </div>

                <div className={styles.cta}>
                    <Link href="#agendar" className="btn-primary">Agendar mi sesión</Link>
                    <p className={styles.note}>Boleta electrónica automática · Reembolsable en Isapres</p>
                </div>
            </div>
        </section>
    );
}

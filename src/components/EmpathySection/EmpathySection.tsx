import styles from './EmpathySection.module.css';

export default function EmpathySection() {
    return (
        <section className={styles.empathy}>
            <div className="container">
                <div className={styles.content}>
                    <h2 className={styles.title}>Un espacio diseñado para tu bienestar <span>emocional</span>.</h2>
                    <div className={styles.pillars}>
                        <div className={styles.pillar}>
                            <div className={styles.icon}>🌿</div>
                            <h3>Calma</h3>
                            <p>Sesiones sin prisas, en un entorno digital tranquilo y seguro para ti.</p>
                        </div>
                        <div className={styles.pillar}>
                            <div className={styles.icon}>🤝</div>
                            <h3>Vínculo</h3>
                            <p>La relación terapéutica es la base del cambio. Aquí eres escuchado.</p>
                        </div>
                        <div className={styles.pillar}>
                            <div className={styles.icon}>🧠</div>
                            <h3>Evidencia</h3>
                            <p>Enfoque TCC basado en ciencia para resultados concretos y duraderos.</p>
                        </div>
                    </div>
                    <div className={styles.quoteCard}>
                        <blockquote>
                            “Mi objetivo no es solo tratar síntomas, es acompañar a personas únicas en su camino hacia una vida más plena y auténtica.”
                        </blockquote>
                        <cite>— Ps. Gustavo Caro</cite>
                    </div>
                </div>
            </div>
        </section>
    );
}

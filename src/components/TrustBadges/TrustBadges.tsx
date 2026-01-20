import styles from './TrustBadges.module.css';

export default function TrustBadges() {
    return (
        <div className={styles.trustBar}>
            <div className={`container ${styles.badgesContent}`}>
                <div className={styles.badge}>
                    <span className={styles.icon}>🛡️</span>
                    <div className={styles.text}>
                        <strong>Atención Segura</strong>
                        <span>Protocolos de encriptación médica</span>
                    </div>
                </div>
                <div className={styles.badge}>
                    <span className={styles.icon}>🎓</span>
                    <div className={styles.text}>
                        <strong>Colegiado</strong>
                        <span>Registro Nacional de Salud</span>
                    </div>
                </div>
                <div className={styles.badge}>
                    <span className={styles.icon}>⚡</span>
                    <div className={styles.text}>
                        <strong>Boleta Automática</strong>
                        <span>Reembolsable en Isapres/Seguros</span>
                    </div>
                </div>
                <div className={styles.badge}>
                    <span className={styles.icon}>⭐</span>
                    <div className={styles.text}>
                        <strong>Confianza Pacientes</strong>
                        <span>Respaldo y ética profesional</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

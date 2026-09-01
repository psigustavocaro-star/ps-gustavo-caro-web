import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import styles from './terminos.module.css';

export const metadata = {
    title: 'Condiciones de Atención y Cancelación',
    description: 'Condiciones de agendamiento, reprogramación, cancelación y reembolsos de Ps. Gustavo Caro.',
};

export default function TerminosAtencionPage() {
    return (
        <main className={styles.legalPage}>
            <Navbar />
            <div className="container">
                <article className={styles.content}>
                    <h1>Condiciones de Atención y Cancelación</h1>
                    <p className={styles.updated}>Última actualización: enero 2026</p>

                    <section>
                        <h2>1. Alcance de la atención</h2>
                        <p>
                            Estas condiciones regulan el agendamiento y la prestación de servicios de
                            psicoterapia y evaluación psicológica de Ps. Gustavo Caro. Antes de reservar,
                            se informa el servicio, su modalidad, valor y las condiciones aplicables.
                        </p>
                    </section>

                    <section>
                        <h2>2. Agendamiento y puntualidad</h2>
                        <p>
                            La reserva se confirma una vez completado el proceso de agendamiento y, cuando
                            corresponda, verificado el pago. Se solicita conectarse o llegar puntualmente a la
                            hora acordada. Los retrasos reducen el tiempo disponible de la sesión y no extienden
                            automáticamente su duración. Un atraso de <strong>15 minutos o más</strong>, sin aviso,
                            se considera inasistencia.
                        </p>
                    </section>

                    <section>
                        <h2>3. Reprogramación y cancelación</h2>
                        <p className={styles.highlight}>
                            Para reprogramar o cancelar una sesión sin costo, se debe avisar con al menos
                            <strong> 48 horas de anticipación</strong>, por WhatsApp o correo electrónico.
                        </p>
                        <ul>
                            <li>Las reprogramaciones están sujetas a disponibilidad de agenda.</li>
                            <li>
                                Si el aviso se realiza con menos de 48 horas de anticipación, la sesión se
                                considera reservada y no corresponde devolución del monto pagado.
                            </li>
                            <li>
                                La inasistencia sin aviso, incluido un atraso de 15 minutos o más, se considera
                                como sesión realizada para efectos de reserva y pago.
                            </li>
                            <li>
                                Situaciones excepcionales, como una urgencia médica acreditable, pueden ser
                                revisadas de manera individual.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2>4. Cancelación por parte del profesional</h2>
                        <p>
                            Si la sesión debe ser cancelada por el profesional, se ofrecerá una nueva fecha con
                            prioridad o, si no fuera posible reprogramar, la devolución del monto correspondiente
                            al servicio no prestado.
                        </p>
                    </section>

                    <section>
                        <h2>5. Packs y procesos de evaluación</h2>
                        <p>
                            En los packs y evaluaciones, la regla de 48 horas se aplica a cada sesión agendada.
                            Las sesiones ya realizadas no son reembolsables. Cualquier devolución eventual se
                            evaluará únicamente respecto de servicios no prestados, considerando estas condiciones
                            y los derechos que correspondan conforme a la normativa aplicable.
                        </p>
                    </section>

                    <section>
                        <h2>6. Boleta de honorarios</h2>
                        <p>
                            La boleta de honorarios se emite a solicitud del paciente. En packs o procesos con
                            varias sesiones, puede solicitarse una boleta por el total o una boleta por cada sesión,
                            según corresponda.
                        </p>
                    </section>

                    <section>
                        <h2>7. Urgencias y crisis</h2>
                        <p className={styles.warning}>
                            Este servicio no atiende emergencias psiquiátricas ni situaciones de riesgo vital.
                        </p>
                        <p>
                            En una situación de crisis, contacte a Salud Responde al 600 360 7777, a la línea
                            *4141 o acuda al servicio de urgencias más cercano.
                        </p>
                    </section>

                    <section>
                        <h2>8. Contacto</h2>
                        <p>
                            Para solicitar una reprogramación, cancelación o resolver dudas sobre estas condiciones,
                            escriba a <strong>psi.gustavocaro@gmail.com</strong> o al WhatsApp +56 9 2240 9953.
                        </p>
                    </section>

                    <section>
                        <h2>9. Derechos legales</h2>
                        <p>
                            Estas condiciones no limitan los derechos irrenunciables que puedan corresponder a las
                            personas usuarias conforme a la legislación chilena aplicable.
                        </p>
                    </section>
                </article>
            </div>
            <Footer />
        </main>
    );
}

import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import styles from "./legal.module.css";

export const metadata = {
    title: 'Política de Privacidad',
    description: 'Política de privacidad y protección de datos personales de Ps. Gustavo Caro.',
};

export default function PrivacidadPage() {
    return (
        <main className={styles.legalPage}>
            <Navbar />
            <div className="container">
                <article className={styles.content}>
                    <h1>Política de Privacidad</h1>
                    <p className={styles.updated}>Última actualización: Febrero 2026</p>

                    <section>
                        <h2>1. Responsable del Tratamiento</h2>
                        <p>
                            El responsable del tratamiento de sus datos personales es
                            <strong> Gustavo Caro</strong>, Psicólogo Clínico.
                        </p>
                        <ul>
                            <li><strong>Correo de Contacto:</strong> psi.gustavocaro@gmail.com</li>
                            <li><strong>WhatsApp:</strong> +56 9 2240 9953</li>
                        </ul>
                    </section>

                    <section>
                        <h2>2. Datos que Recopilamos</h2>
                        <p>Podemos recopilar los siguientes tipos de información:</p>
                        <h3>2.1 Datos de Identificación</h3>
                        <ul>
                            <li>Nombre completo</li>
                            <li>RUT (para emisión de boletas)</li>
                            <li>Correo electrónico</li>
                            <li>Número de teléfono</li>
                            <li>Dirección (comuna)</li>
                        </ul>
                        <h3>2.2 Datos Clínicos (Sensibles)</h3>
                        <ul>
                            <li>Motivo de consulta</li>
                            <li>Información de anamnesis proporcionada voluntariamente</li>
                            <li>Historial de sesiones</li>
                        </ul>
                        <p className={styles.highlight}>
                            Los datos clínicos son tratados con el más alto nivel de confidencialidad,
                            conforme al secreto profesional establecido en el Código de Ética del
                            Colegio de Psicólogos de Chile.
                        </p>
                    </section>

                    <section>
                        <h2>3. Finalidad del Tratamiento</h2>
                        <p>Sus datos personales son utilizados para:</p>
                        <ul>
                            <li>Gestionar el agendamiento y confirmación de citas.</li>
                            <li>Emitir boletas de honorarios electrónicas.</li>
                            <li>Enviar recordatorios de sesión por correo o WhatsApp.</li>
                            <li>Proporcionar atención psicológica profesional.</li>
                            <li>Enviar información relevante sobre salud mental (solo si ha dado consentimiento).</li>
                        </ul>
                    </section>

                    <section>
                        <h2>4. Base Legal del Tratamiento</h2>
                        <p>El tratamiento de sus datos se fundamenta en:</p>
                        <ul>
                            <li><strong>Ejecución de un contrato:</strong> La prestación del servicio de psicoterapia.</li>
                            <li><strong>Consentimiento:</strong> Para el envío de comunicaciones de marketing.</li>
                            <li><strong>Obligaciones legales:</strong> Emisión de documentos tributarios.</li>
                            <li><strong>Intereses vitales:</strong> En situaciones de riesgo para la vida.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>5. Conservación de Datos</h2>
                        <p>
                            Los datos clínicos se conservan por un mínimo de 5 años desde la última
                            atención, conforme a las recomendaciones del Colegio de Psicólogos y
                            la normativa de salud vigente.
                        </p>
                        <p>
                            Los datos de facturación se conservan por 6 años según la normativa tributaria chilena.
                        </p>
                    </section>

                    <section>
                        <h2>6. Derechos del Titular</h2>
                        <p>Usted tiene derecho a:</p>
                        <ul>
                            <li><strong>Acceso:</strong> Conocer qué datos tenemos sobre usted.</li>
                            <li><strong>Rectificación:</strong> Corregir datos inexactos.</li>
                            <li><strong>Cancelación:</strong> Solicitar la eliminación de sus datos (con las limitaciones legales).</li>
                            <li><strong>Oposición:</strong> Negarse al tratamiento para fines de marketing.</li>
                        </ul>
                        <p>
                            Para ejercer estos derechos, escriba a
                            <strong> psi.gustavocaro@gmail.com</strong> indicando su solicitud.
                        </p>
                    </section>

                    <section>
                        <h2>7. Seguridad de los Datos</h2>
                        <p>
                            Implementamos medidas técnicas y organizativas para proteger sus datos, incluyendo:
                        </p>
                        <ul>
                            <li>Almacenamiento cifrado de información sensible.</li>
                            <li>Acceso restringido exclusivamente al profesional tratante.</li>
                            <li>Uso de plataformas de pago certificadas (Flow).</li>
                            <li>Comunicaciones encriptadas para sesiones online.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>8. Transferencia Internacional</h2>
                        <p>
                            Algunos servicios utilizados (como correo electrónico o almacenamiento en la nube)
                            pueden implicar transferencia de datos a servidores fuera de Chile.
                            En estos casos, nos aseguramos de que los proveedores cumplan con
                            estándares de protección equivalentes.
                        </p>
                    </section>

                    <section>
                        <h2>9. Modificaciones</h2>
                        <p>
                            Esta política puede ser actualizada periódicamente.
                            Le notificaremos cambios significativos a través del sitio web o por correo electrónico.
                        </p>
                    </section>
                </article>
            </div>
            <Footer />
        </main>
    );
}

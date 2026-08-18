import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import styles from "./legal.module.css";
import Link from "next/link";

export const metadata = {
    title: 'Política de Privacidad',
    description: 'Política de privacidad y protección de datos personales de Ps. Gustavo Caro. Cumplimiento Ley 19.628 y Ley 21.719.',
};

export default function PrivacidadPage() {
    return (
        <main className={styles.legalPage}>
            <Navbar />
            <div className="container">
                <article className={styles.content}>
                    <h1>Política de Privacidad y Protección de Datos</h1>
                    <p className={styles.updated}>Última actualización: agosto 2026</p>

                    <section>
                        <h2>1. Responsable del Tratamiento</h2>
                        <p>
                            El responsable del tratamiento de sus datos personales es
                            <strong> Gustavo Caro</strong>, Psicólogo Clínico, en su calidad de titular
                            del sitio <strong>psgustavocaro.cl</strong>.
                        </p>
                        <ul>
                            <li><strong>Correo de contacto:</strong> psi.gustavocaro@gmail.com</li>
                            <li><strong>WhatsApp:</strong> +56 9 2240 9953</li>
                        </ul>
                    </section>

                    <section>
                        <h2>2. Marco legal aplicable</h2>
                        <p>
                            Esta política se rige por la normativa chilena vigente en materia de protección de datos personales:
                        </p>
                        <ul>
                            <li><strong>Ley N° 19.628</strong> sobre Protección de la Vida Privada.</li>
                            <li>
                                <strong>Ley N° 21.719</strong> sobre Protección de Datos Personales
                                (publicada en 2024, con entrada en plena vigencia en diciembre de 2026).
                                Este sitio se ajusta anticipadamente a sus estándares.
                            </li>
                            <li><strong>Código de Ética</strong> del Colegio de Psicólogos de Chile, en particular el deber de secreto profesional.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>3. Datos que recopilamos</h2>
                        <h3>3.1 Datos de identificación</h3>
                        <ul>
                            <li>Nombre completo (nombres y apellidos).</li>
                            <li>RUT (para emisión de boleta electrónica).</li>
                            <li>Correo electrónico.</li>
                            <li>Número de teléfono.</li>
                            <li>Dirección, comuna y región (para boleta electrónica).</li>
                        </ul>
                        <h3>3.2 Datos del servicio</h3>
                        <ul>
                            <li>Motivo de consulta o resumen del requerimiento.</li>
                            <li>Historial de sesiones agendadas y estado de pago.</li>
                            <li>Fechas y horarios de sesiones.</li>
                        </ul>
                        <h3>3.3 Datos que NO recopilamos</h3>
                        <ul>
                            <li>Este sitio <strong>no almacena</strong> anamnesis clínica detallada, medicamentos, diagnósticos previos ni historial clínico en línea.</li>
                            <li>Estos datos, cuando existen, permanecen únicamente en fichas físicas o digitales privadas fuera del sitio web, bajo custodia directa del profesional.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>4. Finalidades del tratamiento</h2>
                        <ul>
                            <li>Gestionar el agendamiento, confirmación y modificación de citas.</li>
                            <li>Emitir boletas de honorarios electrónicas ante el SII.</li>
                            <li>Procesar pagos a través de pasarelas certificadas.</li>
                            <li>Enviar recordatorios y comunicaciones relacionadas con las sesiones.</li>
                            <li>Enviar, solo si usted ha dado consentimiento expreso, comunicaciones informativas sobre salud mental (newsletter).</li>
                        </ul>
                    </section>

                    <section>
                        <h2>5. Base legal del tratamiento</h2>
                        <ul>
                            <li><strong>Consentimiento expreso:</strong> Otorgado al aceptar esta política durante el proceso de agendamiento.</li>
                            <li><strong>Ejecución contractual:</strong> Prestación del servicio profesional de psicoterapia.</li>
                            <li><strong>Obligación legal:</strong> Emisión de documentos tributarios y conservación por plazos legales.</li>
                            <li><strong>Interés vital:</strong> Situaciones excepcionales de riesgo para la vida o integridad del paciente o terceros.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>6. Encargados de tratamiento (terceros)</h2>
                        <p>
                            Para operar el sitio y prestar el servicio utilizamos proveedores tecnológicos
                            que actúan como encargados del tratamiento bajo nuestras instrucciones:
                        </p>
                        <ul>
                            <li><strong>Vercel Inc.</strong> (Estados Unidos): hosting del sitio web.</li>
                            <li><strong>Supabase Inc.</strong> (base de datos alojada en AWS US-East, Estados Unidos): almacenamiento de datos de agendamiento y contacto.</li>
                            <li><strong>Resend Inc.</strong> (Estados Unidos): envío de correos transaccionales y newsletter.</li>
                            <li><strong>Cal.com Inc.</strong> (Estados Unidos): sincronización de disponibilidad y agenda.</li>
                            <li><strong>Flow S.A.</strong> (Chile): pasarela de pagos nacionales.</li>
                            <li><strong>PayPal Inc.</strong> (Estados Unidos): pasarela de pagos internacionales.</li>
                            <li><strong>SimpleAPI</strong> (Chile) y <strong>Servicio de Impuestos Internos</strong>: emisión de boletas electrónicas.</li>
                        </ul>
                        <p>
                            Estos proveedores están sujetos a acuerdos de tratamiento de datos y cumplen
                            estándares internacionales de seguridad. La transferencia internacional de datos
                            se realiza al amparo de las causales legítimas contempladas en la Ley 21.719.
                        </p>
                    </section>

                    <section>
                        <h2>7. Conservación de los datos</h2>
                        <ul>
                            <li><strong>Datos de agendamiento y facturación:</strong> 6 años desde la última transacción, según normativa tributaria.</li>
                            <li><strong>Datos de contacto para newsletter:</strong> hasta que solicite darse de baja.</li>
                            <li><strong>Datos clínicos (fichas físicas o digitales fuera del sitio):</strong> mínimo 5 años desde la última atención, conforme al Código de Ética del Colegio de Psicólogos.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>8. Derechos del titular (Derechos ARCO+)</h2>
                        <p>Conforme a la Ley 19.628 y a la nueva Ley 21.719, usted tiene derecho a:</p>
                        <ul>
                            <li><strong>Acceso:</strong> conocer qué datos suyos tratamos y con qué finalidad.</li>
                            <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
                            <li><strong>Cancelación (supresión):</strong> solicitar la eliminación de sus datos, con las limitaciones legales aplicables.</li>
                            <li><strong>Oposición:</strong> oponerse al tratamiento para determinadas finalidades (por ejemplo, marketing).</li>
                            <li><strong>Portabilidad:</strong> obtener sus datos en un formato estructurado (aplicable desde la vigencia plena de la Ley 21.719).</li>
                            <li><strong>Bloqueo:</strong> solicitar la suspensión temporal del tratamiento mientras se resuelve una controversia.</li>
                        </ul>
                        <p>
                            Puede ejercer estos derechos a través del formulario disponible en
                            {' '}<Link href="/derechos-arco">esta página</Link> o escribiendo a
                            {' '}<strong>psi.gustavocaro@gmail.com</strong>, con asunto
                            &quot;Derechos ARCO&quot;. Responderemos su solicitud dentro de un plazo
                            máximo de 15 días hábiles.
                        </p>
                    </section>

                    <section>
                        <h2>9. Medidas de seguridad</h2>
                        <ul>
                            <li>Conexiones cifradas TLS/HTTPS en todo el sitio.</li>
                            <li>Base de datos con acceso restringido mediante credenciales rotativas y Row Level Security.</li>
                            <li>Cabeceras de seguridad HTTP (HSTS, CSP básica, X-Frame-Options).</li>
                            <li>Panel administrativo protegido por autenticación con sesión firmada y bloqueo por múltiples intentos fallidos.</li>
                            <li>Registro (auditoría) de operaciones sensibles sin exposición de datos personales innecesarios.</li>
                            <li>Pasarelas de pago con firma HMAC y verificación de webhook.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>10. Cookies</h2>
                        <p>
                            El sitio utiliza cookies estrictamente necesarias para su funcionamiento
                            (sesión, preferencias). No usamos cookies publicitarias ni de perfilamiento
                            de terceros. Para el detalle completo, consulte nuestra
                            {' '}<Link href="/cookies">Política de Cookies</Link>.
                        </p>
                    </section>

                    <section>
                        <h2>11. Menores de edad</h2>
                        <p>
                            La atención a menores de 18 años requiere el consentimiento informado
                            y firmado del padre, madre o representante legal. En el caso de
                            adolescentes entre 14 y 17 años, se procura además su asentimiento
                            informado, conforme a lineamientos éticos vigentes.
                        </p>
                    </section>

                    <section>
                        <h2>12. Incidentes de seguridad</h2>
                        <p>
                            En caso de detectarse una vulneración de datos personales que pueda
                            afectar sus derechos, se le notificará por correo electrónico dentro
                            de los plazos exigidos por la ley y se comunicará el hecho a la
                            Agencia de Protección de Datos correspondiente.
                        </p>
                    </section>

                    <section>
                        <h2>13. Modificaciones a esta política</h2>
                        <p>
                            Esta política puede actualizarse para reflejar cambios legales o
                            técnicos. La versión vigente siempre estará disponible en esta URL.
                            Los cambios sustanciales se notificarán con al menos 15 días de
                            anticipación por correo electrónico a las personas suscritas.
                        </p>
                    </section>
                </article>
            </div>
            <Footer />
        </main>
    );
}

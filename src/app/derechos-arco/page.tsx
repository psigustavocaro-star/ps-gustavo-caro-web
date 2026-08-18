import type { Metadata } from 'next';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import ArcoForm from './ArcoForm';
import styles from '../privacidad/legal.module.css';

export const metadata: Metadata = {
    title: 'Ejercicio de derechos ARCO',
    description: 'Solicita acceso, rectificación, cancelación u oposición al tratamiento de tus datos personales conforme a la Ley 19.628 y Ley 21.719.',
};

export default function DerechosArcoPage() {
    return (
        <main className={styles.legalPage}>
            <Navbar />
            <div className="container">
                <article className={styles.content}>
                    <h1>Ejercicio de derechos sobre tus datos personales</h1>
                    <p className={styles.updated}>
                        Formulario para ejercer los derechos ARCO+ establecidos en la Ley 19.628 y en la Ley 21.719 de Protección de Datos Personales.
                    </p>

                    <section>
                        <h2>¿Qué puedes solicitar?</h2>
                        <ul>
                            <li><strong>Acceso:</strong> recibir una copia de los datos que tenemos sobre ti.</li>
                            <li><strong>Rectificación:</strong> corregir un dato inexacto o incompleto.</li>
                            <li><strong>Cancelación:</strong> eliminar tus datos (con las limitaciones legales aplicables a datos tributarios y clínicos).</li>
                            <li><strong>Oposición:</strong> darte de baja del newsletter u oponerte a otras finalidades específicas.</li>
                            <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado (JSON o CSV).</li>
                        </ul>
                    </section>

                    <section>
                        <h2>¿Cómo funciona?</h2>
                        <ol>
                            <li>Completa el formulario indicando el tipo de solicitud y tu correo electrónico registrado.</li>
                            <li>Recibiremos tu solicitud por correo. Verificaremos tu identidad respondiéndote al mismo correo.</li>
                            <li>Resolveremos tu solicitud dentro de un plazo máximo de <strong>15 días hábiles</strong>.</li>
                            <li>Si tu solicitud implica eliminar datos requeridos por ley (facturación, tributarios), te lo comunicaremos indicando el plazo hasta el cual estamos obligados a conservarlos.</li>
                        </ol>
                    </section>

                    <ArcoForm />

                    <section>
                        <h2>Alternativa</h2>
                        <p>
                            También puedes ejercer tus derechos escribiéndonos directamente a{' '}
                            <strong>psi.gustavocaro@gmail.com</strong> con asunto &quot;Derechos ARCO&quot;.
                        </p>
                    </section>
                </article>
            </div>
            <Footer />
        </main>
    );
}

import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Booking from "@/components/Booking/Booking";

export const metadata = {
    title: 'Agendar Hora - Ps. Gustavo Caro',
    description: 'Reserva tu sesión de psicoterapia cognitiva conductual o evaluación psicológica.'
};

export default function AgendarPage() {
    return (
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)' }}>
            <Navbar />
            <div style={{ flex: 1, paddingTop: '100px', paddingBottom: '60px' }}>
                <Booking />
            </div>
            <Footer />
        </main>
    );
}

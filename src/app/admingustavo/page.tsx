import AdminDashboard from "@/components/Admin/AdminDashboard";

export const metadata = {
    title: "Administración | Psicólogo Gustavo Caro",
    description: "Panel de administración de pacientes.",
    robots: { index: false, follow: false, nocache: true },
};

export default function AdminPage() {
    return <AdminDashboard />;
}

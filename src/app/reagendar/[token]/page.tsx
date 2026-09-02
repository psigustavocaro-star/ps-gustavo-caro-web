import RescheduleClient from './reschedule-client';

export const metadata = {
    title: 'Reprogramar sesión | Ps. Gustavo Caro',
    robots: { index: false, follow: false },
};

export default async function ReschedulePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    return <RescheduleClient token={token} />;
}

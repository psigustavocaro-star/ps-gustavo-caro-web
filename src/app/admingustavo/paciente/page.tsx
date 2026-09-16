import AdminPatientPortalPreview from './portal-preview-client';

export const dynamic = 'force-dynamic';

export default async function AdminPatientPortalPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
    const { email } = await searchParams;
    return <AdminPatientPortalPreview email={email || ''} />;
}

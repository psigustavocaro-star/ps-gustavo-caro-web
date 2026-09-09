'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from '@/components/Admin/AdminDashboard.module.css';

export default function Requests() {
  const [data, setData] = useState<any>();
  const [message, setMessage] = useState('');
  const load = () => fetch('/api/admin/patient-requests', { credentials: 'include' }).then(response => response.ok ? response.json() : Promise.reject()).then(setData).catch(() => setData({ requests: [], refunds: [], error: true }));
  useEffect(() => { void load(); }, []);
  const pending = useMemo(() => data?.requests?.filter((request: any) => request.status === 'PENDING') || [], [data]);
  const awaitingRefund = useMemo(() => data?.refunds?.filter((refund: any) => refund.status === 'AWAITING_REFUND') || [], [data]);
  const act = async (action: string, id: string, status?: string) => {
    const response = await fetch('/api/admin/patient-requests', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, id, status }) });
    setMessage(response.ok ? 'Cambios guardados correctamente.' : 'No fue posible guardar el cambio.');
    if (response.ok) void load();
  };

  if (!data) return <div className={styles.requestsLoading}>Cargando solicitudes…</div>;
  if (data.error) return <div className={styles.requestsLoading}>No fue posible cargar las solicitudes.</div>;

  return <section className={styles.requestsPanel}>
    <div className={styles.requestOverview}>
      <div><span>GESTIÓN DE PACIENTES</span><h2>Solicitudes y devoluciones</h2><p>Revisa las solicitudes antes de efectuar cualquier cambio en la agenda.</p></div>
      <div className={styles.requestKpis}><div><strong>{pending.length}</strong><small>pendientes</small></div><div><strong>{awaitingRefund.length}</strong><small>reembolsos</small></div></div>
    </div>
    {message && <p className={styles.requestFeedback}>{message}</p>}
    <div className={styles.requestSectionHeader}><div><span>SOLICITUDES</span><h3>Por revisar</h3></div><small>{pending.length} pendientes de tu decisión</small></div>
    <div className={styles.requestCards}>{pending.length ? pending.map((request: any) => <article className={styles.requestCard} key={request.id}>
      <div className={styles.requestCardTop}><div><span className={request.type === 'CANCEL' ? styles.requestCancelTag : styles.requestChangeTag}>{request.type === 'CANCEL' ? 'Anulación' : 'Cambio de fecha'}</span><h3>{request.booking.name || 'Paciente sin nombre'}</h3><p>{request.booking.email} · {new Date(request.appointmentDate).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })}</p></div><span className={styles.pendingStatus}>Pendiente</span></div>
      {request.message && <p className={styles.requestMessage}>“{request.message}”</p>}
      <div className={styles.requestActions}><button className={styles.rejectRequest} onClick={() => act('review', request.id, 'REJECTED')}>Rechazar</button><button className={styles.approveRequest} onClick={() => act('review', request.id, 'APPROVED')}>Aprobar solicitud</button></div>
    </article>) : <div className={styles.requestsEmpty}>No hay solicitudes pendientes por ahora.</div>}</div>
    <div className={styles.requestSectionHeader}><div><span>DEVOLUCIONES</span><h3>En espera de reembolso</h3></div><small>Datos bancarios cifrados</small></div>
    <div className={styles.requestCards}>{awaitingRefund.length ? awaitingRefund.map((refund: any) => <article className={`${styles.requestCard} ${styles.refundCard}`} key={refund.id}>
      <div className={styles.requestCardTop}><div><span className={styles.refundTag}>Reembolso</span><h3>{refund.booking.name || refund.booking.email}</h3><p>{refund.booking.email}</p></div><strong className={styles.refundAmount}>${refund.refundAmount.toLocaleString('es-CL')}</strong></div>
      <div className={styles.refundDetails}><span>Pago recibido <b>${refund.grossAmount.toLocaleString('es-CL')}</b></span><span>Comisión Flow <b>−${refund.flowCommission.toLocaleString('es-CL')}</b></span><span>Devolver <b>${refund.refundAmount.toLocaleString('es-CL')}</b></span></div>
      <div className={styles.bankData}><b>Datos para transferencia</b><p>{refund.bankData.holderName} · {refund.bankData.rut}<br />{refund.bankData.bank} · {refund.bankData.accountType} · {refund.bankData.accountNumber}<br />{refund.bankData.email}</p></div>
      <div className={styles.requestActions}><button className={styles.approveRequest} onClick={() => act('refund-completed', refund.id)}>Marcar devolución realizada</button></div>
    </article>) : <div className={styles.requestsEmpty}>No hay devoluciones pendientes.</div>}</div>
  </section>;
}

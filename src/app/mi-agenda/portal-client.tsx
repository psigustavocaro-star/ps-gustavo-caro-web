'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import styles from './portal.module.css';

const serviceNames: Record<string, string> = { sesion: 'Psicoterapia individual', packSesiones: 'Pack de sesiones', primeraConsulta: 'Primera consulta', evalTDAH: 'Evaluación TDAH', evalAutismo: 'Evaluación TEA' };
const displayDate = (value: string) => new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
const shortDate = (value: string) => new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short' }).format(new Date(value));

type Modal = { booking: any; index: number; type: 'CHANGE' | 'CANCEL' };

export default function PatientPortal() {
  const [data, setData] = useState<any>();
  const [modal, setModal] = useState<Modal | null>(null);
  const [notice, setNotice] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const load = () => fetch('/api/paciente/me').then(response => response.ok ? response.json() : Promise.reject()).then(setData).catch(() => { window.location.href = '/mi-cuenta'; });
  useEffect(() => { void load(); }, []);
  if (!data) return <main className={styles.loading}>Preparando tu espacio personal…</main>;

  const sessions = data.bookings.flatMap((booking: any) => {
    const dates = booking.appointmentDates?.length ? booking.appointmentDates : booking.appointmentDate ? [booking.appointmentDate] : [];
    return dates.map((date: string, index: number) => ({ booking, date, index, total: dates.length }));
  }).sort((a: any, b: any) => Date.parse(a.date) - Date.parse(b.date));
  const upcoming = sessions.filter((session: any) => Date.parse(session.date) > Date.now())[0];

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!modal) return;
    const form = new FormData(event.currentTarget);
    const bank = Object.fromEntries(['holderName', 'rut', 'email', 'bank', 'accountType', 'accountNumber'].map(key => [key, String(form.get(key) || '')]));
    const response = await fetch('/api/paciente/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: modal.booking.id, appointmentIndex: modal.index, type: modal.type, message: form.get('message'), bank }) });
    const result = await response.json();
    setNotice(response.ok ? 'Recibí tu solicitud. La revisaré personalmente y te responderé apenas tenga una actualización.' : result.error);
    if (response.ok) { setModal(null); void load(); }
  }

  return <main className={styles.patientPortal} data-patient-portal>
    <div className={styles.ambientOne} /><div className={styles.ambientTwo} />
    <Navbar patientAuthenticated onPatientLogout={async () => { await fetch('/api/paciente/logout', { method: 'POST' }); window.location.href = '/mi-cuenta'; }} />

    <section className={styles.hero}>
      <div className={styles.heroCopy}><p className={styles.eyebrow}>TU ESPACIO PERSONAL</p><h1>Hola, qué bueno<br />verte por aquí.</h1><p className={styles.intro}>Aquí puedes revisar tus sesiones y gestionar cualquier solicitud con tiempo y tranquilidad.</p><div className={styles.patientLine}><span className={styles.avatar}>{data.email.slice(0, 1).toUpperCase()}</span><span><b>{data.email}</b><small>Portal del paciente</small></span></div><div className={styles.heroActions}><button onClick={() => setProfileOpen(true)}>Editar mis datos</button><button className={styles.subtleButton} onClick={() => setPasswordOpen(true)}>Cambiar contraseña</button></div></div>
      <div className={styles.heroPhoto}><Image src="/images/patient-real.png" alt="Persona en un momento de calma" fill sizes="(max-width: 800px) 100vw, 380px" priority /></div>
    </section>

    {data.mustChangePassword && <PasswordCard done={() => { void load(); }} />}
    {profileOpen && <ProfileModal profile={data.profile} onClose={() => setProfileOpen(false)} onSaved={() => { setProfileOpen(false); setNotice('Tus datos personales fueron actualizados.'); void load(); }} />}
    {passwordOpen && <PasswordModal onClose={() => setPasswordOpen(false)} onSaved={() => { setPasswordOpen(false); setNotice('Tu contraseña fue actualizada.'); }} />}
    {notice && <div className={styles.notice}><span>✓</span>{notice}<button onClick={() => setNotice('')}>×</button></div>}

    <section className={styles.contentGrid}>
      <div className={styles.sessionsColumn}>
        <div className={styles.sectionHeader}><div><p className={styles.eyebrow}>TU AGENDA</p><h2>Próximas sesiones</h2></div><span className={styles.sessionCount}>{sessions.length} {sessions.length === 1 ? 'sesión' : 'sesiones'}</span></div>
        <div className={styles.sessionList}>{sessions.map((session: any, position: number) => <SessionCard key={`${session.booking.id}-${session.index}`} session={session} featured={position === 0} onRequest={setModal} />)}</div>
      </div>
      <aside className={styles.sideColumn}>
        <div className={styles.nextCard}><p className={styles.eyebrow}>PRÓXIMA SESIÓN</p>{upcoming ? <><div className={styles.nextDate}><b>{new Date(upcoming.date).getDate()}</b><span>{new Intl.DateTimeFormat('es-CL', { month: 'short' }).format(new Date(upcoming.date))}</span></div><h3>{serviceNames[upcoming.booking.serviceType] || upcoming.booking.serviceType}</h3><p>{displayDate(upcoming.date)}</p>{upcoming.booking.meetUrl && <a className={styles.meetButton} href={upcoming.booking.meetUrl} target="_blank" rel="noreferrer">Unirme a la sesión <span>↗</span></a>}</> : <p>No tienes sesiones futuras por ahora.</p>}</div>
        <div className={styles.guidance}><span className={styles.guidanceIcon}>✦</span><h3>¿Necesitas un cambio?</h3><p>Revisaré personalmente tu solicitud. Puedes pedir cambios o anulaciones con 48 horas de anticipación.</p></div>
        <div className={styles.requestSummary}><p className={styles.eyebrow}>MIS SOLICITUDES</p>{data.requests.length ? data.requests.slice(0, 3).map((request: any) => <div key={request.id} className={styles.requestRow}><span className={request.status === 'PENDING' ? styles.pendingDot : styles.doneDot} /><div><b>{request.type === 'CANCEL' ? 'Anulación' : 'Cambio de hora'}</b><small>{shortDate(request.appointmentDate)} · {request.status === 'PENDING' ? 'En revisión' : request.status === 'APPROVED' ? 'Aprobada' : 'No aprobada'}</small></div></div>) : <p className={styles.empty}>Aún no tienes solicitudes.</p>}</div>
      </aside>
    </section>

    {modal && <RequestModal modal={modal} onClose={() => setModal(null)} onSubmit={submitRequest} />}
  </main>;
}

function PasswordModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) { const [password, setPassword] = useState(''); const [error, setError] = useState(''); return <div className={styles.backdrop} role="dialog" aria-modal="true"><form onSubmit={async e => { e.preventDefault(); const r = await fetch('/api/paciente/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) }); if (r.ok) onSaved(); else setError('Usa al menos 10 caracteres.'); }} className={styles.modal}><button type="button" className={styles.modalClose} onClick={onClose}>×</button><header className={styles.modalHeader}><p className={styles.eyebrow}>SEGURIDAD</p><h2>Cambiar contraseña</h2></header><div className={styles.modalBody}><label className={styles.field}><span>Nueva contraseña</span><input required minLength={10} type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>{error && <p>{error}</p>}</div><footer className={styles.modalActions}><button className={styles.primaryButton}>Guardar contraseña</button></footer></form></div>; }

function ProfileModal({ profile, onClose, onSaved }: { profile: any; onClose: () => void; onSaved: () => void }) { const [form, setForm] = useState<any>(profile || {}); const [error, setError] = useState(''); const update=(key:string,value:string)=>setForm((p:any)=>({...p,[key]:value})); const labels: Array<[string,string,string]> = [['firstName','Primer nombre','text'],['secondName','Segundo nombre','text'],['firstSurname','Apellido paterno','text'],['secondSurname','Apellido materno','text'],['birthDate','Fecha de nacimiento','date'],['gender','Género','text'],['occupation','Ocupación','text'],['companion','Acompañante','text'],['address','Dirección','text'],['region','Región','text'],['commune','Comuna','text'],['phone','Teléfono','tel'],['educationLevel','Nivel educacional','text'],['emergencyContact','Contacto de emergencia','text']]; return <div className={styles.backdrop} role="dialog" aria-modal="true"><form onSubmit={async e=>{e.preventDefault(); const r=await fetch('/api/paciente/profile',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)}); if(r.ok) onSaved(); else setError('No fue posible guardar los cambios.');}} className={styles.modal}><button type="button" className={styles.modalClose} onClick={onClose}>×</button><header className={styles.modalHeader}><p className={styles.eyebrow}>MI INFORMACIÓN</p><h2>Editar datos personales</h2><p>El correo y RUT se protegen como identificadores de tu cuenta. Para corregirlos, solicita apoyo al profesional.</p></header><div className={styles.modalBody}>{labels.map(([key,label,type])=><label key={key} className={styles.field}><span>{label}</span><input type={type} value={form[key] || ''} onChange={e=>update(key,e.target.value)} /></label>)}<p>Antecedentes clínicos: al enviarlos quedarán pendientes de revisión y no reemplazarán automáticamente tu ficha.</p>{['diagnoses','medications','genogram'].map(key=><label key={key} className={styles.field}><span>{key==='diagnoses'?'Diagnósticos':key==='medications'?'Medicamentos':'Genograma / antecedentes familiares'}</span><textarea onChange={e=>update(key,e.target.value)} /></label>)}{error&&<p>{error}</p>}</div><footer className={styles.modalActions}><button className={styles.primaryButton}>Guardar cambios</button></footer></form></div>; }

function SessionCard({ session, featured, onRequest }: { session: any; featured: boolean; onRequest: (modal: Modal) => void }) {
  const allowed = Date.parse(session.date) - Date.now() >= 172800000;
  return <article className={`${styles.sessionCard} ${featured ? styles.featured : ''}`}><div className={styles.calendarTile}><b>{new Date(session.date).getDate()}</b><span>{new Intl.DateTimeFormat('es-CL', { month: 'short' }).format(new Date(session.date)).replace('.', '')}</span></div><div className={styles.sessionInfo}><div className={styles.sessionTitle}><h3>{serviceNames[session.booking.serviceType] || session.booking.serviceType}</h3>{session.booking.serviceType === 'packSesiones' && <span>Sesión {session.index + 1} de {session.total}</span>}</div><p className={styles.dateLine}>◷ {displayDate(session.date)}</p>{session.booking.meetUrl && <a href={session.booking.meetUrl} target="_blank" rel="noreferrer" className={styles.meetLink}>Unirme por Google Meet <span>↗</span></a>}<div className={styles.cardActions}>{allowed ? <><button onClick={() => onRequest({ booking: session.booking, index: session.index, type: 'CHANGE' })}>Solicitar cambio</button><button onClick={() => onRequest({ booking: session.booking, index: session.index, type: 'CANCEL' })} className={styles.subtleButton}>Solicitar anulación</button></> : <span className={styles.locked}>Esta sesión está dentro de las 48 horas.</span>}</div></div></article>;
}

function PasswordCard({ done }: { done: () => void }) { const [password, setPassword] = useState(''); const [error, setError] = useState(''); return <section className={styles.passwordCard}><div className={styles.lockIcon}>⌁</div><div><p className={styles.eyebrow}>UN ÚLTIMO PASO</p><h2>Protege tu espacio personal</h2><p>Crea una contraseña personal para continuar. Solo te tomará un momento.</p></div><form onSubmit={async event => { event.preventDefault(); const response = await fetch('/api/paciente/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) }); if (response.ok) done(); else setError('La contraseña debe tener al menos 10 caracteres.'); }}><input required minLength={10} type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Nueva contraseña" /><button>Guardar y continuar</button>{error && <small>{error}</small>}</form></section>; }

function RequestModal({ modal, onClose, onSubmit }: { modal: Modal; onClose: () => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  const cancellation = modal.type === 'CANCEL';
  const bankFields = [['holderName', 'Nombre del titular'], ['rut', 'RUT'], ['email', 'Correo para la devolución'], ['bank', 'Banco'], ['accountType', 'Tipo de cuenta'], ['accountNumber', 'Número de cuenta']];
  return <div className={styles.backdrop} role="dialog" aria-modal="true" aria-labelledby="request-title">
    <form onSubmit={onSubmit} className={styles.modal}>
      <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Cerrar">×</button>
      <header className={styles.modalHeader}><p className={styles.eyebrow}>{cancellation ? 'SOLICITUD DE ANULACIÓN' : 'SOLICITUD DE CAMBIO'}</p><h2 id="request-title">{cancellation ? 'Gestionemos tu anulación' : 'Cuéntame qué necesitas'}</h2><p>No haré cambios en tu sesión hasta revisar personalmente tu solicitud.</p>{cancellation && <div className={styles.scrollHint}><span>↓</span> Completa tus datos de transferencia. Desplázate para continuar.</div>}</header>
      <div className={styles.modalBody}>
        <label className={styles.field}><span>Mensaje <em>opcional</em></span><textarea name="message" placeholder={cancellation ? '¿Hay algo que debamos considerar?' : 'Indica qué día u horario te acomodaría mejor.'} /></label>
        {cancellation && <section className={styles.bankFields}><div className={styles.bankHeading}><h3>Datos para tu transferencia</h3><p><span>✓</span> Quedarán cifrados y solo yo podré verlos.</p></div><div className={styles.bankGrid}>{bankFields.map(([name, label]) => <label key={name} className={styles.field}><span>{label}</span><input required name={name} placeholder={label} autoComplete={name === 'email' ? 'email' : 'off'} /></label>)}</div></section>}
      </div>
      <footer className={styles.modalActions}><button className={styles.primaryButton}>Enviar solicitud</button><button type="button" onClick={onClose} className={styles.cancelButton}>Volver</button></footer>
    </form>
  </div>;
}

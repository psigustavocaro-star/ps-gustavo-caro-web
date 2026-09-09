'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './AdminDateTimePicker.module.css';

type Props = {
    value: string;
    onChange: (value: string) => void;
    withTime?: boolean;
    ariaLabel: string;
};

const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const weekdays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const pad = (value: number) => String(value).padStart(2, '0');
const localDate = (value?: string) => {
    if (!value) return new Date();
    const [datePart, timePart = '12:00'] = value.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hours || 0, minutes || 0);
};
const keyFor = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export default function AdminDateTimePicker({ value, onChange, withTime = true, ariaLabel }: Props) {
    const [open, setOpen] = useState(false);
    const [month, setMonth] = useState(() => localDate(value));
    const rootRef = useRef<HTMLDivElement>(null);
    const selected = value ? localDate(value) : null;

    useEffect(() => {
        const close = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    useEffect(() => {
        if (open) setMonth(selected || new Date());
    // The calendar only needs to reset when it opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const calendarDays = useMemo(() => {
        const first = new Date(month.getFullYear(), month.getMonth(), 1);
        const startOffset = (first.getDay() + 6) % 7;
        const start = new Date(month.getFullYear(), month.getMonth(), 1 - startOffset);
        const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
        const calendarLength = Math.ceil((startOffset + daysInMonth) / 7) * 7;
        return Array.from({ length: calendarLength }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
    }, [month]);

    const label = selected
        ? new Intl.DateTimeFormat('es-CL', withTime
            ? { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
            : { day: 'numeric', month: 'long', year: 'numeric' }).format(selected)
        : withTime ? 'Elegir fecha y hora' : 'Elegir fecha';

    const selectDate = (date: Date) => {
        const hours = selected?.getHours() ?? 18;
        const minutes = selected?.getMinutes() ?? 30;
        const dateValue = keyFor(date);
        onChange(withTime ? `${dateValue}T${pad(hours)}:${pad(minutes)}` : dateValue);
        if (!withTime) setOpen(false);
    };

    const updateTime = (time: string) => {
        const dateValue = selected ? keyFor(selected) : keyFor(new Date());
        onChange(`${dateValue}T${time}`);
    };

    return <div ref={rootRef} className={styles.root}>
        <button type="button" className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`} onClick={() => setOpen(current => !current)} aria-label={ariaLabel} aria-expanded={open}>
            <span className={styles.calendarIcon}>▦</span><span>{label}</span><span className={styles.chevron}>⌄</span>
        </button>
        {open && <div className={styles.popover}>
            <div className={styles.calendarHeader}>
                <button type="button" onClick={() => setMonth(current => new Date(current.getFullYear(), current.getMonth() - 1, 1))} aria-label="Mes anterior">‹</button>
                <strong>{months[month.getMonth()]} <span>{month.getFullYear()}</span></strong>
                <button type="button" onClick={() => setMonth(current => new Date(current.getFullYear(), current.getMonth() + 1, 1))} aria-label="Mes siguiente">›</button>
            </div>
            <div className={styles.weekdays}>{weekdays.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
            <div className={styles.dayGrid}>{calendarDays.map(date => {
                const currentMonth = date.getMonth() === month.getMonth();
                const isSelected = selected && keyFor(date) === keyFor(selected);
                const today = keyFor(date) === keyFor(new Date());
                return <button type="button" key={keyFor(date)} onClick={() => selectDate(date)} className={`${styles.day} ${!currentMonth ? styles.outside : ''} ${isSelected ? styles.selected : ''} ${today ? styles.today : ''}`}>{date.getDate()}</button>;
            })}</div>
            {withTime && <div className={styles.timeArea}>
                <span>Hora</span>
                <div className={styles.timeControl}><select aria-label="Hora" value={pad(selected?.getHours() ?? 18)} onChange={event => updateTime(`${event.target.value}:${pad(selected?.getMinutes() ?? 30)}`)}>{Array.from({ length: 24 }, (_, hour) => <option key={hour} value={pad(hour)}>{pad(hour)}</option>)}</select><i>:</i><select aria-label="Minutos" value={pad(selected?.getMinutes() ?? 30)} onChange={event => updateTime(`${pad(selected?.getHours() ?? 18)}:${event.target.value}`)}>{[0, 15, 30, 45].map(minute => <option key={minute} value={pad(minute)}>{pad(minute)}</option>)}</select></div>
            </div>}
            <div className={styles.footer}><button type="button" onClick={() => { onChange(withTime ? `${keyFor(new Date())}T${pad(new Date().getHours())}:${pad(new Date().getMinutes())}` : keyFor(new Date())); setMonth(new Date()); }}>Hoy</button><button type="button" className={styles.done} onClick={() => setOpen(false)}>Listo</button></div>
        </div>}
    </div>;
}

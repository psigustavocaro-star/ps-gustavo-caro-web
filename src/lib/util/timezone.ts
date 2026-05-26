export const CLINIC_TIME_ZONE = 'America/Santiago';

const getTimeZoneParts = (date: Date, timeZone: string) => {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(date);

    return Object.fromEntries(parts.map(part => [part.type, part.value]));
};

const getTimeZoneOffsetMs = (date: Date, timeZone: string) => {
    const parts = getTimeZoneParts(date, timeZone);
    const zonedAsUtc = Date.UTC(
        Number(parts.year),
        Number(parts.month) - 1,
        Number(parts.day),
        Number(parts.hour),
        Number(parts.minute),
        Number(parts.second),
    );

    return zonedAsUtc - date.getTime();
};

export function clinicWallTimeToIso(date: Date, time: string) {
    const [hours, minutes] = time.split(':').map(Number);
    const firstGuessUtc = Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hours,
        minutes,
        0,
        0,
    );

    const firstOffset = getTimeZoneOffsetMs(new Date(firstGuessUtc), CLINIC_TIME_ZONE);
    const secondGuessUtc = firstGuessUtc - firstOffset;
    const secondOffset = getTimeZoneOffsetMs(new Date(secondGuessUtc), CLINIC_TIME_ZONE);

    return new Date(firstGuessUtc - secondOffset).toISOString();
}

export function formatClinicDate(isoDate: string | Date, options: Intl.DateTimeFormatOptions) {
    return new Date(isoDate).toLocaleDateString('es-CL', {
        timeZone: CLINIC_TIME_ZONE,
        ...options,
    });
}

export function formatClinicTime(isoDate: string | Date) {
    return new Date(isoDate).toLocaleTimeString('es-CL', {
        timeZone: CLINIC_TIME_ZONE,
        hour: '2-digit',
        minute: '2-digit',
    });
}

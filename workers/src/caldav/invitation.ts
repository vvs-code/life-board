/**
 * Слот уходит в календарь приглашением: организатор — сервер, участник — владелец со статусом NEEDS-ACTION.
 * Apple Calendar рисует «Принять / Отклонить», ответ читается при синхронизации (FR-23, FR-24).
 * Работоспособность при организаторе-сервере проверяется спайком до разработки (риск в PRD).
 */
export function slotInvitation(p: {uid: string; title: string; start: Date; end: Date; organizer: string; owner: string}) {
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Life Board//RU',
        'METHOD:REQUEST',
        'BEGIN:VEVENT',
        `UID:${p.uid}`,
        `DTSTAMP:${fmt(new Date())}`,
        `DTSTART:${fmt(p.start)}`,
        `DTEND:${fmt(p.end)}`,
        `SUMMARY:${p.title}`,
        `ORGANIZER:mailto:${p.organizer}`,
        `ATTENDEE;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${p.owner}`,
        'STATUS:TENTATIVE',
        'END:VEVENT',
        'END:VCALENDAR',
    ].join('\r\n');
}

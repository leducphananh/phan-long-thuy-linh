import { WeddingEvent } from '../types/wedding';

/**
 * Generate Google Calendar URL
 */
export function getGoogleCalendarUrl(event: WeddingEvent): string {
  const { calendarEvent } = event;
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const text = encodeURIComponent(calendarEvent.title);
  const details = encodeURIComponent(calendarEvent.details);
  const location = encodeURIComponent(calendarEvent.location);
  const dates = `${calendarEvent.startTime}/${calendarEvent.endTime}`;

  return `${baseUrl}&text=${text}&dates=${dates}&details=${details}&location=${location}`;
}

/**
 * Generate and trigger download of .ics file for Apple Calendar, Outlook, Mobile
 */
export function downloadIcsFile(event: WeddingEvent): void {
  const { calendarEvent } = event;
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Invitation//Hai Nam & Khanh Linh//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:wedding-${event.id}-${Date.now()}@wedding.invitation`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${calendarEvent.startTime}`,
    `DTEND:${calendarEvent.endTime}`,
    `SUMMARY:${calendarEvent.title}`,
    `DESCRIPTION:${calendarEvent.details}`,
    `LOCATION:${calendarEvent.location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${event.id}-wedding-invitation.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

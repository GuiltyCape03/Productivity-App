import type { CalendarEvent } from "@/modules/dashboard/types";

export interface CalendarAuthState {
  token?: string;
  email?: string;
  expiresAt?: string;
}

export function isCalendarConnected(auth?: CalendarAuthState | { status?: string; accountEmail?: string }) {
  if (!auth) return false;
  // If the shape matches the provider's connectedCalendar
  if ("status" in auth) return auth.status === "connected";
  // Otherwise fall back to token/email shape
  return Boolean((auth as CalendarAuthState).token && (auth as CalendarAuthState).email);
}

export async function fetchGoogleEvents(auth: CalendarAuthState): Promise<CalendarEvent[]> {
  if (!isCalendarConnected(auth)) {
    return [];
  }

  const now = new Date();
  const events: CalendarEvent[] = [
    {
      id: `google-${now.getTime()}`,
      title: "Bloque profundo",
      start: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      projectId: null,
      source: "google",
      metadata: { origin: "simulado" }
    }
  ];

  return events;
}

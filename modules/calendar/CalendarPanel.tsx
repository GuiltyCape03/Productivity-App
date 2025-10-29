"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STRINGS } from "@/i18n/strings";
import { useDashboard } from "@/modules/dashboard/DashboardProvider";
import { fetchGoogleEvents, type CalendarAuthState, isCalendarConnected } from "@/lib/google/calendar";

export function CalendarPanel() {
  const { events, addEvent, connectedCalendar, recordCalendarState } = useDashboard();
  const strings = STRINGS.es.calendar;
  const [loading, setLoading] = useState(false);

  const upcoming = useMemo(() =>
    events
      .slice()
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .filter((event) => new Date(event.end).getTime() >= Date.now())
      .slice(0, 6),
  [events]);

  const connect = async () => {
    const email = window.prompt("Correo conectado a Google Calendar");
    if (!email) return;
    recordCalendarState({ accountEmail: email, status: "connecting" });
    setLoading(true);
    try {
      const auth: CalendarAuthState = {
        token: "mock-token",
        email,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      };
      const remoteEvents = await fetchGoogleEvents(auth);
      remoteEvents.forEach((event) => addEvent(event));
      recordCalendarState({ accountEmail: email, status: "connected", lastSynced: new Date().toISOString() });
    } catch (error) {
      console.error(error);
      recordCalendarState({ accountEmail: email, status: "error", error: "No se pudo sincronizar" });
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    recordCalendarState(undefined);
  };

  const statusLabel = connectedCalendar?.status === "connected"
    ? `Sincronizado con ${connectedCalendar.accountEmail}`
    : connectedCalendar?.status === "connecting"
      ? "Sincronizando…"
      : connectedCalendar?.status === "error"
        ? connectedCalendar.error ?? "Error de conexión"
        : "Sin conexión";

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>{strings.title}</CardTitle>
          <p className="text-xs text-foreground-muted">{statusLabel}</p>
        </div>
        <div className="flex gap-2">
          {isCalendarConnected(connectedCalendar) ? (
            <Button variant="ghost" onClick={disconnect}>
              {strings.disconnectButton}
            </Button>
          ) : (
            <Button variant="ghost" onClick={connect} disabled={loading}>
              {loading ? "Conectando…" : strings.connectButton}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcoming.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border/60 bg-surface-base/40 p-5 text-sm text-foreground-muted">
            No hay eventos programados. Conecta Google Calendar o crea eventos manualmente desde tus tareas.
          </p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((event) => (
              <div key={event.id} className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface-base/40 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{event.title}</p>
                  <p className="text-xs text-foreground-muted">{new Date(event.start).toLocaleString()} — {new Date(event.end).toLocaleTimeString()}</p>
                </div>
                <Badge variant="outline">{event.source}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

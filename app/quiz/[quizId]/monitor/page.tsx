"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { monitorConfig } from "@/lib/monitor/config";

interface SummaryResponse {
  counts: {
    active: number;
    finished: number;
    warnings: number;
    offline: number;
  };
  meta: {
    title: string;
    joinCode: string;
    startedAt: string | null;
    startedAtDisplay?: string | null;
    joined: number;
  };
}

interface AttemptRow {
  attemptId: string;
  name: string | null;
  image?: string | null;
  tabSwitchCount: number;
  completed: boolean;
  lastSeenAt: string | null;
  lastActivityAt: string | null;
  answered: number;
  total: number;
}

interface EventRow {
  type: string;
  createdAt: string;
  payload: Record<string, unknown> | null;
  name: string | null;
  image?: string | null;
}

const DEFAULT_EVENT_LIMIT = 5;
const EXTENDED_EVENT_LIMIT = 20;

export default function LiveMonitorPage() {
  const params = useParams<{ quizId: string }>();
  const quizId = params?.quizId || "";

  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventLimit, setEventLimit] = useState(DEFAULT_EVENT_LIMIT);

  useEffect(() => {
    if (!quizId) return;

    const safeJson = async (res: Response) => {
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        return text ? { error: text } : null;
      }
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    };

    const load = async () => {
      try {
        const [summaryRes, attemptsRes, eventsRes] = await Promise.all([
          fetch(`/api/monitor/${quizId}/summary`).then(safeJson),
          fetch(`/api/monitor/${quizId}/attempts`).then(safeJson),
          fetch(`/api/monitor/${quizId}/events?limit=${eventLimit}`).then(safeJson),
        ]);

        if (summaryRes && !summaryRes.error) {
          setSummary(summaryRes);
        }
        if (attemptsRes && !attemptsRes.error) {
          setAttempts(attemptsRes.rows ?? []);
        }
        if (eventsRes && !eventsRes.error) {
          setEvents(eventsRes.events ?? []);
        }
      } catch (error) {
        console.error("Failed to load monitor data:", error);
      } finally {
        setLoading(false);
      }
    };

    void load();
    const id = window.setInterval(load, monitorConfig.pollIntervalMs);
    return () => window.clearInterval(id);
  }, [quizId, eventLimit]);

  const formatPHTime = (value?: string | null) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return new Intl.DateTimeFormat("en-PH", {
      timeZone: "Asia/Manila",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const formatPHDateTime = (value?: string | null) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";

    const dateKey = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
    const nowKey = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const isToday = dateKey === nowKey;

    const timePart = new Intl.DateTimeFormat("en-PH", {
      timeZone: "Asia/Manila",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);

    if (isToday) {
      return `Today at ${timePart}`;
    }

    const datePart = new Intl.DateTimeFormat("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(date);

    return `${datePart} at ${timePart}`;
  };

  const onlineCutoff = useMemo(
    () => new Date(Date.now() - monitorConfig.onlineWindowMs),
    [],
  );

  const getStatus = (row: AttemptRow) => {
    if (row.completed) return { label: "Finished", className: "text-blue-400" };
    if (row.tabSwitchCount >= monitorConfig.warningTabSwitches) {
      return { label: "Warning", className: "text-amber-400" };
    }
    const lastSeen = row.lastSeenAt ? new Date(row.lastSeenAt) : null;
    if (!lastSeen || lastSeen <= onlineCutoff) {
      return { label: "Offline", className: "text-red-400" };
    }
    return { label: "Active", className: "text-emerald-400" };
  };

  const renderEvent = (event: EventRow) => {
    const name = event.name ?? "Student";
    const questionNo = typeof event.payload?.questionNo === "number"
      ? ` Question ${event.payload.questionNo}`
      : "";

    switch (event.type) {
      case "answered":
        return `${name} answered${questionNo}`;
      case "auto_fail":
        return `${name} timed out${questionNo}`;
      case "tab_blur":
        return `${name} switched tab`;
      case "tab_focus":
        return `${name} returned to quiz`;
      case "submit":
        return `${name} submitted the quiz`;
      case "disconnect":
        return `${name} disconnected`;
      default:
        return `${name} activity`;
    }
  };

  const getEventDotClass = (type: string) => {
    switch (type) {
      case "answered":
        return "bg-emerald-400";
      case "auto_fail":
        return "bg-amber-400";
      case "tab_blur":
        return "bg-amber-400";
      case "tab_focus":
        return "bg-sky-400";
      case "submit":
        return "bg-blue-400";
      case "disconnect":
        return "bg-red-400";
      default:
        return "bg-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href={`/quiz/${quizId}/view?tab=overview`} className="text-3xl font-bold text-foreground">
            ← Back
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-foreground">Live Quiz Monitor</h1>
          <p className="text-muted-foreground">Monitor student activity during the quiz</p>
        </div>

        <div className="grid gap-4">
          <div className="card p-4">
            <p className="text-sm text-muted-foreground">{summary?.meta?.title ?? "Quiz"}</p>
            <div className="mt-2 text-lg font-semibold text-foreground">
              Quiz Code: <span className="text-primary">{summary?.meta?.joinCode ?? "—"}</span>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              Students Joined: {summary?.meta?.joined ?? 0}
            </div>
            <div className="text-sm text-muted-foreground">
              Quiz Started: {summary?.meta?.startedAtDisplay ?? formatPHDateTime(summary?.meta?.startedAt ?? null)}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card p-4">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-400">
                {summary?.counts?.active ?? 0}
              </p>
            </div>

            <div className="card p-4">
              <p className="text-sm text-muted-foreground">Finished</p>
              <p className="mt-2 text-3xl font-semibold text-blue-400">
                {summary?.counts?.finished ?? 0}
              </p>
            </div>

            <div className="card p-4">
              <p className="text-sm text-muted-foreground">Warnings</p>
              <p className="mt-2 text-3xl font-semibold text-amber-400">
                {summary?.counts?.warnings ?? 0}
              </p>
            </div>

            <div className="card p-4">
              <p className="text-sm text-muted-foreground">Offline</p>
              <p className="mt-2 text-3xl font-semibold text-red-400">
                {summary?.counts?.offline ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 mt-8 lg:grid-cols-[2fr_1fr] items-start">
          <div className="card p-4 min-h-[360px]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-foreground">Student Activity</h2>
              <span className="text-xs text-muted-foreground">Top 5 most recent</span>
            </div>

            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : attempts.length === 0 ? (
              <p className="text-muted-foreground">No student activity yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground">
                    <tr className="border-b border-border/60">
                      <th className="text-left py-2">Student Name</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Progress</th>
                      <th className="text-left py-2">Tab Switch</th>
                      <th className="text-left py-2">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((row) => {
                      const status = getStatus(row);
                      return (
                        <tr key={row.attemptId} className="border-b border-border/40">
                          <td className="py-3 text-foreground">
                            <div className="flex items-center gap-3">
                              {row.image ? (
                                <img
                                  src={row.image}
                                  alt={row.name ?? "Student"}
                                  className="h-8 w-8 rounded-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-muted text-xs flex items-center justify-center text-muted-foreground">
                                  {row.name?.[0] ?? "S"}
                                </div>
                              )}
                              <span>{row.name ?? "Student"}</span>
                            </div>
                          </td>
                          <td className={`py-3 font-semibold ${status.className}`}>
                            {status.label}
                          </td>
                          <td className="py-3 text-foreground">
                            {row.answered} / {row.total}
                          </td>
                          <td className="py-3 text-foreground">{row.tabSwitchCount}</td>
                          <td className="py-3 text-muted-foreground">
                            {formatPHTime(row.lastActivityAt ?? row.lastSeenAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <p className="mt-3 text-xs text-muted-foreground">
              Auto-refreshing every 10 seconds
            </p>
          </div>

          <div className="card p-4 min-h-[360px]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-foreground">Live Activity</h2>
              <button
                type="button"
                onClick={() =>
                  setEventLimit((prev) =>
                    prev === DEFAULT_EVENT_LIMIT ? EXTENDED_EVENT_LIMIT : DEFAULT_EVENT_LIMIT,
                  )
                }
                className="text-xs font-semibold text-primary hover:text-primary/80"
              >
                {eventLimit === DEFAULT_EVENT_LIMIT ? "View last 20" : "Show last 5"}
              </button>
            </div>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : events.length === 0 ? (
              <p className="text-muted-foreground">No recent activity yet.</p>
            ) : (
              <div className="relative border-l-2 border-muted-foreground/40 pl-6 space-y-4">
                {events.map((event, idx) => (
                  <div key={`${event.createdAt}-${idx}`} className="relative border-b border-muted-foreground/40 pb-3">
                    <span
                      className={`absolute -left-[14px] top-1.5 h-2.5 w-2.5 rounded-full ${getEventDotClass(event.type)} ring-2 ring-background`}
                    />
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{formatPHTime(event.createdAt)}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-sm text-foreground">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={event.name ?? "Student"}
                          className="h-7 w-7 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-muted text-[10px] flex items-center justify-center text-muted-foreground">
                          {event.name?.[0] ?? "S"}
                        </div>
                      )}
                      <span>{renderEvent(event)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Showing last {eventLimit} events
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

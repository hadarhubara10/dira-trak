import { STATUS_CONFIG } from "@/lib/constants";
import type { ApartmentNote, StatusLog, TimelineEntry } from "@/lib/types";
import { useMemo } from "react";

interface ActivityTimelineProps {
  statusLogs: StatusLog[];
  notes: ApartmentNote[];
}

export function ActivityTimeline({ statusLogs, notes }: ActivityTimelineProps) {
  const entries = useMemo<TimelineEntry[]>(() => {
    const statusEntries: TimelineEntry[] = statusLogs.map((log) => ({
      type: "status",
      data: log,
    }));
    const noteEntries: TimelineEntry[] = notes.map((note) => ({
      type: "note",
      data: note,
    }));

    return [...statusEntries, ...noteEntries].sort(
      (a, b) =>
        new Date(b.data.created_at).getTime() -
        new Date(a.data.created_at).getTime()
    );
  }, [statusLogs, notes]);

  if (entries.length === 0) {
    return <p className="text-xs text-text-muted">אין פעילות עדיין</p>;
  }

  return (
    <div className="flex flex-col">
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1;

        if (entry.type === "status") {
          return (
            <StatusEntry
              key={`s-${entry.data.id}`}
              log={entry.data}
              isLast={isLast}
            />
          );
        }

        return (
          <NoteEntry
            key={`n-${entry.data.id}`}
            note={entry.data}
            isLast={isLast}
          />
        );
      })}
    </div>
  );
}

function StatusEntry({ log, isLast }: { log: StatusLog; isLast: boolean }) {
  const config = STATUS_CONFIG[log.to_status];

  return (
    <div className="flex gap-3 pb-4" style={{ position: "relative" }}>
      <div
        className="flex w-8 shrink-0 justify-center"
        style={{ zIndex: 1 }}
      >
        <div
          className="mt-1 h-3 w-3 rounded-full border-2 border-white"
          style={{
            backgroundColor: config?.dotColor || "#9ca3af",
            boxShadow: `0 0 0 2px ${config?.dotColor || "#9ca3af"}33`,
          }}
        />
        {!isLast && <TimelineLine />}
      </div>
      <div className="flex-1">
        <div className="text-[13px] font-semibold text-text-primary">
          {config?.label || log.to_status}
        </div>
        <div className="mt-0.5 text-[11px] text-text-muted">
          {formatTimestamp(log.created_at)}
          {log.profiles?.display_name && ` · ${log.profiles.display_name}`}
        </div>
        {log.note && (
          <p className="mt-1 text-xs text-text-secondary">{log.note}</p>
        )}
      </div>
    </div>
  );
}

function NoteEntry({
  note,
  isLast,
}: {
  note: ApartmentNote;
  isLast: boolean;
}) {
  return (
    <div className="flex gap-3 pb-4" style={{ position: "relative" }}>
      <div
        className="flex w-8 shrink-0 justify-center"
        style={{ zIndex: 1 }}
      >
        <div
          className="mt-1.5 h-2.5 w-2.5 rounded-full"
          style={{
            backgroundColor: "#7a7a9a",
            boxShadow: "0 0 0 2px rgba(122, 122, 154, 0.15)",
          }}
        />
        {!isLast && <TimelineLine />}
      </div>
      <div className="flex-1">
        <p className="text-[13px] leading-relaxed text-text-secondary">
          {note.content}
        </p>
        <div className="mt-0.5 text-[11px] text-text-muted">
          {formatTimestamp(note.created_at)}
          {note.profiles?.display_name && ` · ${note.profiles.display_name}`}
        </div>
      </div>
    </div>
  );
}

function TimelineLine() {
  return (
    <div
      className="absolute top-5 w-0.5 bg-border-light"
      style={{ insetInlineStart: "15px", bottom: 0 }}
    />
  );
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

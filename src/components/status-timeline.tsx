import { STATUS_CONFIG } from "@/lib/constants";
import type { StatusLog } from "@/lib/types";

interface StatusTimelineProps {
  logs: StatusLog[];
}

export function StatusTimeline({ logs }: StatusTimelineProps) {
  if (logs.length === 0) {
    return (
      <p className="text-xs text-text-muted">אין היסטוריית סטטוס</p>
    );
  }

  return (
    <div className="flex flex-col">
      {logs.map((log, index) => {
        const config = STATUS_CONFIG[log.to_status];
        const isLast = index === logs.length - 1;

        return (
          <div key={log.id} className="flex gap-3 pb-4" style={{ position: "relative" }}>
            {/* Dot + line */}
            <div className="flex w-8 shrink-0 justify-center" style={{ zIndex: 1 }}>
              <div
                className="mt-1 h-3 w-3 rounded-full border-2 border-white"
                style={{
                  backgroundColor: config?.dotColor || "#9ca3af",
                  boxShadow: `0 0 0 2px ${config?.dotColor || "#9ca3af"}33`,
                }}
              />
              {!isLast && (
                <div
                  className="absolute top-5 w-0.5 bg-border-light"
                  style={{
                    insetInlineStart: "15px",
                    bottom: 0,
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-text-primary">
                {config?.label || log.to_status}
              </div>
              <div className="mt-0.5 text-[11px] text-text-muted">
                {new Date(log.created_at).toLocaleDateString("he-IL", {
                  day: "numeric",
                  month: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {log.profiles?.display_name && ` · ${log.profiles.display_name}`}
              </div>
              {log.note && (
                <p className="mt-1 text-xs text-text-secondary">{log.note}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

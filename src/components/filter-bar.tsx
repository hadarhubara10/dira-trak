"use client";

import { SOURCE_CONFIG, STATUS_CONFIG, STATUS_PIPELINE } from "@/lib/constants";
import type { Apartment, ApartmentSource, ApartmentStatus } from "@/lib/types";
import type { ViewMode } from "@/hooks/use-filters";

interface FilterBarProps {
  viewMode: ViewMode;
  apartments: Apartment[];
  activeStatuses: ApartmentStatus[];
  activeSources: ApartmentSource[];
  onToggleStatus: (status: ApartmentStatus) => void;
  onToggleSource: (source: ApartmentSource) => void;
  onClear: () => void;
}

export function FilterBar({
  viewMode,
  apartments,
  activeStatuses,
  activeSources,
  onToggleStatus,
  onToggleSource,
  onClear,
}: FilterBarProps) {
  const totalCount = apartments.length;
  const hasActiveFilters = activeStatuses.length > 0 || activeSources.length > 0;

  // For list view: show status chips with counts
  if (viewMode === "list") {
    const statusCounts = STATUS_PIPELINE.reduce(
      (acc, s) => {
        acc[s] = apartments.filter((a) => a.status === s).length;
        return acc;
      },
      {} as Record<ApartmentStatus, number>
    );

    return (
      <div className="flex gap-2 overflow-x-auto px-5 pb-3">
        <button
          onClick={onClear}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all ${
            !hasActiveFilters
              ? "border-accent-blue bg-accent-blue text-white"
              : "border-border bg-surface text-text-secondary"
          }`}
        >
          הכל ({totalCount})
        </button>
        {STATUS_PIPELINE.filter((s) => statusCounts[s] > 0).map((status) => {
          const config = STATUS_CONFIG[status];
          const isActive = activeStatuses.includes(status);
          return (
            <button
              key={status}
              onClick={() => onToggleStatus(status)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all ${
                isActive
                  ? `border-current ${config.color}`
                  : "border-border bg-surface text-text-secondary"
              }`}
              style={
                isActive
                  ? { borderColor: config.dotColor, color: config.dotColor }
                  : undefined
              }
            >
              {config.label} ({statusCounts[status]})
            </button>
          );
        })}
      </div>
    );
  }

  // For kanban view: source + neighborhood chips
  const neighborhoods = [
    ...new Set(
      apartments.map((a) => a.neighborhood).filter(Boolean) as string[]
    ),
  ];

  return (
    <div className="flex gap-2 overflow-x-auto px-5 pb-3">
      <button
        onClick={onClear}
        className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all ${
          !hasActiveFilters
            ? "border-accent-blue bg-accent-blue text-white"
            : "border-border bg-surface text-text-secondary"
        }`}
      >
        הכל
      </button>
      {(["YAD2", "FACEBOOK"] as ApartmentSource[]).map((src) => {
        const config = SOURCE_CONFIG[src];
        const isActive = activeSources.includes(src);
        return (
          <button
            key={src}
            onClick={() => onToggleSource(src)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all ${
              isActive
                ? `${config.bgClass} ${config.textClass} border-current`
                : "border-border bg-surface text-text-secondary"
            }`}
          >
            {config.label}
          </button>
        );
      })}
      {neighborhoods.map((n) => (
        <button
          key={n}
          onClick={() => {
            // Neighborhood filtering happens via search
          }}
          className="shrink-0 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] font-medium text-text-secondary"
        >
          {n}
        </button>
      ))}
    </div>
  );
}

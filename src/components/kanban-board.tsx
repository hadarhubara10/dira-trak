"use client";

import { STATUS_CONFIG, STATUS_PIPELINE } from "@/lib/constants";
import type { Apartment } from "@/lib/types";
import { ApartmentCard } from "@/components/apartment-card";

interface KanbanBoardProps {
  apartments: Apartment[];
  onSelect: (id: string) => void;
}

export function KanbanBoard({ apartments, onSelect }: KanbanBoardProps) {
  // Group apartments by status
  const grouped = STATUS_PIPELINE.reduce(
    (acc, status) => {
      acc[status] = apartments.filter((a) => a.status === status);
      return acc;
    },
    {} as Record<string, Apartment[]>
  );

  // Only show columns that have apartments or are "active" statuses
  const activeColumns = STATUS_PIPELINE.filter(
    (status) => (grouped[status]?.length || 0) > 0
  );

  if (apartments.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-sm text-text-muted">
        אין דירות להצגה. לחץ + כדי להוסיף דירה חדשה
      </div>
    );
  }

  return (
    <div
      className="flex flex-1 gap-3 overflow-x-auto overflow-y-hidden px-5 pb-5"
      style={{ scrollSnapType: "x mandatory" }}
    >
      {activeColumns.map((status) => {
        const config = STATUS_CONFIG[status];
        const columnApartments = grouped[status] || [];

        return (
          <div
            key={status}
            className="flex min-w-[300px] max-w-[300px] flex-col gap-2.5"
            style={{ scrollSnapAlign: "start" }}
          >
            {/* Column header */}
            <div className="flex items-center gap-2 py-1">
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: config.dotColor }}
              />
              <span className="text-sm font-semibold text-text-primary">
                {config.label}
              </span>
              <span className="rounded-[10px] bg-border-light px-2 py-0.5 text-xs text-text-muted">
                {columnApartments.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto">
              {columnApartments.map((apt) => (
                <ApartmentCard
                  key={apt.id}
                  apartment={apt}
                  onClick={() => onSelect(apt.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { STATUS_CONFIG, SOURCE_CONFIG } from "@/lib/constants";
import type { Apartment } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

interface ApartmentListProps {
  apartments: Apartment[];
  onSelect: (id: string) => void;
}

export function ApartmentList({ apartments, onSelect }: ApartmentListProps) {
  if (apartments.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-sm text-text-muted">
        אין דירות להצגה
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 pb-5">
      {apartments.map((apt) => {
        const statusConfig = STATUS_CONFIG[apt.status];
        const sourceConfig = SOURCE_CONFIG[apt.source];
        const isRejected = apt.status === "REJECTED";

        return (
          <button
            key={apt.id}
            onClick={() => onSelect(apt.id)}
            className="flex w-full items-center gap-3 border-b border-border-light py-3.5 text-start"
          >
            {/* Status dot */}
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: statusConfig.dotColor }}
            />

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-text-primary">
                {apt.title}
              </div>
              <div className="mt-1 flex items-center gap-2.5 text-xs text-text-secondary">
                {apt.neighborhood && <span>{apt.neighborhood}</span>}
                {apt.neighborhood && apt.rooms != null && <span>·</span>}
                {apt.rooms != null && <span>{apt.rooms} חד׳</span>}
                {apt.rooms != null && <span>·</span>}
                <span
                  className={`rounded px-1.5 py-px text-[9px] font-semibold ${sourceConfig.bgClass} ${sourceConfig.textClass}`}
                >
                  {apt.source === "FACEBOOK" ? "FB" : sourceConfig.label}
                </span>
              </div>
            </div>

            {/* Price */}
            <div
              className={`shrink-0 text-[15px] font-bold ${
                isRejected
                  ? "text-text-muted line-through"
                  : "text-accent-blue"
              }`}
            >
              {apt.price ? formatPrice(apt.price) : ""}
            </div>

            {/* Arrow */}
            <ChevronLeft className="h-4 w-4 text-text-muted" />
          </button>
        );
      })}
    </div>
  );
}

import { SourceBadge } from "@/components/source-badge";
import type { Apartment } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { BedDouble, Ruler, Building2, Calendar } from "lucide-react";

interface ApartmentCardProps {
  apartment: Apartment;
  onClick: () => void;
}

export function ApartmentCard({ apartment, onClick }: ApartmentCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full cursor-pointer rounded-[10px] border border-border-light bg-surface p-3.5 text-start shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-150 hover:translate-y-[-1px] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
    >
      {/* Top row: title + source */}
      <div className="mb-2 flex items-start justify-between">
        <span className="text-sm font-semibold leading-snug text-text-primary">
          {apartment.title}
        </span>
        <SourceBadge source={apartment.source} />
      </div>

      {/* Details row */}
      <div className="mb-2.5 flex gap-3 text-xs text-text-secondary">
        {apartment.rooms != null && (
          <span className="flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5" /> {apartment.rooms}
          </span>
        )}
        {apartment.size != null && (
          <span className="flex items-center gap-1">
            <Ruler className="h-3.5 w-3.5" /> {apartment.size} מ״ר
          </span>
        )}
        {apartment.floor != null && (
          <span className="flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" /> קומה {apartment.floor}
          </span>
        )}
      </div>

      {/* Bottom row: price + neighborhood */}
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-accent-blue">
          {apartment.price ? formatPrice(apartment.price) : ""}
        </span>
        {apartment.neighborhood && (
          <span className="text-xs text-text-muted">
            {apartment.neighborhood}
          </span>
        )}
      </div>

      {/* Viewing date chip */}
      {apartment.viewing_date && (
        <div className="mt-2 inline-flex items-center gap-1 rounded-[6px] bg-purple-50 px-2 py-0.5 text-[11px] text-status-viewing">
          <Calendar className="h-3 w-3" />{" "}
          {new Date(apartment.viewing_date).toLocaleDateString("he-IL", {
            weekday: "long",
            day: "numeric",
            month: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}
    </button>
  );
}

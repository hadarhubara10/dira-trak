import { STATUS_CONFIG } from "@/lib/constants";
import type { ApartmentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ApartmentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        config.bgColor,
        config.color,
        className
      )}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: config.dotColor }}
      />
      {config.label}
    </span>
  );
}

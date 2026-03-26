import { SOURCE_CONFIG } from "@/lib/constants";
import type { ApartmentSource } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SourceBadgeProps {
  source: ApartmentSource;
  className?: string;
}

export function SourceBadge({ source, className }: SourceBadgeProps) {
  const config = SOURCE_CONFIG[source];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-[6px] px-2 py-0.5 text-[10px] font-semibold",
        config.bgClass,
        config.textClass,
        className
      )}
    >
      {config.label}
    </span>
  );
}

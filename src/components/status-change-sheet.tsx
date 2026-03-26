"use client";

import { STATUS_CONFIG, STATUS_PIPELINE } from "@/lib/constants";
import type { ApartmentStatus } from "@/lib/types";
import { useUpdateStatus } from "@/hooks/use-update-status";
import { getEventValue } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
import { Check } from "lucide-react";

interface StatusChangeSheetProps {
  apartmentId: string;
  apartmentTitle: string;
  currentStatus: ApartmentStatus;
  open: boolean;
  onClose: () => void;
}

export function StatusChangeSheet({
  apartmentId,
  apartmentTitle,
  currentStatus,
  open,
  onClose,
}: StatusChangeSheetProps) {
  const [selected, setSelected] = useState<ApartmentStatus>(currentStatus);
  const [note, setNote] = useState("");
  const updateStatus = useUpdateStatus();

  function handleSave() {
    if (selected === currentStatus) {
      onClose();
      return;
    }

    updateStatus.mutate(
      { id: apartmentId, status: selected, note: note || undefined },
      {
        onSuccess: () => {
          setNote("");
          onClose();
        },
      }
    );
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-start text-xl font-bold">
            שנה סטטוס
          </SheetTitle>
          <p className="text-start text-[13px] text-text-secondary">
            {apartmentTitle}
          </p>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-2 px-0 py-4">
          {STATUS_PIPELINE.map((status) => {
            const config = STATUS_CONFIG[status];
            const isCurrent = status === currentStatus;
            const isSelected = status === selected;

            return (
              <button
                key={status}
                onClick={() => setSelected(status)}
                className={`flex items-center gap-2 rounded-[10px] border px-3 py-2.5 text-[13px] font-medium transition-all ${
                  isSelected
                    ? "border-accent-blue bg-accent-light text-accent-blue"
                    : "border-border-light text-text-primary hover:border-accent-blue hover:bg-accent-light"
                }`}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: config.dotColor }}
                />
                {config.label}
                {isCurrent && <Check className="ms-auto h-4 w-4" />}
              </button>
            );
          })}
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
            הערה (אופציונלי)
          </label>
          <Input
            placeholder="למה השתנה הסטטוס?"
            value={note}
            onChange={(e) => setNote(getEventValue(e))}
            className="rounded-[10px] border-border bg-bg-app text-sm"
          />
        </div>

        <div className="flex gap-2.5 border-t border-border-light pt-4 pb-8">
          <Button
            onClick={handleSave}
            disabled={updateStatus.isPending}
            className="flex-[2] rounded-xl bg-accent-blue py-3.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {updateStatus.isPending ? "שומר..." : "שמור"}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl border-border bg-bg-app py-3.5 text-sm font-semibold text-text-primary"
          >
            ביטול
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

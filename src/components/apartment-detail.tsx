"use client";

import { useApartment } from "@/hooks/use-apartment";
import { useDeleteApartment } from "@/hooks/use-delete-apartment";
import { useStatusLogs } from "@/hooks/use-status-logs";
import { formatPrice, formatPhone, getWhatsAppUrl, getCallUrl } from "@/lib/utils";
import { SourceBadge } from "@/components/source-badge";
import { StatusBadge } from "@/components/status-badge";
import { StatusTimeline } from "@/components/status-timeline";
import { StatusChangeSheet } from "@/components/status-change-sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface ApartmentDetailProps {
  apartmentId: string | null;
  open: boolean;
  onClose: () => void;
  onEdit: (id: string) => void;
}

export function ApartmentDetail({
  apartmentId,
  open,
  onClose,
  onEdit,
}: ApartmentDetailProps) {
  const { data: apartment, isLoading } = useApartment(apartmentId);
  const { data: logs } = useStatusLogs(apartmentId);
  const deleteApartment = useDeleteApartment();
  const [statusSheetOpen, setStatusSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  function handleDelete() {
    if (!apartmentId) return;
    deleteApartment.mutate(apartmentId, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        onClose();
      },
    });
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] overflow-y-auto rounded-t-3xl"
        >
          {isLoading || !apartment ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <>
              {/* Header */}
              <SheetHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <SheetTitle className="text-start text-xl font-bold text-text-primary">
                      {apartment.title}
                    </SheetTitle>
                    <div className="mt-1.5 flex items-center gap-2">
                      <StatusBadge status={apartment.status} />
                      <SourceBadge source={apartment.source} />
                    </div>
                  </div>
                  {apartment.source_url && (
                    <a
                      href={apartment.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-sm text-text-secondary"
                    >
                      🔗
                    </a>
                  )}
                </div>
              </SheetHeader>

              {/* Info grid */}
              <div className="border-t border-border-light px-0 py-4">
                <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  פרטי הדירה
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {apartment.price != null && (
                    <InfoItem
                      label="מחיר"
                      value={`${formatPrice(apartment.price)} / חודש`}
                      accent
                    />
                  )}
                  {apartment.rooms != null && (
                    <InfoItem label="חדרים" value={String(apartment.rooms)} />
                  )}
                  {apartment.floor != null && (
                    <InfoItem label="קומה" value={String(apartment.floor)} />
                  )}
                  {apartment.size != null && (
                    <InfoItem
                      label="גודל"
                      value={`${apartment.size} מ״ר`}
                    />
                  )}
                  {apartment.neighborhood && (
                    <InfoItem label="שכונה" value={apartment.neighborhood} />
                  )}
                  {apartment.address && (
                    <InfoItem label="כתובת" value={apartment.address} />
                  )}
                </div>
              </div>

              {/* Contact */}
              {(apartment.contact_name || apartment.contact_phone) && (
                <div className="border-t border-border-light px-0 py-4">
                  <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    איש קשר
                  </h3>
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1">
                      {apartment.contact_name && (
                        <div className="text-sm font-semibold text-text-primary">
                          {apartment.contact_name}
                        </div>
                      )}
                      {apartment.contact_phone && (
                        <div
                          className="text-[13px] text-text-secondary"
                          dir="ltr"
                          style={{ textAlign: "end" }}
                        >
                          {formatPhone(apartment.contact_phone)}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {apartment.contact_phone && (
                        <>
                          <a
                            href={getCallUrl(apartment.contact_phone)}
                            className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-green-100 text-lg text-green-600"
                          >
                            📞
                          </a>
                          <a
                            href={getWhatsAppUrl(apartment.contact_phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-green-100 text-lg text-[#25d366]"
                          >
                            💬
                          </a>
                        </>
                      )}
                      {apartment.source_url && (
                        <a
                          href={apartment.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-accent-light text-lg text-accent-blue"
                        >
                          🔗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Viewing */}
              {apartment.viewing_date && (
                <div className="border-t border-border-light px-0 py-4">
                  <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    ביקור
                  </h3>
                  <div className="inline-flex items-center gap-1 rounded-[6px] bg-purple-50 px-3 py-1.5 text-[13px] text-status-viewing">
                    📅{" "}
                    {new Date(apartment.viewing_date).toLocaleDateString(
                      "he-IL",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {logs && logs.length > 0 && (
                <div className="border-t border-border-light px-0 py-4">
                  <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    היסטוריית סטטוס
                  </h3>
                  <StatusTimeline logs={logs} />
                </div>
              )}

              {/* Notes */}
              {apartment.notes && (
                <div className="border-t border-border-light px-0 py-4">
                  <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    הערות
                  </h3>
                  <p className="text-[13px] leading-relaxed text-text-secondary">
                    {apartment.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2.5 border-t border-border-light pt-4 pb-8">
                <Button
                  onClick={() => setStatusSheetOpen(true)}
                  className="flex-1 rounded-xl bg-accent-blue py-3.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  שנה סטטוס
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onEdit(apartment.id)}
                  className="flex-1 rounded-xl border-border bg-bg-app py-3.5 text-sm font-semibold text-text-primary"
                >
                  עריכה
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="rounded-xl border-border bg-red-50 px-4 py-3.5 text-sm text-destructive"
                >
                  🗑
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Status change sub-sheet */}
      {apartment && (
        <StatusChangeSheet
          apartmentId={apartment.id}
          apartmentTitle={apartment.title}
          currentStatus={apartment.status}
          open={statusSheetOpen}
          onClose={() => setStatusSheetOpen(false)}
        />
      )}

      {/* Delete confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>מחיקת דירה</DialogTitle>
            <DialogDescription>
              האם למחוק את &quot;{apartment?.title}&quot;? פעולה זו לא ניתנת
              לביטול.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              ביטול
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteApartment.isPending}
            >
              {deleteApartment.isPending ? "מוחק..." : "מחק"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InfoItem({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-text-muted">{label}</span>
      <span
        className={`text-sm font-semibold ${
          accent ? "text-accent-blue" : "text-text-primary"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

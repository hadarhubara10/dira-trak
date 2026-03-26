"use client";

import { SOURCE_CONFIG } from "@/lib/constants";
import type { Apartment, ApartmentSource, CreateApartmentInput } from "@/lib/types";
import { detectSource, getEventValue } from "@/lib/utils";
import { useCreateApartment } from "@/hooks/use-create-apartment";
import { useUpdateApartment } from "@/hooks/use-update-apartment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
import { Sparkles, Check, ChevronLeft } from "lucide-react";

interface ApartmentFormProps {
  apartment?: Apartment;
  open: boolean;
  onClose: () => void;
}

const SOURCES: ApartmentSource[] = ["YAD2", "FACEBOOK", "OTHER"];

export function ApartmentForm({ apartment, open, onClose }: ApartmentFormProps) {
  const isEdit = !!apartment;
  const createApartment = useCreateApartment();
  const updateApartment = useUpdateApartment();

  const [title, setTitle] = useState(apartment?.title || "");
  const [sourceUrl, setSourceUrl] = useState(apartment?.source_url || "");
  const [source, setSource] = useState<ApartmentSource>(
    apartment?.source || "OTHER"
  );
  const [price, setPrice] = useState(apartment?.price?.toString() || "");
  const [rooms, setRooms] = useState(apartment?.rooms?.toString() || "");
  const [neighborhood, setNeighborhood] = useState(
    apartment?.neighborhood || ""
  );
  const [contactName, setContactName] = useState(
    apartment?.contact_name || ""
  );
  const [contactPhone, setContactPhone] = useState(
    apartment?.contact_phone || ""
  );
  const [notes, setNotes] = useState(apartment?.notes || "");
  const [showMore, setShowMore] = useState(false);
  const [address, setAddress] = useState(apartment?.address || "");
  const [floor, setFloor] = useState(apartment?.floor?.toString() || "");
  const [size, setSize] = useState(apartment?.size?.toString() || "");
  const [autoDetected, setAutoDetected] = useState(false);

  function handleUrlChange(url: string) {
    setSourceUrl(url);
    const detected = detectSource(url);
    if (detected) {
      setSource(detected);
      setAutoDetected(true);
    } else {
      setAutoDetected(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data: CreateApartmentInput = {
      title: title.trim(),
      source,
      source_url: sourceUrl.trim() || null,
      price: price ? parseInt(price.replace(/,/g, ""), 10) : null,
      rooms: rooms ? parseFloat(rooms) : null,
      neighborhood: neighborhood.trim() || null,
      contact_name: contactName.trim() || null,
      contact_phone: contactPhone.trim() || null,
      notes: notes.trim() || null,
      address: address.trim() || null,
      floor: floor ? parseInt(floor, 10) : null,
      size: size ? parseInt(size, 10) : null,
    };

    if (isEdit && apartment) {
      updateApartment.mutate(
        { id: apartment.id, data },
        { onSuccess: () => onClose() }
      );
    } else {
      createApartment.mutate(data, { onSuccess: () => onClose() });
    }
  }

  const isPending = createApartment.isPending || updateApartment.isPending;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        className="max-h-[92dvh] overflow-y-auto rounded-t-3xl px-5"
      >
        <SheetHeader className="px-0 pb-2 pt-2">
          <SheetTitle className="text-start text-xl font-bold">
            {isEdit ? "עריכת דירה" : <><Sparkles className="inline h-5 w-5" /> דירה חדשה</>}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-0">
          {/* Title */}
          <div className="mb-4">
            <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
              כותרת *
            </label>
            <Input
              placeholder='לדוגמה: 3 חד׳ רחוב הרצל'
              value={title}
              onChange={(e) => setTitle(getEventValue(e))}
              required
              className="rounded-[10px] border-border bg-bg-app text-sm"
            />
          </div>

          {/* Source URL */}
          <div className="mb-4">
            <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
              קישור למודעה
            </label>
            <Input
              placeholder="הדבק קישור מיד2 או פייסבוק"
              value={sourceUrl}
              onChange={(e) => handleUrlChange(getEventValue(e))}
              dir="ltr"
              className="rounded-[10px] border-border bg-bg-app text-xs"
              style={{ textAlign: "end" }}
            />
            {autoDetected && (
              <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-green-600">
                <Check className="h-3.5 w-3.5" /> זוהה אוטומטית: {SOURCE_CONFIG[source].label}
              </div>
            )}
          </div>

          {/* Source chips */}
          <div className="mb-4">
            <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
              מקור
            </label>
            <div className="flex gap-2">
              {SOURCES.map((s) => {
                const config = SOURCE_CONFIG[s];
                const isActive = source === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSource(s)}
                    className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all ${
                      isActive
                        ? `${config.bgClass} ${config.textClass} border-current`
                        : "border-border bg-surface text-text-secondary"
                    }`}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price + Rooms */}
          <div className="mb-4 flex gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                מחיר (₪)
              </label>
              <Input
                placeholder="5,000"
                value={price}
                onChange={(e) => setPrice(getEventValue(e))}
                dir="ltr"
                className="rounded-[10px] border-border bg-bg-app text-sm"
                style={{ textAlign: "end" }}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                חדרים
              </label>
              <Input
                placeholder="3"
                value={rooms}
                onChange={(e) => setRooms(getEventValue(e))}
                dir="ltr"
                className="rounded-[10px] border-border bg-bg-app text-sm"
                style={{ textAlign: "end" }}
              />
            </div>
          </div>

          {/* Neighborhood */}
          <div className="mb-4">
            <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
              שכונה / אזור
            </label>
            <Input
              placeholder="פלורנטין, לב העיר..."
              value={neighborhood}
              onChange={(e) => setNeighborhood(getEventValue(e))}
              className="rounded-[10px] border-border bg-bg-app text-sm"
            />
          </div>

          {/* Contact */}
          <div className="mb-4 flex gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                שם איש קשר
              </label>
              <Input
                placeholder="שם המשכיר"
                value={contactName}
                onChange={(e) => setContactName(getEventValue(e))}
                className="rounded-[10px] border-border bg-bg-app text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                טלפון
              </label>
              <Input
                placeholder="054-..."
                value={contactPhone}
                onChange={(e) => setContactPhone(getEventValue(e))}
                dir="ltr"
                className="rounded-[10px] border-border bg-bg-app text-sm"
                style={{ textAlign: "end" }}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
              הערות
            </label>
            <Textarea
              placeholder="הערות חופשיות..."
              value={notes}
              onChange={(e) => setNotes(getEventValue(e))}
              rows={2}
              className="resize-none rounded-[10px] border-border bg-bg-app text-sm"
            />
          </div>

          {/* Expandable section */}
          {!showMore ? (
            <button
              type="button"
              onClick={() => setShowMore(true)}
              className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-accent-blue"
            >
              <ChevronLeft className="inline h-4 w-4" /> פרטים נוספים (כתובת, קומה, גודל)
            </button>
          ) : (
            <div className="mb-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                  כתובת
                </label>
                <Input
                  placeholder="כתובת מלאה"
                  value={address}
                  onChange={(e) => setAddress(getEventValue(e))}
                  className="rounded-[10px] border-border bg-bg-app text-sm"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                    קומה
                  </label>
                  <Input
                    placeholder="4"
                    value={floor}
                    onChange={(e) => setFloor(getEventValue(e))}
                    dir="ltr"
                    className="rounded-[10px] border-border bg-bg-app text-sm"
                    style={{ textAlign: "end" }}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                    גודל (מ״ר)
                  </label>
                  <Input
                    placeholder="75"
                    value={size}
                    onChange={(e) => setSize(getEventValue(e))}
                    dir="ltr"
                    className="rounded-[10px] border-border bg-bg-app text-sm"
                    style={{ textAlign: "end" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-2.5 border-t border-border-light pt-4 pb-8">
            <Button
              type="submit"
              disabled={isPending || !title.trim()}
              className="flex-[2] rounded-xl bg-accent-blue py-3.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {isPending
                ? "שומר..."
                : isEdit
                ? "שמור שינויים"
                : "הוסף דירה"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl border-border bg-bg-app py-3.5 text-sm font-semibold text-text-primary"
            >
              ביטול
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

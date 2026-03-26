"use client";

import { useApartments } from "@/hooks/use-apartments";
import { useFilters } from "@/hooks/use-filters";
import type { ApartmentSource, ApartmentStatus } from "@/lib/types";
import { ApartmentDetail } from "@/components/apartment-detail";
import { ApartmentForm } from "@/components/apartment-form";
import { ApartmentList } from "@/components/apartment-list";
import { FilterBar } from "@/components/filter-bar";
import { InstallPrompt } from "@/components/install-prompt";
import { KanbanBoard } from "@/components/kanban-board";
import { NavBar } from "@/components/nav-bar";
import { Suspense, useCallback, useRef, useState } from "react";
import { Home, Columns3, List, Search, Plus } from "lucide-react";

function getInputValue(el: HTMLInputElement | null): string {
  // React 19 types omit `value` from HTMLInputElement
  return (el as unknown as { value: string })?.value ?? "";
}

function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="relative mx-5 mb-3 shrink-0">
      <input
        ref={ref}
        placeholder="חיפוש דירה..."
        defaultValue={value}
        onInput={() => onChange(getInputValue(ref.current))}
        className="w-full rounded-[10px] border border-border bg-surface pe-3 ps-9 py-2.5 text-sm outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/10"
      />
      <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
    </div>
  );
}

function DashboardInner() {
  const { filters, viewMode, setFilter, setViewMode, clearFilters } =
    useFilters();
  const { data: apartments = [] } = useApartments(filters);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editApartment, setEditApartment] = useState<string | null>(null);

  const handleSelect = useCallback((id: string) => setSelectedId(id), []);

  const handleEdit = useCallback((id: string) => {
    setSelectedId(null);
    setEditApartment(id);
  }, []);

  const editApt = editApartment
    ? apartments.find((a) => a.id === editApartment)
    : undefined;

  const toggleStatus = useCallback(
    (status: ApartmentStatus) => {
      const current = filters.status || [];
      const next = current.includes(status)
        ? current.filter((s) => s !== status)
        : [...current, status];
      setFilter("status", next.length > 0 ? next : null);
    },
    [filters.status, setFilter]
  );

  const toggleSource = useCallback(
    (source: ApartmentSource) => {
      const current = filters.source || [];
      const next = current.includes(source)
        ? current.filter((s) => s !== source)
        : [...current, source];
      setFilter("source", next.length > 0 ? next : null);
    },
    [filters.source, setFilter]
  );

  return (
    <div className="flex min-h-dvh flex-col bg-bg-app">
      {/* Top nav */}
      <div className="flex shrink-0 items-center justify-between px-5 pt-[env(safe-area-inset-top)] pb-3">
        <h1 className="pt-3 text-2xl font-bold text-text-primary">
          <Home className="inline h-6 w-6" /> DiraTrak
        </h1>
      </div>

      {/* Install prompt */}
      <InstallPrompt />

      {/* View toggle - list temporarily disabled */}
      {/* <div className="mx-5 mb-3 flex shrink-0 overflow-hidden rounded-[10px] border border-border bg-surface">
        <button
          onClick={() => setViewMode("kanban")}
          className={`flex-1 py-2 text-center text-[13px] font-medium transition-all ${
            viewMode === "kanban"
              ? "bg-accent-blue text-white"
              : "text-text-secondary"
          }`}
        >
          <Columns3 className="inline h-4 w-4" /> קנבן
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`flex-1 py-2 text-center text-[13px] font-medium transition-all ${
            viewMode === "list"
              ? "bg-accent-blue text-white"
              : "text-text-secondary"
          }`}
        >
          <List className="inline h-4 w-4" /> רשימה
        </button>
      </div> */}

      {/* Search (list view only) */}
      {/* {viewMode === "list" && (
        <SearchBar
          value={filters.search || ""}
          onChange={(val) => setFilter("search", val || null)}
        />
      )} */}

      {/* Filters */}
      <FilterBar
        viewMode={viewMode}
        apartments={apartments}
        activeStatuses={filters.status || []}
        activeSources={filters.source || []}
        onToggleStatus={toggleStatus}
        onToggleSource={toggleSource}
        onClear={clearFilters}
      />

      {/* Content - list temporarily disabled */}
      <KanbanBoard apartments={apartments} onSelect={handleSelect} />
      {/* {viewMode === "kanban" ? (
        <KanbanBoard apartments={apartments} onSelect={handleSelect} />
      ) : (
        <ApartmentList apartments={apartments} onSelect={handleSelect} />
      )} */}

      {/* FAB */}
      <button
        onClick={() => setFormOpen(true)}
        className="fixed bottom-[84px] start-5 z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-blue text-[28px] font-light text-white shadow-[0_6px_24px_rgba(37,99,235,0.35)] transition-transform hover:scale-105"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <Plus className="h-7 w-7" />
      </button>

      {/* Bottom nav */}
      <NavBar />

      {/* Sheets */}
      <ApartmentDetail
        apartmentId={selectedId}
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        onEdit={handleEdit}
      />

      <ApartmentForm
        open={formOpen || !!editApartment}
        apartment={editApt}
        onClose={() => {
          setFormOpen(false);
          setEditApartment(null);
        }}
      />
    </div>
  );
}

export function DashboardContent() {
  return (
    <Suspense>
      <DashboardInner />
    </Suspense>
  );
}

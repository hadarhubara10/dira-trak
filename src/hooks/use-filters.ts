"use client";

import type { ApartmentFilters, ApartmentSource, ApartmentStatus } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export type ViewMode = "kanban" | "list";

export function useFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filters: ApartmentFilters = useMemo(() => {
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") as ApartmentFilters["sortBy"];
    const sortDir = searchParams.get("sortDir") as ApartmentFilters["sortDir"];

    return {
      status: status
        ? (status.split(",") as ApartmentStatus[])
        : undefined,
      source: source
        ? (source.split(",") as ApartmentSource[])
        : undefined,
      search: search || undefined,
      sortBy: sortBy || "created_at",
      sortDir: sortDir || "desc",
    };
  }, [searchParams]);

  const viewMode: ViewMode = useMemo(() => {
    const view = searchParams.get("view");
    return view === "list" ? "list" : "kanban";
  }, [searchParams]);

  const setFilter = useCallback(
    (key: string, value: string | string[] | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || (Array.isArray(value) && value.length === 0)) {
        params.delete(key);
      } else {
        params.set(key, Array.isArray(value) ? value.join(",") : value);
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const setViewMode = useCallback(
    (mode: ViewMode) => {
      setFilter("view", mode);
    },
    [setFilter]
  );

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams();
    const view = searchParams.get("view");
    if (view) params.set("view", view);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  return { filters, viewMode, setFilter, setViewMode, clearFilters };
}

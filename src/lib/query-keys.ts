import type { ApartmentFilters } from "./types";

export const apartmentKeys = {
  all: ["apartments"] as const,
  lists: () => [...apartmentKeys.all, "list"] as const,
  list: (filters: ApartmentFilters) =>
    [...apartmentKeys.lists(), filters] as const,
  details: () => [...apartmentKeys.all, "detail"] as const,
  detail: (id: string) => [...apartmentKeys.details(), id] as const,
  statusLogs: (id: string) =>
    [...apartmentKeys.detail(id), "status-logs"] as const,
  notes: (id: string) =>
    [...apartmentKeys.detail(id), "notes"] as const,
} as const;

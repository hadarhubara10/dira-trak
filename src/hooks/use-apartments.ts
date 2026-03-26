"use client";

import { createClient } from "@/lib/supabase/client";
import { apartmentKeys } from "@/lib/query-keys";
import { fetchApartments } from "@/lib/queries/apartments";
import type { ApartmentFilters } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export function useApartments(filters: ApartmentFilters = {}) {
  const supabase = createClient();

  return useQuery({
    queryKey: apartmentKeys.list(filters),
    queryFn: () => fetchApartments(supabase, filters),
  });
}

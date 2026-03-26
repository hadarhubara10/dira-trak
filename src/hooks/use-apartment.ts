"use client";

import { createClient } from "@/lib/supabase/client";
import { apartmentKeys } from "@/lib/query-keys";
import { fetchApartment } from "@/lib/queries/apartments";
import { useQuery } from "@tanstack/react-query";

export function useApartment(id: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: apartmentKeys.detail(id!),
    queryFn: () => fetchApartment(supabase, id!),
    enabled: !!id,
  });
}

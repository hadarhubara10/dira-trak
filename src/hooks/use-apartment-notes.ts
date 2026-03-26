"use client";

import { createClient } from "@/lib/supabase/client";
import { apartmentKeys } from "@/lib/query-keys";
import { fetchApartmentNotes } from "@/lib/queries/apartments";
import { useQuery } from "@tanstack/react-query";

export function useApartmentNotes(apartmentId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: apartmentKeys.notes(apartmentId!),
    queryFn: () => fetchApartmentNotes(supabase, apartmentId!),
    enabled: !!apartmentId,
  });
}

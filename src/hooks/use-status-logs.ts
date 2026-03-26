"use client";

import { createClient } from "@/lib/supabase/client";
import { apartmentKeys } from "@/lib/query-keys";
import { fetchStatusLogs } from "@/lib/queries/apartments";
import { useQuery } from "@tanstack/react-query";

export function useStatusLogs(apartmentId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: apartmentKeys.statusLogs(apartmentId!),
    queryFn: () => fetchStatusLogs(supabase, apartmentId!),
    enabled: !!apartmentId,
  });
}

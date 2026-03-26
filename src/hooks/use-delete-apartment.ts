"use client";

import { createClient } from "@/lib/supabase/client";
import { apartmentKeys } from "@/lib/query-keys";
import { deleteApartment } from "@/lib/queries/apartments";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteApartment() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: (id: string) => deleteApartment(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apartmentKeys.lists() });
    },
  });
}

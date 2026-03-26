"use client";

import { createClient } from "@/lib/supabase/client";
import { apartmentKeys } from "@/lib/query-keys";
import { updateApartment } from "@/lib/queries/apartments";
import type { UpdateApartmentInput } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateApartment() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApartmentInput }) =>
      updateApartment(supabase, id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: apartmentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: apartmentKeys.detail(variables.id),
      });
    },
  });
}

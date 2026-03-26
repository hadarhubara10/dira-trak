"use client";

import { createClient } from "@/lib/supabase/client";
import { apartmentKeys } from "@/lib/query-keys";
import { createApartment } from "@/lib/queries/apartments";
import type { CreateApartmentInput } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateApartment() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: (data: CreateApartmentInput) =>
      createApartment(supabase, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apartmentKeys.lists() });
    },
  });
}

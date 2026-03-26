"use client";

import { createClient } from "@/lib/supabase/client";
import { apartmentKeys } from "@/lib/query-keys";
import { createApartmentNote } from "@/lib/queries/apartments";
import type { CreateNoteInput } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateNote() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: (input: CreateNoteInput) =>
      createApartmentNote(supabase, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: apartmentKeys.notes(variables.apartment_id),
      });
    },
  });
}

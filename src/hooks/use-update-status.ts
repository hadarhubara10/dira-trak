"use client";

import { createClient } from "@/lib/supabase/client";
import { apartmentKeys } from "@/lib/query-keys";
import type { Apartment, ApartmentStatus } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateStatusInput {
  id: string;
  status: ApartmentStatus;
  note?: string;
}

export function useUpdateStatus() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, status, note }: UpdateStatusInput) => {
      const { error } = await supabase.rpc("change_apartment_status", {
        p_apartment_id: id,
        p_new_status: status,
        p_note: note || null,
      });
      if (error) throw error;
    },
    onMutate: async ({ id, status }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: apartmentKeys.detail(id),
      });
      await queryClient.cancelQueries({
        queryKey: apartmentKeys.lists(),
      });

      // Snapshot previous values
      const previousDetail = queryClient.getQueryData<Apartment>(
        apartmentKeys.detail(id)
      );
      const previousLists = queryClient.getQueriesData({
        queryKey: apartmentKeys.lists(),
      });

      // Optimistic update on detail
      if (previousDetail) {
        queryClient.setQueryData<Apartment>(apartmentKeys.detail(id), {
          ...previousDetail,
          status,
        });
      }

      // Optimistic update on lists
      queryClient.setQueriesData<Apartment[]>(
        { queryKey: apartmentKeys.lists() },
        (old) =>
          old?.map((apt) => (apt.id === id ? { ...apt, status } : apt))
      );

      return { previousDetail, previousLists };
    },
    onError: (_err, { id }, context) => {
      // Rollback on error
      if (context?.previousDetail) {
        queryClient.setQueryData(
          apartmentKeys.detail(id),
          context.previousDetail
        );
      }
      if (context?.previousLists) {
        for (const [queryKey, data] of context.previousLists) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: apartmentKeys.all });
    },
  });
}

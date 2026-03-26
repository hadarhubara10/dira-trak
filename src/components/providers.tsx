"use client";

import { createClient } from "@/lib/supabase/client";
import { apartmentKeys } from "@/lib/query-keys";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";

function RealtimeListener() {
  const queryClient = useQueryClient();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    const supabase = supabaseRef.current;
    const channel = supabase
      .channel("apartments-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "apartments" },
        () => {
          queryClient.invalidateQueries({ queryKey: apartmentKeys.all });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeListener />
      {children}
    </QueryClientProvider>
  );
}

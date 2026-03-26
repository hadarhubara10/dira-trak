import { createClient } from "@/lib/supabase/server";
import { apartmentKeys } from "@/lib/query-keys";
import { fetchApartments } from "@/lib/queries/apartments";
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { DashboardContent } from "./dashboard-content";

export default async function DashboardPage() {
  const supabase = await createClient();
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: apartmentKeys.list({}),
    queryFn: () => fetchApartments(supabase, {}),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContent />
    </HydrationBoundary>
  );
}

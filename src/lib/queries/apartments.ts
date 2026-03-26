import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Apartment,
  ApartmentFilters,
  ApartmentNote,
  CreateApartmentInput,
  CreateNoteInput,
  StatusLog,
  UpdateApartmentInput,
} from "../types";
import { detectSource } from "../utils";

export async function fetchApartments(
  supabase: SupabaseClient,
  filters: ApartmentFilters
): Promise<Apartment[]> {
  let query = supabase.from("apartments").select("*");

  if (filters.status && filters.status.length > 0) {
    query = query.in("status", filters.status);
  }

  if (filters.source && filters.source.length > 0) {
    query = query.in("source", filters.source);
  }

  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,neighborhood.ilike.%${filters.search}%,address.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
    );
  }

  const sortBy = filters.sortBy || "created_at";
  const sortDir = filters.sortDir || "desc";
  query = query.order(sortBy, { ascending: sortDir === "asc" });

  const { data, error } = await query;
  if (error) throw error;
  return data as Apartment[];
}

export async function fetchApartment(
  supabase: SupabaseClient,
  id: string
): Promise<Apartment> {
  const { data, error } = await supabase
    .from("apartments")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Apartment;
}

export async function fetchStatusLogs(
  supabase: SupabaseClient,
  apartmentId: string
): Promise<StatusLog[]> {
  const { data, error } = await supabase
    .from("status_logs")
    .select("*, profiles(display_name)")
    .eq("apartment_id", apartmentId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as StatusLog[];
}

export async function fetchApartmentNotes(
  supabase: SupabaseClient,
  apartmentId: string
): Promise<ApartmentNote[]> {
  const { data, error } = await supabase
    .from("apartment_notes")
    .select("*, profiles(display_name)")
    .eq("apartment_id", apartmentId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as ApartmentNote[];
}

export async function createApartmentNote(
  supabase: SupabaseClient,
  input: CreateNoteInput
): Promise<ApartmentNote> {
  const { data, error } = await supabase
    .from("apartment_notes")
    .insert(input)
    .select("*, profiles(display_name)")
    .single();
  if (error) throw error;
  return data as ApartmentNote;
}

export async function createApartment(
  supabase: SupabaseClient,
  input: CreateApartmentInput
): Promise<Apartment> {
  // Auto-detect source from URL if not explicitly set
  const data = { ...input };
  if (data.source_url && !data.source) {
    const detected = detectSource(data.source_url);
    if (detected) data.source = detected;
  }

  const { data: apartment, error } = await supabase
    .from("apartments")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return apartment as Apartment;
}

export async function updateApartment(
  supabase: SupabaseClient,
  id: string,
  input: UpdateApartmentInput
): Promise<Apartment> {
  const { data, error } = await supabase
    .from("apartments")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Apartment;
}

export async function deleteApartment(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from("apartments").delete().eq("id", id);
  if (error) throw error;
}

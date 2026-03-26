export type ApartmentStatus =
  | "NEW"
  | "CONTACTED"
  | "RESPONDED"
  | "VIEWING_SCHEDULED"
  | "VIEWED"
  | "INTERESTED"
  | "REJECTED"
  | "RENTED";

export type ApartmentSource = "YAD2" | "FACEBOOK" | "OTHER";

export interface Apartment {
  id: string;
  title: string;
  source: ApartmentSource;
  source_url: string | null;
  status: ApartmentStatus;
  price: number | null;
  rooms: number | null;
  neighborhood: string | null;
  address: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  floor: number | null;
  size: number | null;
  notes: string | null;
  viewing_date: string | null;
  rating: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface StatusLog {
  id: string;
  apartment_id: string;
  from_status: ApartmentStatus | null;
  to_status: ApartmentStatus;
  note: string | null;
  changed_by: string;
  created_at: string;
  // Joined from profiles
  profiles?: {
    display_name: string | null;
  };
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export type CreateApartmentInput = {
  title: string;
  source: ApartmentSource;
  source_url?: string | null;
  price?: number | null;
  rooms?: number | null;
  neighborhood?: string | null;
  address?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  floor?: number | null;
  size?: number | null;
  notes?: string | null;
  viewing_date?: string | null;
};

export type UpdateApartmentInput = Partial<CreateApartmentInput>;

export interface ApartmentFilters {
  status?: ApartmentStatus[];
  source?: ApartmentSource[];
  search?: string;
  sortBy?: "created_at" | "price" | "status" | "viewing_date";
  sortDir?: "asc" | "desc";
}

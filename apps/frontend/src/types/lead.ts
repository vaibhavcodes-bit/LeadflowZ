export interface Lead {
  id: string;

  name: string;

  email?: string | null;

  phone?: string | null;

  source?: string | null;

  status: string;

  external_lead_id?: string | null;

  notes?: string | null;

  created_at: string;

  updated_at?: string | null;
}
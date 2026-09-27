export type LeadStatus =
  | "new"
  | "qualified"
  | "contacted"
  | "converted"
  | "lost";

export interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: LeadStatus | string;
  created_at: string;
}
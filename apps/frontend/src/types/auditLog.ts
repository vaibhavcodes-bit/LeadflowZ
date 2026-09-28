export interface AuditLog {
  id: string;
  lead_id: string;
  event_type: string;
  description?: string | null;
  created_at: string;
}
import type { Lead } from "../types/lead";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function getLeads(): Promise<Lead[]> {
  const response = await fetch(`${API_BASE_URL}/api/leads`);

  if (!response.ok) {
    throw new Error(`Failed to fetch leads: ${response.status}`);
  }

  return response.json();
}
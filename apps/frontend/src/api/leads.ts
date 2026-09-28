import type { Lead } from "../types/lead";

const API_BASE_URL = "http://localhost:8000/api";

export async function getLeads(): Promise<Lead[]> {
  const response = await fetch(`${API_BASE_URL}/leads`);

  if (!response.ok) {
    throw new Error("Failed to fetch leads");
  }

  return response.json();
}

export async function getLead(id: string): Promise<Lead> {
  const response = await fetch(`${API_BASE_URL}/leads/${id}`);

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || "Failed to fetch lead",
    );
  }

  return response.json();
}

export async function updateLead(
  id: string,
  data: {
    name: string;
    email: string;
    phone: string;
    source: string;
  },
): Promise<Lead> {
  const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || "Failed to update lead",
    );
  }

  return response.json();
}

export async function updateLeadStatus(
  id: string,
  status: string,
): Promise<Lead> {
  const response = await fetch(`${API_BASE_URL}/leads/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || "Failed to update lead status",
    );
  }

  return response.json();
}
import type { AuditLog } from "../types/auditLog";
import type { Lead, LeadStatus } from "../types/lead";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000/api";

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    },
  );

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const body = await response.json();

      if (body?.message) {
        message = body.message;
      } else if (body?.detail) {
        message =
          typeof body.detail === "string"
            ? body.detail
            : JSON.stringify(body.detail);
      } else if (body?.error) {
        message = body.error;
      }
    } catch {
      // Ignore invalid JSON error response.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function getLeads(): Promise<Lead[]> {
  const response = await request<
    Lead[] | { leads: Lead[] }
  >("/leads");

  if (Array.isArray(response)) {
    return response;
  }

  return response.leads || [];
}

export async function getLead(
  leadId: string,
): Promise<Lead> {
  return request<Lead>(`/leads/${leadId}`);
}

export async function getLeadAuditLogs(
  leadId: string,
): Promise<AuditLog[]> {
  const response = await request<
    AuditLog[] | { logs: AuditLog[] }
  >(`/leads/${leadId}/audit-logs`);

  if (Array.isArray(response)) {
    return response;
  }

  return response.logs || [];
}

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
): Promise<Lead> {
  return request<Lead>(
    `/leads/${leadId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    },
  );
}
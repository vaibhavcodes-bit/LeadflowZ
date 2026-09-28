import type { AuditLog } from "../types/auditLog";
import type { Lead, LeadStatus } from "../types/lead";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

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

/**
 * Normalizes different possible backend company field names
 * into the frontend's `company` property.
 */
function normalizeLead(lead: any): Lead {
  return {
    id: lead.id,
    name: lead.name ?? "",
    email: lead.email ?? null,
    phone: lead.phone ?? null,

    company:
      lead.company ??
      lead.company_name ??
      lead.companyName ??
      null,

    source: lead.source ?? null,

    status: lead.status,

    created_at: lead.created_at,

    updated_at: lead.updated_at ?? null,

    external_lead_id:
      lead.external_lead_id ??
      lead.externalLeadId ??
      null,
  };
}

export async function getLeads(): Promise<Lead[]> {
  const response = await request<
    Lead[] | { leads: Lead[] }
  >("/leads");

  const leads = Array.isArray(response)
    ? response
    : response.leads || [];

  return leads.map(normalizeLead);
}

export async function getLead(
  leadId: string,
): Promise<Lead> {
  const response = await request<Lead>(
    `/leads/${leadId}`,
  );

  return normalizeLead(response);
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
  const response = await request<Lead>(
    `/leads/${leadId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    },
  );

  return normalizeLead(response);
}
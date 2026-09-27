import type { Lead } from "../types/lead";
import { StatusBadge } from "./StatusBadge";

interface LeadTableProps {
  leads: Lead[];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function LeadTable({ leads }: LeadTableProps) {
  if (leads.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⌕</div>
        <h3>No leads found</h3>
        <p>Try changing your search or status filter.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="lead-table">
        <thead>
          <tr>
            <th>Lead</th>
            <th>Contact</th>
            <th>Phone</th>
            <th>Source</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>

        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>
                <div className="lead-cell">
                  <div className="avatar">
                    {getInitials(lead.name)}
                  </div>

                  <div>
                    <div className="lead-name">{lead.name}</div>
                    <div className="lead-id">
                      {lead.id.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              </td>

              <td>{lead.email || "-"}</td>

              <td>{lead.phone || "-"}</td>

              <td>
                <span className="source-tag">
                  {lead.source || "Unknown"}
                </span>
              </td>

              <td>
                <StatusBadge status={lead.status} />
              </td>

              <td>{formatDate(lead.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
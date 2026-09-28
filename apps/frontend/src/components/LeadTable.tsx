import type { Lead } from "../types/lead";
import StatusBadge from "./StatusBadge";

interface LeadTableProps {
  leads: Lead[];
  onOpenLead: (leadId: string) => void;
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function getInitials(name?: string | null): string {
  if (!name?.trim()) {
    return "L";
  }

  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function LeadTable({
  leads,
  onOpenLead,
}: LeadTableProps) {
  if (!leads.length) {
    return (
      <div className="table-empty-state">
        <div className="empty-icon">⌕</div>

        <h3>No leads found</h3>

        <p>
          Try changing your search or status filter.
        </p>
      </div>
    );
  }

  return (
    <div className="leads-table-wrapper">
      <table className="leads-table">
        <thead>
          <tr>
            <th className="lead-column">
              Lead
            </th>

            <th>
              Company
            </th>

            <th>
              Source
            </th>

            <th>
              Status
            </th>

            <th>
              Created
            </th>

            <th className="action-column">
              <span className="sr-only">
                Actions
              </span>
            </th>
          </tr>
        </thead>

        <tbody>
          {leads.map((lead) => {
            const name =
              lead.name?.trim() || "Unnamed Lead";

            const email =
              lead.email?.trim() || "No email";

            return (
              <tr
                key={lead.id}
                className="lead-row"
                onClick={() =>
                  onOpenLead(lead.id)
                }
              >
                {/* LEAD */}

                <td>
                  <div className="table-lead">
                    <div className="table-avatar">
                      {getInitials(lead.name)}
                    </div>

                    <div className="table-lead-info">
                      <strong>
                        {name}
                      </strong>

                      <span>
                        {email}
                      </span>

                      {lead.phone && (
                        <small>
                          {lead.phone}
                        </small>
                      )}
                    </div>
                  </div>
                </td>

                {/* COMPANY */}

                <td>
                  <span className="table-company">
                    {lead.company?.trim() || "—"}
                  </span>
                </td>

                {/* SOURCE */}

                <td>
                  <span className="table-source">
                    {lead.source?.trim() || "—"}
                  </span>
                </td>

                {/* STATUS */}

                <td>
                  <StatusBadge
                    status={lead.status}
                  />
                </td>

                {/* CREATED */}

                <td>
                  <span className="table-date">
                    {formatDate(
                      lead.created_at
                    )}
                  </span>
                </td>

                {/* ACTION */}

                <td>
                  <button
                    type="button"
                    className="table-action"
                    onClick={(event) => {
                      event.stopPropagation();

                      onOpenLead(lead.id);
                    }}
                    aria-label={`View ${name}`}
                  >
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
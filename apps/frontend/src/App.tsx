import { useEffect, useMemo, useState } from "react";

import "./App.css";

type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "lost"
  | string;

interface Lead {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  source?: string | null;
  status: LeadStatus;
  created_at?: string | null;
  updated_at?: string | null;
}

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const statusLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  converted: "Converted",
  lost: "Lost",
};

function getStatusLabel(status: string): string {
  return statusLabels[status] || status;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function fetchLeads(): Promise<void> {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/leads`);

      if (!response.ok) {
        throw new Error(
          `Request failed with status ${response.status}`,
        );
      }

      const data: unknown = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid leads response");
      }

      setLeads(data as Lead[]);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load leads. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesSearch =
        !query ||
        lead.name?.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.phone?.toLowerCase().includes(query) ||
        lead.source?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        lead.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  const statusCounts = useMemo(() => {
    return {
      all: leads.length,
      new: leads.filter(
        (lead) => lead.status.toLowerCase() === "new",
      ).length,
      contacted: leads.filter(
        (lead) => lead.status.toLowerCase() === "contacted",
      ).length,
      qualified: leads.filter(
        (lead) => lead.status.toLowerCase() === "qualified",
      ).length,
      converted: leads.filter(
        (lead) => lead.status.toLowerCase() === "converted",
      ).length,
    };
  }, [leads]);

  return (
    <div className="app-shell">
      <main className="page-container">
        <section className="page-header">
          <div>
            <div className="eyebrow">CRM / LEADS</div>

            <h1>Leads</h1>

            <p className="page-description">
              Manage, track and follow up with your incoming leads.
            </p>
          </div>

          <button
            className="refresh-button"
            type="button"
            onClick={() => void fetchLeads()}
            disabled={loading}
          >
            <span className="refresh-icon">↻</span>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Total Leads</span>
              <span className="stat-icon">◎</span>
            </div>

            <strong>{statusCounts.all}</strong>

            <span className="stat-description">
              All incoming leads
            </span>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">New</span>
              <span className="stat-icon">✦</span>
            </div>

            <strong>{statusCounts.new}</strong>

            <span className="stat-description">
              Needs attention
            </span>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Qualified</span>
              <span className="stat-icon">✓</span>
            </div>

            <strong>{statusCounts.qualified}</strong>

            <span className="stat-description">
              Sales qualified
            </span>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Converted</span>
              <span className="stat-icon">↗</span>
            </div>

            <strong>{statusCounts.converted}</strong>

            <span className="stat-description">
              Successfully converted
            </span>
          </div>
        </section>

        <section className="lead-panel">
          <div className="panel-header">
            <div>
              <h2>All Leads</h2>

              <p>
                {filteredLeads.length}{" "}
                {filteredLeads.length === 1 ? "lead" : "leads"}{" "}
                displayed
              </p>
            </div>
          </div>

          <div className="filters">
            <div className="search-wrapper">
              <span className="search-icon">⌕</span>

              <input
                type="search"
                placeholder="Search by name, email, phone or source..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search leads"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="status-filter"
              aria-label="Filter leads by status"
            >
              <option value="all">All statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <p>Loading leads...</p>
            </div>
          ) : error ? (
            <div className="state-container">
              <div className="state-icon error-icon">!</div>

              <h3>Something went wrong</h3>

              <p>{error}</p>

              <button
                type="button"
                className="retry-button"
                onClick={() => void fetchLeads()}
              >
                Try again
              </button>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="state-container">
              <div className="state-icon">⌕</div>

              <h3>No leads found</h3>

              <p>
                {search || statusFilter !== "all"
                  ? "Try changing your search or filters."
                  : "No leads have been created yet."}
              </p>

              {(search || statusFilter !== "all") && (
                <button
                  type="button"
                  className="retry-button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="leads-table">
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
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <div className="lead-cell">
                          <div className="avatar">
                            {getInitials(lead.name)}
                          </div>

                          <div className="lead-name-wrapper">
                            <span className="lead-name">
                              {lead.name}
                            </span>

                            <span className="lead-id">
                              {lead.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="email">
                          {lead.email || "—"}
                        </span>
                      </td>

                      <td>
                        <span className="phone">
                          {lead.phone || "—"}
                        </span>
                      </td>

                      <td>
                        <span className="source-badge">
                          {lead.source || "Unknown"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge status-${lead.status.toLowerCase()}`}
                        >
                          <span className="status-dot" />
                          {getStatusLabel(lead.status)}
                        </span>
                      </td>

                      <td>
                        <span className="created-date">
                          {formatDate(lead.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
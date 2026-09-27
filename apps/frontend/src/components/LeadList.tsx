import { useEffect, useMemo, useState } from "react";

import { getLeads } from "../api/leads";
import type { Lead } from "../types/lead";
import { LeadStats } from "../components/LeadStats";
import { LeadTable } from "../components/LeadTable";

export default function LeadList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadLeads() {
    try {
      setLoading(true);
      setError(null);

      const data = await getLeads();

      setLeads(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load leads",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesSearch =
        !query ||
        lead.name.toLowerCase().includes(query) ||
        (lead.email ?? "").toLowerCase().includes(query) ||
        (lead.phone ?? "").toLowerCase().includes(query) ||
        (lead.source ?? "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        lead.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  if (loading) {
    return (
      <section className="lead-page">
        <div className="lead-header">
          <div>
            <span className="eyebrow">CRM / LEADS</span>
            <h1>Leads</h1>
            <p>Manage, track and follow up with your incoming leads.</p>
          </div>
        </div>

        <div className="state-card">
          <div className="loading-spinner" />
          <p>Loading leads...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="lead-page">
        <div className="lead-header">
          <div>
            <span className="eyebrow">CRM / LEADS</span>
            <h1>Leads</h1>
            <p>Manage, track and follow up with your incoming leads.</p>
          </div>
        </div>

        <div className="state-card error-state">
          <div className="state-icon">!</div>

          <div>
            <h3>Unable to load leads</h3>
            <p>{error}</p>

            <button
              type="button"
              className="refresh-button"
              onClick={() => void loadLeads()}
            >
              ↻ Try again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="lead-page">
      <div className="lead-header">
        <div>
          <span className="eyebrow">CRM / LEADS</span>

          <h1>Leads</h1>

          <p>
            Manage, track and follow up with your incoming leads.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={() => void loadLeads()}
        >
          ↻ Refresh
        </button>
      </div>

      <LeadStats leads={leads} />

      <div className="lead-section">
        <div className="section-header">
          <div>
            <h2>All Leads</h2>
            <p>
              {filteredLeads.length} of {leads.length} leads displayed
            </p>
          </div>
        </div>

        <div className="lead-toolbar">
          <div className="search-box">
            <span className="search-icon">⌕</span>

            <input
              type="search"
              placeholder="Search by name, email, phone or source..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="qualified">Qualified</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="state-card empty-state">
            <div className="state-icon">⌕</div>

            <h3>No leads found</h3>

            <p>
              Try changing your search or status filter.
            </p>

            {(search || statusFilter !== "all") && (
              <button
                type="button"
                className="refresh-button"
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
          <LeadTable leads={filteredLeads} />
        )}
      </div>
    </section>
  );
}
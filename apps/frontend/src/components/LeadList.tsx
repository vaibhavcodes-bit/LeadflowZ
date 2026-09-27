import { useEffect, useMemo, useState } from "react";

import { getLeads } from "../api/leads";
import { LeadStats } from "../components/LeadStats";
import { LeadTable } from "../components/LeadTable";
import type { Lead } from "../types/lead";

export default function LeadList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  /*
   * Used by the Refresh and Try Again buttons.
   */
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

  /*
   * Initial API request.
   *
   * The cancelled flag prevents state updates if the
   * component unmounts before the API request completes.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadInitialLeads() {
      try {
        const data = await getLeads();

        if (!cancelled) {
          setLeads(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load leads",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialLeads();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Search + status filtering.
   */
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

  /*
   * Loading state.
   */
  if (loading) {
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
        </div>

        <div className="state-card">
          <div className="loading-spinner" />

          <p>Loading leads...</p>
        </div>
      </section>
    );
  }

  /*
   * Error state.
   */
  if (error) {
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

  /*
   * Main Lead List UI.
   */
  return (
    <section className="lead-page">
      {/* Page Header */}
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

      {/* Lead Statistics */}
      <LeadStats leads={leads} />

      {/* Lead Section */}
      <div className="lead-section">
        {/* Section Header */}
        <div className="section-header">
          <div>
            <h2>All Leads</h2>

            <p>
              {filteredLeads.length} of {leads.length} leads displayed
            </p>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="lead-toolbar">
          <div className="search-box">
            <span
              className="search-icon"
              aria-hidden="true"
            >
              ⌕
            </span>

            <input
              type="search"
              placeholder="Search by name, email, phone or source..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search leads"
            />
          </div>

          <select
            className="status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter leads by status"
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="qualified">Qualified</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        {/* Empty State / Table */}
        {filteredLeads.length === 0 ? (
          <div className="state-card empty-state">
            <div
              className="state-icon"
              aria-hidden="true"
            >
              ⌕
            </div>

            <h3>No leads found</h3>

            <p>
              {search || statusFilter !== "all"
                ? "Try changing your search or status filter."
                : "There are currently no leads to display."}
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
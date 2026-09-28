import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { getLeads } from "../api/leads";

import LeadStats from "./LeadStats";
import LeadTable from "./LeadTable";

import type { Lead } from "../types/lead";

interface LeadListProps {
  onOpenLead: (leadId: string) => void;
}

const STATUS_OPTIONS = [
  {
    value: "all",
    label: "All statuses",
  },
  {
    value: "new",
    label: "New",
  },
  {
    value: "contacted",
    label: "Contacted",
  },
  {
    value: "qualified",
    label: "Qualified",
  },
  {
    value: "converted",
    label: "Converted",
  },
  {
    value: "lost",
    label: "Lost",
  },
];

export default function LeadList({
  onOpenLead,
}: LeadListProps) {
  const [leads, setLeads] =
    useState<Lead[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  async function loadLeads() {
    try {
      setLoading(true);
      setError(null);

      const data = await getLeads();

      setLeads(
        Array.isArray(data) ? data : [],
      );
    } catch (err) {
      console.error(
        "Failed to load leads:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load leads.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return leads.filter((lead) => {
      const searchableText = [
        lead.name,
        lead.email,
        lead.phone,
        lead.source,
        lead.company,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query ||
        searchableText.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        String(lead.status).toLowerCase() ===
          statusFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    leads,
    search,
    statusFilter,
  ]);

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
  }

  /*
   * LOADING
   */
  if (loading) {
    return (
      <section className="lead-page">
        <header className="page-header">
          <div>
            <span className="eyebrow">
              CRM / LEADS
            </span>

            <h1>Leads</h1>

            <p>
              Manage, track and follow up with
              your incoming leads.
            </p>
          </div>
        </header>

        <div className="state-card">
          <div className="loading-spinner" />

          <h3>Loading leads...</h3>

          <p>
            Please wait while we fetch your
            latest leads.
          </p>
        </div>
      </section>
    );
  }

  /*
   * ERROR
   */
  if (error) {
    return (
      <section className="lead-page">
        <header className="page-header">
          <div>
            <span className="eyebrow">
              CRM / LEADS
            </span>

            <h1>Leads</h1>

            <p>
              Manage, track and follow up with
              your incoming leads.
            </p>
          </div>
        </header>

        <div className="state-card error-state">
          <div className="state-icon">
            !
          </div>

          <div>
            <span className="eyebrow">
              ERROR
            </span>

            <h3>
              Unable to load leads
            </h3>

            <p>{error}</p>

            <button
              type="button"
              className="refresh-button"
              onClick={() =>
                void loadLeads()
              }
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
      {/* ===========================
          PAGE HEADER
      ============================ */}

      <header className="page-header">
        <div>
          <span className="eyebrow">
            CRM / LEADS
          </span>

          <h1>Leads</h1>

          <p>
            Manage, track and follow up with
            your incoming leads.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={() =>
            void loadLeads()
          }
          disabled={loading}
        >
          <span aria-hidden="true">
            ↻
          </span>

          Refresh
        </button>
      </header>

      {/* ===========================
          STATISTICS
      ============================ */}

      <LeadStats leads={leads} />

      {/* ===========================
          LEADS PANEL
      ============================ */}

      <section className="leads-panel">
        <div className="section-header">
          <div>
            <span className="eyebrow">
              PIPELINE
            </span>

            <h2>All Leads</h2>

            <p>
              Showing{" "}
              <strong>
                {filteredLeads.length}
              </strong>{" "}
              of{" "}
              <strong>
                {leads.length}
              </strong>{" "}
              leads
            </p>
          </div>
        </div>

        {/* ===========================
            TOOLBAR
        ============================ */}

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
              value={search}
              placeholder="Search by name, email, phone, company or source..."
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              aria-label="Search leads"
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <select
            className="status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value,
              )
            }
            aria-label="Filter leads by status"
          >
            {STATUS_OPTIONS.map(
              (option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ),
            )}
          </select>
        </div>

        {/* ===========================
            TABLE / EMPTY STATE
        ============================ */}

        {filteredLeads.length > 0 ? (
          <LeadTable
            leads={filteredLeads}
            onOpenLead={onOpenLead}
          />
        ) : (
          <div className="state-card empty-state">
            <div className="state-icon">
              ⌕
            </div>

            <h3>
              No leads found
            </h3>

            <p>
              {search ||
              statusFilter !== "all"
                ? "No leads match your current filters."
                : "There are currently no leads to display."}
            </p>

            {(search ||
              statusFilter !==
                "all") && (
              <button
                type="button"
                className="refresh-button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </section>
    </section>
  );
}
import {
  useEffect,
  useState,
} from "react";

import {
  getLead,
  getLeadAuditLogs,
  updateLeadStatus,
} from "../api/leads";

import type {
  Lead,
  LeadStatus,
} from "../types/lead";

import type {
  AuditLog,
} from "../types/auditLog";

import StatusBadge from "./StatusBadge";

interface LeadDetailProps {
  leadId: string;
  onBack: () => void;
}

function formatDateTime(
  value?: string | null,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function formatEventType(
  value?: string | null,
): string {
  if (!value) {
    return "Activity";
  }

  switch (value.toLowerCase()) {
    case "lead_created":
      return "Lead Created";

    case "lead_updated":
      return "Lead Updated";

    case "lead_status_changed":
      return "Status Changed";

    case "status_changed":
      return "Status Changed";

    default:
      return value
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (letter) =>
          letter.toUpperCase(),
        );
  }
}

function getInitials(
  name?: string | null,
): string {
  if (!name) {
    return "L";
  }

  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "L";
}

function getEventDescription(
  log: AuditLog,
): string {
  const rawLog = log as AuditLog & {
    description?: string | null;
    message?: string | null;
    details?: Record<string, unknown> | null;
  };

  /*
   * Your backend currently returns `description`.
   */
  if (rawLog.description) {
    return rawLog.description;
  }

  /*
   * Support `message` as well in case
   * the backend schema changes later.
   */
  if (rawLog.message) {
    return rawLog.message;
  }

  const eventType =
    String(
      rawLog.event_type ?? "",
    ).toLowerCase();

  switch (eventType) {
    case "lead_created":
      return "Lead was created.";

    case "lead_updated":
      return "Lead information was updated.";

    case "lead_status_changed":
    case "status_changed":
      return "Lead status was changed.";

    default:
      return "Lead activity was recorded.";
  }
}

function getEventIcon(
  eventType?: string | null,
): string {
  switch (
    eventType?.toLowerCase()
  ) {
    case "lead_created":
      return "+";

    case "lead_updated":
      return "✎";

    case "lead_status_changed":
    case "status_changed":
      return "✓";

    default:
      return "•";
  }
}

export default function LeadDetail({
  leadId,
  onBack,
}: LeadDetailProps) {
  const [lead, setLead] =
    useState<Lead | null>(null);

  const [logs, setLogs] =
    useState<AuditLog[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [auditLoading, setAuditLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [updating, setUpdating] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadLead() {
      if (!leadId) {
        setError("Lead ID is missing.");
        setLoading(false);
        setAuditLoading(false);
        return;
      }

      try {
        setLoading(true);
        setAuditLoading(true);
        setError(null);

        /*
         * Load lead first.
         */
        const leadData =
          await getLead(leadId);

        if (cancelled) {
          return;
        }

        setLead(leadData);
        setLoading(false);

        /*
         * Load audit logs separately.
         *
         * Audit failure must not break
         * the lead detail page.
         */
        try {
          const auditData =
            await getLeadAuditLogs(
              leadId,
            );

          if (!cancelled) {
            setLogs(
              Array.isArray(auditData)
                ? auditData
                : [],
            );
          }
        } catch (auditError) {
          console.warn(
            "Unable to load audit history:",
            auditError,
          );

          if (!cancelled) {
            setLogs([]);
          }
        } finally {
          if (!cancelled) {
            setAuditLoading(false);
          }
        }
      } catch (loadError) {
        console.error(
          "Failed to load lead:",
          loadError,
        );

        if (cancelled) {
          return;
        }

        if (
          loadError instanceof Error
        ) {
          setError(
            loadError.message,
          );
        } else {
          setError(
            "Unable to load lead.",
          );
        }

        setLoading(false);
        setAuditLoading(false);
      }
    }

    void loadLead();

    return () => {
      cancelled = true;
    };
  }, [leadId]);

  async function handleStatusChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    if (!lead) {
      return;
    }

    const nextStatus =
      event.target.value as LeadStatus;

    if (
      nextStatus === lead.status
    ) {
      return;
    }

    const previousStatus =
      lead.status;

    try {
      setUpdating(true);
      setError(null);

      const updatedLead =
        await updateLeadStatus(
          lead.id,
          nextStatus,
        );

      setLead(updatedLead);

      /*
       * Reload audit history so the
       * status change immediately appears.
       */
      try {
        const updatedLogs =
          await getLeadAuditLogs(
            lead.id,
          );

        setLogs(
          Array.isArray(updatedLogs)
            ? updatedLogs
            : [],
        );
      } catch (auditError) {
        console.warn(
          "Audit history could not be refreshed:",
          auditError,
        );
      }
    } catch (updateError) {
      console.error(
        "Failed to update lead status:",
        updateError,
      );

      /*
       * Keep UI state consistent if
       * the update failed.
       */
      setLead({
        ...lead,
        status: previousStatus,
      });

      if (
        updateError instanceof Error
      ) {
        setError(
          updateError.message,
        );
      } else {
        setError(
          "Failed to update lead status.",
        );
      }
    } finally {
      setUpdating(false);
    }
  }

  /*
   * Loading
   */
  if (loading) {
    return (
      <div className="lead-detail-page">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← Back to Leads
        </button>

        <section className="detail-card">
          <div className="loading-state">
            <div className="loading-spinner" />

            <h2>
              Loading lead...
            </h2>

            <p>
              Please wait while we load
              the lead information.
            </p>
          </div>
        </section>
      </div>
    );
  }

  /*
   * Error
   */
  if (error || !lead) {
    return (
      <div className="lead-detail-page">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← Back to Leads
        </button>

        <section className="detail-card error-card">
          <span className="eyebrow">
            LEAD DETAILS
          </span>

          <h2>
            Unable to load lead
          </h2>

          <p>
            {error ||
              "Lead was not found."}
          </p>
        </section>
      </div>
    );
  }

  const externalLeadId =
    (
      lead as Lead & {
        external_lead_id?: string | null;
      }
    ).external_lead_id;

  return (
    <div className="lead-detail-page">

      {/* =====================================
          TOP NAVIGATION
      ====================================== */}

      <div className="detail-page-header">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← Back to Leads
        </button>
      </div>

      {/* =====================================
          HERO
      ====================================== */}

      <section className="detail-card lead-hero-card">
        <div className="lead-hero">

          <div className="avatar avatar-large">
            {getInitials(
              lead.name,
            )}
          </div>

          <div className="lead-hero-content">
            <span className="eyebrow">
              LEAD DETAILS
            </span>

            <h1>
              {lead.name ||
                "Unnamed Lead"}
            </h1>

            <div className="lead-meta">
              <span>
                ID: {lead.id}
              </span>

              <span className="meta-separator">
                •
              </span>

              <span>
                Created{" "}
                {formatDateTime(
                  lead.created_at,
                )}
              </span>
            </div>
          </div>

          <div className="lead-hero-status">
            <StatusBadge
              status={lead.status}
            />
          </div>
        </div>
      </section>

      {/* =====================================
          STATUS
      ====================================== */}

      <section className="detail-card">
        <div className="card-header">
          <div>
            <span className="eyebrow">
              PIPELINE
            </span>

            <h2>
              Lead Status
            </h2>
          </div>
        </div>

        <div className="status-control">
          <div className="status-control-label">
            <label htmlFor="lead-status">
              Current status
            </label>

            <span>
              Change the current pipeline
              stage for this lead.
            </span>
          </div>

          <select
            id="lead-status"
            value={lead.status}
            onChange={
              handleStatusChange
            }
            disabled={updating}
          >
            <option value="new">
              New
            </option>

            <option value="contacted">
              Contacted
            </option>

            <option value="qualified">
              Qualified
            </option>

            <option value="converted">
              Converted
            </option>

            <option value="lost">
              Lost
            </option>
          </select>

          {updating && (
            <span className="status-updating">
              Updating...
            </span>
          )}
        </div>

        {error && (
          <div className="inline-error">
            {error}
          </div>
        )}
      </section>

      {/* =====================================
          CONTACT INFORMATION
      ====================================== */}

      <section className="detail-card">
        <div className="card-header">
          <div>
            <span className="eyebrow">
              CONTACT
            </span>

            <h2>
              Contact Information
            </h2>
          </div>
        </div>

        <div className="details-grid">

          <div className="detail-field">
            <span className="field-label">
              Full Name
            </span>

            <strong>
              {lead.name || "—"}
            </strong>
          </div>

          <div className="detail-field">
            <span className="field-label">
              Email
            </span>

            <strong>
              {lead.email || "—"}
            </strong>
          </div>

          <div className="detail-field">
            <span className="field-label">
              Phone
            </span>

            <strong>
              {lead.phone || "—"}
            </strong>
          </div>

          <div className="detail-field">
            <span className="field-label">
              Source
            </span>

            <strong>
              {lead.source ||
                "Unknown"}
            </strong>
          </div>

        </div>
      </section>

      {/* =====================================
          LEAD INFORMATION
      ====================================== */}

      <section className="detail-card">
        <div className="card-header">
          <div>
            <span className="eyebrow">
              INFORMATION
            </span>

            <h2>
              Lead Information
            </h2>
          </div>
        </div>

        <div className="details-grid">

          <div className="detail-field">
            <span className="field-label">
              Lead ID
            </span>

            <strong className="break-word">
              {lead.id}
            </strong>
          </div>

          <div className="detail-field">
            <span className="field-label">
              External Lead ID
            </span>

            <strong className="break-word">
              {externalLeadId ||
                "—"}
            </strong>
          </div>

          <div className="detail-field">
            <span className="field-label">
              Created
            </span>

            <strong>
              {formatDateTime(
                lead.created_at,
              )}
            </strong>
          </div>

          <div className="detail-field">
            <span className="field-label">
              Last Updated
            </span>

            <strong>
              {formatDateTime(
                lead.updated_at ||
                  lead.created_at,
              )}
            </strong>
          </div>

        </div>
      </section>

      {/* =====================================
          NOTES
      ====================================== */}

      <section className="detail-card">
        <div className="card-header">
          <div>
            <span className="eyebrow">
              NOTES
            </span>

            <h2>
              Notes
            </h2>
          </div>
        </div>

        <div className="notes-section">
          <p>
            No notes have been added
            for this lead.
          </p>
        </div>
      </section>

      {/* =====================================
          ACTIVITY TIMELINE
      ====================================== */}

      <section className="detail-card activity-card">
        <div className="card-header">
          <div>
            <span className="eyebrow">
              ACTIVITY
            </span>

            <h2>
              Activity Timeline
            </h2>
          </div>

          {!auditLoading &&
            logs.length > 0 && (
              <span className="activity-count">
                {logs.length}{" "}
                {logs.length === 1
                  ? "event"
                  : "events"}
              </span>
            )}
        </div>

        {auditLoading ? (
          <div className="activity-loading">
            <div className="loading-spinner" />

            <p>
              Loading activity history...
            </p>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              ◷
            </div>

            <h3>
              No activity yet
            </h3>

            <p>
              Changes to this lead
              will appear here.
            </p>
          </div>
        ) : (
          <div className="activity-timeline">

            {logs.map(
              (log, index) => {
                const rawLog =
                  log as AuditLog & {
                    id?: string;
                    event_type?: string;
                    created_at?: string;
                    description?: string;
                    message?: string;
                  };

                const eventType =
                  rawLog.event_type ||
                  "";

                const createdAt =
                  rawLog.created_at ||
                  null;

                return (
                  <div
                    className="activity-item"
                    key={
                      rawLog.id ||
                      `${eventType}-${createdAt}-${index}`
                    }
                  >

                    <div className="activity-marker">
                      <span>
                        {getEventIcon(
                          eventType,
                        )}
                      </span>
                    </div>

                    <div className="activity-content">

                      <div className="activity-top">
                        <strong>
                          {formatEventType(
                            eventType,
                          )}
                        </strong>

                        <time>
                          {formatDateTime(
                            createdAt,
                          )}
                        </time>
                      </div>

                      <p>
                        {getEventDescription(
                          log,
                        )}
                      </p>

                    </div>
                  </div>
                );
              },
            )}

          </div>
        )}
      </section>

      {/* =====================================
          FOOTER
      ====================================== */}

      <div className="detail-footer">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← Back to Leads
        </button>
      </div>

    </div>
  );
}
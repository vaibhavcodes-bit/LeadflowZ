import { useEffect, useState } from "react";

import {
  getLead,
  updateLead,
  updateLeadStatus,
} from "../api/leads";

import type { Lead } from "../types/lead";

interface LeadDetailProps {
  leadId: string;
  onBack: () => void;
}

const STATUS_OPTIONS = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
];

function formatDate(value?: string | null): string {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
}

function getStatusClass(status: string): string {
  return `status-badge status-${status.toLowerCase()}`;
}

export default function LeadDetail({
  leadId,
  onBack,
}: LeadDetailProps) {
  const [lead, setLead] = useState<Lead | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("");
  const [notes, setNotes] = useState("");

  async function loadLead() {
    try {
      setLoading(true);
      setError(null);

      const data = await getLead(leadId);

      setLead(data);

      setName(data.name);
      setEmail(data.email ?? "");
      setPhone(data.phone ?? "");
      setSource(data.source ?? "");
      setNotes(data.notes ?? "");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load lead",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialLead() {
      try {
        const data = await getLead(leadId);

        if (cancelled) {
          return;
        }

        setLead(data);
        setName(data.name);
        setEmail(data.email ?? "");
        setPhone(data.phone ?? "");
        setSource(data.source ?? "");
        setNotes(data.notes ?? "");
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load lead",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialLead();

    return () => {
      cancelled = true;
    };
  }, [leadId]);

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const updatedLead = await updateLead(leadId, {
            name,
            email,
            phone,
            source,
          });

      setLead(updatedLead);

      setName(updatedLead.name);
      setEmail(updatedLead.email ?? "");
      setPhone(updatedLead.phone ?? "");
      setSource(updatedLead.source ?? "");
      setNotes(updatedLead.notes ?? "");

      setEditing(false);
      setSuccess("Lead updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update lead",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const newStatus = event.target.value;

    if (!lead || newStatus === lead.status) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const updatedLead = await updateLeadStatus(
        leadId,
        newStatus,
      );

      setLead(updatedLead);

      setSuccess("Lead status updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update lead status",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    if (!lead) {
      return;
    }

    setName(lead.name);
    setEmail(lead.email ?? "");
    setPhone(lead.phone ?? "");
    setSource(lead.source ?? "");
    setNotes(lead.notes ?? "");

    setEditing(false);
    setError(null);
    setSuccess(null);
  }

  if (loading) {
    return (
      <section className="lead-page">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← Back to Leads
        </button>

        <div className="state-card">
          <div className="loading-spinner" />
          <p>Loading lead...</p>
        </div>
      </section>
    );
  }

  if (error && !lead) {
    return (
      <section className="lead-page">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← Back to Leads
        </button>

        <div className="state-card error-state">
          <div className="state-icon">!</div>

          <div>
            <h3>Unable to load lead</h3>
            <p>{error}</p>

            <button
              type="button"
              className="refresh-button"
              onClick={() => void loadLead()}
            >
              Try again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!lead) {
    return null;
  }

  return (
    <section className="lead-page">
      <div className="detail-topbar">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← Back to Leads
        </button>
      </div>

      <div className="detail-header">
        <div>
          <span className="eyebrow">CRM / LEADS / DETAIL</span>

          <h1>{lead.name}</h1>

          <p>
            Lead created {formatDate(lead.created_at)}
          </p>
        </div>

        <div className="detail-status">
          <label htmlFor="lead-status">
            Status
          </label>

          <select
            id="lead-status"
            className={getStatusClass(lead.status)}
            value={lead.status.toLowerCase()}
            onChange={handleStatusChange}
            disabled={saving}
          >
            {STATUS_OPTIONS.map((status) => (
              <option
                value={status}
                key={status}
              >
                {status.charAt(0).toUpperCase() +
                  status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="detail-message error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="detail-message success-message">
          {success}
        </div>
      )}

      <div className="detail-grid">
        <div className="detail-card">
          <div className="detail-card-header">
            <div>
              <span className="eyebrow">
                CONTACT
              </span>

              <h2>Contact Information</h2>
            </div>
          </div>

          <div className="detail-fields">
            <div className="detail-field">
              <span>Name</span>

              {editing ? (
                <input
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                />
              ) : (
                <strong>{lead.name}</strong>
              )}
            </div>

            <div className="detail-field">
              <span>Email</span>

              {editing ? (
                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                />
              ) : (
                <strong>
                  {lead.email || "Not provided"}
                </strong>
              )}
            </div>

            <div className="detail-field">
              <span>Phone</span>

              {editing ? (
                <input
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                />
              ) : (
                <strong>
                  {lead.phone || "Not provided"}
                </strong>
              )}
            </div>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-card-header">
            <div>
              <span className="eyebrow">
                LEAD DETAILS
              </span>

              <h2>Lead Information</h2>
            </div>
          </div>

          <div className="detail-fields">
            <div className="detail-field">
              <span>Source</span>

              {editing ? (
                <input
                  value={source}
                  onChange={(event) =>
                    setSource(event.target.value)
                  }
                />
              ) : (
                <strong>
                  {lead.source || "Not provided"}
                </strong>
              )}
            </div>

            <div className="detail-field">
              <span>Status</span>

              <strong>
                <span
                  className={getStatusClass(
                    lead.status,
                  )}
                >
                  {lead.status}
                </span>
              </strong>
            </div>

            <div className="detail-field">
              <span>External Lead ID</span>

              <strong>
                {lead.external_lead_id ||
                  "Not provided"}
              </strong>
            </div>

            <div className="detail-field">
              <span>Created</span>

              <strong>
                {formatDate(lead.created_at)}
              </strong>
            </div>

            <div className="detail-field">
              <span>Last Updated</span>

              <strong>
                {formatDate(lead.updated_at)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-card notes-card">
        <div className="detail-card-header">
          <div>
            <span className="eyebrow">
              NOTES
            </span>

            <h2>Lead Notes</h2>
          </div>
        </div>

        {editing ? (
          <textarea
            value={notes}
            onChange={(event) =>
              setNotes(event.target.value)
            }
            placeholder="Add notes about this lead..."
            rows={6}
          />
        ) : (
          <p className="lead-notes">
            {lead.notes || "No notes added yet."}
          </p>
        )}
      </div>

      <div className="detail-actions">
        {editing ? (
          <>
            <button
              type="button"
              className="secondary-button"
              onClick={handleCancelEdit}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="refresh-button"
              onClick={() => void handleSave()}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="refresh-button"
            onClick={() => {
              setSuccess(null);
              setError(null);
              setEditing(true);
            }}
          >
            Edit Lead
          </button>
        )}
      </div>
    </section>
  );
}
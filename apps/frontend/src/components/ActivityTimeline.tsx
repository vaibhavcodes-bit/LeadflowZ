import { useEffect, useState } from "react";

import { getLeadAuditLogs } from "../api/leads";
import type { AuditLog } from "../types/auditLog";

interface ActivityTimelineProps {
  leadId: string;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

function getEventLabel(eventType: string): string {
  return eventType
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getEventIcon(eventType: string): string {
  switch (eventType.toUpperCase()) {
    case "LEAD_CREATED":
      return "+";

    case "LEAD_UPDATED":
      return "✎";

    case "STATUS_CHANGED":
      return "↻";

    default:
      return "•";
  }
}

export function ActivityTimeline({
  leadId,
}: ActivityTimelineProps) {
  const [activities, setActivities] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadActivities() {
      try {
        setLoading(true);
        setError(null);

        const data = await getLeadAuditLogs(leadId);

        if (!cancelled) {
          setActivities(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load activity",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadActivities();

    return () => {
      cancelled = true;
    };
  }, [leadId]);

  return (
    <section className="activity-section">
      <div className="section-header">
        <div>
          <h2>Activity Timeline</h2>

          <p>
            Recent activity and changes for this lead.
          </p>
        </div>
      </div>

      {loading && (
        <div className="state-card">
          <div className="loading-spinner" />

          <p>Loading activity...</p>
        </div>
      )}

      {!loading && error && (
        <div className="state-card error-state">
          <div className="state-icon">!</div>

          <div>
            <h3>Unable to load activity</h3>

            <p>{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && activities.length === 0 && (
        <div className="state-card empty-state">
          <div className="state-icon">•</div>

          <h3>No activity yet</h3>

          <p>
            Activity for this lead will appear here.
          </p>
        </div>
      )}

      {!loading && !error && activities.length > 0 && (
        <div className="activity-timeline">
          {activities.map((activity) => (
            <div
              className="activity-item"
              key={activity.id}
            >
              <div className="activity-marker">
                {getEventIcon(activity.event_type)}
              </div>

              <div className="activity-content">
                <div className="activity-top">
                  <h3>
                    {getEventLabel(activity.event_type)}
                  </h3>

                  <time dateTime={activity.created_at}>
                    {formatDate(activity.created_at)}
                  </time>
                </div>

                {activity.description && (
                  <p>{activity.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
import type { AuditLog } from "../types/auditLog";

interface ActivityTimelineProps {
  logs: AuditLog[];
}

function formatDateTime(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Unknown date";
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getEventLabel(eventType: string) {
  switch (eventType) {
    case "lead_created":
      return "Lead Created";

    case "lead_updated":
      return "Lead Updated";

    case "lead_status_changed":
      return "Status Changed";

    default:
      return eventType
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
  }
}

export default function ActivityTimeline({
  logs,
}: ActivityTimelineProps) {
  if (!logs.length) {
    return (
      <section className="timeline-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ACTIVITY</span>
            <h2>Activity Timeline</h2>
          </div>
        </div>

        <div className="empty-state">
          <div className="empty-icon">◷</div>

          <h3>No activity yet</h3>

          <p>
            Changes to this lead will appear here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="timeline-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">ACTIVITY</span>
          <h2>Activity Timeline</h2>
        </div>
      </div>

      <div className="activity-timeline">
        {logs.map((log) => (
          <div
            className="timeline-item"
            key={log.id}
          >
            <div className="timeline-marker">
              <span />
            </div>

            <div className="timeline-content">
              <div className="timeline-header">
                <strong>
                  {getEventLabel(log.event_type)}
                </strong>

                <span className="timeline-date">
                  {formatDateTime(log.created_at)}
                </span>
              </div>

              <p className="timeline-message">
                {log.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
import type { LeadStatus } from "../types/lead";

interface StatusBadgeProps {
  status: LeadStatus | string;
}

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();

  const label =
    normalizedStatus.charAt(0).toUpperCase() +
    normalizedStatus.slice(1);

  return (
    <span
      className={`status-badge status-${normalizedStatus}`}
    >
      <span className="status-dot" />
      {label}
    </span>
  );
}
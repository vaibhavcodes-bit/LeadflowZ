import type { Lead } from "../types/lead";

interface StatusBadgeProps {
  status: Lead["status"];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();

  const statusConfig: Record<
    string,
    {
      label: string;
      className: string;
    }
  > = {
    new: {
      label: "New",
      className: "status-new",
    },
    qualified: {
      label: "Qualified",
      className: "status-qualified",
    },
    contacted: {
      label: "Contacted",
      className: "status-contacted",
    },
    converted: {
      label: "Converted",
      className: "status-converted",
    },
    lost: {
      label: "Lost",
      className: "status-lost",
    },
  };

  const config = statusConfig[normalizedStatus] ?? {
    label: status,
    className: "status-default",
  };

  return (
    <span className={`status-badge ${config.className}`}>
      <span className="status-dot" />
      {config.label}
    </span>
  );
}
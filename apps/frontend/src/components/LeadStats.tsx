import type { Lead } from "../types/lead";

interface LeadStatsProps {
  leads: Lead[];
}

interface StatCardProps {
  label: string;
  value: number;
  description: string;
  icon: string;
  className?: string;
}

function StatCard({
  label,
  value,
  description,
  icon,
  className = "",
}: StatCardProps) {
  return (
    <article
      className={`stat-card ${className}`.trim()}
    >
      <div className="stat-card-top">
        <span className="stat-label">
          {label}
        </span>

        <span
          className="stat-icon"
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>

      <strong className="stat-value">
        {value}
      </strong>

      <span className="stat-description">
        {description}
      </span>
    </article>
  );
}

export default function LeadStats({
  leads,
}: LeadStatsProps) {
  const getStatusCount = (status: string) =>
    leads.filter(
      (lead) =>
        String(lead.status).toLowerCase() ===
        status.toLowerCase(),
    ).length;

  const total = leads.length;
  const newLeads = getStatusCount("new");
  const qualified = getStatusCount("qualified");
  const converted = getStatusCount("converted");

  return (
    <section
      className="stats-grid"
      aria-label="Lead statistics"
    >
      <StatCard
        label="Total Leads"
        value={total}
        description="All incoming leads"
        icon="◎"
      />

      <StatCard
        label="New"
        value={newLeads}
        description="Needs attention"
        icon="✦"
      />

      <StatCard
        label="Qualified"
        value={qualified}
        description="Sales qualified"
        icon="✓"
      />

      <StatCard
        label="Converted"
        value={converted}
        description="Successfully converted"
        icon="↗"
      />
    </section>
  );
}
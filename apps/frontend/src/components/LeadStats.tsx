import type { Lead } from "../types/lead";

interface LeadStatsProps {
  leads: Lead[];
}

export function LeadStats({ leads }: LeadStatsProps) {
  const total = leads.length;

  const newLeads = leads.filter(
    (lead) => lead.status.toLowerCase() === "new",
  ).length;

  const qualified = leads.filter(
    (lead) => lead.status.toLowerCase() === "qualified",
  ).length;

  const converted = leads.filter(
    (lead) => lead.status.toLowerCase() === "converted",
  ).length;

  const stats = [
    {
      label: "Total Leads",
      value: total,
      description: "All incoming leads",
      icon: "◉",
    },
    {
      label: "New",
      value: newLeads,
      description: "Needs attention",
      icon: "+",
    },
    {
      label: "Qualified",
      value: qualified,
      description: "Sales qualified",
      icon: "✓",
    },
    {
      label: "Converted",
      value: converted,
      description: "Successfully converted",
      icon: "↗",
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <div className="stat-card" key={stat.label}>
          <div>
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value">{stat.value}</p>
            <p className="stat-description">{stat.description}</p>
          </div>

          <div className="stat-icon">{stat.icon}</div>
        </div>
      ))}
    </div>
  );
}
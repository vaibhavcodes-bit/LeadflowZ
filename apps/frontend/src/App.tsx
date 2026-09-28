import { useState } from "react";

import LeadList from "./components/LeadList";
import LeadDetail from "./components/LeadDetail";

import "./App.css";

type Page = "list" | "detail";

function App() {
  const [page, setPage] = useState<Page>("list");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const handleOpenLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    setPage("detail");
  };

  const handleBack = () => {
    setSelectedLeadId(null);
    setPage("list");
  };

  return (
    <div className="app">
      {page === "list" && (
        <LeadList onOpenLead={handleOpenLead} />
      )}

      {page === "detail" && selectedLeadId && (
        <LeadDetail
          leadId={selectedLeadId}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default App;
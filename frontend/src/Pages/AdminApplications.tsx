import React, { useState } from "react";
import BackgroundAnimation from "../components/common/BackgroundAnimation";
import AnalyticsSummary from "../components/admin/AnalyticsSummary";
import CompanyApplicationsTable from "../components/admin/CompanyApplicationsTable";
import ErrorBoundary from "../components/common/ErrorBoundary";
import "./AdminApplications.css";

export default function AdminApplications() {
  const [tab, setTab] = useState<"analytics" | "manage">("analytics");

  return (
    <div className="adminApplications">
      <BackgroundAnimation />
      <div className="container">
        <header className="header">
          <h1>Applications hub</h1>
          <p>Switch between analytics and application management.</p>
        </header>

        <div className="tabs">
          <button className={`tabBtn ${tab==="analytics"?"tabBtn--active":""}`} onClick={() => setTab("analytics")}>Analytics</button>
          <button className={`tabBtn ${tab==="manage"?"tabBtn--active":""}`} onClick={() => setTab("manage")}>Application management</button>
        </div>

        <div className="section">
          <ErrorBoundary>
            {tab === "analytics" ? <AnalyticsSummary /> : <CompanyApplicationsTable />}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

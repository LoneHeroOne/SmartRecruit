import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { ensureChartJSRegistered } from "../../lib/chartjs";
import api from "../../Services/apiClient";
import "./AnalyticsSummary.css";

ensureChartJSRegistered();

function formatStatusLabel(s?: string | null) {
  return s ? s.replace(/_/g, " ") : "—";
}
function statusMod(s?: string | null) {
  return s && s.trim() ? s : "pending";
}

type TrendPoint = { date: string; applications: number };
type Summary = {
  jobs: number; open_jobs: number; applications: number;
  by_status: Record<string, number>;
  score_histogram?: Record<string, number>;
  trend_30d?: TrendPoint[];   // <— we’ll use this
};

export default function AnalyticsSummary() {
  const [data, setData] = useState<Summary | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/company/analytics/summary");
        setData(r.data);
      } catch (e: any) {
        const code = e?.response?.status;
        if (code === 403 || code === 404) {
          try {
            const r2 = await api.get("/admin/analytics/summary");
            setData(r2.data);
          } catch (e2: any) {
            setErr("Failed to load analytics");
          }
        } else {
          setErr(e?.response?.data?.detail || "Failed to load analytics");
        }
      }
    })();
  }, []);

  if (err) return <div className="error">{err}</div>;
  if (!data) return <div>Loading analytics…</div>;

  const trend = Array.isArray(data.trend_30d) ? data.trend_30d : [];
  const labels = trend.map(p => p.date ?? "").filter(Boolean);
  const counts = trend.map(p => Number(p.applications ?? 0));

  const barData = {
    labels,
    datasets: [{ label: "Applications (last 30 days)", data: counts }]
  };

  return (
    <section className="analyticsSummary">
      {/* KPIs */}
      <div className="kpis">
        <div className="card kpi">
          <div className="kpi__label">Jobs</div>
          <div className="kpi__value">{data.jobs ?? 0}</div>
        </div>
        <div className="card kpi">
          <div className="kpi__label">Open Jobs</div>
          <div className="kpi__value">{data.open_jobs ?? 0}</div>
        </div>
        <div className="card kpi">
          <div className="kpi__label">Applications</div>
          <div className="kpi__value">{data.applications ?? 0}</div>
        </div>
        {"avg_score" in data && (
          <div className="card kpi">
            <div className="kpi__label">Avg. Score</div>
            <div className="kpi__value">{(data as any).avg_score?.toFixed?.(2) ?? "—"}</div>
          </div>
        )}
      </div>

      {/* By status pills if present */}
      {data.by_status && (
        <div className="card">
          <div style={{marginBottom:8,opacity:.85}}>By status</div>
          <div className="toolbar">
            {Object.entries(data.by_status).map(([k,v]) => {
              const mod = statusMod(k);
              return (
                <span key={k} className={`pill pill--${mod}`}>
                  {formatStatusLabel(k)}: {v as number}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Top jobs + Recent apps (if provided by company summary) */}
      <div className="gridTwo">
        {"top_jobs_by_apps" in (data as any) && (
          <div className="card">
            <h3 style={{margin:"4px 0 10px"}}>Top jobs (by applications)</h3>
            <table className="table table--dense">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Applications</th>
                </tr>
              </thead>
              <tbody>
                {(data as any).top_jobs_by_apps?.map?.((row: any) => (
                  <tr key={row.id}>
                    <td>{row.title}</td>
                    <td>{row.applications}</td>
                  </tr>
                )) || null}
              </tbody>
            </table>
          </div>
        )}

        {"recent_applications" in (data as any) && (
          <div className="card">
            <h3 style={{margin:"4px 0 10px"}}>Recent applications</h3>
            <table className="table table--dense">
              <thead><tr><th>Candidate</th><th>Job</th><th>Score</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {(data as any).recent_applications?.map?.((r: any, i: number) => (
                  <tr key={i}>
                    <td>{r.candidate_email ?? "—"}</td>
                    <td>{r.job_title ?? "—"}</td>
                    <td>{r.score ?? "—"}</td>
                    <td>
                      <span className={`pill pill--${statusMod(r.status)}`}>
                        {formatStatusLabel(r.status)}
                      </span>
                    </td>
                    <td>{r.applied_at ? new Date(r.applied_at).toLocaleDateString() : "—"}</td>
                  </tr>
                )) || null}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 30-day histogram (if present) */}
      {!!trend.length && (
        <div className="card">
          <h3 style={{margin:"4px 0 12px"}}>Application volume — last 30 days</h3>
          <div className="chartBox">
            <Bar key={labels.join("|")} data={barData} options={{responsive:true,maintainAspectRatio:false}} redraw />
          </div>
        </div>
      )}
    </section>
  );
}

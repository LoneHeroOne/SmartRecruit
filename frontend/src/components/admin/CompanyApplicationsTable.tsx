import { useEffect, useMemo, useState } from "react";
import {
  fetchAdminJobs,
  fetchAdminJobApplications,
  bulkSetApplicationStatus,
  setApplicationStatus,
  type AdminJob,
  type AdminJobApp,
} from "../../Services/applicationsApi";
import "./CompanyApplicationsTable.css";

function formatStatusLabel(s?: string | null) {
  return s ? s.replace(/_/g, " ") : "—";
}
function statusMod(s?: string | null) {
  return s && s.trim() ? s : "pending";
}

type SortKey = "score_desc" | "score_asc";
type StatusFilter = "all" | "pending" | "accepted" | "rejected";

export default function CompanyApplicationsTable() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [apps, setApps] = useState<AdminJobApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [sort, setSort] = useState<SortKey>("score_desc");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("all");

  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const selectedIds = useMemo(
    () => Object.keys(selected).filter((k) => !!selected[+k]).map(Number),
    [selected]
  );
  const allChecked = useMemo(
    () => apps.length > 0 && apps.every((a) => selected[a.id]),
    [apps, selected]
  );

  // initial load: jobs then first job's apps
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const j = await fetchAdminJobs();
        if (!mounted) return;
        setJobs(j);
        const first = j[0]?.id ?? null;
        setSelectedJobId(first);
      } catch (e: any) {
        if (!mounted) return;
        const msg = e?.response?.data?.detail || e?.message || "Request failed.";
        setErr(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // load apps for selected job + options
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!selectedJobId) {
        setApps([]);
        return;
      }
      setLoading(true);
      try {
        const apps = await fetchAdminJobApplications(selectedJobId, {
          sort,
          status: filterStatus === "all" ? undefined : filterStatus,
        });
        if (!mounted) return;
        setApps(apps);
        setSelected({});
        setErr(null);
      } catch (e: any) {
        if (!mounted) return;
        const msg = e?.response?.data?.detail || e?.message || "Request failed.";
        setErr(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [selectedJobId, sort, filterStatus]);

  const toggleAll = () => {
    if (allChecked) {
      setSelected({});
    } else {
      const map: Record<number, boolean> = {};
      apps.forEach((a) => (map[a.id] = true));
      setSelected(map);
    }
  };

  const onRowCheck = (id: number, checked: boolean) =>
    setSelected((s) => ({ ...s, [id]: checked }));

  const onBulkAction = async (status: "accepted" | "rejected") => {
    if (selectedIds.length === 0) return;
    const prev = apps;
    // optimistic UI
    setApps((list) =>
      list.map((a) => (selectedIds.includes(a.id) ? { ...a, status } : a))
    );
    try {
      const { ok, fail } = await bulkSetApplicationStatus(selectedIds, status);
      if (fail > 0) {
        alert(`Partial success: ${ok} updated, ${fail} failed.`);
        // Reload to be safe:
        if (selectedJobId) {
          const fresh = await fetchAdminJobApplications(selectedJobId, {
            sort,
            status: filterStatus === "all" ? undefined : filterStatus,
          });
          setApps(fresh);
        }
      }
      setSelected({});
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Bulk update failed.");
      setApps(prev); // revert
    }
  };

  const onRowStatusChange = async (id: number, status: "accepted" | "rejected") => {
    const prev = apps;
    setApps((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
    try {
      await setApplicationStatus(id, status);
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Update failed.");
      setApps(prev);
    }
  };

  return (
    <div>
      {/* Controls */}
      <div className="toolbar">
        <label style={{ opacity: 0.8 }}>Job</label>
        <select value={selectedJobId ?? ""} onChange={(e) => setSelectedJobId(e.target.value ? Number(e.target.value) : null)} className="input">
          {jobs.length === 0 && <option value="">— No jobs —</option>}
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title} {j.status ? `(${j.status})` : ""}
            </option>
          ))}
        </select>

        <label style={{ opacity: 0.8 }}>Status</label>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as StatusFilter)} className="input">
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>

        <label style={{ opacity: 0.8 }}>Sort</label>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="input">
          <option value="score_desc">Score: high → low</option>
          <option value="score_asc">Score: low → high</option>
        </select>

        <div className="toolbar__spacer" />
        <button className="btn btn-outline" disabled={selectedIds.length === 0} onClick={() => onBulkAction("accepted")}>
          Set Accepted ({selectedIds.length})
        </button>
        <button className="btn btn-outline" disabled={selectedIds.length === 0} onClick={() => onBulkAction("rejected")}>
          Set Rejected ({selectedIds.length})
        </button>
      </div>

      {/* Table */}
      <div className="card">
        <div className="tableWrap">
        <div className="thead">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={allChecked} onChange={toggleAll} />
            <span style={{ fontSize: 12, opacity: 0.8 }}>Select all</span>
          </div>
          <div>ID</div>
          <div>Score</div>
          <div>Job title</div>
          <div>Status</div>
          <div>Applied at</div>
          <div>Actions</div>
        </div>

        {loading && <div className="trow" style={{ opacity: 0.7 }}>Loading…</div>}
        {err && !loading && (
          <div className="trow" style={{ color: "#f66" }}>{err}</div>
        )}
        {!loading && !err && apps.length === 0 && (
          <div className="trow" style={{ opacity: 0.7 }}>No applications.</div>
        )}

        {!loading &&
          !err &&
          apps.map((a) => (
            <div key={a.id} className="trow">
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={!!selected[a.id]}
                  onChange={(e) => onRowCheck(a.id, e.target.checked)}
                />
              </div>
              <div>#{a.id}</div>
              <div>{a.score == null ? "—" : a.score}</div>
              <div>{a.job_title}</div>
              <div>
                <span className={`badge badge--${statusMod(a.status)}`}>
                  {formatStatusLabel(a.status)}
                </span>
              </div>
              <div style={{ whiteSpace: "nowrap" }}>
                {a.applied_at ? new Date(a.applied_at).toLocaleString() : "—"}
              </div>
              <div className="btnRow">
                <button
                  className="btn"
                  style={{ padding: "0.4em 1.0em", fontWeight: 200 }}
                  onClick={() => onRowStatusChange(a.id, "accepted")}
                >
                  Accept
                </button>
                <button
                  className="btn"
                  style={{ padding: "0.4em 1.0em", fontWeight: 200, marginLeft: 6 }}
                  onClick={() => onRowStatusChange(a.id, "rejected")}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

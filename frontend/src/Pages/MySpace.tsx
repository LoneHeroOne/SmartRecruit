import { useEffect, useState } from "react";
import apiClient from "../Services/apiClient";
import { getCompanyMe, patchCompanyMe, uploadCompanyLogo } from "../Services/companyApi";

type Me = { id: number; email: string; full_name?: string; is_admin?: boolean; account_type?: "candidate"|"company"; company_name?: string; sector?: string };
type CV = { id: number; file_path: string; uploaded_at: string };
type MyApp = { id: number; job_id: number; job_title: string; status: string; score?: number | null; applied_at: string };

export default function MySpace() {
  const [me, setMe] = useState<Me | null>(null);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [apps, setApps] = useState<MyApp[]>([]);
  const [co, setCo] = useState<any | null>(null);
  const [desc, setDesc] = useState("");
  const [upBusy, setUpBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const meRes = await apiClient.get("/users/me");
        const meData = meRes.data as Me;
        let coData = null;
        if (meData.account_type === "company") {
          coData = (await getCompanyMe()).data;
        } else {
          // candidate: parallel load CV + apps
          const [cvRes, appRes] = await Promise.all([ apiClient.get("/cvs"), apiClient.get("/applications/me") ]);
          setCvs(cvRes.data || []); setApps(appRes.data || []);
        }
        if (!mounted) return;
        setMe(meData);
        if (coData) { setCo(coData); setDesc(coData.company_description || ""); }
        setErr(null);
      } catch (e:any) {
        setErr(e?.response?.data?.detail || "Impossible de charger vos données.");
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Chargement…</div>;
  if (err) return <div style={{ padding: 16, color: "#f66" }}>{err}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Mon espace</h2>

      {/* Candidate view stays the same */}
      {me?.account_type !== "company" && (
        <>
          <section className="card glass" style={{ padding: 16, marginBottom: 16 }}>
            <h3>Profil</h3>
            <div>Email : {me?.email}</div>
            <div>Nom : {me?.full_name ?? "—"}</div>
            <div>Rôle : {me?.is_admin ? "Admin" : "Candidat"}</div>
          </section>

          <section className="card glass" style={{ padding: 16, marginBottom: 16 }}>
            <h3>Mes CV</h3>
            {cvs.length === 0 ? (
              <div>Vous n’avez pas encore téléversé de CV.</div>
            ) : (
              <ul>
                {cvs.map(cv => (
                  <li key={cv.id}>
                    {cv.file_path} — {new Date(cv.uploaded_at).toLocaleString()}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card glass" style={{ padding: 16 }}>
            <h3>Mes candidatures</h3>
            {apps.length === 0 ? (
              <div>Vous n’avez pas encore postulé.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: 6 }}>Offre</th>
                    <th style={{ textAlign: "left", padding: 6 }}>Statut</th>
                    <th style={{ textAlign: "left", padding: 6 }}>Score</th>
                    <th style={{ textAlign: "left", padding: 6 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map(a => (
                    <tr key={a.id}>
                      <td style={{ padding: 6 }}>{a.job_title}</td>
                      <td style={{ padding: 6 }}>{a.status}</td>
                      <td style={{ padding: 6 }}>{a.score ?? "—"}</td>
                      <td style={{ padding: 6 }}>{new Date(a.applied_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}

      {/* Company view */}
      {me?.account_type === "company" && (
        <section className="card glass" style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Profil Entreprise</h3>
          <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: 16, alignItems: "start" }}>
            <div>
              <div style={{ width: 96, height: 96, borderRadius: 8, overflow: "hidden", background: "#222", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {co?.company_logo_url ? (
                  <img src={co.company_logo_url} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 22, opacity: .7 }}>{(co?.company_name || "??").slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <label className="btn" style={{ display: "inline-block", marginTop: 8 }}>
                Changer le logo
                <input type="file" accept="image/png,image/jpeg" style={{ display: "none" }}
                  onChange={async (e) => {
                    const f = e.target.files?.[0]; if (!f) return;
                    setUpBusy(true);
                    try {
                      const res = await uploadCompanyLogo(f);
                      setCo({ ...co, company_logo_url: res.data.company_logo_url });
                    } catch (err: any) {
                      alert(err?.response?.data?.detail || "Échec de l'upload du logo");
                    } finally { setUpBusy(false); }
                  }}
                />
              </label>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{co?.company_name || "—"}</div>
              <div style={{ opacity: .8, margin: "4px 0" }}>Secteur : {co?.sector || "—"}</div>
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Description</div>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={5} style={{ width: "100%" }} placeholder="Parlez de votre entreprise…" />
                <div style={{ marginTop: 8 }}>
                  <button className="btn-primary" disabled={upBusy} onClick={async () => {
                    try {
                      const updated = await patchCompanyMe({ company_description: desc });
                      setCo(updated.data);
                    } catch (e: any) { alert(e?.response?.data?.detail || "Échec de la mise à jour"); }
                  }}>Enregistrer</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

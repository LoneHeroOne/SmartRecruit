import { useEffect, useMemo, useState } from "react";
import "./jobs.theme.css";
import "../components/jobs/JobCardsGrid.css";
import "../components/jobs/JobCard.css";
import HeroSearch from "../components/jobs/HeroSearch";
import FilterBar from "../components/jobs/FilterBar";
import type { Filters } from "../components/jobs/FilterBar";
import "../components/jobs/FilterBar.css";
import { getJobs } from "../Services/jobsListApi";
import type { JobDetail } from "../Services/jobsApi";

export default function Jobs(){
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({ type: [], gov: [], mode: [], specialty: [] });
  const [jobs, setJobs] = useState<JobDetail[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // server filtering later; for now grab page and filter client-side
        const data = await getJobs();
        setJobs(data);
      } finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter(j => {
      // search fields: title, company, skills, descriptions
      const txt = [
        j.title, j.company_name, (j.skills || []).join(" "),
        j.offer_description, j.company_overview
      ].filter(Boolean).join(" ").toLowerCase();
      const qOk = !q || txt.includes(q);

      // filters (AND within each category group)
      const typeOk = !filters.type?.length || (j.employment_type && filters.type.includes(j.employment_type));
      const modeOk = !filters.mode?.length || (j.work_mode && filters.mode.includes(j.work_mode));
      const govOk  = !filters.gov?.length  || (j.location_city && filters.gov.includes(j.location_city) || (j as any).governorate && filters.gov!.includes((j as any).governorate));
      const specOk = !filters.specialty?.length || ((j as any).specialty && filters.specialty.includes((j as any).specialty));

      return qOk && typeOk && modeOk && govOk && specOk;
    });
  }, [jobs, query, filters]);

  return (
    <div className="jobsTheme">
      <HeroSearch
        defaultQuery=""
        onSubmit={(q)=> setQuery(q)}
      />

      <FilterBar
        value={filters}
        onChange={setFilters}
        count={filtered.length}
      />

      <div className="jobsPageContainer">
        <div className="jobGrid">
          {loading && <div style={{padding:"16px"}}>Chargement…</div>}
          {!loading && filtered.map(j => (
            <div key={j.id} className="jobCard">
              <header className="jobCard__header">
                <img className="jobCard__logo" alt={`${j.company_name ?? "Entreprise"} logo`}
                     src={j.company_logo_url ? (j.company_logo_url.startsWith("http")? j.company_logo_url : `${import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/,"") ?? ""}${j.company_logo_url}`) : ""} />
                <div className="jobCard__headText">
                  <h3 className="jobCard__title">{j.title}</h3>
                  <div className="jobCard__company">{j.company_name}</div>
                </div>
              </header>

              <div className="jobCard__facts">
                <div className="chip"><span>Expérience</span><strong>{j.experience_min ?? "—"}</strong></div>
                <div className="chip"><span>Type</span><strong>{j.employment_type ?? "—"}</strong></div>
                <div className="chip"><span>Mode</span><strong>{j.work_mode ?? "—"}</strong></div>
                <div className="chip"><span>Niveau</span><strong>{j.education_level ?? "—"}</strong></div>
              </div>

              {!!(j.skills?.length) && (
                <>
                  <span style={{color: "#6b768a", fontSize: ".82rem"}}>Compétences</span>
                  <ul className="jlSkills">
                    {j.skills.slice(0,3).map((s,i)=><li key={i} className="jlSkill">{s}</li>)}
                    {j.skills.length > 3 && <li className="jlSkill jlSkill--more">+{j.skills.length-3} de plus</li>}
                  </ul>
                </>
              )}

              <div className="jobCard__dates">
                <span className="muted">Publié: {j.posted_at ? new Date(j.posted_at).toLocaleDateString() : "—"}</span>
                <span className="muted">Modifié: {j.updated_at ? new Date(j.updated_at).toLocaleDateString() : "—"}</span>
              </div>

              <div className="jobCard__actions">
                <a className="jlBtn jlBtn--teal" href={`/jobs/${j.id}`}>Voir l'offre</a>
                <a className="jlBtn jlBtn--blue" href={`/apply/${j.id}`}>Postuler</a>
              </div>
            </div>
          ))}
          {!loading && filtered.length === 0 && (
            <div style={{padding:"32px", textAlign:"center"}}>
              <div style={{fontSize:"20px"}}>Aucune offre ne correspond à votre recherche</div>
              <div style={{color:"var(--ink-500)"}}>Essayez d'effacer des filtres ou utilisez d'autres mots-clés.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

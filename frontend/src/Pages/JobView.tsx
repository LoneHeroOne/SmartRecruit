import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getJob, type JobDetail } from "../Services/jobsApi";
import { getCompanyByUserId, type PublicCompany } from "../Services/companyApi";
import InfoBadge from "../components/common/InfoBadge";
import Section from "../components/common/Section";
import CompanyProfileDialog from "../components/company/CompanyProfileDialog";
import "./JobView.css";
import "./jobs.theme.css";

const relDays = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const days = Math.max(1, Math.round((Date.now() - d.getTime()) / 86400000));
  // fr-ish label similar to your screenshot
  return `il y a ${days} jour${days > 1 ? "s" : ""}`;
};

const resolveLogoUrl = (u?: string | null) => {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  // prefix relative API base if needed
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "";
  return `${base}${u.startsWith("/") ? u : `/${u}`}`;
};

export default function JobView() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<PublicCompany | null>(null);
  const id = Number(jobId);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getJob(id);
        if (alive) setJob(data);
      } catch (e: any) {
        setErr(e?.response?.data?.detail || e?.message || "Erreur de chargement");
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const salaryLabel = useMemo(() => {
    if (!job) return "—";
    if (job.salary_is_confidential) return "Confidentiel";
    if (job.salary_min && job.salary_max && job.salary_currency)
      return `${job.salary_min}–${job.salary_max} ${job.salary_currency}`;
    if (job.salary_min && job.salary_currency) return `≥ ${job.salary_min} ${job.salary_currency}`;
    if (job.salary_max && job.salary_currency) return `≤ ${job.salary_max} ${job.salary_currency}`;
    return "—";
  }, [job]);

  const handleViewProfile = async () => {
    if (!job) return;
    const me = JSON.parse(localStorage.getItem("me") || "{}");
    if (isCompany(me) && me.company_name === job.company_name) {
      navigate("/me");
      return;
    }
    try {
      const data = await getCompanyByUserId(job.owner_user_id!);
      setCompanyInfo(data);
      setCompanyOpen(true);
    } catch (e) {
      // fallback to info from job payload
      setCompanyInfo({
        id: 0,
        company_name: job.company_name || "",
        company_description: job.company_overview,
        company_logo_url: job.company_logo_url,
        sector: null,
      });
      setCompanyOpen(true);
    }
  };

  const isCompany = (u: any) => u.account_type === "company";

  if (err) return <section className="jobView error">{err}</section>;
  if (!job) return <section className="jobView loading">Chargement de l’offre…</section>;

  const loc = [job.location_city, job.location_country].filter(Boolean).join(", ");
  const logo = resolveLogoUrl(job.company_logo_url);

  const banner = useMemo(() => {
    if (!job?.banner_url) return null;
    return job.banner_url.startsWith("http")
      ? job.banner_url
      : `${import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ?? ""}${job.banner_url}`;
  }, [job?.banner_url]);

  // competencies: show first 3 + “+N de plus”
  const maxTags = 3;
  const skills = job.skills || [];
  const visibleSkills = skills.slice(0, maxTags);
  const remaining = Math.max(skills.length - maxTags, 0);

  return (
    <div className="jobsTheme">
      <section className="jobView" aria-label={`Offre: ${job.title}`}>
      {/* HERO */}
      <div className="jobHero" style={banner ? { backgroundImage: `url(${banner})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
        <div className="jobHero__brand">
          {logo ? (
            <img src={logo} alt={`${job.company_name ?? "Entreprise"} logo`} />
          ) : (
            <div className="logoPH" aria-hidden="true" />
          )}
        </div>
        <div className="jobHero__main">
          <h1 className="jobTitle">{job.title}</h1>
          <div className="jobCompany">{job.company_name}</div>
          <div className="jobMetaRow">
            {loc && <span className="jobMetaChip">{loc}</span>}
            {job.deadline && (
              <span className="jobMetaChip">
                Date limite&nbsp;: {new Date(job.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="jdHeaderActions">
            <button className="jdBtn jdBtn--primary" onClick={() => navigate(`/apply/${job.id}`)}>
              Postuler
            </button>
            <button className="jdBtn jdBtn--secondary" onClick={handleViewProfile}>
              Voir profil
            </button>
            <button className="jdBtn jdBtn--tertiary" onClick={() => navigator.share?.({url:location.href}) ?? navigator.clipboard.writeText(location.href)}>
              Partager l’offre
            </button>
          </div>
        </div>
      </div>

      {/* FACTS (4 tiles) */}
      <div className="factsRow">
        <div className="factCell">
          <div className="factLabel">Expérience</div>
          <div className="factValue">{job.experience_min ?? "—"}</div>
        </div>
        <div className="factCell">
          <div className="factLabel">Type d’emploi</div>
          <div className="factValue">{job.employment_type ?? "—"}</div>
        </div>
        <div className="factCell">
          <div className="factLabel">Mode de travail</div>
          <div className="factValue">{job.work_mode ?? "—"}</div>
        </div>
        <div className="factCell">
          <div className="factLabel">Niveau d’étude</div>
          <div className="factValue">{job.education_level ?? "—"}</div>
        </div>
      </div>

      {/* 2-COLUMN CONTENT */}
      <div className="contentGrid">
        <div className="leftCol">
          {job.company_overview && (
            <section className="card">
              <h3>Présentation de l’entreprise</h3>
              <p>{job.company_overview}</p>
            </section>
          )}
          {job.offer_description && (
            <section className="card">
              <h3>Description d’offre</h3>
              <p>{job.offer_description}</p>
            </section>
          )}
          {!!(job.missions && job.missions.length) && (
            <section className="card">
              <h3>🎯 Missions principales</h3>
              <ul className="bulletList">
                {job.missions.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </section>
          )}
        </div>

        <div className="rightCol">
          {job.profile_requirements && (
            <section className="card">
              <h3>Profil recherché</h3>
              <p>{job.profile_requirements}</p>
            </section>
          )}

          <section className="card">
            <h3>Compétences</h3>
            <ul className="pillList">
              {visibleSkills.map((s, i) => <li className="pill" key={i} title={s}>{s}</li>)}
              {remaining > 0 && <li className="pill pill--more">+{remaining} de plus</li>}
            </ul>
          </section>

          <section className="card">
            <h3>Rémunération</h3>
            <div>{salaryLabel}</div>
          </section>

          <div className="posted">Publié&nbsp;: {relDays(job.posted_at)}</div>
        </div>
      </div>

      {companyInfo && (
        <CompanyProfileDialog
          open={companyOpen}
          onClose={() => setCompanyOpen(false)}
          name={companyInfo.company_name}
          logo={companyInfo.company_logo_url}
          overview={companyInfo.company_description}
          sector={companyInfo.sector}
        />
      )}
    </section>
    </div>
  );
}

import React, { useMemo } from "react";
import "./JobCard.css";

export type JobCardProps = {
  id: number;
  title: string;
  company_name?: string | null;
  company_logo_url?: string | null;
  experience_min?: string | null;
  employment_type?: string | null;
  work_mode?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  salary_is_confidential?: boolean | null;
  skills?: string[];
  posted_at?: string | null;
  updated_at?: string | null;
};

function fact(label:string, value:string) {
  return (
    <div className="factItem">
      <div className="factLabel">{label}</div>
      <div className="factValue">{value}</div>
    </div>
  );
}

export default function JobCard(props: JobCardProps){
  const {
    id, title, company_name, company_logo_url,
    experience_min, employment_type, work_mode,
    salary_min, salary_max, salary_currency, salary_is_confidential,
    skills = [], posted_at, updated_at
  } = props;

  const logo = company_logo_url?.startsWith("http")
    ? company_logo_url
    : `${import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/,"") ?? ""}${company_logo_url ?? ""}`;

  const salary = useMemo(() =>
    salary_is_confidential ? "Confidentiel" :
    (salary_min && salary_max && salary_currency) ? `${salary_min} - ${salary_max} ${salary_currency}` :
    (salary_min && salary_currency) ? `≥ ${salary_min} ${salary_currency}` :
    (salary_max && salary_currency) ? `≤ ${salary_max} ${salary_currency}` : "—",
    [salary_min, salary_max, salary_currency, salary_is_confidential]
  );

  return (
    <article className="jobCard jobCard--tj group">
      {/* Header */}
      <header className="jobCard__header">
        <div className="jobCard__logoWrap">
          {logo && <img className="jobCard__logo" src={logo} alt={`${company_name} logo`} />}
        </div>
        <div className="jobCard__headText">
          <h3 className="jobCard__title">{title}</h3>
          <div className="jobCard__company">{company_name}</div>
        </div>
      </header>

      {/* Info grid (always 2 columns) */}
      <div className="jobCard__facts jobCard__facts--tj">
        {fact("Expérience", experience_min ?? "—")}
        {fact("Type d'emploi", employment_type ?? "—")}
        {fact("Mode de travail", work_mode ?? "—")}
        {fact("Rémunération", salary)}
      </div>

      {/* Compétences section title like TuniJobs */}
      {!!(skills?.length) && <div className="jobCard__sectionTitle">Compétences</div>}

      {/* Skills (≤3 + +N) */}
      {!!(skills?.length) && (
        <ul className="jlSkills">
          {skills.slice(0,3).map((s,i)=><li key={i} className="jlSkill">{s}</li>)}
          {skills.length > 3 && <li className="jlSkill jlSkill--more">+{skills.length-3} de plus</li>}
        </ul>
      )}

      {/* Dates + buttons */}
      <div className="jobCard__footer">
        <div className="jobCard__dates jobCard__dates--tj">
          <span>Publié: {posted_at ? new Date(posted_at).toLocaleDateString() : "—"}</span>
          <span>Modifié: {updated_at ? new Date(updated_at).toLocaleDateString() : "—"}</span>
        </div>
        <div className="jobCard__actions jobCard__actions--tj">
          <a className="jlBtn jlBtn--outlineTeal" href={`/jobs/${id}`}>🛈&nbsp; Voir l'offre</a>
          <a className="jlBtn jlBtn--outlineBlue" href={`/apply/${id}`}>✈︎&nbsp; Postuler</a>
        </div>
      </div>
    </article>
  );
}

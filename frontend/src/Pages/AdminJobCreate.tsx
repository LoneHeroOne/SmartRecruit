import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../Services/apiClient";
import { getCompanyMe } from "../Services/companyApi";
import "./AdminJobCreate.css";

function toIntOrNull(v: FormDataEntryValue | null) {
  const s = (v as string) || "";
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? null : n;
}

type FormDataType = {
  title: string;
  company_name: string;
  company_logo_url: string;
  location_city: string;
  location_country: string;
  experience_min: string;
  employment_type: string;
  work_mode: string;
  salary_min: string;
  salary_max: string;
  salary_currency: string;
  salary_is_confidential: boolean;
  education_level: string;
  company_overview: string;
  offer_description: string;
  missions: string[];
  profile_requirements: string;
  skills: string[];
  description: string;
  deadline: string;
  status: string;
};

const steps = [
  { title: "Informations de base", icon: "📋", required: ["title"] },
  { title: "Type d'emploi & salaire", icon: "💼", required: [] },
  { title: "Descriptions & exigences", icon: "📝", required: [] },
  { title: "Détails finals", icon: "🚀", required: ["description"] }
];

const totalSteps = steps.length;

export default function AdminJobCreate() {
  const nav = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [skillInput, setSkillInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({
    title: "",
    company_name: "",
    company_logo_url: "/tt-logo.svg",
    location_city: "",
    location_country: "Tunisia",
    experience_min: "",
    employment_type: "CDI",
    work_mode: "On-site",
    salary_min: "",
    salary_max: "",
    salary_currency: "DT",
    salary_is_confidential: false,
    education_level: "",
    company_overview: "",
    offer_description: "",
    missions: [],
    profile_requirements: "",
    skills: [],
    description: "",
    deadline: "",
    status: "published",
  });

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    setFormData((prev) => ({ ...prev, skills: Array.from(new Set([...prev.skills, s])) }));
    setSkillInput("");
  };
  const removeSkill = (i: number) => {
    setFormData((prev) => ({ ...prev, skills: prev.skills.filter((_, idx) => idx !== i) }));
  };

  const updateFormData = (field: keyof FormDataType, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    (async () => {
      try {
        // If logged-in user is a company, this returns 200; otherwise 403.
        const res = await getCompanyMe();
        updateFormData("company_name", res.data.company_name || formData.company_name);
      } catch {
        /* ignore: not a company user */
      }
    })();
  }, []);

  const validateStep = (step: number): boolean => {
    const required = steps[step - 1]?.required || [];
    const newErrors: Record<string, string> = {};
    for (const field of required) {
      if (!formData[field as keyof FormDataType]) {
        newErrors[field] = "Ce champ est requis.";
      }
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentStep < totalSteps) {
      e.preventDefault();
      handleNext();
    }
  };

  const handlePublish = async () => {
    if (validateStep(currentStep)) {
      setIsSubmitting(true);
      try {
        const body = {
          ...formData,
          missions: formData.missions || [],
          salary_min: toIntOrNull(formData.salary_min || null),
          salary_max: toIntOrNull(formData.salary_max || null),
          experience_min: formData.experience_min || null,
          location_city: formData.location_city || null,
          deadline: formData.deadline || null,
        };
        await apiClient.post("/jobs", body);
        localStorage.removeItem("jobCreateDraft");
        nav("/jobs");
      } catch (err) {
        alert("Erreur lors de la publication");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    const draft = localStorage.getItem("jobCreateDraft");
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("jobCreateDraft", JSON.stringify(formData));
  }, [formData]);

  const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="page admin-job-create" onKeyDown={handleKeyDown}>
      <h2>Créer une offre</h2>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>
      <div className="stepper">
        {steps.map((step, index) => (
          <div key={index} className={`step ${index + 1 === currentStep ? 'active' : index + 1 < currentStep ? 'completed' : ''}`}>
            <div className="step-number">{index + 1}</div>
            <div className="step-icon">{step.icon}</div>
            <div className="step-title">{step.title}</div>
          </div>
        ))}
      </div>
      <div className="form-grid">
        {currentStep === 1 && (
          <>
            <label>Intitulé du poste<input value={formData.title} onChange={(e)=>updateFormData("title", e.target.value)} required />
            {errors.title && <span className="error">{errors.title}</span>}</label>
            <label>Entreprise<input value={formData.company_name} onChange={(e)=>updateFormData("company_name", e.target.value)} /></label>
            <label>Logo (URL)<input value={formData.company_logo_url} onChange={(e)=>updateFormData("company_logo_url", e.target.value)} placeholder="/tt-logo.svg" /></label>
            <label>Ville<input value={formData.location_city} onChange={(e)=>updateFormData("location_city", e.target.value)} placeholder="Tunis" /></label>
            <label>Pays<input value={formData.location_country} onChange={(e)=>updateFormData("location_country", e.target.value)} /></label>
          </>
        )}
        {currentStep === 2 && (
          <>
            <label>Expérience<input value={formData.experience_min} onChange={(e)=>updateFormData("experience_min", e.target.value)} placeholder="1-2 ans" /></label>
            <label>Type d'emploi<select value={formData.employment_type} onChange={(e)=>updateFormData("employment_type", e.target.value)}>
              <option>CDI</option><option>CDD</option><option>Full-time</option><option>Part-time</option>
              <option>Internship</option><option>Contractor</option>
            </select></label>
            <label>Mode de travail<select value={formData.work_mode} onChange={(e)=>updateFormData("work_mode", e.target.value)}>
              <option>On-site</option><option>Remote</option><option>Hybrid</option>
            </select></label>
            <label>Salaire min<input value={formData.salary_min} onChange={(e)=>updateFormData("salary_min", e.target.value)} type="number" min={0} /></label>
            <label>Salaire max<input value={formData.salary_max} onChange={(e)=>updateFormData("salary_max", e.target.value)} type="number" min={0} /></label>
            <label>Devise<input value={formData.salary_currency} onChange={(e)=>updateFormData("salary_currency", e.target.value)} /></label>
            <label className="row"><input type="checkbox" checked={formData.salary_is_confidential} onChange={(e)=>updateFormData("salary_is_confidential", e.target.checked)} /> Rémunération confidentielle</label>
            <label>Niveau d'étude<input value={formData.education_level} onChange={(e)=>updateFormData("education_level", e.target.value)} placeholder="Licence / Master / Ingénieur..." /></label>
          </>
        )}
        {currentStep === 3 && (
          <>
            <label className="col-span-2">Présentation de l'entreprise
              <textarea value={formData.company_overview} onChange={(e)=>updateFormData("company_overview", e.target.value)} rows={4} placeholder="Qui sommes-nous ?" />
            </label>
            <label className="col-span-2">Description d'offre
              <textarea value={formData.offer_description} onChange={(e)=>updateFormData("offer_description", e.target.value)} rows={6} placeholder="Détails de l'offre" />
            </label>
            <label className="col-span-2">🎯 Missions principales
              <textarea value={formData.missions.join('\n')} onChange={(e)=>updateFormData("missions", e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} rows={4} placeholder={"Une mission par ligne"} />
            </label>
            <label className="col-span-2">Profil recherché
              <textarea value={formData.profile_requirements} onChange={(e)=>updateFormData("profile_requirements", e.target.value)} rows={5} placeholder="Compétences générales, qualités..." />
            </label>
            <div className="row">
              <label>Compétences</label>
              <div className="skills">
                <input value={skillInput} onChange={(e)=>setSkillInput(e.target.value)} placeholder="Ajouter une compétence" />
                <button type="button" onClick={addSkill}>+</button>
              </div>
              <div className="chips">
                {formData.skills.map((s,i)=><span key={i} className="chip" onClick={()=>removeSkill(i)} title="Retirer">{s} ×</span>)}
              </div>
            </div>
          </>
        )}
        {currentStep === 4 && (
          <>
            <label className="col-span-2">Notes (interne)
              <textarea value={formData.description} onChange={(e)=>updateFormData("description", e.target.value)} rows={3} placeholder="Note interne (facultatif)" />
              {errors.description && <span className="error">{errors.description}</span>}
            </label>
            <label>Date limite<input value={formData.deadline} onChange={(e)=>updateFormData("deadline", e.target.value)} type="date" /></label>
            <label>Statut<select value={formData.status} onChange={(e)=>updateFormData("status", e.target.value)}>
              <option value="draft">draft</option><option value="published">published</option><option value="archived">archived</option>
            </select></label>
          </>
        )}
      </div>
      <div className="actions">
        {currentStep > 1 && <button type="button" onClick={handlePrev}>Précédent</button>}
        {currentStep < totalSteps && <button type="button" onClick={handleNext}>Suivant</button>}
        {currentStep === totalSteps && <button className="btn-primary" type="button" onClick={handlePublish} disabled={isSubmitting}>{isSubmitting ? "Publication..." : "Publier"}</button>}
      </div>
    </div>
  );
}

import api from "./apiClient";

export type JobDetail = {
  id: number;
  title: string;
  company_name: string | null;
  company_logo_url: string | null;
  banner_url?: string | null;
  location_city: string | null;
  location_country: string | null;
  experience_min: string | null;        // currently null in example
  employment_type: string | null;       // "CDI"
  work_mode: string | null;             // "Remote"
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;       // "DT"
  salary_is_confidential: boolean | null;
  education_level: string | null;       // "Licence"
  company_overview: string | null;      // text
  offer_description: string | null;     // text
  missions: string[];                   // []
  profile_requirements: string | null;  // text
  skills: string[];                     // ["React","TypeScript","Node.js"]
  description: string | null;           // internal note (ignore on UI)
  deadline: string | null;              // ISO date
  status: string | null;                // "published"
  posted_at: string | null;             // ISO
  updated_at?: string | null;
  created_at?: string | null;
  owner_user_id?: number | null;
};

export const getJob = async (id: number) => {
  const res = await api.get<JobDetail>(`/jobs/${id}`);
  return res.data;
};

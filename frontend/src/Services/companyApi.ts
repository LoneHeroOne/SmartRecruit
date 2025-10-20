import apiClient from "./apiClient";

export type CompanyMe = {
  id: number; email: string; account_type: string;
  company_name?: string; sector?: string;
  company_logo_url?: string; company_description?: string;
};

export type PublicCompany = {
  id: number;
  company_name: string;
  sector?: string | null;
  company_description?: string | null;
  company_logo_url?: string | null;
};

export const getCompanyMe = () => apiClient.get<CompanyMe>("/company/me");
export const patchCompanyMe = (data: Partial<CompanyMe>) => apiClient.patch<CompanyMe>("/company/me", data);
export const uploadCompanyLogo = (file: File) => {
  const fd = new FormData(); fd.append("file", file);
  return apiClient.post<{ company_logo_url: string }>("/company/logo", fd, { headers: { "Content-Type": "multipart/form-data" }});
};

export const getCompanyByUserId = async (userId: number) => {
  const res = await apiClient.get<PublicCompany>(`/company/${userId}`);
  return res.data;
};

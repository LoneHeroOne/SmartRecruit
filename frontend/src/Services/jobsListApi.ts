import api from "./apiClient";
import type { JobDetail } from "./jobsApi";

export async function getJobs(): Promise<JobDetail[]> {
  const res = await api.get<JobDetail[]>("/jobs"); // swap to paged route if needed
  return res.data;
}

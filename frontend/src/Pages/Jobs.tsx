import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../Services/apiClient";
import "./Jobs.css";

interface Job {
  id: number;
  title: string;
  description: string;
  location?: string;
  duration?: string;
  requirements?: string[];
  deadline?: string; // date string
  contract_type?: string;
}

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get("/jobs");
        setJobs(response.data);
      } catch (err) {
        setError("Failed to fetch jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="jobs-container">
      <h2 className="jobs-title">Available Jobs</h2>
      {loading && <div className="loading">Loading jobs...</div>}
      {error && <div className="error-message">{error}</div>}
      {!loading && !error && jobs.length === 0 && (
        <div className="no-jobs">No jobs found.</div>
      )}
      <div className="jobs-grid">
        {!loading &&
          !error &&
          jobs.map((job) => (
            <div key={job.id} className="job-card">
              <h3 className="job-title">{job.title}</h3>
              <p className="job-company">Location: {job.location || "N/A"}</p>
              <p className="job-description">{job.description}</p>
              <Link to={`/apply/${job.id}`} className="apply-button">
                Apply
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Jobs;

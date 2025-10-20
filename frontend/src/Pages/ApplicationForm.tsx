import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../Services/apiClient";
import "./ApplicationForm.css";

interface ApplicationData {
  job_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  education_level: string;
  years_experience: number;
  linkedin_url?: string;
  cover_letter: string;
}

interface Job {
  id: number;
  title: string;
  description: string;
  location?: string;
  duration?: string;
  requirements?: string[];
  deadline?: string;
  contract_type?: string;
}

const steps = [
  { id: 1, title: "Personal Information", progress: 25 },
  { id: 2, title: "Education & Experience", progress: 50 },
  { id: 3, title: "Cover Letter & CV", progress: 75 },
  { id: 4, title: "Review & Submit", progress: 100 },
];

type CurrentCV = { id: number; file_path: string; uploaded_at: string } | null;

export default function ApplicationForm() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentCv, setCurrentCv] = useState<CurrentCV>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [jobError, setJobError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState<ApplicationData>({
    job_id: Number(jobId) || 0,
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    education_level: "",
    years_experience: 0,
    linkedin_url: "",
    cover_letter: "",
  });

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { state: { message: "Please log in to apply." } });
      return;
    }

    // Fetch job details
    const fetchJob = async () => {
      try {
        const response = await api.get(`/jobs/${jobId}`);
        setJob(response.data);
      } catch (err) {
        setJobError("Failed to load job details.");
      } finally {
        setJobLoading(false);
      }
    };

    // Fetch current CV
    const fetchCurrentCv = async () => {
      try {
        const response = await api.get(`/cvs/current`);
        setCurrentCv(response.data);
      } catch (err) {
        // CV not uploaded yet, that's ok
        setCurrentCv(null);
      }
    };

    if (jobId) fetchJob();
    fetchCurrentCv();
  }, [navigate, jobId]);

  const onReplaceCv = async (file: File) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      await api.post("/cvs", fd);
      // Refresh current CV after upload
      const curRes = await api.get("/cvs/current");
      setCurrentCv(curRes.data);
    } catch (err) {
      alert("Failed to upload CV. Please try again.");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };



  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const formPayload = {
        ...formData,
        years_experience: Number(formData.years_experience),
      };

      await api.post("/applications", formPayload);

      setSubmitted(true);
    } catch (error: any) {
      console.error("Application submission failed:", error);
      const errorMsg = error.response?.status === 400
        ? error.response.data.detail || "Duplicate information found. Please verify your details."
        : "An error occurred. Please try again.";
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2 className="step-title">Personal Information</h2>
            <div className="form-group">
              <label htmlFor="first_name" className="form-label">
                First Name *
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="last_name" className="form-label">
                Last Name *
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone_number" className="form-label">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="linkedin_url" className="form-label">
                LinkedIn URL
              </label>
              <input
                type="url"
                id="linkedin_url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/yourprofile"
                className="form-input"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h2 className="step-title">Education & Experience</h2>
            <div className="form-group">
              <label htmlFor="education_level" className="form-label">
                Education Level *
              </label>
              <select
                id="education_level"
                name="education_level"
                value={formData.education_level}
                onChange={handleInputChange}
                required
                className="form-input"
              >
                <option value="">Select education level</option>
                <option value="high_school">High School</option>
                <option value="bachelors">Bachelor's Degree</option>
                <option value="masters">Master's Degree</option>
                <option value="doctorate">Doctorate</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="years_experience" className="form-label">
                Years of Experience *
              </label>
              <input
                type="number"
                id="years_experience"
                name="years_experience"
                value={formData.years_experience}
                onChange={handleInputChange}
                min="0"
                max="50"
                required
                className="form-input"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h2 className="step-title">Cover Letter & CV</h2>
            <div className="form-group">
              <label htmlFor="cover_letter" className="form-label">
                Cover Letter *
              </label>
              <textarea
                id="cover_letter"
                name="cover_letter"
                value={formData.cover_letter}
                onChange={handleInputChange}
                rows={8}
                required
                placeholder="Tell us why you're interested in this position and why you'd be a great fit..."
                className="form-textarea"
              />
            </div>
            <div className="card glass" style={{ padding: 16, marginTop: 16 }}>
              <h4 style={{ marginTop: 0 }}>Votre CV</h4>
              {currentCv ? (
                <div>
                  CV enregistré: {currentCv.file_path.split("/").pop()}
                </div>
              ) : (
                <div style={{ color: "#f66" }}>Aucun CV enregistré</div>
              )}
              <label style={{ display: "inline-block", marginTop: 8, cursor: "pointer", background: "#f0f0f0", padding: "8px 12px", borderRadius: 4 }}>
                Remplacer le CV
                <input
                  type="file"
                  accept="application/pdf"
                  style={{ display: "none" }}
                  onChange={(e) => e.target.files?.[0] && onReplaceCv(e.target.files[0])}
                />
              </label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h2 className="step-title">Review Your Application</h2>
            <div className="review-section">
              <h3>Personal Information</h3>
              <p><strong>First Name:</strong> {formData.first_name}</p>
              <p><strong>Last Name:</strong> {formData.last_name}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Phone:</strong> {formData.phone_number}</p>
              <p><strong>LinkedIn:</strong> {formData.linkedin_url || "Not provided"}</p>
            </div>

            <div className="review-section">
              <h3>Education & Experience</h3>
              <p><strong>Education Level:</strong> {formData.education_level}</p>
              <p><strong>Years of Experience:</strong> {formData.years_experience}</p>
            </div>

            <div className="review-section">
              <h3>Cover Letter</h3>
              <p className="cover-letter-preview">{formData.cover_letter}</p>
              {currentCv && <p><strong>CV:</strong> {currentCv.file_path.split("/").pop()}</p>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentProgress = steps.find((step) => step.id === currentStep)?.progress || 0;

  if (jobLoading) return (
    <div className="application-form-container">
      <div className="application-card">
        <div className="loading">Loading job details...</div>
      </div>
    </div>
  );

  if (jobError) return (
    <div className="application-form-container">
      <div className="application-card">
        <div className="error-message">{jobError}</div>
        <Link to="/jobs" className="apply-button">Back to Jobs</Link>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="application-form-container">
      <div className="application-card success-message">
        <h2>Application Submitted Successfully!</h2>
        <p>Your application has been received. We'll be in touch soon.</p>
        <div className="nav-options">
          <Link to="/jobs" className="apply-button">View More Jobs</Link>
          <Link to="/" className="apply-button secondary">Home</Link>
        </div>
      </div>
    </div>
  );

  if (submitError) return (
    <div className="application-form-container">
      <div className="application-card error-card">
        <h2>Submission Error</h2>
        <p>{submitError}</p>
        <button onClick={() => setSubmitError("")} className="apply-button">Try Again</button>
        <br />
        <Link to="/jobs" className="apply-button secondary">Back to Jobs</Link>
      </div>
    </div>
  );

  return (
    <div className="application-form-container">
      <div className="application-card">
        {job && (
          <div className="job-header">
            <h2 className="job-title">{job.title}</h2>
            <p className="job-description">{job.description}</p>
          </div>
        )}

        <div className="progress-section">
          <div className="progress-steps">
            {steps.map((step, index) => (
              <div key={step.id} className={`progress-step ${currentStep > step.id ? 'completed' : ''} ${currentStep === step.id ? 'current' : ''}`}>
                <div className={`progress-step-circle ${currentStep > step.id ? 'completed' : ''} ${currentStep === step.id ? 'current' : ''}`}>
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                <span className="progress-step-title">{step.title}</span>
                {index < steps.length - 1 && <div className={`progress-line ${currentStep > step.id ? 'active' : ''}`}></div>}
              </div>
            ))}
          </div>
          <div className="progress-text">
            Step {currentStep} of 4: {steps.find((s) => s.id === currentStep)?.title}
          </div>
        </div>

        <div className="form-content">{renderStepContent()}</div>

        <div className="form-navigation">
          {currentStep > 1 && (
            <button type="button" onClick={prevStep} className="nav-button secondary">
              Previous
            </button>
          )}
          {currentStep < 4 ? (
            <button type="button" onClick={nextStep} className="nav-button primary">
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="nav-button primary submit"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

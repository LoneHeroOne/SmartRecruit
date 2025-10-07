import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Services/apiClient";
import BackgroundAnimation from "../components/common/BackgroundAnimation";
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

const steps = [
  { id: 1, title: "Personal Information", progress: 25 },
  { id: 2, title: "Education & Experience", progress: 50 },
  { id: 3, title: "Cover Letter & CV", progress: 75 },
  { id: 4, title: "Review & Submit", progress: 100 },
];

export default function ApplicationForm() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cvFile, setCVFile] = useState<File | null>(null);

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
  }, [navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCVFile(file);
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Note: CV upload is optional in this form
      // If you want to add CV upload, modify the body accordingly
      const formPayload = {
        ...formData,
        years_experience: Number(formData.years_experience),
      };

      const response = await api.post("/applications/apply", formPayload);

      // Success: Show confirmation and navigate to internships list
      alert("Your application has been submitted successfully! We'll be in touch soon.");
      navigate("/internships");
    } catch (error: any) {
      console.error("Application submission failed:", error);
      alert("Application submission failed. Please try again.");
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
            <div className="form-group">
              <label htmlFor="cv_file" className="form-label">
                CV/Resume Upload (Optional)
              </label>
              <input
                type="file"
                id="cv_file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt"
                className="form-input"
              />
              {cvFile && <p className="file-selected">Selected: {cvFile.name}</p>}
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
              {cvFile && <p><strong>CV File:</strong> {cvFile.name}</p>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentProgress = steps.find((step) => step.id === currentStep)?.progress || 0;

  return (
    <div className="application-form-container">
      <BackgroundAnimation />
      <div className="application-card">
        <div className="progress-section">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${currentProgress}%` }}></div>
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

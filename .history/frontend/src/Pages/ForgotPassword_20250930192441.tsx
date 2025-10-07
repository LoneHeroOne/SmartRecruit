import { useState } from "react";
import BackgroundAnimation from "../components/common/BackgroundAnimation";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setLoading(false);
    setMessage("If an account with that email exists, a password reset link has been sent.");
  };

  return (
    <div className="forgot-password-container">
      <BackgroundAnimation />
      <div className="forgot-password-card">
        <h1 className="forgot-password-title">Forgot Password</h1>

        {message && <div className="message">{message}</div>}

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div>
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <p className="back-prompt">
          <button onClick={() => navigate("/")} className="back-link">
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
}
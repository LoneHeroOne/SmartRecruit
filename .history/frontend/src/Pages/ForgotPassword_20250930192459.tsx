import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundAnimation from "../components/common/BackgroundAnimation";
import { forgotPassword } from "../Services/authService";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await forgotPassword({ email });
      setMessage("Password reset link sent to your email.");
    } catch (err) {
      setError("Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-ct">
      <BackgroundAnimation />
      <div className="forgot-password-card">
        <h1 className="forgot-password-title">Forgot Password</h1>

        {error && <div className="error-msg">{error}</div>}
        {message && <div className="message">{message}</div>}

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div>
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

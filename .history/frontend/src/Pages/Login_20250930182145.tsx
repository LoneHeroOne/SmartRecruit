import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundAnimation from "../components/common/BackgroundAnimation";
import {login} from "../Services/authService";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(form);
      localStorage.setItem("token", res.data.access_token);
      navigate("/internships"); // redirect after login
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <BackgroundAnimation />
      <div className="login-card">
        <h1 className="login-title">
          Login
        </h1>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="form-label"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="form-label"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="register-prompt">
          Don’t have an account?{" "}
          <a
            href="/register"
            className="register-link"
          >
            Register
          </a>
        </p>

        <p className="register-prompt">
          <a
            href="/forgot-password"
            className="register-link"
          >
            Forgot Password?
          </a>
        </p>

      </div>
    </div>
  );
}

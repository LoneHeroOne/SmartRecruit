import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundAnimation from "../components/common/BackgroundAnimation";
import { register, login } from "../Services/authService";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(form);
      // Auto-login after registration
      await login({ email: form.email, password: form.password });
      navigate("/internships");
    } catch (err) {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <BackgroundAnimation />
      <div className="register-card">
        <h1 className="register-title">
          Register
        </h1>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="form-label"
            >
              First Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div>
            <label
              htmlFor="name"
              className="form-label"
            >
              Last Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="login-prompt">
          Already have an account?{" "}
          <a
            href="/"
            className="login-link"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

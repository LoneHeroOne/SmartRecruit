import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.css";

type User = {
  full_name?: string;
  is_admin?: boolean;
  account_type?: "admin" | "company" | "candidate";
  company_name?: string | null;
};

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("me");
      if (raw) setUser(JSON.parse(raw));
    } catch {
      setUser(null);
    }
  }, []);

  const isCompany = !!(user?.account_type === "company" || user?.company_name);
  const isAdmin = !!user?.is_admin;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("me");
    navigate("/auth/signin", { replace: true });
  };

  return (
    <header className="sr-nav">
      <div className="sr-nav__left">
        <Link to="/jobs" className="brand">
          <img src="/tt-logo.svg" alt="Tunisie Télécom" />
          <span>SmartRecruit</span>
        </Link>

        <nav className="links">
          <NavLink to="/jobs" className={({ isActive }) => (isActive ? "active" : "")} aria-label="Jobs">
            Jobs
          </NavLink>

          {(isAdmin || isCompany) && (
            <>
              <NavLink to="/admin/applications" className={({ isActive }) => (isActive ? "active" : "")} aria-label="Application Management">
                Application Management
              </NavLink>
              <NavLink to="/admin/create-job" className={({ isActive }) => (isActive ? "active" : "")} aria-label="Post a Job">
                Post a Job
              </NavLink>
              {/* If you later add a real analytics page, keep this */}
              {/* <NavLink to="/admin/analytics" className={({ isActive }) => (isActive ? "active" : "")}>Analytics</NavLink> */}
            </>
          )}
        </nav>
      </div>

      <div className="sr-nav__right">
        {user ? (
          <div className="auth-menu">
            <button className="auth-trigger" onClick={() => setOpen(v => !v)}>
              <span className="user-chip">{user.full_name ?? (isCompany ? user.company_name ?? "Entreprise" : "Compte")}</span>
            </button>
            {open && (
              <div className="auth-dropdown" onMouseLeave={() => setOpen(false)}>
                <Link className="auth-item" to="/me" onClick={() => setOpen(false)}>
                  Mon espace <span className="auth-caption">Profil, CV, candidatures</span>
                </Link>

                {(isAdmin || isCompany) && (
                  <Link className="auth-item" to="/admin/create-job" onClick={() => setOpen(false)}>
                    Publier une offre
                  </Link>
                )}

                <button className="auth-item" onClick={logout}>
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-menu">
            <button className="auth-trigger" onClick={() => setOpen(v => !v)}>Se connecter</button>
            {open && (
              <div className="auth-dropdown" onMouseLeave={() => setOpen(false)}>
                <Link className="auth-item" to="/auth/signin" onClick={() => setOpen(false)}>Connexion</Link>
                <Link className="auth-item" to="/candidate/signup" onClick={() => setOpen(false)}>Inscription Candidat</Link>
                <Link className="auth-item" to="/company/signup" onClick={() => setOpen(false)}>Inscription Entreprise</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

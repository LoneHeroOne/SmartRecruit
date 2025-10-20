import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../Services/apiClient";

const SECTEURS = [
  "Informatique / IT",
  "Télécoms",
  "Banque / Finance",
  "Assurance",
  "Santé",
  "Industrie",
  "Commerce / Distribution",
  "Services",
  "Éducation / Formation",
  "Marketing / Communication",
  "Autre",
];

type Form = {
  company_name: string;
  last_name: string;
  first_name: string;
  email: string;
  phone: string;
  sector: string;
  password: string;
  confirm: string;
};

export default function CompanySignup() {
  const nav = useNavigate();
  const [form, setForm] = useState<Form>({
    company_name: "",
    last_name: "",
    first_name: "",
    email: "",
    phone: "",
    sector: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onChange =
    (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    // Basic validations (align with TuniJobs semantics)
    if (!form.company_name || !form.last_name || !form.first_name || !form.email || !form.password) {
      setErr("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (form.password !== form.confirm) {
      setErr("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setLoading(true);

      // 1) Register company account
      await api.post("/auth/register", {
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone || null,
        account_type: "company",
        company_name: form.company_name,
        sector: form.sector || null,
      });

      // 2) Login
      const loginRes = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });
      const token = loginRes.data?.access_token;
      if (token) localStorage.setItem("token", token);

      // 3) Cache /users/me for navbar, navigate to /me (or /jobs if you prefer)
      const meRes = await api.get("/users/me");
      localStorage.setItem("me", JSON.stringify(meRes.data || {}));
      nav("/me", { replace: true });
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      setErr(typeof detail === "string" ? detail : "Inscription impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card glass" style={{ maxWidth: 680, margin: "32px auto", padding: 20 }}>
      <h2 style={{ marginTop: 0 }}>Inscription Entreprise</h2>
      {err && <div style={{ color: "#f66", marginBottom: 10 }}>{err}</div>}

      <form onSubmit={onSubmit}>
        {/* Nom de l’entreprise */}
        <label style={{ display: "block", marginBottom: 12 }}>
          Nom de l'entreprise
          <input value={form.company_name} onChange={onChange("company_name")} required />
        </label>

        {/* Nom / Prénom */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>
            Nom
            <input value={form.last_name} onChange={onChange("last_name")} required />
          </label>
          <label>
            Prénom
            <input value={form.first_name} onChange={onChange("first_name")} required />
          </label>
        </div>

        {/* Email / Mobile */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          <label>
            Email
            <input type="email" value={form.email} onChange={onChange("email")} required />
          </label>
          <label>
            Numéro de mobile
            <input value={form.phone} onChange={onChange("phone")} />
          </label>
        </div>

        {/* Secteur d’activité */}
        <div style={{ marginTop: 12 }}>
          <label>
            Secteur d'activité
            <select value={form.sector} onChange={onChange("sector")}>
              <option value="">Sélectionner le secteur d'activité</option>
              {SECTEURS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Mot de passe / Confirmation */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          <label>
            Mot de passe
            <input type="password" value={form.password} onChange={onChange("password")} required />
          </label>
          <label>
            Confirmer le mot de passe
            <input type="password" value={form.confirm} onChange={onChange("confirm")} required />
          </label>
        </div>

        <button className="btn-primary" disabled={loading} style={{ marginTop: 16 }}>
          {loading ? "En cours…" : "S'inscrire"}
        </button>
      </form>

      <div style={{ marginTop: 12 }}>
        <Link to="/auth/signin">Retour à la connexion</Link>
      </div>
    </div>
  );
}

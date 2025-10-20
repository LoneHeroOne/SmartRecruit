import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../Services/apiClient";

type Form = {
  last_name: string;
  first_name: string;
  email: string;
  phone: string;
  jj: string;
  mm: string;
  aaaa: string;
  password: string;
  confirm: string;
};

export default function CandidateSignup() {
  const nav = useNavigate();
  const [form, setForm] = useState<Form>({
    last_name: "",
    first_name: "",
    email: "",
    phone: "",
    jj: "",
    mm: "",
    aaaa: "",
    password: "",
    confirm: "",
  });
  const [cv, setCv] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onChange = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const toIsoDate = (jj: string, mm: string, aaaa: string) => {
    if (!jj || !mm || !aaaa) return null;
    const JJ = jj.padStart(2, "0");
    const MM = mm.padStart(2, "0");
    return `${aaaa}-${MM}-${JJ}`;
  };

  const isPdf = (file: File | null) =>
    !!file && (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    // basic validations (mirror TuniJobs semantics)
    if (!form.last_name || !form.first_name || !form.email || !form.password) {
      setErr("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (form.password !== form.confirm) {
      setErr("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!cv || !isPdf(cv)) {
      setErr("Veuillez joindre votre CV au format PDF.");
      return;
    }

    const dob = toIsoDate(form.jj, form.mm, form.aaaa);

    try {
      setLoading(true);

      // 1) Register
      await api.post("/auth/register", {
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone || null,
        date_of_birth: dob,              // "YYYY-MM-DD" or null
        account_type: "candidate",
      });

      // 2) Login (get token)
      const loginRes = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });
      const token = loginRes.data?.access_token;
      if (token) localStorage.setItem("token", token);

      // 3) Upload CV (multipart/form-data)
      const fd = new FormData();
      fd.append("file", cv);
      await api.post("/cvs", fd);

      // 4) Cache /users/me for navbar, navigate to /me
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
      <h2 style={{ marginTop: 0 }}>Inscription Candidat</h2>
      {err && <div style={{ color: "#f66", marginBottom: 10 }}>{err}</div>}

      <form onSubmit={onSubmit}>
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

        {/* CV (PDF) */}
        <div style={{ marginTop: 12 }}>
          <label>
            CV (Format PDF)
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setCv(e.target.files?.[0] || null)}
              required
            />
          </label>
        </div>

        {/* Date de naissance: jj / mm / aaaa */}
        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 6 }}>Date de naissance</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "80px 20px 80px 20px 110px",
              alignItems: "center",
              gap: 6,
            }}
          >
            <input placeholder="jj" value={form.jj} onChange={onChange("jj")} />
            <div style={{ textAlign: "center" }}>/</div>
            <input placeholder="mm" value={form.mm} onChange={onChange("mm")} />
            <div style={{ textAlign: "center" }}>/</div>
            <input placeholder="aaaa" value={form.aaaa} onChange={onChange("aaaa")} />
          </div>
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

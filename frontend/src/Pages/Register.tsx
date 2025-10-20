import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="card glass" style={{ maxWidth: 560, margin: "32px auto", padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Créer un compte</h2>
      <p>Choisissez votre type de compte :</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
        <Link className="btn-primary" to="/candidate/signup">Je suis candidat</Link>
        <Link className="btn-primary" to="/company/signup">Je suis une entreprise</Link>
      </div>
      <div style={{ marginTop: 16, opacity: .8 }}>
        Vous avez déjà un compte ? <Link to="/auth/signin">Se connecter</Link>
      </div>
    </div>
  );
}

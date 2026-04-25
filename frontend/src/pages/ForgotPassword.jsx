import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import AuthLayout from "../components/AuthLayout";
import Alert from "../components/Alert";

export default function ForgotPassword() {
  const [email,   setEmail]   = useState("");
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setSuccess(""); setError(""); setLoading(true);
    try {
      await api.post("/password/forgot-password", { email });
      setSuccess("Reset link sent. Check your inbox.");
    } catch { setError("No account found with that email."); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout rightTitle="Reset password" items={["Secure token link", "10 minute expiry", "Instant delivery", "One-time use only"]}>
      <Alert type="success" message={success} onClose={() => setSuccess("")} />
      <Alert type="error"   message={error}   onClose={() => setError("")} />

      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".14em", color: "var(--blue)", marginBottom: 4 }}>
        auth · reset_password
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", marginBottom: 24, letterSpacing: "-.4px" }}>
        Forgot password<span className="px-cursor" />
      </div>

      <form onSubmit={submit} noValidate>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--ink3)", marginBottom: 4 }}>
            email_address
          </label>
          <input className="px-input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} className="px-btn btn-dark px-btn-lg" style={{ width: "100%", marginBottom: 10 }}>
          {loading ? "sending..." : "send_reset_link →"}
        </button>
      </form>
      <div style={{ textAlign: "center", fontSize: 9, color: "var(--ink3)" }}>
        <Link to="/" style={{ color: "var(--ink2)", textDecoration: "none", fontWeight: 600 }}>← back_to_login</Link>
      </div>
    </AuthLayout>
  );
}

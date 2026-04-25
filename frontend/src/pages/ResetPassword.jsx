import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import AuthLayout from "../components/AuthLayout";
import Alert from "../components/Alert";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate  = useNavigate();
  const [password, setPassword] = useState("");
  const [success,  setSuccess]  = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const submit = async e => {
    e.preventDefault();
    setSuccess(""); setError(""); setLoading(true);
    try {
      await api.post(`/password/reset-password/${token}`, { password });
      setSuccess("Password updated. Redirecting...");
      setTimeout(() => navigate("/"), 2000);
    } catch { setError("Invalid or expired token."); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout rightTitle="New password" items={["Strong password required", "Min 6 characters", "Cannot reuse old password", "Immediate effect"]}>
      <Alert type="success" message={success} onClose={() => setSuccess("")} />
      <Alert type="error"   message={error}   onClose={() => setError("")} />

      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".14em", color: "var(--blue)", marginBottom: 4 }}>
        auth · new_password
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", marginBottom: 24, letterSpacing: "-.4px" }}>
        Set password<span className="px-cursor" />
      </div>

      <form onSubmit={submit} noValidate>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--ink3)", marginBottom: 4 }}>
            new_password
          </label>
          <input className="px-input" type="password" placeholder="············" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
        </div>
        <button type="submit" disabled={loading} className="px-btn btn-dark px-btn-lg" style={{ width: "100%", marginBottom: 10 }}>
          {loading ? "updating..." : "update_password →"}
        </button>
      </form>
      <div style={{ textAlign: "center", fontSize: 9, color: "var(--ink3)" }}>
        <Link to="/" style={{ color: "var(--ink2)", textDecoration: "none", fontWeight: 600 }}>← back_to_login</Link>
      </div>
    </AuthLayout>
  );
}

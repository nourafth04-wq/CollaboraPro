import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import AuthLayout from "../components/AuthLayout";
import Alert from "../components/Alert";

export default function Login() {
  const { login }  = useContext(AuthContext);
  const navigate   = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (loading) return;
    setError(""); setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials.");
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout rightTitle="Welcome back">
      <Alert type="error" message={error} onClose={() => setError("")} />

      {/* Eyebrow */}
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".14em", color: "var(--blue)", marginBottom: 4 }}>
        auth · sign_in
      </div>

      {/* Title */}
      <div style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", marginBottom: 24, letterSpacing: "-.4px", display: "flex", alignItems: "center" }}>
        Welcome back<span className="px-cursor" />
      </div>

      <form onSubmit={submit} noValidate>
        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--ink3)", marginBottom: 4 }}>
            email_address
          </label>
          <input
            className="px-input"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--ink3)", marginBottom: 4 }}>
            password
          </label>
          <input
            className="px-input"
            type="password"
            placeholder="············"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-btn btn-dark px-btn-lg"
          style={{ width: "100%", marginBottom: 10 }}
        >
          {loading ? "authenticating..." : "continue →"}
        </button>
      </form>

      <div style={{ textAlign: "center", fontSize: 9, color: "var(--ink3)", letterSpacing: ".04em" }}>
        <Link to="/forgot-password" style={{ color: "var(--ink2)", textDecoration: "none", fontWeight: 600 }}>
          forgot_password?
        </Link>
      </div>
    </AuthLayout>
  );
}

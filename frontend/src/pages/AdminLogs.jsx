import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

const ACTION_TAG = {
  CREATE_USER: "tag-green", DELETE_USER: "tag-red",
  UPDATE_USER: "tag-blue",  UPDATE_ROLE: "tag-yellow",
  LOGIN: "tag-gray", REGISTER: "tag-gray",
};

export default function AdminLogs() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get("/logs").then(r => setLogs(r.data)).finally(() => setLoading(false)); }, []);

  const fmtDate = s => { if (!s) return "—"; const d = new Date(s.includes(" ") ? s.replace(" ","T") : s); return isNaN(d) ? "—" : d.toLocaleString(); };

  return (
    <>
      <Navbar />
      <div className="px-page px-scanlines">
        <div className="px-container">
          <div className="term-bar" style={{ marginBottom: 0 }}>
            <div className="term-dots"><div className="term-dot td-red"/><div className="term-dot td-yellow"/><div className="term-dot td-green"/></div>
            <div className="term-path"><span className="hi">admin</span> / audit_log · {logs.length} entries</div>
          </div>

          <div style={{ border: "2px solid var(--bd2)", boxShadow: "var(--sh-lg)", overflow: "hidden" }}>
            <div className="px-admin-hdr">
              <div className="px-admin-hdr-title"><span>action_history</span></div>
            </div>
            {loading ? (
              <div className="px-loading">loading audit data...</div>
            ) : logs.length === 0 ? (
              <div className="px-empty">no_actions_recorded</div>
            ) : logs.map((log, i) => (
              <div key={log._id || i} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "9px 14px", borderBottom: "1px solid var(--bd)", background: "var(--s)", fontSize: 10, transition: "background .1s" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--s2)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--s)"}>
                <span style={{ fontSize: 9, fontWeight: 600, color: "var(--ink3)", minWidth: 160, flexShrink: 0, fontFamily: "var(--font)" }}>{fmtDate(log.createdAt || log.date)}</span>
                <span style={{ fontWeight: 600, color: "var(--ink)", flex: 1, minWidth: 160 }}>{log.adminEmail || "—"}</span>
                <span className={`px-tag ${ACTION_TAG[log.action] || "tag-gray"}`}>{log.action}</span>
                {log.target && <span style={{ color: "var(--ink2)", fontSize: 10 }}>{log.target}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Navbar from "../components/Navbar";

const Seg = ({ on, color = "blue" }) => <div className={`px-seg ${on ? color : ""}`} />;
const Segs = ({ total = 8, filled = 0, color = "blue" }) => (
  <div className="px-segs">
    {Array.from({ length: total }, (_, i) => <Seg key={i} on={i < filled} color={color} />)}
  </div>
);

// ── Time-based greeting ──────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return "Good morning";
  if (h >= 12 && h < 18) return "Good afternoon";
  if (h >= 18 && h < 22) return "Good evening";
  return "Working late";
}

// ── Time period for the terminal line ───────────────────
function getTimePeriod() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return "morning_session";
  if (h >= 12 && h < 18) return "afternoon_session";
  if (h >= 18 && h < 22) return "evening_session";
  return "night_session";
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data,    setData]    = useState(null);
  const [error,   setError]   = useState(false);
  const [greeting] = useState(getGreeting);   // computed once on mount
  const [period]   = useState(getTimePeriod);

  useEffect(() => {
    api.get("/dashboard")
      .then(r => setData(r.data))
      .catch(() => {
        // API failed — set empty data so the page still renders
        setData({ projects: 0, tasks: { todo: 0, in_progress: 0, done: 0, total: 0 }, recentActivity: [] });
        setError(true);
      });
  }, []);

  if (!data) return (
    <>
      <Navbar />
      <div className="px-page px-scanlines">
        <div className="px-container">
          <div className="px-loading">loading system data...</div>
        </div>
      </div>
    </>
  );

  const kpiColors = {
    blue:   "var(--blue)",
    green:  "var(--green)",
    yellow: "var(--yellow)",
    red:    "var(--red)",
  };

  const projects   = data.projects    ?? 0;
  const todo       = data.tasks?.todo        ?? 0;
  const inProgress = data.tasks?.in_progress ?? 0;
  const done       = data.tasks?.done        ?? 0;

  const kpis = [
    { label: "projects",    val: String(projects).padStart(2, "0"),    color: "blue",   segs: Math.min(8, projects * 2) },
    { label: "to_do",       val: String(todo).padStart(2, "0"),        color: "blue",   segs: Math.min(8, todo) },
    { label: "in_progress", val: String(inProgress).padStart(2, "0"), color: "yellow", segs: Math.min(8, inProgress) },
    { label: "completed",   val: String(done).padStart(2, "0"),        color: "green",  segs: Math.min(8, done) },
  ];

  // Quick links — hide admin-only links for non-admins
  const isAdmin = user?.role === "admin";
  const quickLinks = [
    { to: "/projects",    label: "~/projects", sub: "view your projects",   color: "var(--blue)",   always: true },
    { to: "/admin/users", label: "~/users",    sub: "manage team members",  color: "var(--green)",  always: false },
    { to: "/admin/logs",  label: "~/logs",     sub: "view audit trail",     color: "var(--yellow)", always: false },
  ].filter(l => l.always || isAdmin);

  return (
    <>
      <Navbar />
      <div className="px-page px-scanlines">
        <div className="px-container">

          {/* Greeting */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "var(--ink3)", marginBottom: 6, letterSpacing: ".04em" }}>
              $ whoami →{" "}
              <span style={{ color: "var(--blue)" }}>{user?.email?.split("@")[0]}</span>
              {" "}· role={user?.role} · {period}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", letterSpacing: "-.5px", display: "flex", alignItems: "center" }}>
              {greeting}<span className="px-cursor" />
            </div>
          </div>

          {/* Error notice for non-admins with no data */}
          {error && (
            <div style={{ marginBottom: 14, padding: "8px 12px", background: "var(--yellow-l)", border: "2px solid var(--yellow)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--yellow-d)" }}>
              // dashboard_data unavailable — you may not be assigned to any projects yet
            </div>
          )}

          {/* KPI Strip */}
          <div className="px-kpi-strip" style={{ marginBottom: 20 }}>
            {kpis.map(({ label, val, color, segs }) => (
              <div key={label} className="px-kpi">
                <div className="px-kpi-label">{label}</div>
                <div className="px-kpi-val" style={{ color: kpiColors[color] }}>{val}</div>
                <Segs total={8} filled={segs} color={color} />
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div className="px-sec" style={{ margin: 0 }}>quick_access</div>
            <Link to="/projects" className="px-btn btn-ghost px-btn-sm">view_all →</Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8, marginBottom: 20 }}>
            {quickLinks.map(({ to, label, sub, color }) => (
              <Link key={to} to={to} style={{ textDecoration: "none" }}>
                <div
                  className="px-card"
                  style={{ padding: "12px 14px", borderLeft: `3px solid ${color}`, transition: "box-shadow .12s" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "var(--sh-lg)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "var(--sh)"}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink)", marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 9, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em" }}>{sub}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent activity — admin only */}
          {isAdmin && data.recentActivity?.length > 0 && (
            <div className="px-card-lg" style={{ overflow: "hidden" }}>
              <div style={{ background: "var(--s2)", borderBottom: "2px solid var(--bd2)", padding: "8px 14px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--ink3)" }}>
                  <span style={{ color: "var(--blue)" }}>// </span>recent_activity
                </div>
              </div>
              {data.recentActivity.map((log, i) => (
                <div key={log._id || i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "8px 14px", borderBottom: "1px solid var(--bd)",
                  background: "var(--s)", fontSize: 10,
                  transition: "background .1s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--s2)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--s)"}>
                  <span style={{ fontWeight: 700, color: "var(--blue)", fontSize: 9, textTransform: "uppercase", letterSpacing: ".04em" }}>{log.action}</span>
                  <span style={{ color: "var(--bd2)" }}>·</span>
                  <span style={{ color: "var(--ink2)" }}>{log.target || "—"}</span>
                </div>
              ))}
            </div>
          )}

          {/* For team/client — show a helpful message if no data */}
          {!isAdmin && projects === 0 && (
            <div style={{ border: "2px dashed var(--bd2)", padding: "28px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink3)", marginBottom: 8 }}>
                // no_projects_found
              </div>
              <div style={{ fontSize: 9, color: "var(--ink3)", marginBottom: 14, letterSpacing: ".04em" }}>
                You haven't been added to any projects yet. Contact your admin or Scrum Master.
              </div>
              <Link to="/projects" className="px-btn btn-primary px-btn-sm">browse_projects →</Link>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

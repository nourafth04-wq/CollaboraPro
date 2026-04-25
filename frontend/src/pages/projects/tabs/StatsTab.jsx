import { useState, useEffect } from "react";
import api from "../../../api/axios";
import Alert from "../../../components/Alert";

const PxBar = ({ filled = 0, total = 10, color = "var(--blue)" }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {Array.from({ length: total }, (_, i) => (
      <div key={i} style={{ width: 8, height: 8, border: `1.5px solid ${i < filled ? color : "var(--bd2)"}`, background: i < filled ? color + "40" : "transparent" }} />
    ))}
  </div>
);

export default function StatsTab({ stats, projectId }) {
  const [memberStats, setMemberStats] = useState(null);
  const [exporting,   setExporting]   = useState(false);
  const [alert,       setAlert]       = useState(null);

  useEffect(() => {
    api.get(`/projects/${projectId}/stats/members`).then(r => setMemberStats(r.data.memberStats)).catch(() => {});
  }, [projectId]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await api.get(`/projects/${projectId}/stats/export`);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `${stats.project.name.replace(/\s+/g,"_")}_report.json`;
      a.click(); URL.revokeObjectURL(url);
      setAlert({ type: "success", message: "report_exported." });
    } catch { setAlert({ type: "error", message: "export_failed." }); }
    finally { setExporting(false); }
  };

  const { tasks, priorities } = stats;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink)" }}>
          $ project_stats <span style={{ color: "var(--blue)" }}>·</span> <span style={{ color: "var(--ink3)", fontWeight: 400 }}>{stats.project.name}</span>
        </div>
        <button className="px-btn btn-ghost px-btn-sm" onClick={handleExport} disabled={exporting}>
          {exporting ? "exporting..." : "export_report →"}
        </button>
      </div>

      {/* Stat blocks */}
      <div style={{ border: "2px solid var(--bd2)", boxShadow: "var(--sh-lg)", overflow: "hidden", background: "var(--s)" }}>
        <div className="px-stats-hdr">
          <div className="px-stats-title">task_metrics</div>
        </div>
        <div className="px-stat-grid">
          <div className="px-stat">
            <div className="px-stat-label">completion</div>
            <div className="px-stat-val" style={{ color: "var(--blue)" }}>{tasks.completionRate}%</div>
            <div className="px-stat-sub">{tasks.done} / {tasks.total} tasks done</div>
            <PxBar filled={Math.round(tasks.completionRate / 10)} total={10} color="var(--blue)" />
          </div>
          <div className="px-stat">
            <div className="px-stat-label">in_progress</div>
            <div className="px-stat-val" style={{ color: "var(--yellow)" }}>{String(tasks.doing).padStart(2,"0")}</div>
            <div className="px-stat-sub">tasks being worked on</div>
            <PxBar filled={Math.min(10, tasks.doing)} total={10} color="var(--yellow)" />
          </div>
          <div className="px-stat">
            <div className="px-stat-label">overdue</div>
            <div className="px-stat-val" style={{ color: tasks.overdue > 0 ? "var(--red)" : "var(--green)" }}>{String(tasks.overdue || 0).padStart(2,"0")}</div>
            <div className="px-stat-sub">{tasks.overdue > 0 ? "need attention" : "all on track"}</div>
            <PxBar filled={Math.min(10, tasks.overdue || 0)} total={10} color="var(--red)" />
          </div>
        </div>
      </div>

      {/* Priority breakdown */}
      <div style={{ border: "2px solid var(--bd2)", boxShadow: "var(--sh)", background: "var(--s)" }}>
        <div className="px-stats-hdr">
          <div className="px-stats-title">priority_breakdown</div>
        </div>
        <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "HIGH",   val: priorities.high,   color: "var(--red)" },
            { label: "MEDIUM", val: priorities.medium, color: "var(--yellow)" },
            { label: "LOW",    val: priorities.low,    color: "var(--green)" },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 52, fontSize: 8, fontWeight: 700, color, letterSpacing: ".1em" }}>{label}</span>
              <div style={{ flex: 1, height: 4, background: "var(--s3)", border: "1px solid var(--bd2)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: tasks.total > 0 ? `${(val / tasks.total) * 100}%` : "0%", background: color, transition: "width .5s" }} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: "var(--ink3)", minWidth: 20, textAlign: "right" }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Member workload */}
      {memberStats?.length > 0 && (
        <div style={{ border: "2px solid var(--bd2)", boxShadow: "var(--sh)", overflow: "hidden", background: "var(--s)" }}>
          <div className="px-stats-hdr">
            <div className="px-stats-title">member_workload</div>
          </div>
          <div style={{ background: "var(--s2)", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 4, padding: "6px 14px", fontSize: 7, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink3)", borderBottom: "1px solid var(--bd)" }}>
            <span>member</span><span>role</span><span>total</span><span>done</span><span>rate</span>
          </div>
          {memberStats.map(ms => (
            <div key={ms.user._id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 4, padding: "8px 14px", borderBottom: "1px solid var(--bd)", fontSize: 10, alignItems: "center", background: "var(--s)" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--s2)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--s)"}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--ink)" }}>{ms.user.email}</span>
              <span className={`px-tag ${ms.projectRole === "admin" ? "tag-blue" : ms.projectRole === "team" ? "tag-green" : "tag-yellow"}`} style={{ fontSize: 8 }}>{ms.projectRole}</span>
              <span style={{ color: "var(--ink2)" }}>{ms.tasks.total}</span>
              <span style={{ color: "var(--green)", fontWeight: 700 }}>{ms.tasks.completed}</span>
              <span style={{ color: "var(--blue)", fontWeight: 700 }}>{ms.tasks.completionRate}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

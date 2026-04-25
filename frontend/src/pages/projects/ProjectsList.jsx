import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import Alert from "../../components/Alert";

export default function ProjectsList() {
  const [projects,   setProjects]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form,       setForm]       = useState({ name: "", description: "", deadline: "" });
  const [alert,      setAlert]      = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchProjects(); }, []);
  const fetchProjects = async () => {
    try { const { data } = await api.get("/projects"); setProjects(data); }
    catch { setAlert({ type: "error", message: "load_failed." }); }
    finally { setLoading(false); }
  };

  const handleCreate = async e => {
    e.preventDefault();
    if (!form.name.trim()) return setAlert({ type: "error", message: "project_name required." });
    try { await api.post("/projects", form); setAlert({ type: "success", message: "project_created." }); setShowCreate(false); setForm({ name: "", description: "", deadline: "" }); fetchProjects(); }
    catch (err) { setAlert({ type: "error", message: err.response?.data?.message || "create_failed." }); }
  };

  const statusTag = s => ({ active: "tag-green", completed: "tag-blue", archived: "tag-gray" }[s] || "tag-gray");
  const pct = p => {
    if (!p.tasks || p.tasks.length === 0) return 0;
    return Math.round((p.tasks.filter(t => t.status === "done").length / p.tasks.length) * 100);
  };

  return (
    <>
      <Navbar />
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <div className="px-page px-scanlines">
        <div className="px-container">

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".14em", color: "var(--blue)", marginBottom: 3 }}>
                // projects
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", letterSpacing: "-.4px" }}>
                ~/projects <span style={{ color: "var(--ink3)", fontSize: 12, fontWeight: 400 }}>({projects.length})</span>
              </div>
            </div>
            <button className="px-btn btn-primary" onClick={() => setShowCreate(true)}>+ new_project</button>
          </div>

          {/* Create modal */}
          {showCreate && (
            <div className="px-modal-overlay" onClick={() => setShowCreate(false)}>
              <div className="px-modal" onClick={e => e.stopPropagation()}>
                <div className="px-modal-title">new_project</div>
                <form onSubmit={handleCreate} noValidate>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink3)", display: "block", marginBottom: 4 }}>project_name *</label>
                    <input className="px-input" placeholder="my_awesome_project" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink3)", display: "block", marginBottom: 4 }}>description</label>
                    <textarea className="px-input" style={{ height: 72, resize: "none", paddingTop: 8 }} placeholder="what is this project about?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink3)", display: "block", marginBottom: 4 }}>deadline</label>
                    <input type="date" className="px-input" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button type="button" className="px-btn btn-ghost" onClick={() => setShowCreate(false)}>cancel</button>
                    <button type="submit" className="px-btn btn-primary">create →</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* List */}
          {loading ? <div className="px-loading">loading projects...</div>
          : projects.length === 0 ? (
            <div className="px-empty" style={{ padding: "48px 24px" }}>
              <div style={{ fontSize: 11, marginBottom: 12 }}>no_projects_yet</div>
              <button className="px-btn btn-primary" onClick={() => setShowCreate(true)}>+ create_first_project</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
              {projects.map(p => (
                <div key={p._id} className={`px-proj-card ${p.status !== "active" ? "done" : ""}`} onClick={() => navigate(`/projects/${p._id}`)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink)", paddingLeft: 8 }}>
                      <span style={{ color: "var(--blue)" }}>~/</span>{p.name.toLowerCase().replace(/\s+/g,"_")}
                    </div>
                    <span className={`px-tag ${statusTag(p.status)}`}>{p.status}</span>
                  </div>
                  <div style={{ fontSize: 10, color: "var(--ink3)", lineHeight: 1.55, marginBottom: 10, paddingLeft: 8 }}>
                    {p.description || "no_description_provided"}
                  </div>
                  <div className="px-prog" style={{ marginLeft: 8 }}>
                    <div className="px-prog-fill" style={{ width: `${pct(p)}%`, background: p.status === "completed" ? "var(--green)" : "var(--blue)" }} />
                  </div>
                  <div style={{ display: "flex", gap: 14, fontSize: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--ink3)", paddingLeft: 8 }}>
                    <span>{p.members.length} members</span>
                    {p.deadline && <span>due {new Date(p.deadline).toLocaleDateString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import Alert from "../../components/Alert";
import { useAuth } from "../../context/AuthContext";
import TasksTab     from "./tabs/TasksTab";
import DocumentsTab from "./tabs/DocumentsTab";
import ChatTab      from "./tabs/ChatTab";
import StatsTab     from "./tabs/StatsTab";
import MembersTab   from "./tabs/MembersTab";

const TABS = [
  { key: "overview",   label: "[ overview ]" },
  { key: "tasks",      label: "[ tasks ]" },
  { key: "documents",  label: "[ docs ]" },
  { key: "chat",       label: "[ chat ]" },
  { key: "members",    label: "[ members ]" },
];

export default function ProjectDetail() {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project,   setProject]   = useState(null);
  const [stats,     setStats]     = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading,   setLoading]   = useState(true);
  const [alert,     setAlert]     = useState(null);
  const [editMode,  setEditMode]  = useState(false);
  const [editForm,  setEditForm]  = useState({});

  useEffect(() => { fetchProject(); fetchStats(); }, [id]);

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
      setEditForm({ name: data.name, description: data.description || "", status: data.status, deadline: data.deadline?.split("T")[0] || "" });
    } catch (err) {
      if (err.response?.status === 404) navigate("/projects");
      else setAlert({ type: "error", message: "Failed to load project." });
    } finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try { const { data } = await api.get(`/projects/${id}/stats`); setStats(data); } catch (_) {}
  };

  const handleUpdate = async e => {
    e.preventDefault();
    try { await api.put(`/projects/${id}`, editForm); setAlert({ type: "success", message: "project_updated." }); setEditMode(false); fetchProject(); }
    catch (err) { setAlert({ type: "error", message: err.response?.data?.message || "update_failed." }); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`delete_project "${project.name}"?`)) return;
    try { await api.delete(`/projects/${id}`); navigate("/projects"); }
    catch { setAlert({ type: "error", message: "delete_failed." }); }
  };

  const isOwner = project && (project.owner._id === user?._id || project.owner._id === user?.id || user?.role === "admin");
  const statusTag = { active: "tag-green", completed: "tag-blue", archived: "tag-gray" };

  if (loading) return (
    <><Navbar />
      <div className="px-page px-scanlines">
        <div className="px-container"><div className="px-loading">loading project data...</div></div>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <div className="px-page px-scanlines">
        <div className="px-container">

          {/* Terminal chrome */}
          <div className="term-bar" style={{ marginBottom: 0 }}>
            <div className="term-dots"><div className="term-dot td-red"/><div className="term-dot td-yellow"/><div className="term-dot td-green"/></div>
            <div className="term-path">
              <span className="hi">~/projects</span> / {project.name.toLowerCase().replace(/\s+/g,"_")} — {project.status}
            </div>
          </div>

          {/* Project header */}
          <div className="px-card-lg" style={{ padding: 16, marginBottom: 14 }}>
            {editMode ? (
              <form onSubmit={handleUpdate} noValidate>
                <input className="px-input" style={{ marginBottom: 8, fontSize: 13, fontWeight: 700 }} value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="project_name" />
                <textarea className="px-input" style={{ marginBottom: 8, height: 60, resize: "none", paddingTop: 8 }} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} placeholder="description" />
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <select className="px-input" style={{ flex: 1 }} value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                    <option value="active">active</option><option value="completed">completed</option><option value="archived">archived</option>
                  </select>
                  <input type="date" className="px-input" style={{ flex: 1 }} value={editForm.deadline} onChange={e => setEditForm({ ...editForm, deadline: e.target.value })} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="px-btn btn-ghost px-btn-sm" onClick={() => setEditMode(false)}>cancel</button>
                  <button type="submit" className="px-btn btn-primary px-btn-sm">save_changes →</button>
                </div>
              </form>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", letterSpacing: "-.3px" }}>
                      <span style={{ color: "var(--blue)" }}>~/</span>
                      {project.name.toLowerCase().replace(/\s+/g,"_")}
                    </div>
                    <span className={`px-tag ${statusTag[project.status] || "tag-gray"}`}>{project.status}</span>
                  </div>
                  {project.description && <div style={{ fontSize: 10, color: "var(--ink3)", marginBottom: 8, lineHeight: 1.55 }}>{project.description}</div>}
                  <div style={{ display: "flex", gap: 14, fontSize: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--ink3)" }}>
                    <span>owner={project.owner.email}</span>
                    {project.deadline && <span>due={new Date(project.deadline).toLocaleDateString()}</span>}
                    <span>members={project.members.length}</span>
                  </div>
                </div>
                {isOwner && (
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button className="px-btn btn-ghost px-btn-sm" onClick={() => setEditMode(true)}>edit</button>
                    <button className="px-btn btn-danger px-btn-sm" onClick={handleDelete}>delete</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="px-tabs" style={{ marginBottom: 14 }}>
            {TABS.map(({ key, label }) => (
              <button key={key} className={`px-tab ${activeTab === key ? "active" : ""}`} onClick={() => setActiveTab(key)}>
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "overview"   && stats   && <StatsTab     stats={stats} projectId={id} />}
          {activeTab === "overview"   && !stats  && <div className="px-loading">loading stats...</div>}
          {activeTab === "tasks"      && <TasksTab     projectId={id} members={project.members} currentUser={user} />}
          {activeTab === "documents"  && <DocumentsTab projectId={id} currentUser={user} />}
          {activeTab === "chat"       && <ChatTab      projectId={id} currentUser={user} members={project.members} />}
          {activeTab === "members"    && <MembersTab   project={project} currentUser={user} isOwner={isOwner} onRefresh={fetchProject} />}
        </div>
      </div>
    </>
  );
}

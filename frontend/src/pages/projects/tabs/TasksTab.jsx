import { useState, useEffect } from "react";
import api from "../../../api/axios";
import Alert from "../../../components/Alert";

const COLS   = ["todo", "doing", "done"];
const LABELS = { todo: "[ todo ]", doing: "[ doing ]", done: "[ done ]" };
const COL_COLOR = { todo: "var(--ink3)", doing: "var(--yellow)", done: "var(--green)" };
const PRIO_CLS = { high: "tag-red", medium: "tag-yellow", low: "tag-green" };
const PRIO_BORDER = { high: "var(--red)", medium: "var(--yellow)", low: "var(--green)" };

export default function TasksTab({ projectId, members, currentUser }) {
  const [tasks,        setTasks]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [alert,        setAlert]        = useState(null);
  const [showCreate,   setShowCreate]   = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [form,         setForm]         = useState({ title: "", description: "", assignee: "", priority: "medium", deadline: "" });
  const [commentText,  setCommentText]  = useState("");
  const [subTaskText,  setSubTaskText]  = useState("");

  useEffect(() => { fetchTasks(); }, [projectId]);

  const fetchTasks = async () => {
    try { const { data } = await api.get(`/projects/${projectId}/tasks`); setTasks(data); }
    catch { setAlert({ type: "error", message: "load_failed." }); }
    finally { setLoading(false); }
  };

  const refresh = async taskId => {
    const { data } = await api.get(`/projects/${projectId}/tasks/${taskId}`);
    setSelectedTask(data);
    setTasks(prev => prev.map(t => t._id === data._id ? data : t));
  };

  const create = async e => {
    e.preventDefault();
    if (!form.title.trim()) return setAlert({ type: "error", message: "title required." });
    try { await api.post(`/projects/${projectId}/tasks`, form); setAlert({ type: "success", message: "task_created." }); setShowCreate(false); setForm({ title: "", description: "", assignee: "", priority: "medium", deadline: "" }); fetchTasks(); }
    catch (err) { setAlert({ type: "error", message: err.response?.data?.message || "error." }); }
  };

  const changeStatus = async (taskId, s) => {
    try { await api.put(`/projects/${projectId}/tasks/${taskId}`, { status: s }); fetchTasks(); if (selectedTask?._id === taskId) refresh(taskId); }
    catch { setAlert({ type: "error", message: "update_failed." }); }
  };

  const deleteTask = async taskId => {
    if (!window.confirm("delete_task?")) return;
    await api.delete(`/projects/${projectId}/tasks/${taskId}`);
    setSelectedTask(null); fetchTasks();
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    await api.post(`/projects/${projectId}/tasks/${selectedTask._id}/comments`, { content: commentText });
    setCommentText(""); refresh(selectedTask._id);
  };

  const addSubTask = async () => {
    if (!subTaskText.trim()) return;
    await api.post(`/projects/${projectId}/tasks/${selectedTask._id}/subtasks`, { title: subTaskText });
    setSubTaskText(""); refresh(selectedTask._id);
  };

  const toggleSub = async subId => {
    await api.patch(`/projects/${projectId}/tasks/${selectedTask._id}/subtasks/${subId}/toggle`);
    refresh(selectedTask._id);
  };

  const F = ({ label, children }) => (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "block", fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink3)", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );

  if (loading) return <div className="px-loading">loading tasks...</div>;

  return (
    <div>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink)" }}>
          $ task_board <span style={{ color: "var(--blue)" }}>·</span> <span style={{ color: "var(--ink3)", fontWeight: 400 }}>{tasks.length} tasks</span>
        </div>
        <button className="px-btn btn-primary px-btn-sm" onClick={() => setShowCreate(true)}>+ new_task</button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="px-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="px-modal" onClick={e => e.stopPropagation()}>
            <div className="px-modal-title">new_task</div>
            <form onSubmit={create} noValidate>
              <F label="title *"><input className="px-input" placeholder="task_title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></F>
              <F label="description"><textarea className="px-input" style={{ height: 60, resize: "none", paddingTop: 8 }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></F>
              <F label="assign_to">
                <select className="px-input" value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })}>
                  <option value="">unassigned</option>
                  {members.map(m => <option key={m.user._id} value={m.user._id}>{m.user.email}</option>)}
                </select>
              </F>
              <F label="priority">
                <select className="px-input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">low</option><option value="medium">medium</option><option value="high">high</option>
                </select>
              </F>
              <F label="deadline"><input type="date" className="px-input" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></F>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button type="button" className="px-btn btn-ghost" onClick={() => setShowCreate(false)}>cancel</button>
                <button type="submit" className="px-btn btn-primary">create →</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kanban */}
      <div className="px-kan-grid">
        {COLS.map(col => (
          <div key={col} className="px-kan-col">
            <div className="px-kan-col-hdr">
              <span className="px-kan-col-name" style={{ color: COL_COLOR[col] }}>{LABELS[col]}</span>
              <span className="px-kan-col-count">{tasks.filter(t => t.status === col).length.toString().padStart(2,"0")}</span>
            </div>
            {tasks.filter(t => t.status === col).length === 0 ? (
              <div className="px-kcard-empty">empty</div>
            ) : tasks.filter(t => t.status === col).map(task => (
              <div key={task._id} className={`px-kcard priority-${task.priority} ${col === "done" ? "is-done" : ""}`} onClick={() => setSelectedTask(task)}>
                <div className="px-kcard-title">{task.title}</div>
                <div className="px-kcard-foot">
                  <span className="px-kcard-who">{task.assignee?.email?.split("@")[0] || "—"}</span>
                  {col === "done"
                    ? <div className="px-kcard-checkmark"><svg width="7" height="5" viewBox="0 0 7 5"><path d="M1 2.5L3 4.5L6 1" stroke="var(--green)" strokeWidth="1.5" fill="none"/></svg></div>
                    : <span className={`px-tag ${PRIO_CLS[task.priority]}`} style={{ fontSize: 8 }}>{task.priority}</span>
                  }
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Drawer */}
      {selectedTask && (
        <div className="px-drawer-overlay" onClick={() => setSelectedTask(null)}>
          <div className="px-drawer" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedTask(null)} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "var(--ink3)", fontFamily: "var(--font)" }}>
              [ ✕ ]
            </button>

            {/* Title */}
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--blue)", marginBottom: 4 }}>// task_detail</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", paddingRight: 40, marginBottom: 4, letterSpacing: "-.2px", borderLeft: `3px solid ${PRIO_BORDER[selectedTask.priority]}`, paddingLeft: 8 }}>
              {selectedTask.title}
            </div>
            <div style={{ fontSize: 10, color: "var(--ink3)", lineHeight: 1.55, marginBottom: 14, paddingLeft: 8 }}>
              {selectedTask.description || "no_description"}
            </div>

            {/* Meta */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16, padding: 12, background: "var(--s2)", border: "2px solid var(--bd2)" }}>
              <div>
                <div style={{ fontSize: 7, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink3)", marginBottom: 4 }}>status</div>
                <select className="px-input" style={{ height: 28, fontSize: 10 }} value={selectedTask.status} onChange={e => changeStatus(selectedTask._id, e.target.value)}>
                  {COLS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 7, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink3)", marginBottom: 4 }}>priority</div>
                <span className={`px-tag ${PRIO_CLS[selectedTask.priority]}`}>{selectedTask.priority}</span>
              </div>
              <div>
                <div style={{ fontSize: 7, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink3)", marginBottom: 4 }}>assignee</div>
                <div style={{ fontSize: 10, color: "var(--ink)" }}>{selectedTask.assignee?.email || "unassigned"}</div>
              </div>
              {selectedTask.deadline && (
                <div>
                  <div style={{ fontSize: 7, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink3)", marginBottom: 4 }}>deadline</div>
                  <div style={{ fontSize: 10, color: "var(--ink)" }}>{new Date(selectedTask.deadline).toLocaleDateString()}</div>
                </div>
              )}
            </div>

            {/* Subtasks */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink)", marginBottom: 8 }}>
                // subtasks ({selectedTask.subTasks.filter(s=>s.completed).length}/{selectedTask.subTasks.length})
              </div>
              {selectedTask.subTasks.map(s => (
                <label key={s._id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px", cursor: "pointer", marginBottom: 2 }}>
                  <div style={{ width: 12, height: 12, border: `1.5px solid ${s.completed ? "var(--green)" : "var(--bd2)"}`, background: s.completed ? "var(--green-l)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                    onClick={() => toggleSub(s._id)}>
                    {s.completed && <svg width="7" height="5" viewBox="0 0 7 5"><path d="M1 2.5L3 4.5L6 1" stroke="var(--green)" strokeWidth="1.5" fill="none"/></svg>}
                  </div>
                  <span style={{ fontSize: 11, color: s.completed ? "var(--ink3)" : "var(--ink)", textDecoration: s.completed ? "line-through" : "none" }}>{s.title}</span>
                </label>
              ))}
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <input className="px-input" style={{ flex: 1, height: 28, fontSize: 10 }} placeholder="add_subtask..." value={subTaskText} onChange={e => setSubTaskText(e.target.value)} onKeyDown={e => e.key === "Enter" && addSubTask()} />
                <button className="px-btn btn-ghost px-btn-sm" onClick={addSubTask}>add</button>
              </div>
            </div>

            {/* Comments */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink)", marginBottom: 8 }}>
                // comments ({selectedTask.comments.length})
              </div>
              <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                {selectedTask.comments.map(c => (
                  <div key={c._id} style={{ padding: "8px 10px", background: "var(--s2)", border: "2px solid var(--bd2)", borderLeft: "3px solid var(--blue)" }}>
                    <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--blue)", marginBottom: 3 }}>{c.author.email}</div>
                    <div style={{ fontSize: 11, color: "var(--ink)", lineHeight: 1.45 }}>{c.content}</div>
                    <div style={{ fontSize: 8, color: "var(--ink3)", marginTop: 3 }}>{new Date(c.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <textarea className="px-input" style={{ marginBottom: 6, height: 60, resize: "none", paddingTop: 8 }} placeholder="write_comment..." value={commentText} onChange={e => setCommentText(e.target.value)} />
              <button className="px-btn btn-primary px-btn-sm" onClick={addComment}>post_comment →</button>
            </div>

            <div style={{ borderTop: "2px dashed var(--bd2)", paddingTop: 14 }}>
              <button className="px-btn btn-danger px-btn-sm" onClick={() => deleteTask(selectedTask._id)}>delete_task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

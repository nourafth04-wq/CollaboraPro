import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import PageLayout from "../components/PageLayout";
import Alert from "../components/Alert";

export default function AdminUsers() {
  const [users,     setUsers]     = useState([]);
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [role,      setRole]      = useState("team");
  const [alert,     setAlert]     = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [newRole,   setNewRole]   = useState("");

  const load = async () => { try { const r = await api.get("/users"); setUsers(r.data); } catch (_) {} };
  useEffect(() => { load(); }, []);

  const createUser = async () => {
    if (!email || !password) return;
    try { await api.post("/users", { email, password, role }); setAlert({ type: "success", message: "user_created successfully." }); setEmail(""); setPassword(""); setRole("team"); load(); }
    catch (e) { setAlert({ type: "error", message: e.response?.data?.message || "create_failed." }); }
  };

  const deleteUser = async id => {
    if (!window.confirm("delete_user? this cannot be undone.")) return;
    try { await api.delete(`/users/${id}`); setAlert({ type: "success", message: "user_deleted." }); load(); }
    catch { setAlert({ type: "error", message: "delete_failed." }); }
  };

  const confirmRole = async id => {
    try { await api.put(`/users/${id}/role`, { role: newRole }); setEditingId(null); setNewRole(""); setAlert({ type: "success", message: "role_updated." }); load(); }
    catch { setAlert({ type: "error", message: "update_failed." }); }
  };

  const roleTag = r => {
    const map = { admin: "tag-blue", team: "tag-green", client: "tag-yellow" };
    return <span className={`px-tag ${map[r] || "tag-gray"}`}>{r}</span>;
  };

  const avStyle = r => ({
    admin:  { background: "var(--blue-l)",   color: "var(--blue-d)",   borderColor: "var(--blue)" },
    team:   { background: "var(--green-l)",  color: "var(--green-d)",  borderColor: "var(--green)" },
    client: { background: "var(--yellow-l)", color: "var(--yellow-d)", borderColor: "var(--yellow)" },
  }[r] || { background: "var(--s2)", color: "var(--ink3)", borderColor: "var(--bd2)" });

  return (
    <>
      <Navbar />
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <div className="px-page px-scanlines">
        <div className="px-container">

          {/* Terminal chrome */}
          <div className="term-bar" style={{ marginBottom: 0 }}>
            <div className="term-dots"><div className="term-dot td-red"/><div className="term-dot td-yellow"/><div className="term-dot td-green"/></div>
            <div className="term-path"><span className="hi">admin</span> / user_management · {users.length} records</div>
          </div>

          {/* Create user */}
          <div className="px-card-lg" style={{ padding: 20, marginBottom: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--ink3)", marginBottom: 14 }}>
              <span style={{ color: "var(--blue)" }}>// </span>create_user
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 160px", gap: 8, marginBottom: 12 }}>
              <input className="px-input" placeholder="email_address" value={email} onChange={e => setEmail(e.target.value)} />
              <input className="px-input" type="password" placeholder="password" value={password} onChange={e => setPassword(e.target.value)} />
              <select className="px-input" value={role} onChange={e => setRole(e.target.value)}>
                <option value="team">team</option>
                <option value="admin">admin</option>
                <option value="client">client</option>
              </select>
            </div>
            <button className="px-btn btn-primary" onClick={createUser}>+ create_user</button>
          </div>

          {/* User list */}
          <div style={{ border: "2px solid var(--bd2)", boxShadow: "var(--sh-lg)", overflow: "hidden" }}>
            <div className="px-admin-hdr">
              <div className="px-admin-hdr-title"><span>user_list</span> · {users.length} records</div>
            </div>
            {users.length === 0 ? (
              <div className="px-empty">no_users_found</div>
            ) : users.map(u => (
              <div key={u._id} className="px-admin-row">
                <div className="px-user-av" style={avStyle(u.role)}>{u.email[0].toUpperCase()}</div>
                <div className="px-user-email">{u.email}</div>
                {editingId === u._id ? (
                  <select className="px-input" style={{ width: 120, marginRight: 6 }} value={newRole} onChange={e => setNewRole(e.target.value)}>
                    <option value="team">team</option><option value="admin">admin</option><option value="client">client</option>
                  </select>
                ) : roleTag(u.role)}
                <div style={{ display: "flex", gap: 5 }}>
                  {editingId === u._id ? (
                    <>
                      <button className="px-btn btn-success px-btn-xs" onClick={() => confirmRole(u._id)}>✓ save</button>
                      <button className="px-btn btn-ghost px-btn-xs" onClick={() => { setEditingId(null); setNewRole(""); }}>✕ cancel</button>
                    </>
                  ) : (
                    <button className="px-btn btn-ghost px-btn-xs" onClick={() => { setEditingId(u._id); setNewRole(u.role); }}>edit_role</button>
                  )}
                  <button className="px-btn btn-danger px-btn-xs" onClick={() => deleteUser(u._id)}>delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

import { useState } from "react";
import api from "../../../api/axios";
import Alert from "../../../components/Alert";

export default function MembersTab({ project, currentUser, isOwner, onRefresh }) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole,  setInviteRole]  = useState("team");
  const [alert,       setAlert]       = useState(null);
  const [loading,     setLoading]     = useState(false);

  const handleInvite = async e => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setLoading(true);
    try {
      const { data: users } = await api.get("/users");
      const target = users.find(u => u.email.toLowerCase() === inviteEmail.toLowerCase());
      if (!target) { setAlert({ type: "error", message: "user_not_found. check their account exists." }); return; }
      await api.post(`/projects/${project._id}/members`, { userId: target._id, role: inviteRole });
      setAlert({ type: "success", message: `${target.email} added as ${inviteRole}.` });
      setInviteEmail(""); onRefresh();
    } catch (err) { setAlert({ type: "error", message: err.response?.data?.message || "invite_failed." }); }
    finally { setLoading(false); }
  };

  const handleRemove = async (userId, email) => {
    if (!window.confirm(`remove ${email}?`)) return;
    try { await api.delete(`/projects/${project._id}/members/${userId}`); setAlert({ type: "success", message: `${email} removed.` }); onRefresh(); }
    catch { setAlert({ type: "error", message: "remove_failed." }); }
  };

  const roleTag = r => ({ admin: "tag-blue", team: "tag-green", client: "tag-yellow" }[r] || "tag-gray");
  const avStyle = r => ({
    admin:  { background: "var(--blue-l)",   color: "var(--blue-d)",   borderColor: "var(--blue)" },
    team:   { background: "var(--green-l)",  color: "var(--green-d)",  borderColor: "var(--green)" },
    client: { background: "var(--yellow-l)", color: "var(--yellow-d)", borderColor: "var(--yellow)" },
  }[r] || { background: "var(--s2)", color: "var(--ink3)", borderColor: "var(--bd2)" });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink)" }}>
        $ members <span style={{ color: "var(--blue)" }}>·</span> <span style={{ color: "var(--ink3)", fontWeight: 400 }}>{project.members.length} in project</span>
      </div>

      {/* Invite */}
      {isOwner && (
        <div className="px-card-lg" style={{ padding: 16 }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--ink3)", marginBottom: 12 }}>
            <span style={{ color: "var(--blue)" }}>// </span>invite_member
          </div>
          <form onSubmit={handleInvite} noValidate style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input className="px-input" style={{ flex: 1, minWidth: 200 }} placeholder="email_address" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
            <select className="px-input" style={{ width: 120 }} value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
              <option value="team">team</option>
              <option value="client">client</option>
              <option value="admin">admin</option>
            </select>
            <button type="submit" className="px-btn btn-primary" disabled={loading}>{loading ? "inviting..." : "invite →"}</button>
          </form>
        </div>
      )}

      {/* Member list */}
      <div style={{ border: "2px solid var(--bd2)", boxShadow: "var(--sh-lg)", overflow: "hidden" }}>
        <div className="px-admin-hdr">
          <div className="px-admin-hdr-title"><span>team_members</span></div>
        </div>
        {project.members.map(m => (
          <div key={m.user._id} className="px-admin-row">
            <div className="px-user-av" style={avStyle(m.role)}>{m.user.email[0].toUpperCase()}</div>
            <div className="px-user-email">{m.user.email}</div>
            <span className={`px-tag ${roleTag(m.role)}`}>{m.role}</span>
            {project.owner._id === m.user._id && (
              <span style={{ fontSize: 8, fontWeight: 700, color: "var(--yellow)", textTransform: "uppercase", letterSpacing: ".08em" }}>owner</span>
            )}
            {isOwner && project.owner._id !== m.user._id && m.user._id !== currentUser?._id && m.user._id !== currentUser?.id && (
              <button className="px-btn btn-danger px-btn-xs" onClick={() => handleRemove(m.user._id, m.user.email)}>remove</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

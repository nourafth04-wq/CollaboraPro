import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifs, setNotifs]     = useState([]);
  const [unread, setUnread]     = useState(0);
  const [showDrop, setShowDrop] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    fetchNotifs();
    const t = setInterval(fetchNotifs, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const h = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fetchNotifs = async () => {
    try { const { data } = await api.get("/notifications"); setNotifs(data.notifications); setUnread(data.unreadCount); }
    catch (_) {}
  };

  const handleNotif = async n => {
    if (!n.read) { await api.patch(`/notifications/${n._id}/read`); fetchNotifs(); }
    if (n.link) navigate(n.link);
    setShowDrop(false);
  };

  const markAll = async () => { await api.patch("/notifications/read-all"); fetchNotifs(); };

  const isActive = path => location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  return (
    <nav className="px-nav">
      {/* Logo */}
      <Link to="/dashboard" className="px-nav-logo" style={{ textDecoration: "none" }}>
        <div className="px-logo-grid">
          <div className="plg-w"></div><div className="plg-b"></div><div className="plg-w"></div>
          <div className="plg-b"></div><div className="plg-w"></div><div className="plg-b"></div>
          <div className="plg-w"></div><div className="plg-b"></div><div className="plg-w"></div>
        </div>
        <div className="px-logo-text">Collabora<span>Pro</span></div>
      </Link>

      {/* Tabs */}
      {user && (
        <div className="px-nav-tabs">
          {[
            { path: "/dashboard", label: "Dashboard" },
            { path: "/projects",  label: "Projects" },
            ...(user.role === "admin" ? [{ path: "/admin/users", label: "Admin" }] : []),
          ].map(({ path, label }) => (
            <Link key={path} to={path} className={`px-nav-tab ${isActive(path) ? "active" : ""}`}>
              {label}
            </Link>
          ))}
        </div>
      )}

      {/* Right side */}
      {user && (
        <div className="px-nav-right">
          {/* Notifications */}
          <div style={{ position: "relative" }} ref={dropRef}>
            <button className="px-nav-notif" onClick={() => setShowDrop(!showDrop)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unread > 0 && <div className="px-nav-notif-dot" />}
            </button>

            {showDrop && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                width: 300, background: "var(--s)",
                border: "2px solid var(--bd2)", boxShadow: "var(--sh-lg)",
                zIndex: 200, maxHeight: 340, display: "flex", flexDirection: "column",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderBottom: "2px solid var(--bd2)", background: "var(--s2)" }}>
                  <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink3)" }}>// notifications</span>
                  {unread > 0 && (
                    <button onClick={markAll} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 9, fontWeight: 700, color: "var(--blue)", fontFamily: "var(--font)", textTransform: "uppercase", letterSpacing: ".06em" }}>
                      mark all read
                    </button>
                  )}
                </div>
                <div style={{ overflowY: "auto", flex: 1 }}>
                  {notifs.length === 0 ? (
                    <div style={{ padding: "24px", textAlign: "center", fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink3)" }}>no notifications</div>
                  ) : notifs.slice(0, 10).map(n => (
                    <div key={n._id} onClick={() => handleNotif(n)} style={{
                      padding: "8px 12px", cursor: "pointer",
                      borderBottom: "1px solid var(--bd)",
                      background: !n.read ? "var(--blue-l)" : "var(--s)",
                      transition: "background .1s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--s3)"}
                    onMouseLeave={e => e.currentTarget.style.background = !n.read ? "var(--blue-l)" : "var(--s)"}>
                      <div style={{ fontSize: 10, color: "var(--ink)", lineHeight: 1.4 }}>{n.message}</div>
                      <div style={{ fontSize: 8, color: "var(--ink3)", marginTop: 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="px-nav-chip">{user.role.toUpperCase()}</div>
          <div className="px-nav-user">{user.email}</div>
          <button className="px-nav-logout" onClick={() => { logout(); navigate("/"); }}>[ logout ]</button>
        </div>
      )}
    </nav>
  );
}

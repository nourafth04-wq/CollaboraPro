export default function AuthLayout({ children, rightTitle, rightText, items }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font)", overflow: "hidden" }}>

      {/* LEFT — dark terminal side */}
      <div style={{
        width: "100%", maxWidth: 480,
        background: "var(--ink)",
        padding: "48px 44px",
        display: "flex", flexDirection: "column",
        flexShrink: 0,
        position: "relative",
      }}>
        {/* Scanline */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,.012) 3px,rgba(255,255,255,.012) 4px)",
        }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,5px)", gridTemplateRows: "repeat(4,5px)", gap: "1.5px" }}>
            {[0,1,2,3,1,0,0,1,0,1,1,0,1,0,0,1].map((b, i) => (
              <div key={i} style={{ background: b ? "var(--blue)" : "rgba(255,255,255,.1)" }} />
            ))}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-.3px" }}>
            Collabora<span style={{ color: "var(--blue)" }}>Pro</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1.3, letterSpacing: "-.6px", marginBottom: 8 }}>
          {rightTitle || "Build things."}<br />
          <span style={{ color: "var(--blue)" }}>Ship faster.</span>
        </div>
        <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".12em", color: "rgba(255,255,255,.25)", marginBottom: 40 }}>
          v2.0.0 · sprint 3 · stable
        </div>

        {/* Feature checklist */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
          {(items || ["Kanban task management", "Real-time team chat", "Document versioning", "Role-based access"]).map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 10, color: "rgba(255,255,255,.55)", letterSpacing: ".02em" }}>
              <div style={{ width: 12, height: 12, border: "1.5px solid var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ width: 6, height: 6, background: "var(--blue)" }} />
              </div>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — light form side */}
      <div style={{
        flex: 1,
        background: "var(--bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px 44px",
        position: "relative",
      }}>
        {/* Dot grid pattern */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: .4,
          backgroundImage: "radial-gradient(var(--bd) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }} />
        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 360 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

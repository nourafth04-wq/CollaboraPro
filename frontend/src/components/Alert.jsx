import { useEffect } from "react";

export default function Alert({ type = "success", message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onClose?.(), 3000);
    return () => clearTimeout(t);
  }, [message]);

  if (!message) return null;

  const styles = type === "success"
    ? { background: "#d4f5e3", color: "#0a5c2e", borderColor: "#0f7a3e", shadowColor: "#0a5c2e" }
    : { background: "#ffe0e0", color: "#9a1a1a", borderColor: "#c42b2b", shadowColor: "#9a1a1a" };

  return (
    <div style={{
      position: "fixed", top: 60, right: 20, zIndex: 9999,
      maxWidth: 360, minWidth: 220,
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 14px",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11, fontWeight: 700,
      letterSpacing: ".04em", textTransform: "uppercase",
      background: styles.background, color: styles.color,
      border: `2px solid ${styles.borderColor}`,
      boxShadow: `3px 3px 0 ${styles.shadowColor}`,
      animation: "px-slide-in .15s ease",
    }}>
      <span style={{ fontWeight: 700, fontSize: 13 }}>{type === "success" ? "✓" : "✕"}</span>
      <span style={{ flex: 1, fontSize: 10 }}>{message}</span>
      <button onClick={() => onClose?.()} style={{
        background: "none", border: "none", cursor: "pointer",
        color: "currentColor", fontSize: 16, lineHeight: 1,
        opacity: .6, fontFamily: "inherit", padding: 0,
      }}>×</button>
    </div>
  );
}

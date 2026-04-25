export default function PageLayout({ title, children }) {
  return (
    <main className="px-page px-scanlines">
      <div className="px-container">
        {title && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".14em", color: "var(--blue)", marginBottom: 4 }}>// page</div>
            <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-.4px", color: "var(--ink)" }}>{title}</h1>
          </div>
        )}
        {children}
      </div>
    </main>
  );
}

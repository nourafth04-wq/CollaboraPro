import { useState, useEffect, useRef } from "react";
import api from "../../../api/axios";
import Alert from "../../../components/Alert";

const EXT_COLOR = { pdf:"var(--red)", doc:"var(--blue)", docx:"var(--blue)", xls:"var(--green)", xlsx:"var(--green)", png:"var(--yellow)", jpg:"var(--yellow)", jpeg:"var(--yellow)", zip:"var(--ink3)", txt:"var(--ink3)" };

const FileIcon = ({ name }) => {
  const ext = name?.split(".").pop()?.toLowerCase() || "";
  const color = EXT_COLOR[ext] || "var(--ink3)";
  return (
    <div style={{ width: 32, height: 32, border: `2px solid ${color}`, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      </svg>
    </div>
  );
};

export default function DocumentsTab({ projectId }) {
  const [docs,        setDocs]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [alert,       setAlert]       = useState(null);
  const [uploading,   setUploading]   = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [versions,    setVersions]    = useState([]);
  const [docName,     setDocName]     = useState("");
  const [versionNote, setVersionNote] = useState("");
  const fileRef        = useRef(null);
  const versionFileRef = useRef(null);

  useEffect(() => { fetchDocs(); }, [projectId]);

  const fetchDocs = async () => {
    try { const { data } = await api.get(`/projects/${projectId}/documents`); setDocs(data); }
    catch { setAlert({ type: "error", message: "load_failed." }); }
    finally { setLoading(false); }
  };

  const fetchVersions = async id => {
    try { const { data } = await api.get(`/projects/${projectId}/documents/${id}/versions`); setVersions(data.versions); }
    catch (_) {}
  };

  const handleUpload = async e => {
    const file = e.target.files[0]; if (!file) return; setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file); fd.append("name", docName || file.name);
      await api.post(`/projects/${projectId}/documents`, fd);
      setAlert({ type: "success", message: "document_uploaded." }); setDocName(""); fetchDocs();
    } catch (err) { setAlert({ type: "error", message: err.response?.data?.message || "upload_failed." }); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const handleUploadVersion = async e => {
    const file = e.target.files[0]; if (!file || !selectedDoc) return; setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file); fd.append("note", versionNote);
      await api.post(`/projects/${projectId}/documents/${selectedDoc._id}/versions`, fd);
      setAlert({ type: "success", message: "version_uploaded." }); setVersionNote(""); fetchDocs(); fetchVersions(selectedDoc._id);
    } catch { setAlert({ type: "error", message: "upload_failed." }); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const handleDelete = async docId => {
    if (!window.confirm("delete_document? all versions will be removed.")) return;
    try { await api.delete(`/projects/${projectId}/documents/${docId}`); setAlert({ type: "success", message: "document_deleted." }); if (selectedDoc?._id === docId) setSelectedDoc(null); fetchDocs(); }
    catch { setAlert({ type: "error", message: "delete_failed." }); }
  };

  const dl = docId => { const t = localStorage.getItem("token"); window.open(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/projects/${projectId}/documents/${docId}/download?token=${t}`, "_blank"); };
  const dlv = (docId, v) => { const t = localStorage.getItem("token"); window.open(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/projects/${projectId}/documents/${docId}/versions/${v}/download?token=${t}`, "_blank"); };
  const fmtSize = b => { if (!b) return "—"; if (b < 1024) return `${b}b`; if (b < 1048576) return `${(b/1024).toFixed(1)}kb`; return `${(b/1048576).toFixed(1)}mb`; };

  if (loading) return <div className="px-loading">loading documents...</div>;

  return (
    <div>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Upload bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink)", marginBottom: 10 }}>
          $ documents <span style={{ color: "var(--blue)" }}>·</span> <span style={{ color: "var(--ink3)", fontWeight: 400 }}>{docs.length} files</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: 12, background: "var(--s)", border: "2px solid var(--bd2)", boxShadow: "var(--sh)" }}>
          <input className="px-input" style={{ flex: 1, minWidth: 180 }} placeholder="document_name (optional)" value={docName} onChange={e => setDocName(e.target.value)} />
          <button className="px-btn btn-primary" onClick={() => fileRef.current.click()} disabled={uploading}>
            {uploading ? "uploading..." : "upload_file →"}
          </button>
          <input ref={fileRef} type="file" style={{ display: "none" }} onChange={handleUpload} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedDoc ? "1fr 1fr" : "1fr", gap: 12 }}>
        {/* Document list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {docs.length === 0 ? (
            <div className="px-empty">no_documents_yet</div>
          ) : docs.map(doc => (
            <div key={doc._id}
              onClick={() => { setSelectedDoc(doc); fetchVersions(doc._id); }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px",
                background: selectedDoc?._id === doc._id ? "var(--blue-l)" : "var(--s)",
                border: `2px solid ${selectedDoc?._id === doc._id ? "var(--blue)" : "var(--bd2)"}`,
                boxShadow: "2px 2px 0 var(--bd)",
                cursor: "pointer", transition: "border-color .12s",
              }}
              onMouseEnter={e => { if (selectedDoc?._id !== doc._id) e.currentTarget.style.borderColor = "var(--blue)"; }}
              onMouseLeave={e => { if (selectedDoc?._id !== doc._id) e.currentTarget.style.borderColor = "var(--bd2)"; }}>
              <FileIcon name={doc.filename} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</div>
                <div style={{ fontSize: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink3)", marginTop: 2 }}>
                  v{doc.currentVersion} · {fmtSize(doc.size)} · {doc.uploadedBy.email}
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
                <button className="px-btn btn-ghost px-btn-xs" onClick={() => dl(doc._id)} title="download">↓</button>
                <button className="px-btn btn-danger px-btn-xs" onClick={() => handleDelete(doc._id)} title="delete">✕</button>
              </div>
            </div>
          ))}
        </div>

        {/* Version panel */}
        {selectedDoc && (
          <div style={{ border: "2px solid var(--bd2)", boxShadow: "var(--sh-lg)", overflow: "hidden" }}>
            <div style={{ background: "var(--ink)", padding: "8px 12px" }}>
              <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".12em", color: "rgba(255,255,255,.45)" }}>
                <span style={{ color: "#7eb3ff" }}>{selectedDoc.name}</span> · v{selectedDoc.currentVersion} current
              </div>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                <input className="px-input" style={{ flex: 1 }} placeholder="version_note..." value={versionNote} onChange={e => setVersionNote(e.target.value)} />
                <button className="px-btn btn-ghost px-btn-sm" onClick={() => versionFileRef.current.click()} disabled={uploading}>
                  upload_version →
                </button>
                <input ref={versionFileRef} type="file" style={{ display: "none" }} onChange={handleUploadVersion} />
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink3)", marginBottom: 8 }}>
                // version_history
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {versions.map(v => (
                  <div key={v._id} className={`px-version-item ${v.versionNumber === selectedDoc.currentVersion ? "current" : ""}`}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
                        v{v.versionNumber}
                        {v.versionNumber === selectedDoc.currentVersion && <span className="px-tag tag-green" style={{ fontSize: 8 }}>current</span>}
                      </div>
                      {v.note && <div style={{ fontSize: 8, color: "var(--ink3)", marginTop: 2 }}>{v.note}</div>}
                      <div style={{ fontSize: 8, color: "var(--ink3)", marginTop: 2, textTransform: "uppercase", letterSpacing: ".04em" }}>
                        {v.uploadedBy?.email} · {new Date(v.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <button className="px-btn btn-ghost px-btn-xs" onClick={() => dlv(selectedDoc._id, v.versionNumber)}>↓</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

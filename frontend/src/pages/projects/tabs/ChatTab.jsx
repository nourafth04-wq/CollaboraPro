import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import api from "../../../api/axios";

export default function ChatTab({ projectId, currentUser, members }) {
  const [messages,     setMessages]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [inputValue,   setInputValue]   = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    fetchMessages();
    api.patch(`/projects/${projectId}/messages/read`).catch(() => {});

    try {
      const token = localStorage.getItem("token");
      socketRef.current = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:5000", { auth: { token } });
      socketRef.current.emit("join_project", projectId);
      socketRef.current.on("new_message", msg =>
        setMessages(prev => prev.some(m => m._id === msg._id) ? prev : [...prev, msg])
      );
    } catch (_) {}

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave_project", projectId);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [projectId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fetchMessages = async () => {
    try { const { data } = await api.get(`/projects/${projectId}/messages?limit=100`); setMessages(data.messages); }
    catch (_) {} finally { setLoading(false); }
  };

  const handleInput = e => {
    setInputValue(e.target.value);
    const m = e.target.value.match(/@(\w*)$/);
    if (m) { setMentionQuery(m[1].toLowerCase()); setShowMentions(true); }
    else    { setShowMentions(false); }
  };

  const insertMention = member => {
    setInputValue(inputValue.replace(/@\w*$/, `@${member.user._id} `));
    setShowMentions(false); inputRef.current?.focus();
  };

  const filteredMembers = members.filter(m =>
    m.user._id !== currentUser?._id && m.user._id !== currentUser?.id &&
    m.user.email.toLowerCase().includes(mentionQuery)
  );

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const content = inputValue; setInputValue("");
    try {
      const { data } = await api.post(`/projects/${projectId}/messages`, { content });
      setMessages(prev => [...prev, data.data]);
      socketRef.current?.emit("send_message", { projectId, ...data.data });
    } catch (_) {}
  };

  const handleDelete = async msgId => {
    try { await api.delete(`/projects/${projectId}/messages/${msgId}`); setMessages(prev => prev.filter(m => m._id !== msgId)); }
    catch (_) {}
  };

  const fmt    = d => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const fmtDay = d => new Date(d).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  const isMe   = msg => msg.sender?._id === currentUser?._id || msg.sender?._id === currentUser?.id;

  const renderContent = content => content.replace(/@([a-fA-F0-9]{24})/g, (match, id) => {
    const m = members.find(m => m.user._id === id);
    return m ? `@${m.user.email.split("@")[0]}` : match;
  });

  if (loading) return <div className="px-loading">loading messages...</div>;

  let lastDay = null;

  return (
    <div className="px-chat-wrap">
      {/* Header */}
      <div className="px-chat-hdr">
        <div className="px-chat-online"><div className="px-online-sq" />live</div>
        <div className="px-chat-room">
          {projectId ? `project_chat` : "chat"} / general
        </div>
        <span style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,.25)", padding: "2px 8px", border: "1px solid rgba(255,255,255,.1)", textTransform: "uppercase", letterSpacing: ".06em" }}>
          {members.length} members
        </span>
      </div>

      {/* Messages */}
      <div className="px-chat-msgs">
        {messages.length === 0 && (
          <div style={{ textAlign: "center", margin: "auto", fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink3)" }}>
            no_messages_yet // start the conversation
          </div>
        )}
        {messages.map(msg => {
          const day = fmtDay(msg.createdAt);
          const showDay = day !== lastDay; lastDay = day;
          const mine = isMe(msg);

          return (
            <div key={msg._id}>
              {showDay && (
                <div style={{ textAlign: "center", fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink3)", padding: "8px 0", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 1, background: "repeating-linear-gradient(90deg,var(--bd) 0,var(--bd) 4px,transparent 4px,transparent 8px)" }} />
                  {day}
                  <div style={{ flex: 1, height: 1, background: "repeating-linear-gradient(90deg,var(--bd) 0,var(--bd) 4px,transparent 4px,transparent 8px)" }} />
                </div>
              )}
              <div className={`px-msg ${mine ? "mine" : "theirs"}`}>
                {!mine && <div className="px-msg-who">{msg.sender?.email?.split("@")[0]}</div>}
                <div style={{ position: "relative", display: "group" }}>
                  <div className={`px-bubble ${mine ? "mine" : "theirs"}`}>
                    {renderContent(msg.content)}
                  </div>
                  {mine && (
                    <button onClick={() => handleDelete(msg._id)} style={{
                      position: "absolute", top: 2, left: -44,
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 8, fontWeight: 700, color: "var(--ink3)",
                      fontFamily: "var(--font)", textTransform: "uppercase", letterSpacing: ".06em",
                      opacity: 0, transition: "opacity .15s", padding: "2px 4px",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "var(--red)"; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = "0"; }}>
                      del
                    </button>
                  )}
                </div>
                <div className="px-msg-ts">{fmt(msg.createdAt)}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Mention suggestions */}
      {showMentions && filteredMembers.length > 0 && (
        <div className="px-chat-mention">
          {filteredMembers.map(m => (
            <div key={m.user._id} className="px-mention-item" onClick={() => insertMention(m)}>
              @{m.user.email}
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-chat-input-row">
        <div className="px-chat-prompt">&gt;_</div>
        <textarea
          ref={inputRef}
          className="px-chat-inp"
          placeholder="message... @ to mention, enter to send"
          value={inputValue}
          onChange={handleInput}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          rows={1}
          style={{ paddingTop: 10, lineHeight: 1.4 }}
        />
        <button className="px-chat-send" onClick={handleSend}>send →</button>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import AnalyticsContainer from "./AnalyticsContainer";
// ============================================================
// 📋 ATTENDANCE MODIFICATION REQUEST SYSTEM
// Teacher request bhejega, Admin approve/reject karega
// ============================================================

const useModifyRequests = () => {
  const [requests, setRequests] = useState(() => {
    try { return JSON.parse(localStorage.getItem("attendx_requests") || "[]"); }
    catch { return []; }
  });

  const saveRequests = (updated) => {
    setRequests(updated);
    localStorage.setItem("attendx_requests", JSON.stringify(updated));
  };

  const addRequest = (req) => {
    const newReq = { ...req, id: Date.now().toString(), status: "pending", createdAt: new Date().toISOString() };
    saveRequests([newReq, ...requests]);
    return newReq;
  };

  const approveRequest = (id) => {
    saveRequests(requests.map(r => r.id === id ? { ...r, status: "approved", resolvedAt: new Date().toISOString() } : r));
  };

  const rejectRequest = (id, reason) => {
    saveRequests(requests.map(r => r.id === id ? { ...r, status: "rejected", rejectReason: reason, resolvedAt: new Date().toISOString() } : r));
  };

  const pendingCount = requests.filter(r => r.status === "pending").length;

  return { requests, addRequest, approveRequest, rejectRequest, pendingCount };
};
const MOCK_STUDENTS = [
  { id: "1", name: "Arjun Sharma", rollNumber: "CS21B042", subjects: [
    { subject: "Data Structures", totalClasses: 45, classesAttended: 40 },
    { subject: "Operating Systems", totalClasses: 38, classesAttended: 27 },
    { subject: "DBMS", totalClasses: 42, classesAttended: 39 },
    { subject: "Computer Networks", totalClasses: 36, classesAttended: 25 },
    { subject: "Software Engineering", totalClasses: 30, classesAttended: 28 },
    { subject: "Machine Learning", totalClasses: 28, classesAttended: 18 },
  ]},
  { id: "2", name: "Priya Singh", rollNumber: "CS21B089", subjects: [
    { subject: "Data Structures", totalClasses: 45, classesAttended: 35 },
    { subject: "Operating Systems", totalClasses: 38, classesAttended: 38 },
    { subject: "DBMS", totalClasses: 42, classesAttended: 30 },
    { subject: "Computer Networks", totalClasses: 36, classesAttended: 36 },
    { subject: "Software Engineering", totalClasses: 30, classesAttended: 20 },
    { subject: "Machine Learning", totalClasses: 28, classesAttended: 26 },
  ]},
  { id: "3", name: "Parth Maheshwari", rollNumber: "CS21B059", subjects: [
    { subject: "Data Structures", totalClasses: 45, classesAttended: 35 },
    { subject: "Operating Systems", totalClasses: 38, classesAttended: 38 },
    { subject: "DBMS", totalClasses: 42, classesAttended: 41 },
    { subject: "Computer Networks", totalClasses: 36, classesAttended: 36 },
    { subject: "Software Engineering", totalClasses: 30, classesAttended: 20 },
    { subject: "Machine Learning", totalClasses: 28, classesAttended: 26 },
  ]},
  { id: "4", name: "NishChaye Tenguriya", rollNumber: "CS21B087", subjects: [
    { subject: "Data Structures", totalClasses: 45, classesAttended: 38 },
    { subject: "Operating Systems", totalClasses: 38, classesAttended: 34 },
    { subject: "DBMS", totalClasses: 42, classesAttended: 42 },
    { subject: "Computer Networks", totalClasses: 36, classesAttended: 33 },
    { subject: "Software Engineering", totalClasses: 30, classesAttended: 20 },
    { subject: "Machine Learning", totalClasses: 28, classesAttended: 26 },
  ]},
];

const MOCK_MONTHLY = [
  { month: "Aug", present: 18, absent: 4, late: 2 },
  { month: "Sep", present: 20, absent: 2, late: 1 },
  { month: "Oct", present: 15, absent: 7, late: 3 },
  { month: "Nov", present: 22, absent: 1, late: 0 },
  { month: "Dec", present: 12, absent: 8, late: 2 },
  { month: "Jan", present: 19, absent: 3, late: 1 },
];

const calcPercent = (attended, total) => {
  if (total === 0) return 0;
  return Math.round((attended / total) * 10000) / 100;
};

const getStatusColor = (pct, dark) => {
  if (pct < 75) return dark ? "#ff6b6b" : "#e53e3e";
  if (pct < 85) return dark ? "#fbbf24" : "#d97706";
  return dark ? "#4ade80" : "#16a34a";
};

function DonutChart({ percentage, size = 120, dark }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    const cx = size / 2, cy = size / 2, r = size * 0.38, lw = size * 0.14;
    const filled = (percentage / 100) * 2 * Math.PI;
    const start = -Math.PI / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    ctx.lineWidth = lw;
    ctx.stroke();
    const color = getStatusColor(percentage, dark);
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, start + filled);
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.fillStyle = dark ? "#f1f5f9" : "#1e293b";
    ctx.font = `bold ${size * 0.2}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${Math.round(percentage)}%`, cx, cy);
  }, [percentage, size, dark]);
  return <canvas ref={canvasRef} style={{ width: size, height: size, display: "block" }} />;
}

function BarChart({ data, dark }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const padL = 32, padR = 16, padT = 16, padB = 36;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;
    const barGroupW = chartW / data.length;
    const barW = barGroupW * 0.28;
    const maxVal = Math.max(...data.map((d) => d.present + d.absent + d.late)) || 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (chartH * i) / 4;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.strokeStyle = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    data.forEach((d, i) => {
      const gx = padL + i * barGroupW + barGroupW * 0.1;
      const bars = [
        { val: d.present, color: dark ? "#4ade80" : "#22c55e" },
        { val: d.late, color: dark ? "#fbbf24" : "#f59e0b" },
        { val: d.absent, color: dark ? "#f87171" : "#ef4444" },
      ];
      bars.forEach((bar, j) => {
        const bh = (bar.val / maxVal) * chartH;
        const bx = gx + j * (barW + 2);
        const by = padT + chartH - bh;
        const radius = Math.min(4, bh / 2);
        ctx.beginPath();
        ctx.roundRect(bx, by, barW, bh, [radius, radius, 0, 0]);
        ctx.fillStyle = bar.color;
        ctx.fill();
      });
      ctx.fillStyle = dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
      ctx.font = `11px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(d.month, gx + (3 * barW + 4) / 2, H - padB + 18);
    });
  }, [data, dark]);
  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />;
}

function SubjectCard({ subject, totalClasses, classesAttended, dark, delay }) {
  const pct = calcPercent(classesAttended, totalClasses);
  const isLow = pct < 75;
  const absent = totalClasses - classesAttended;
  const needed = Math.max(0, Math.ceil(0.75 * totalClasses - classesAttended));
  return (
    <div style={{ background: isLow ? (dark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.05)") : (dark ? "rgba(34,197,94,0.06)" : "rgba(34,197,94,0.04)"), border: `1px solid ${isLow ? (dark ? "rgba(239,68,68,0.35)" : "rgba(239,68,68,0.25)") : (dark ? "rgba(34,197,94,0.3)" : "rgba(34,197,94,0.25)")}`, borderRadius: 16, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, animation: `slideUp 0.4s ease ${delay}ms both` }}>
      <div style={{ flexShrink: 0 }}><DonutChart percentage={pct} size={72} dark={dark} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: dark ? "#f1f5f9" : "#1e293b", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{subject}</div>
        <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)", marginBottom: 8, fontFamily: "monospace" }}>{classesAttended}/{totalClasses} classes • {absent} absent</div>
        <div style={{ height: 5, background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: getStatusColor(pct, dark), borderRadius: 99 }} />
        </div>
      </div>
      <div style={{ flexShrink: 0, textAlign: "right" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, background: isLow ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)", fontSize: 11, fontWeight: 700, color: isLow ? (dark ? "#fca5a5" : "#dc2626") : (dark ? "#86efac" : "#15803d"), marginBottom: 6 }}>
          <span style={{ fontSize: 8 }}>●</span>{isLow ? "LOW" : "SAFE"}
        </div>
        {isLow && needed > 0 && <div style={{ fontSize: 10, color: dark ? "rgba(252,165,165,0.7)" : "rgba(220,38,38,0.7)", fontFamily: "monospace" }}>Need {needed} more</div>}
      </div>
    </div>
  );
}
function TeacherRequestsView({ theme, dark, user }) {
  const { requests } = useModifyRequests();
  const myRequests = requests.filter(r => r.teacherName === user?.name);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? myRequests : myRequests.filter(r => r.status === filter);
  const statusColor = { pending: "#fbbf24", approved: "#4ade80", rejected: "#f87171" };
  const statusBg = { pending: "rgba(251,191,36,0.08)", approved: "rgba(34,197,94,0.08)", rejected: "rgba(239,68,68,0.08)" };

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Pending", value: myRequests.filter(r => r.status === "pending").length, color: "#fbbf24" },
          { label: "Approved", value: myRequests.filter(r => r.status === "approved").length, color: "#4ade80" },
          { label: "Rejected", value: myRequests.filter(r => r.status === "rejected").length, color: "#f87171" },
        ].map((s, i) => (
          <div key={s.label} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "16px 20px", animation: `slideUp 0.3s ease ${i * 60}ms both` }}>
            <div style={{ fontSize: 10, color: theme.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all", "pending", "approved", "rejected"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "6px 16px", borderRadius: 99, border: `1px solid ${filter === f ? (statusColor[f] || theme.accent) : theme.border}`, background: filter === f ? `${statusColor[f] || theme.accent}20` : "transparent", color: filter === f ? (statusColor[f] || theme.accent) : theme.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", textTransform: "capitalize" }}>
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      {/* Requests */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: theme.muted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 14 }}>No requests found</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((req, i) => (
            <div key={req.id} style={{ background: statusBg[req.status], border: `1px solid ${statusColor[req.status]}40`, borderRadius: 16, padding: 20, animation: `slideUp 0.3s ease ${i * 60}ms both` }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 2 }}>
                    {req.studentName} <span style={{ color: theme.muted, fontFamily: "monospace", fontSize: 12 }}>({req.studentRoll})</span>
                  </div>
                  <div style={{ fontSize: 12, color: theme.muted }}>{req.subject} • {new Date(req.date).toLocaleDateString("en-IN")}</div>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 99, background: `${statusColor[req.status]}20`, color: statusColor[req.status], fontSize: 11, fontWeight: 700 }}>
                  <span style={{ fontSize: 8 }}>●</span>
                  {req.status === "pending" ? "⏳ Pending" : req.status === "approved" ? "✓ Approved" : "✕ Rejected"}
                </div>
              </div>

              {/* Change */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "10px 14px", background: theme.surface2, borderRadius: 10 }}>
                <span style={{ padding: "3px 10px", borderRadius: 6, background: "rgba(239,68,68,0.15)", color: "#f87171", fontSize: 12, fontWeight: 700, textTransform: "capitalize" }}>{req.oldStatus}</span>
                <span style={{ color: theme.muted, fontSize: 16 }}>→</span>
                <span style={{ padding: "3px 10px", borderRadius: 6, background: "rgba(34,197,94,0.15)", color: "#4ade80", fontSize: 12, fontWeight: 700, textTransform: "capitalize" }}>{req.newStatus}</span>
              </div>

              {/* Note */}
              <div style={{ padding: "10px 14px", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: 8, marginBottom: req.status !== "pending" ? 12 : 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", marginBottom: 4 }}>My Note</div>
                <div style={{ fontSize: 13, color: theme.text }}>{req.note}</div>
              </div>

              {/* Approved message */}
              {req.status === "approved" && (
                <div style={{ padding: "10px 14px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: "#86efac" }}>✓ Approved by admin! Attendance updated.</div>
                  <div style={{ fontSize: 10, color: theme.muted, fontFamily: "monospace", marginTop: 4 }}>{new Date(req.resolvedAt).toLocaleString("en-IN")}</div>
                </div>
              )}

              {/* Rejected message */}
              {req.status === "rejected" && req.rejectReason && (
                <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#f87171", textTransform: "uppercase", marginBottom: 4 }}>Admin's Reason</div>
                  <div style={{ fontSize: 13, color: theme.text }}>{req.rejectReason}</div>
                  <div style={{ fontSize: 10, color: theme.muted, fontFamily: "monospace", marginTop: 4 }}>{new Date(req.resolvedAt).toLocaleString("en-IN")}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function AdminRequests({ theme, dark }) {
  const { requests, approveRequest, rejectRequest } = useModifyRequests();
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [filter, setFilter] = useState("pending");

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);
  const statusColor = { pending: "#fbbf24", approved: "#4ade80", rejected: "#f87171" };
  const statusBg = { pending: "rgba(251,191,36,0.1)", approved: "rgba(34,197,94,0.1)", rejected: "rgba(239,68,68,0.1)" };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Pending", value: requests.filter(r => r.status === "pending").length, color: "#fbbf24" },
          { label: "Approved", value: requests.filter(r => r.status === "approved").length, color: "#4ade80" },
          { label: "Rejected", value: requests.filter(r => r.status === "rejected").length, color: "#f87171" },
        ].map((s, i) => (
          <div key={s.label} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "16px 20px", animation: `slideUp 0.3s ease ${i * 60}ms both` }}>
            <div style={{ fontSize: 10, color: theme.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["pending", "approved", "rejected", "all"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "6px 16px", borderRadius: 99, border: `1px solid ${filter === f ? statusColor[f] || theme.accent : theme.border}`, background: filter === f ? `${statusColor[f] || theme.accent}20` : "transparent", color: filter === f ? (statusColor[f] || theme.accent) : theme.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", textTransform: "capitalize" }}>
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: theme.muted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 14 }}>No requests yet</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((req, i) => (
            <div key={req.id} style={{ background: theme.surface, border: `1px solid ${statusColor[req.status]}40`, borderRadius: 16, padding: 20, animation: `slideUp 0.3s ease ${i * 60}ms both` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 2 }}>
                    {req.studentName} <span style={{ color: theme.muted, fontFamily: "monospace", fontSize: 12 }}>({req.studentRoll})</span>
                  </div>
                  <div style={{ fontSize: 12, color: theme.muted }}>{req.subject} • {new Date(req.date).toLocaleDateString("en-IN")}</div>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 99, background: statusBg[req.status], color: statusColor[req.status], fontSize: 11, fontWeight: 700 }}>
                  <span style={{ fontSize: 8 }}>●</span>{req.status.toUpperCase()}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "10px 14px", background: theme.surface2, borderRadius: 10 }}>
                <span style={{ padding: "3px 10px", borderRadius: 6, background: "rgba(239,68,68,0.15)", color: "#f87171", fontSize: 12, fontWeight: 700, textTransform: "capitalize" }}>{req.oldStatus}</span>
                <span style={{ color: theme.muted, fontSize: 16 }}>→</span>
                <span style={{ padding: "3px 10px", borderRadius: 6, background: "rgba(34,197,94,0.15)", color: "#4ade80", fontSize: 12, fontWeight: 700, textTransform: "capitalize" }}>{req.newStatus}</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: theme.muted, fontFamily: "monospace" }}>by {req.teacherName}</span>
              </div>

              <div style={{ padding: "10px 14px", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: 8, marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", marginBottom: 4 }}>Teacher's Note</div>
                <div style={{ fontSize: 13, color: theme.text }}>{req.note}</div>
              </div>

              {req.status === "rejected" && req.rejectReason && (
                <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 8, marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#f87171", textTransform: "uppercase", marginBottom: 4 }}>Reject Reason</div>
                  <div style={{ fontSize: 13, color: theme.text }}>{req.rejectReason}</div>
                </div>
              )}

              {req.status === "pending" && (
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => approveRequest(req.id)}
                    style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                    ✓ Approve
                  </button>
                  <button onClick={() => { setRejectModal(req.id); setRejectReason(""); }}
                    style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                    ✕ Reject
                  </button>
                </div>
              )}

              {req.resolvedAt && (
                <div style={{ fontSize: 10, color: theme.muted, fontFamily: "monospace", marginTop: 8, textAlign: "right" }}>
                  Resolved: {new Date(req.resolvedAt).toLocaleString("en-IN")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {rejectModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ background: dark ? "#111827" : "#fff", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 20, padding: 28, width: 400, maxWidth: "90vw" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: dark ? "#f1f5f9" : "#1e293b", marginBottom: 6 }}>Reject</div>
            <div style={{ fontSize: 13, color: dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", marginBottom: 16 }}>Provide reason to teacher</div>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              style={{ width: "100%", padding: "10px 14px", background: dark ? "#1a2236" : "#f8faff", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, color: dark ? "#f1f5f9" : "#1e293b", fontSize: 13, fontFamily: "'Space Grotesk', sans-serif", outline: "none", resize: "none", marginBottom: 14 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setRejectModal(null)}
                style={{ flex: 1, padding: "10px", borderRadius: 10, background: "transparent", border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, color: dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                Cancel
              </button>
              <button onClick={() => {
                if (!rejectReason.trim()) { alert("Reason is required!"); return; }
                rejectRequest(rejectModal, rejectReason);
                setRejectModal(null);
              }}
                style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function UserManagement({ theme, dark }) {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("attendx_users");
    return saved ? JSON.parse(saved) : [
      { id: "1", name: "Arjun Sharma", email: "student1@demo.com", role: "student", rollNumber: "CS21B042", department: "Computer Science", semester: "VI" },
      { id: "2", name: "Priya Singh", email: "student2@demo.com", role: "student", rollNumber: "CS21B089", department: "Computer Science", semester: "VI" },
      { id: "3", name: "Parth Maheshwari", email: "student3@demo.com", role: "student", rollNumber: "CS21B059", department: "Computer Science", semester: "VI" },
      { id: "4", name: "NishChaye Tenguriya", email: "student4@demo.com", role: "student", rollNumber: "CS21B087", department: "Computer Science", semester: "VI" },
      { id: "5", name: "Prof. Shiv Kumar Verma", email: "teacher@demo.com", role: "teacher", rollNumber: "", department: "Computer Science", semester: "" },
      { id: "6", name: "Yash Sharma", email: "admin@demo.com", role: "admin", rollNumber: "", department: "Administration", semester: "" },
    ];
  });

  const [showForm, setShowForm] = useState(false);
  const [formRole, setFormRole] = useState("student");
  const [filterRole, setFilterRole] = useState("all");
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", rollNumber: "", department: "", semester: "" });

  const saveUsers = (updated) => {
    setUsers(updated);
    localStorage.setItem("attendx_users", JSON.stringify(updated));
  };

  const handleAdd = () => {
    if (!form.name || !form.email || !form.password) {
      alert("Name, Email and Password are required!");
      return;
    }
    const newUser = {
      id: Date.now().toString(),
      name: form.name,
      email: form.email,
      password: form.password,
      role: formRole,
      rollNumber: form.rollNumber,
      department: form.department,
      semester: form.semester,
    };
    saveUsers([...users, newUser]);
    setForm({ name: "", email: "", password: "", rollNumber: "", department: "", semester: "" });
    setShowForm(false);
    setSuccessMsg(`✅ ${form.name} added successfully !`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      saveUsers(users.filter(u => u.id !== id));
    }
  };

  const filtered = filterRole === "all" ? users : users.filter(u => u.role === filterRole);
  const roleColor = { student: "#6366f1", teacher: "#8b5cf6", admin: "#ec4899" };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Users", value: users.length, color: theme.accent },
          { label: "Students", value: users.filter(u => u.role === "student").length, color: "#6366f1" },
          { label: "Teachers", value: users.filter(u => u.role === "teacher").length, color: "#8b5cf6" },
          { label: "Admins", value: users.filter(u => u.role === "admin").length, color: "#ec4899" },
        ].map((s, i) => (
          <div key={s.label} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "16px 20px", animation: `slideUp 0.3s ease ${i * 60}ms both` }}>
            <div style={{ fontSize: 10, color: theme.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "student", "teacher", "admin"].map(r => (
            <button key={r} onClick={() => setFilterRole(r)}
              style={{ padding: "6px 16px", borderRadius: 99, border: `1px solid ${filterRole === r ? roleColor[r] || theme.accent : theme.border}`, background: filterRole === r ? `${roleColor[r] || theme.accent}20` : "transparent", color: filterRole === r ? (roleColor[r] || theme.accent) : theme.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", textTransform: "capitalize" }}>
              {r === "all" ? "All Users" : r}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ padding: "8px 20px", borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif" }}>
          {showForm ? "✕ Cancel" : "+ Add User"}
        </button>
      </div>

      {successMsg && (
        <div style={{ padding: "12px 16px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, fontSize: 13, color: dark ? "#86efac" : "#15803d", marginBottom: 16, fontFamily: "monospace" }}>
          {successMsg}
        </div>
      )}

      {showForm && (
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 24, marginBottom: 20, animation: "slideUp 0.3s ease both" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>Add new user</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["student", "teacher", "admin"].map(r => (
              <button key={r} onClick={() => setFormRole(r)}
                style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${formRole === r ? roleColor[r] : theme.border}`, background: formRole === r ? `${roleColor[r]}20` : theme.surface2, color: formRole === r ? roleColor[r] : theme.muted, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", textTransform: "capitalize" }}>
                {r}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { key: "name", label: "Full Name *", placeholder: "e.g. Rahul Gupta", type: "text" },
              { key: "email", label: "Email *", placeholder: "e.g. rahul@demo.com", type: "email" },
              { key: "password", label: "Password *", placeholder: "min 6 characters", type: "password" },
              { key: "department", label: "Department", placeholder: "e.g. Computer Science", type: "text" },
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{field.label}</label>
                <input type={field.type} placeholder={field.placeholder} value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: 10, color: theme.text, fontSize: 13, fontFamily: "'Space Grotesk', sans-serif", outline: "none" }} />
              </div>
            ))}
            {formRole === "student" && (
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Roll Number</label>
                <input type="text" placeholder="e.g. CS21B099" value={form.rollNumber}
                  onChange={e => setForm({ ...form, rollNumber: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: 10, color: theme.text, fontSize: 13, fontFamily: "'Space Grotesk', sans-serif", outline: "none" }} />
              </div>
            )}
            {formRole === "student" && (
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Semester</label>
                <select value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: 10, color: theme.text, fontSize: 13, fontFamily: "'Space Grotesk', sans-serif", outline: "none" }}>
                  <option value="">Select Semester</option>
                  {["I","II","III","IV","V","VI","VII","VIII"].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
            )}
          </div>
          <button onClick={handleAdd}
            style={{ marginTop: 16, width: "100%", padding: "12px", borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif" }}>
            ✓ Add {formRole.charAt(0).toUpperCase() + formRole.slice(1)}
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
        {filtered.map((u, i) => (
          <div key={u.id} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, animation: `slideUp 0.3s ease ${i * 40}ms both` }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${roleColor[u.role]}, #6366f1)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white", flexShrink: 0 }}>
              {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name}</div>
              <div style={{ fontSize: 10, color: theme.muted, fontFamily: "monospace", marginBottom: 4 }}>{u.email}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: `${roleColor[u.role]}20`, color: roleColor[u.role], fontWeight: 700 }}>{u.role}</span>
                {u.rollNumber && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: theme.surface2, color: theme.muted, fontFamily: "monospace" }}>{u.rollNumber}</span>}
                {u.semester && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: theme.surface2, color: theme.muted }}>{u.semester} Sem</span>}
              </div>
            </div>
            <button onClick={() => handleDelete(u.id)}
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "6px 10px", color: "#f87171", cursor: "pointer", fontSize: 12, flexShrink: 0 }}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
function BulkAttendance({ theme, dark, user }) {
  const [selectedSubject, setSelectedSubject] = useState(MOCK_STUDENTS[0].subjects[0].subject);
  const [attendance, setAttendance] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const subjects = MOCK_STUDENTS[0].subjects.map(s => s.subject);

  // Sabhi students ko default "present" mark karo
  useEffect(() => {
    const initial = {};
    MOCK_STUDENTS.forEach(s => { initial[s.id] = "present"; });
    setAttendance(initial);
    setSubmitted(false);
    setShowSummary(false);
  }, [selectedSubject]);

  const markAll = (status) => {
    const updated = {};
    MOCK_STUDENTS.forEach(s => { updated[s.id] = status; });
    setAttendance(updated);
  };

  const toggle = (id, status) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const presentStudents = MOCK_STUDENTS.filter(s => attendance[s.id] === "present");
  const absentStudents = MOCK_STUDENTS.filter(s => attendance[s.id] === "absent");
  const lateStudents = MOCK_STUDENTS.filter(s => attendance[s.id] === "late");

  const handleSubmit = () => {
    setShowSummary(true);
  };

  const handleConfirm = () => {
    setSubmitted(true);
    setShowSummary(false);
  };

  const statusColor = { present: "#4ade80", absent: "#f87171", late: "#fbbf24" };
  const statusBg = { present: "rgba(34,197,94,0.12)", absent: "rgba(239,68,68,0.12)", late: "rgba(251,191,36,0.12)" };
  const statusBorder = { present: "rgba(34,197,94,0.3)", absent: "rgba(239,68,68,0.3)", late: "rgba(251,191,36,0.3)" };

  if (submitted) {
    return (
      <div style={{ animation: "slideUp 0.4s ease both" }}>
        {/* Success Banner */}
        <div style={{ padding: "20px 24px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 36 }}>✅</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#4ade80", marginBottom: 2 }}>Attendance Submit Ho Gayi!</div>
            <div style={{ fontSize: 13, color: theme.muted }}>{selectedSubject} • {new Date().toLocaleDateString("en-IN")} • {MOCK_STUDENTS.length} students</div>
          </div>
          <button onClick={() => setSubmitted(false)} style={{ marginLeft: "auto", padding: "8px 16px", borderRadius: 8, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
            New Session
          </button>
        </div>

        {/* Final Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            { label: "Present", students: presentStudents, color: "#4ade80", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.25)", icon: "✓" },
            { label: "Absent", students: absentStudents, color: "#f87171", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", icon: "✕" },
            { label: "Late", students: lateStudents, color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.25)", icon: "◷" },
          ].map((group, i) => (
            <div key={group.label} style={{ background: group.bg, border: `1px solid ${group.border}`, borderRadius: 16, padding: 20, animation: `slideUp 0.4s ease ${i * 80}ms both` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${group.color}20`, display: "flex", alignItems: "center", justifyContent: "center", color: group.color, fontWeight: 700, fontSize: 16 }}>{group.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: group.color }}>{group.label}</div>
                  <div style={{ fontSize: 11, color: theme.muted }}>{group.students.length} students</div>
                </div>
              </div>
              {group.students.length === 0 ? (
                <div style={{ fontSize: 12, color: theme.muted, textAlign: "center", padding: "10px 0" }}>None</div>
              ) : (
                group.students.map(s => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: theme.surface, borderRadius: 8, marginBottom: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg, ${group.color}40, ${group.color}20)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: group.color, flexShrink: 0 }}>
                      {s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: theme.text }}>{s.name}</div>
                      <div style={{ fontSize: 10, color: theme.muted, fontFamily: "monospace" }}>{s.rollNumber}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Controls */}
      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 16, padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", animation: "slideUp 0.3s ease both" }}>
        {/* Subject Select */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Subject</div>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, fontSize: 13, fontFamily: "'Space Grotesk', sans-serif", outline: "none" }}>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Date */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Date</div>
          <div style={{ padding: "8px 12px", background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: 8, fontSize: 13, color: theme.text, fontFamily: "monospace" }}>
            {new Date().toLocaleDateString("en-IN")}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
          {[
            { label: "Present", count: presentStudents.length, color: "#4ade80" },
            { label: "Absent", count: absentStudents.length, color: "#f87171" },
            { label: "Late", count: lateStudents.length, color: "#fbbf24" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center", padding: "6px 14px", background: theme.surface2, borderRadius: 8, border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: "monospace" }}>{s.count}</div>
              <div style={{ fontSize: 9, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: theme.muted, display: "flex", alignItems: "center", marginRight: 4 }}>Mark All:</div>
        {[
          { status: "present", label: "✓ All Present", color: "#4ade80", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)" },
          { status: "absent", label: "✕ All Absent", color: "#f87171", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" },
          { status: "late", label: "◷ All Late", color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.3)" },
        ].map(btn => (
          <button key={btn.status} onClick={() => markAll(btn.status)}
            style={{ padding: "6px 14px", borderRadius: 8, background: btn.bg, border: `1px solid ${btn.border}`, color: btn.color, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
            {btn.label}
          </button>
        ))}
        <button onClick={handleSubmit} style={{ marginLeft: "auto", padding: "8px 20px", borderRadius: 10, background: "linear-gradient(135deg, #7c3aed, #4c1d95)", border: "none", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", boxShadow: "0 4px 15px rgba(124,58,237,0.3)" }}>
          Preview & Submit →
        </button>
      </div>

      {/* Students List */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
        {MOCK_STUDENTS.map((student, i) => (
          <div key={student.id} style={{ background: statusBg[attendance[student.id]], border: `1px solid ${statusBorder[attendance[student.id]]}`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, animation: `slideUp 0.3s ease ${i * 50}ms both`, transition: "all 0.2s ease" }}>
            {/* Avatar */}
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${statusColor[attendance[student.id]]}40, ${statusColor[attendance[student.id]]}20)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: statusColor[attendance[student.id]], flexShrink: 0 }}>
              {student.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{student.name}</div>
              <div style={{ fontSize: 10, color: theme.muted, fontFamily: "monospace" }}>{student.rollNumber}</div>
            </div>

            {/* Status Buttons */}
            <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
              {[
                { status: "present", icon: "✓", color: "#4ade80" },
                { status: "late", icon: "◷", color: "#fbbf24" },
                { status: "absent", icon: "✕", color: "#f87171" },
              ].map(btn => (
                <button key={btn.status} onClick={() => toggle(student.id, btn.status)}
                  style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${attendance[student.id] === btn.status ? btn.color : "rgba(255,255,255,0.1)"}`, background: attendance[student.id] === btn.status ? `${btn.color}25` : "transparent", color: attendance[student.id] === btn.status ? btn.color : "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "all 0.15s ease", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {btn.icon}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* PREVIEW SUMMARY MODAL */}
      {showSummary && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(8px)" }}>
          <div style={{ background: dark ? "#111827" : "#fff", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 24, padding: 32, width: 600, maxWidth: "90vw", maxHeight: "80vh", overflowY: "auto", animation: "slideUp 0.3s ease both" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: dark ? "#f1f5f9" : "#1e293b", marginBottom: 4 }}>Attendance Summary</div>
            <div style={{ fontSize: 13, color: dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", marginBottom: 24 }}>{selectedSubject} • {new Date().toLocaleDateString("en-IN")} • {user?.name}</div>

            {/* Summary Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Present", count: presentStudents.length, color: "#4ade80", bg: "rgba(34,197,94,0.1)" },
                { label: "Absent", count: absentStudents.length, color: "#f87171", bg: "rgba(239,68,68,0.1)" },
                { label: "Late", count: lateStudents.length, color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: "14px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: "monospace" }}>{s.count}</div>
                  <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Present List */}
            {presentStudents.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>✓ Present ({presentStudents.length})</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {presentStudents.map(s => (
                    <div key={s.id} style={{ padding: "4px 12px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 99, fontSize: 12, color: "#4ade80", fontWeight: 500 }}>
                      {s.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Absent List */}
            {absentStudents.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>✕ Absent ({absentStudents.length})</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {absentStudents.map(s => (
                    <div key={s.id} style={{ padding: "4px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 99, fontSize: 12, color: "#f87171", fontWeight: 500 }}>
                      {s.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Late List */}
            {lateStudents.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>◷ Late ({lateStudents.length})</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {lateStudents.map(s => (
                    <div key={s.id} style={{ padding: "4px 12px", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: 99, fontSize: 12, color: "#fbbf24", fontWeight: 500 }}>
                      {s.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setShowSummary(false)}
                style={{ flex: 1, padding: "12px", borderRadius: 10, background: "transparent", border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, color: dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                ← Go Back
              </button>
              <button onClick={handleConfirm}
                style={{ flex: 2, padding: "12px", borderRadius: 10, background: "linear-gradient(135deg, #7c3aed, #4c1d95)", border: "none", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", boxShadow: "0 4px 15px rgba(124,58,237,0.4)" }}>
                ✓ Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function TeacherPanel({ user, dark, theme }) {
  const { requests, addRequest, approveRequest, rejectRequest, pendingCount } = useModifyRequests();
  const myRequests = requests.filter((r) => r.teacherName === user?.name);
const [showModifyForm, setShowModifyForm] = useState(false);
const [modifyData, setModifyData] = useState({ oldStatus: "present", newStatus: "absent", note: "", date: "" });
const [modifyMsg, setModifyMsg] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(MOCK_STUDENTS[0]);
  const [selectedSubject, setSelectedSubject] = useState(MOCK_STUDENTS[0].subjects[0].subject);
  const [markStatus, setMarkStatus] = useState("");
  const [attendanceLog, setAttendanceLog] = useState([]);

  const handleMark = (status) => {
    setMarkStatus("Marking...");
    setTimeout(() => {
      const newLog = { student: selectedStudent.name, roll: selectedStudent.rollNumber, subject: selectedSubject, status, time: new Date().toLocaleTimeString("en-IN") };
      setAttendanceLog((prev) => [newLog, ...prev.slice(0, 9)]);
      setMarkStatus(`✅ ${selectedStudent.name} — ${status.toUpperCase()} marked!`);
      setTimeout(() => setMarkStatus(""), 3000);
    }, 600);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 20, padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Mark Attendance</div>
        <div style={{ fontSize: 12, color: theme.muted, marginBottom: 20 }}>Select the Student</div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: theme.muted, marginBottom: 8 }}>Select Student</label>
          <select value={selectedStudent.id} onChange={(e) => { const s = MOCK_STUDENTS.find(x => x.id === e.target.value); setSelectedStudent(s); setSelectedSubject(s.subjects[0].subject); }}
            style={{ width: "100%", padding: "12px 16px", background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: 12, color: theme.text, fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", outline: "none" }}>
            {MOCK_STUDENTS.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: theme.muted, marginBottom: 8 }}>Select Subject</label>
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
            style={{ width: "100%", padding: "12px 16px", background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: 12, color: theme.text, fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", outline: "none" }}>
            {selectedStudent.subjects.map(s => <option key={s.subject} value={s.subject}>{s.subject}</option>)}
          </select>
        </div>
        <div style={{ padding: "12px 16px", background: theme.surface2, borderRadius: 12, marginBottom: 16, border: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{selectedStudent.name}</div>
            <div style={{ fontSize: 11, color: theme.muted, fontFamily: "monospace" }}>{selectedStudent.rollNumber}</div>
          </div>
          <div style={{ fontSize: 11, color: theme.muted, textAlign: "right" }}>
            <div>Today</div>
            <div style={{ fontFamily: "monospace" }}>{new Date().toLocaleDateString("en-IN")}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
          {[{ status: "present", color: "#22c55e", label: "✓ Present" }, { status: "late", color: "#f59e0b", label: "◷ Late" }, { status: "absent", color: "#ef4444", label: "✕ Absent" }].map((btn) => (
            <button key={btn.status} onClick={() => handleMark(btn.status)}
              style={{ padding: "14px 8px", background: `${btn.color}18`, border: `1px solid ${btn.color}40`, borderRadius: 12, color: btn.color, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
              {btn.label}
            </button>
          ))}
        </div>
        {/* MODIFY ATTENDANCE REQUEST FORM */}
<div style={{ marginTop: 16, borderTop: `1px solid ${theme.border}`, paddingTop: 16 }}>
  <button onClick={() => setShowModifyForm(!showModifyForm)}
    style={{ width: "100%", padding: "10px", borderRadius: 10, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
    ✎ {showModifyForm ? "Cancel Request" : "Request Attendance Modify"}
  </button>

  {showModifyForm && (
    <div style={{ marginTop: 12, padding: 16, background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24", marginBottom: 12 }}>⚠ Admin Approval Required</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div>
          <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: theme.muted, textTransform: "uppercase", marginBottom: 6 }}>Current Status</label>
          <select value={modifyData.oldStatus} onChange={e => setModifyData({...modifyData, oldStatus: e.target.value})}
            style={{ width: "100%", padding: "8px 12px", background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, fontSize: 13, fontFamily: "'Space Grotesk', sans-serif", outline: "none" }}>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: theme.muted, textTransform: "uppercase", marginBottom: 6 }}>Change To</label>
          <select value={modifyData.newStatus} onChange={e => setModifyData({...modifyData, newStatus: e.target.value})}
            style={{ width: "100%", padding: "8px 12px", background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, fontSize: 13, fontFamily: "'Space Grotesk', sans-serif", outline: "none" }}>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: theme.muted, textTransform: "uppercase", marginBottom: 6 }}>Date</label>
        <input type="date" value={modifyData.date} onChange={e => setModifyData({...modifyData, date: e.target.value})}
          style={{ width: "100%", padding: "8px 12px", background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, fontSize: 13, fontFamily: "'Space Grotesk', sans-serif", outline: "none" }} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: theme.muted, textTransform: "uppercase", marginBottom: 6 }}>Note / Reason *</label>
        <textarea value={modifyData.note} onChange={e => setModifyData({...modifyData, note: e.target.value})}
          placeholder="Explain the reason for modification..."
          rows={3}
          style={{ width: "100%", padding: "8px 12px", background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, fontSize: 13, fontFamily: "'Space Grotesk', sans-serif", outline: "none", resize: "none" }} />
      </div>

      <button onClick={() => {
        if (!modifyData.note.trim()) { alert("Note is required!"); return; }
        if (!modifyData.date) { alert("Please select a date!"); return; }
        if (modifyData.oldStatus === modifyData.newStatus) { alert("Old and new status cannot be same!"); return; }
        addRequest({
          teacherName: user?.name,
          studentName: selectedStudent.name,
          studentRoll: selectedStudent.rollNumber,
          subject: selectedSubject,
          oldStatus: modifyData.oldStatus,
          newStatus: modifyData.newStatus,
          date: modifyData.date,
          note: modifyData.note,
        });
        setModifyData({ oldStatus: "present", newStatus: "absent", note: "", date: "" });
        setShowModifyForm(false);
        setModifyMsg("✅ Request admin ko bhej di gayi! Approval ka wait karo.");
        setTimeout(() => setModifyMsg(""), 4000);
      }}
        style={{ width: "100%", padding: "10px", borderRadius: 8, background: "rgba(251,191,36,0.2)", border: "1px solid rgba(251,191,36,0.4)", color: "#fbbf24", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
        📨 Send Request to Admin
      </button>
    </div>
  )}

  {modifyMsg && (
    <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, fontSize: 12, color: "#86efac", fontFamily: "monospace" }}>
      {modifyMsg}
    </div>
  )}
</div>
        {markStatus && (
          <div style={{ padding: "12px 16px", background: markStatus.includes("✅") ? "rgba(34,197,94,0.1)" : theme.surface2, border: `1px solid ${markStatus.includes("✅") ? "rgba(34,197,94,0.3)" : theme.border}`, borderRadius: 10, fontSize: 13, color: markStatus.includes("✅") ? (dark ? "#86efac" : "#15803d") : theme.muted, fontFamily: "monospace" }}>
            {markStatus}
          </div>
        )}
      </div>
      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 20, padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Today's Log</div>
        <div style={{ fontSize: 12, color: theme.muted, marginBottom: 20 }}>Recently marked attendance</div>
        {attendanceLog.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: theme.muted, fontSize: 13 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>◎</div>no attendace marked till yet
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {attendanceLog.map((log, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: theme.surface2, borderRadius: 10, border: `1px solid ${theme.border}` }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: log.status === "present" ? "rgba(34,197,94,0.15)" : log.status === "late" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: log.status === "present" ? "#4ade80" : log.status === "late" ? "#fbbf24" : "#f87171", flexShrink: 0 }}>
                  {log.status === "present" ? "✓" : log.status === "late" ? "◷" : "✕"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{log.student}</div>
                  <div style={{ fontSize: 10, color: theme.muted, fontFamily: "monospace" }}>{log.subject}</div>
                </div>
                <div style={{ fontSize: 10, color: theme.muted, fontFamily: "monospace", flexShrink: 0 }}>{log.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 👤 REGISTRATION APPROVALS — Admin approves/rejects pending registrations
// ============================================================
function RegistrationApprovals({ allUsers = [], saveUsers, theme, dark }) {
  const [filterRole, setFilterRole] = useState("all");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  // Get pending (unapproved) registrations
  const pendingUsers = allUsers.filter(u => u.approved === false);
  const filtered = filterRole === "all" ? pendingUsers : pendingUsers.filter(u => u.role === filterRole);

  const roleColor = { student: "#6366f1", teacher: "#8b5cf6", admin: "#ec4899" };

  const handleApprove = (userId) => {
    const updated = allUsers.map(u => u.id === userId ? { ...u, approved: true, approvedAt: new Date().toISOString() } : u);
    saveUsers(updated);
    setActionMsg(`✅ Registration approved!`);
    setTimeout(() => setActionMsg(""), 3000);
  };

  const handleReject = (userId) => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection!");
      return;
    }
    const updated = allUsers.map(u => u.id === userId ? { ...u, approved: false, rejected: true, rejectionReason: rejectReason, rejectedAt: new Date().toISOString() } : u);
    saveUsers(updated);
    setRejectModal(null);
    setRejectReason("");
    setActionMsg(`❌ Registration rejected`);
    setTimeout(() => setActionMsg(""), 3000);
  };

  return (
    <div style={{ animation: "slideUp 0.3s ease both" }}>
      {/* Header Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Pending", value: pendingUsers.length, color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
          { label: "Students", value: pendingUsers.filter(u => u.role === "student").length, color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
          { label: "Teachers", value: pendingUsers.filter(u => u.role === "teacher").length, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
        ].map((stat, i) => (
          <div key={stat.label} style={{ background: stat.bg, border: `1px solid ${stat.color}30`, borderRadius: 14, padding: "16px 20px", animation: `slideUp 0.3s ease ${i * 60}ms both` }}>
            <div style={{ fontSize: 10, color: stat.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{stat.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: stat.color, fontFamily: "monospace" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filter + Status Message */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "student", "teacher"].map(r => (
            <button key={r} onClick={() => setFilterRole(r)}
              style={{ padding: "6px 16px", borderRadius: 99, border: `1px solid ${filterRole === r ? (roleColor[r] || theme.accent) : theme.border}`, background: filterRole === r ? `${roleColor[r] || theme.accent}20` : "transparent", color: filterRole === r ? (roleColor[r] || theme.accent) : theme.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", textTransform: "capitalize" }}>
              {r === "all" ? "All" : r}
            </button>
          ))}
        </div>
        {actionMsg && (
          <div style={{ fontSize: 12, color: actionMsg.includes("✅") ? "#4ade80" : "#f87171", fontWeight: 700, fontFamily: "monospace" }}>
            {actionMsg}
          </div>
        )}
      </div>

      {/* Pending Registrations List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 4 }}>All Done!</div>
          <div style={{ fontSize: 13, color: theme.muted }}>
            {pendingUsers.length === 0 ? "No pending registrations" : "All registrations in this category have been reviewed"}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
          {filtered.map((u, i) => (
            <div key={u.id} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 20, animation: `slideUp 0.3s ease ${i * 50}ms both`, transition: "all 0.2s ease" }}>
              {/* Header with Role Badge */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${roleColor[u.role]}, #6366f1)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "white", flexShrink: 0 }}>
                  {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 2 }}>{u.name}</div>
                  <span style={{ display: "inline-block", fontSize: 10, padding: "2px 10px", borderRadius: 99, background: `${roleColor[u.role]}20`, color: roleColor[u.role], fontWeight: 700, textTransform: "capitalize" }}>
                    {u.role}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div style={{ background: theme.surface2, borderRadius: 12, padding: 12, marginBottom: 14, fontSize: 12 }}>
                <div style={{ marginBottom: 6, color: theme.muted }}>
                  <span style={{ fontWeight: 600 }}>Email:</span> {u.email}
                </div>
                {u.rollNumber && (
                  <div style={{ marginBottom: 6, color: theme.muted }}>
                    <span style={{ fontWeight: 600 }}>Roll:</span> {u.rollNumber}
                  </div>
                )}
                {u.department && (
                  <div style={{ marginBottom: 6, color: theme.muted }}>
                    <span style={{ fontWeight: 600 }}>Dept:</span> {u.department}
                  </div>
                )}
                {u.semester && (
                  <div style={{ color: theme.muted }}>
                    <span style={{ fontWeight: 600 }}>Semester:</span> {u.semester}
                  </div>
                )}
              </div>

              {/* Registration Time */}
              {u.registeredAt && (
                <div style={{ fontSize: 10, color: theme.muted, marginBottom: 14, fontFamily: "monospace" }}>
                  Registered: {new Date(u.registeredAt).toLocaleDateString("en-IN")} {new Date(u.registeredAt).toLocaleTimeString("en-IN")}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => handleApprove(u.id)}
                  style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                  ✓ Approve
                </button>
                <button onClick={() => setRejectModal(u.id)}
                  style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                  ✕ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(8px)" }}>
          <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 20, padding: 28, width: 420, maxWidth: "90vw", animation: "slideUp 0.3s ease both" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f87171", marginBottom: 4 }}>⚠ Reject Registration</div>
            <div style={{ fontSize: 12, color: theme.muted, marginBottom: 16 }}>Please provide a reason for rejection</div>

            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="e.g., Duplicate account, Invalid email, Missing documents, etc."
              rows={4}
              style={{ width: "100%", padding: "10px 14px", background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: 10, color: theme.text, fontSize: 13, fontFamily: "'Space Grotesk', sans-serif", outline: "none", resize: "none", marginBottom: 14 }} />

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setRejectModal(null)}
                style={{ flex: 1, padding: "10px", borderRadius: 10, background: "transparent", border: `1px solid ${theme.border}`, color: theme.muted, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                Cancel
              </button>
              <button onClick={() => handleReject(rejectModal)}
                style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AttendanceTracker({ user, onLogout, allUsers = [], saveUsers, pendingRegistrations = 0 })
{
  const [dark, setDark] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [animKey, setAnimKey] = useState(0);

  const studentData = MOCK_STUDENTS.find(s => s.id === user?.id) || MOCK_STUDENTS[0];
  const subjects = studentData.subjects;
  const overall = (() => {
    const total = subjects.reduce((s, x) => s + x.totalClasses, 0);
    const attended = subjects.reduce((s, x) => s + x.classesAttended, 0);
    return { total, attended, pct: calcPercent(attended, total) };
  })();
  const atRiskCount = subjects.filter(s => calcPercent(s.classesAttended, s.totalClasses) < 75).length;
  const changePage = (page) => { setActivePage(page); setAnimKey((k) => k + 1); };
  const isTeacherOrAdmin = user?.role === "teacher" || user?.role === "admin";
  const roleColor = user?.role === "admin" ? "#ec4899" : user?.role === "teacher" ? "#8b5cf6" : "#6366f1";

  const theme = {
    bg: dark ? "#0a0f1e" : "#f0f4ff",
    surface: dark ? "#111827" : "#ffffff",
    surface2: dark ? "#1a2236" : "#f8faff",
    border: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    text: dark ? "#f1f5f9" : "#1e293b",
    muted: dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
    accent: "#6366f1",
    accentGlow: dark ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.15)",
  };

  const navItems = user?.role === "admin" ? [
    { id: "dashboard", icon: "⬡", label: "Overview" },
    { id: "marking", icon: "◉", label: "Mark Attendance" },
    { id: "bulk", icon: "▦", label: "Bulk Attendance" },
    { id: "analytics", icon: "◎", label: "All Students" },
    { id: "requests", icon: "🔔", label: "Modify Requests", badge: true },
    { id: "registrations", icon: "👤", label: "Registrations" },
  ] : user?.role === "teacher" ? [
    { id: "dashboard", icon: "⬡", label: "Overview" },
    { id: "marking", icon: "◉", label: "Mark Attendance" },
    { id: "bulk", icon: "▦", label: "Bulk Attendance" },
    { id: "analytics", icon: "◎", label: "All Students" },
    { id: "requests", icon: "🔔", label: "Modify Requests", badge: true },
  ] : [
    { id: "dashboard", icon: "⬡", label: "Dashboard" },
    { id: "subjects", icon: "◈", label: "My Subjects" },
    { id: "analytics", icon: "◎", label: "Analytics" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 12px; cursor: pointer; transition: all 0.2s ease; font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 500; border: none; background: none; width: 100%; text-align: left; }
        .nav-item:hover { background: rgba(99,102,241,0.1); }
        .stat-card { padding: 20px 24px; border-radius: 18px; transition: transform 0.2s ease; }
        .stat-card:hover { transform: translateY(-3px); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 99px; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", background: theme.bg, color: theme.text, fontFamily: "'Space Grotesk', sans-serif", overflow: "hidden" }}>

        {/* SIDEBAR */}
        <div style={{ width: sidebarOpen ? 220 : 64, background: theme.surface, borderRight: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", transition: "width 0.3s ease", overflow: "hidden", flexShrink: 0 }}>
          
          {/* Logo */}
          <div style={{ padding: "20px 16px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>⬡</div>
            {sidebarOpen && <div><div style={{ fontSize: 14, fontWeight: 700 }}>AttendX</div><div style={{ fontSize: 10, color: theme.muted, fontFamily: "monospace" }}>v2.4.1</div></div>}
          </div>

          {/* Role Badge */}
          {sidebarOpen && (
            <div style={{ padding: "10px 14px", margin: "10px 8px 4px", borderRadius: 10, background: `${roleColor}15`, border: `1px solid ${roleColor}30`, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: roleColor, textTransform: "uppercase" }}>{user?.role}</div>
                <div style={{ fontSize: 10, color: theme.muted }}>{user?.department}</div>
              </div>
            </div>
          )}

          {/* Nav Items */}
          <nav style={{ padding: "8px", flex: 1 }}>
            {navItems.map((item) => (
              <button key={item.id} className="nav-item" onClick={() => changePage(item.id)}
                style={{ color: activePage === item.id ? theme.accent : theme.muted, background: activePage === item.id ? theme.accentGlow : "transparent", marginBottom: 4, justifyContent: sidebarOpen ? "flex-start" : "center" }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
{sidebarOpen && item.badge && (() => {
  try {
    const reqs = JSON.parse(localStorage.getItem("attendx_requests") || "[]");
    const pending = reqs.filter(r => r.status === "pending").length;
    return pending > 0 ? (
      <span style={{ marginLeft: "auto", background: "#ef4444", color: "white", borderRadius: 99, fontSize: 10, fontWeight: 700, padding: "2px 7px", minWidth: 18, textAlign: "center" }}>{pending}</span>
    ) : null;
  } catch { return null; }
})()}
{sidebarOpen && item.id === "registrations" && pendingRegistrations > 0 && (
  <span style={{ marginLeft: "auto", background: "#f59e0b", color: "white", borderRadius: 99, fontSize: 10, fontWeight: 700, padding: "1px 7px", minWidth: 18, textAlign: "center" }}>{pendingRegistrations}</span>
)}
              </button>
            ))}
          </nav>

          {/* USER PROFILE + LOGOUT — Sidebar ke bilkul neeche */}
          <div style={{ padding: "12px 8px", borderTop: `1px solid ${theme.border}`, flexShrink: 0 }}>
            {/* User Info */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 8, borderRadius: 10, background: theme.surface2, marginBottom: 8, justifyContent: sidebarOpen ? "flex-start" : "center" }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${roleColor}, #6366f1)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, color: "white" }}>
                {user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              {sidebarOpen && (
                <div style={{ overflow: "hidden", flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: theme.text }}>{user?.name}</div>
                  <div style={{ fontSize: 10, color: theme.muted, fontFamily: "monospace" }}>{user?.rollNumber || user?.role}</div>
                </div>
              )}
            </div>

            {/* LOGOUT BUTTON */}
            <button onClick={onLogout}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "center" : "center", gap: 8, transition: "all 0.2s ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}>
              <span style={{ fontSize: 16 }}>↩</span>
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, background: theme.surface, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: theme.muted, fontSize: 18 }}>
                {sidebarOpen ? "◁" : "▷"}
              </button>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{navItems.find(n => n.id === activePage)?.label}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {!isTeacherOrAdmin && (
                <div style={{ padding: "6px 14px", borderRadius: 99, background: overall.pct < 75 ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.1)", border: `1px solid ${overall.pct < 75 ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.25)"}`, fontSize: 12, fontWeight: 700, color: overall.pct < 75 ? "#fca5a5" : "#86efac", fontFamily: "monospace" }}>
                  {overall.pct}% Overall
                </div>
              )}
              <button onClick={() => setDark(!dark)} style={{ background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: 99, padding: "6px 14px", cursor: "pointer", color: theme.text, fontSize: 13, fontWeight: 600 }}>
                {dark ? "☀ Light" : "◑ Dark"}
              </button>
            </div>
          </div>

          {/* Page Content */}
          <div key={animKey} style={{ flex: 1, overflowY: "auto", padding: 24 }}>

            {/* Teacher/Admin Dashboard */}
            {isTeacherOrAdmin && activePage === "dashboard" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
                  {[
                    { label: "Total Students", value: MOCK_STUDENTS.length, color: theme.accent },
                    { label: "At Risk Students", value: MOCK_STUDENTS.filter(s => calcPercent(s.subjects.reduce((a,b)=>a+b.classesAttended,0), s.subjects.reduce((a,b)=>a+b.totalClasses,0)) < 75).length, color: "#f87171" },
                  ].map((stat, i) => (
                    <div key={stat.label} className="stat-card" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
                      <div style={{ fontSize: 11, color: theme.muted, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>{stat.label}</div>
                      <div style={{ fontSize: 32, fontWeight: 700, color: stat.color, fontFamily: "monospace" }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
                <TeacherPanel user={user} dark={dark} theme={theme} />
              </div>
            )}
{isTeacherOrAdmin && activePage === "bulk" && (
  <BulkAttendance theme={theme} dark={dark} user={user} />
)}
            {isTeacherOrAdmin && activePage === "marking" && <TeacherPanel user={user} dark={dark} theme={theme} />}
            {user?.role === "admin" && activePage === "registrations" && (
  <RegistrationApprovals allUsers={allUsers} saveUsers={saveUsers} theme={theme} dark={dark} />
)}
            {user?.role === "admin" && activePage === "requests" && (
  <AdminRequests theme={theme} dark={dark} user={user} />
)}
            {user?.role === "teacher" && activePage === "requests" && (
  <TeacherRequestsView theme={theme} dark={dark} user={user} />
)}
            {isTeacherOrAdmin && activePage === "analytics" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
                {MOCK_STUDENTS.map((s, i) => {
                  const total = s.subjects.reduce((a, b) => a + b.totalClasses, 0);
                  const attended = s.subjects.reduce((a, b) => a + b.classesAttended, 0);
                  const pct = calcPercent(attended, total);
                  return (
                    <div key={s.id} style={{ background: theme.surface, border: `1px solid ${pct < 75 ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.25)"}`, borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 16, animation: `slideUp 0.4s ease ${i * 80}ms both` }}>
                      <DonutChart percentage={pct} size={80} dark={dark} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 2 }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: theme.muted, fontFamily: "monospace", marginBottom: 8 }}>{s.rollNumber}</div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, background: pct < 75 ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)", fontSize: 11, fontWeight: 700, color: pct < 75 ? "#fca5a5" : "#86efac" }}>
                          {pct < 75 ? "AT RISK" : "SAFE"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Student Dashboard */}
            {!isTeacherOrAdmin && activePage === "dashboard" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
                  {[
                    { label: "Overall Attendance", value: `${overall.pct}%`, sub: `${overall.attended}/${overall.total} classes`, color: getStatusColor(overall.pct, dark) },
                    { label: "Subjects Enrolled", value: subjects.length, sub: "Active this semester", color: theme.accent },
                    { label: "At Risk Subjects", value: atRiskCount, sub: "Below 75%", color: atRiskCount > 0 ? "#f87171" : "#4ade80" },
                    { label: "Classes Missed", value: overall.total - overall.attended, sub: "Across all subjects", color: "#fbbf24" },
                  ].map((stat, i) => (
                    <div key={stat.label} className="stat-card" style={{ background: theme.surface, border: `1px solid ${theme.border}`, animation: `slideUp 0.4s ease ${i * 80}ms both` }}>
                      <div style={{ fontSize: 11, color: theme.muted, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>{stat.label}</div>
                      <div style={{ fontSize: 32, fontWeight: 700, color: stat.color, lineHeight: 1, marginBottom: 4, fontFamily: "monospace" }}>{stat.value}</div>
                      <div style={{ fontSize: 11, color: theme.muted }}>{stat.sub}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 16 }}>
                  <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ fontSize: 12, color: theme.muted, fontWeight: 600, textTransform: "uppercase", marginBottom: 20 }}>Attendance Status</div>
                    <DonutChart percentage={overall.pct} size={160} dark={dark} />
                    <div style={{ marginTop: 16, textAlign: "center" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: overall.pct < 75 ? "#fca5a5" : "#86efac" }}>{overall.pct < 75 ? "⚠ Below Threshold" : "✓ You're On Track"}</div>
                    </div>
                  </div>
                  <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 24 }}>
                    <div style={{ fontSize: 12, color: theme.muted, fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>Monthly Breakdown</div>
                    <div style={{ height: 200 }}><BarChart data={MOCK_MONTHLY} dark={dark} /></div>
                  </div>
                </div>
              </div>
            )}

            {!isTeacherOrAdmin && activePage === "subjects" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
                {subjects.map((s, i) => <SubjectCard key={s.subject} {...s} dark={dark} delay={i * 60} />)}
              </div>
            )}

            {!isTeacherOrAdmin && activePage === "analytics" && (
              <AnalyticsContainer subjects={subjects} dark={dark} theme={theme} />
            )}

          </div>
        </div>
      </div>
    </>
  );
}
import { useState, useRef, useEffect } from "react";
import StudentAnalytics from "./StudentAnalytics";

const calcPercent = (attended, total) => {
  if (total === 0) return 0;
  return Math.round((attended / total) * 10000) / 100;
};

const getStatusColor = (pct, dark) => {
  if (pct < 75) return dark ? "#ff6b6b" : "#e53e3e";
  if (pct < 85) return dark ? "#fbbf24" : "#d97706";
  return dark ? "#4ade80" : "#16a34a";
};

function DonutChart({ percentage, size = 72, dark }) {
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

// Subject Box Component - matching SubjectCard style
function SubjectBox({ subject, classesAttended, totalClasses, dark, onOpen, delay }) {
  const pct = calcPercent(classesAttended, totalClasses);
  const isLow = pct < 75;
  const absent = totalClasses - classesAttended;
  const needed = Math.max(0, Math.ceil(0.75 * totalClasses - classesAttended));

  return (
    <div
      onClick={onOpen}
      style={{
        background: isLow ? (dark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.05)") : (dark ? "rgba(34,197,94,0.06)" : "rgba(34,197,94,0.04)"),
        border: `1px solid ${isLow ? (dark ? "rgba(239,68,68,0.35)" : "rgba(239,68,68,0.25)") : (dark ? "rgba(34,197,94,0.3)" : "rgba(34,197,94,0.25)")}`,
        borderRadius: 16,
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        animation: `slideUp 0.4s ease ${delay || 0}ms both`,
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 8px 16px ${dark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)"}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
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

// Analytics Overview Component (shows all subjects)
function AnalyticsOverview({ subjects, dark, onSelectSubject }) {
  const totalClasses = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
  const attendedClasses = subjects.reduce((sum, s) => sum + s.classesAttended, 0);
  const overallPct = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: dark ? "#f1f5f9" : "#1e293b", marginBottom: 8 }}>
          📊 Attendance Analytics
        </h1>
        <p style={{ color: dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", fontSize: 14 }}>
          Your overall attendance status across all subjects
        </p>
      </div>

      {/* Overall Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Overall", value: `${overallPct}%`, color: "#6366f1" },
          { label: "Subjects", value: subjects.length, color: "#6366f1" },
          { label: "Attended", value: `${attendedClasses}/${totalClasses}`, color: "#6366f1" },
        ].map((s, i) => (
          <div key={s.label} style={{ background: dark ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.05)", border: `1px solid ${dark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.1)"}`, borderRadius: 14, padding: "16px 20px", animation: `slideUp 0.3s ease ${i * 60}ms both` }}>
            <div style={{ fontSize: 10, color: dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Subject Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {subjects.map((subject, index) => (
          <SubjectBox
            key={index}
            subject={subject.subject}
            classesAttended={subject.classesAttended}
            totalClasses={subject.totalClasses}
            dark={dark}
            onOpen={() => onSelectSubject(subject.subject)}
            delay={index * 40}
          />
        ))}
      </div>
    </div>
  );
}

// Main Analytics Container
export default function AnalyticsContainer({ subjects, dark }) {
  const [selectedSubject, setSelectedSubject] = useState(null);

  const bgGradient = dark
    ? "radial-gradient(ellipse at 30% 50%, #1a0040 0%, #0a0015 60%, #000008 100%)"
    : "linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)";

  if (selectedSubject) {
    return (
      <div style={{ background: bgGradient, minHeight: "100vh", padding: "20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Back Button */}
          <button
            onClick={() => setSelectedSubject(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              marginBottom: 24,
              background: "rgba(99,102,241,0.1)",
              border: `1px solid rgba(99,102,241,0.2)`,
              borderRadius: 8,
              color: "#6366f1",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(99,102,241,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(99,102,241,0.1)";
            }}
          >
            ← Back to Analytics
          </button>

          {/* Student Analytics */}
          <StudentAnalytics subject={selectedSubject} subjects={subjects} dark={dark} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: bgGradient, minHeight: "100vh", padding: "30px 20px", fontFamily: "'Space Grotesk', sans-serif" }}>
      <AnalyticsOverview
        subjects={subjects}
        dark={dark}
        onSelectSubject={setSelectedSubject}
      />

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

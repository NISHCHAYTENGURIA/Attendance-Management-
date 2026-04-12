import { useState } from "react";

// Status badge styling
const getStatusStyles = (status) => {
  switch (status) {
    case "PRESENT":
      return { bg: "#4CAF50", text: "white" };
    case "ABSENT":
      return { bg: "#F44336", text: "white" };
    case "LATE":
      return { bg: "#FF9800", text: "white" };
    default:
      return { bg: "#999", text: "white" };
  }
};

// Individual Attendance Card Component
function AttendanceCard({ record, dark, delay }) {
  const dateObj = new Date(record.date);
  const day = dateObj.getDate().toString().padStart(2, "0");
  const month = dateObj.toLocaleString("default", { month: "short" });
  const statusStyles = getStatusStyles(record.status);

  const cardBg = dark ? "rgba(17,24,39,0.5)" : "#ffffff";
  const cardBorder = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const textColor = dark ? "#f1f5f9" : "#1e293b";
  const mutedColor = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";

  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        padding: "16px",
        marginBottom: "12px",
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: "10px",
        boxShadow: dark ? "0 2px 4px rgba(0,0,0,0.2)" : "0 2px 4px rgba(0,0,0,0.05)",
        alignItems: "flex-start",
        transition: "all 0.3s ease",
        animation: `slideUp 0.4s ease ${delay || 0}ms both`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#6366f1";
        e.currentTarget.style.boxShadow = dark ? "0 4px 12px rgba(99,102,241,0.15)" : "0 4px 12px rgba(99,102,241,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = cardBorder;
        e.currentTarget.style.boxShadow = dark ? "0 2px 4px rgba(0,0,0,0.2)" : "0 2px 4px rgba(0,0,0,0.05)";
      }}
    >
      {/* Date Box */}
      <div
        style={{
          minWidth: "60px",
          padding: "8px",
          textAlign: "center",
          background: dark ? "#111827" : "#f8fafc",
          border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)"}`,
          borderRadius: "6px",
          fontSize: "12px",
          color: mutedColor,
        }}
      >
        <div style={{ fontSize: "16px", fontWeight: "bold", color: textColor }}>
          {day}
        </div>
        <div style={{ fontSize: "11px", marginTop: "2px" }}>{month}</div>
      </div>

      {/* Status Badge */}
      <div style={{ minWidth: "90px" }}>
        <span
          style={{
            display: "inline-block",
            padding: "6px 12px",
            background: statusStyles.bg,
            color: statusStyles.text,
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          {record.status}
        </span>
      </div>

      {/* Topic Details */}
      <div style={{ flex: 1 }}>
        {record.topics && record.topics.length > 0 && (
          <div style={{ fontSize: "13px", color: textColor, lineHeight: "1.5" }}>
            {record.topics.join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}

// Main Student Analytics Component
export default function StudentAnalytics({ subject, subjects, dark = true }) {
  // Get subject data from the subjects prop
  const subjectData = subjects?.find(s => s.subject === subject);
  const percentage = subjectData ? Math.round((subjectData.classesAttended / subjectData.totalClasses) * 100) : 0;

  // Sample attendance data - filtered by subject
  const attendanceData = [
    {
      date: "2026-04-07",
      status: "PRESENT",
      topics: ["Graph Traversal", "Introduction", "Fractional Knapsack problem"],
      subjectCode: "BCSC1012",
    },
    {
      date: "2026-04-06",
      status: "PRESENT",
      topics: ["Guest / Placement Lecture", "Graph Traversal", "Introduction"],
      subjectCode: "BCSC1012",
    },
    {
      date: "2026-04-01",
      status: "PRESENT",
      topics: ["Guest / Placement Lecture", "Graph Traversal"],
      subjectCode: "BCSC1012",
    },
    {
      date: "2026-03-31",
      status: "PRESENT",
      topics: ["Graph Traversal", "Introduction", "Fractional Knapsack problem"],
      subjectCode: "BCSC1012",
    },
  ];

  const textColor = dark ? "#f1f5f9" : "#1e293b";
  const mutedColor = dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
  const borderColor = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const surfaceBg = dark ? "#111827" : "#f8fafc";

  const statusColor = percentage >= 75 ? "#4ade80" : percentage >= 65 ? "#fbbf24" : "#f87171";

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Subject Header */}
      <div
        style={{
          background: surfaceBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: mutedColor, textTransform: "uppercase", marginBottom: 8 }}>
          {subject}
        </div>
        <div
          style={{
            fontSize: 40,
            fontWeight: 800,
            color: statusColor,
            fontFamily: "monospace",
            marginBottom: 12,
          }}
        >
          {percentage}%
        </div>
        <div style={{ fontSize: 13, color: mutedColor }}>
          {subjectData?.classesAttended}/{subjectData?.totalClasses} classes attended
        </div>
      </div>

      {/* Attendance Records Section */}
      <div
        style={{
          background: surfaceBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 16,
          padding: 20,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: textColor,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "4px",
              height: "16px",
              background: "#6366f1",
              borderRadius: "2px",
            }}
          />
          ATTENDANCE RECORDS
        </div>

        {/* Attendance Cards List */}
        <div>
          {attendanceData.length > 0 ? (
            attendanceData.map((record, index) => (
              <AttendanceCard key={index} record={record} dark={dark} delay={index * 40} />
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: mutedColor }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>📭</div>
              <div style={{ fontSize: 14 }}>No attendance records found</div>
            </div>
          )}
        </div>

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
    </div>
  );
}

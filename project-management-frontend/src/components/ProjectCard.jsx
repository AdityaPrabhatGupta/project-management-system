import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const STATUS_COLORS = {
  active: { bg: "#dcfce7", text: "#16a34a" },
  "on-hold": { bg: "#fef9c3", text: "#ca8a04" },
  completed: { bg: "#dbeafe", text: "#2563eb" },
};

function ProjectCard({ project, isAdmin, onEdit, onDelete }) {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await API.get(`/projects/${project._id}/progress`);
        setProgress(res.data);
      } catch {
        // silently fail
      }
    };
    fetchProgress();
  }, [project._id]);

  const statusStyle = STATUS_COLORS[project.status] || STATUS_COLORS["active"];
  const progressNum = progress ? parseFloat(progress.progress) : 0;

  return (
    <div style={styles.card}>
      {/* Top row */}
      <div style={styles.topRow}>
        <span style={{ ...styles.statusBadge, background: statusStyle.bg, color: statusStyle.text }}>
          {project.status || "active"}
        </span>
        {isAdmin && (
          <div style={styles.actions}>
            <button style={styles.iconBtn} onClick={onEdit} title="Edit">✏️</button>
            <button style={{ ...styles.iconBtn, color: "#ef4444" }} onClick={onDelete} title="Delete">🗑️</button>
          </div>
        )}
      </div>

      {/* Title & description */}
      <h3 style={styles.title}>{project.title}</h3>
      <p style={styles.description}>
        {project.description || "No description provided."}
      </p>

      {/* Progress bar */}
      {progress && (
        <div style={styles.progressSection}>
          <div style={styles.progressLabelRow}>
            <span style={styles.progressLabel}>Progress</span>
            <span style={styles.progressPct}>{progress.progress}</span>
          </div>
          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressFill,
                width: `${progressNum}%`,
                background: progressNum === 100 ? "#16a34a" : "#6366f1",
              }}
            />
          </div>
          <p style={styles.taskCount}>
            {progress.completedTasks} / {progress.totalTasks} tasks done
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        {project.createdBy && (
          <span style={styles.meta}>By {project.createdBy.name}</span>
        )}
        <Link to={`/projects/${project._id}`} style={styles.viewBtn}>
          View →
        </Link>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: "14px",
    padding: "22px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    border: "1px solid #f1f5f9",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    transition: "box-shadow 0.2s",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "3px 10px",
    borderRadius: "99px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  actions: { display: "flex", gap: "6px" },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    padding: "4px",
    borderRadius: "6px",
  },
  title: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  description: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
    lineHeight: "1.5",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  progressSection: { display: "flex", flexDirection: "column", gap: "6px" },
  progressLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: { fontSize: "12px", fontWeight: "600", color: "#374151" },
  progressPct: { fontSize: "12px", fontWeight: "700", color: "#6366f1" },
  progressTrack: {
    height: "6px",
    background: "#f1f5f9",
    borderRadius: "99px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "99px",
    transition: "width 0.4s ease",
  },
  taskCount: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: 0,
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "4px",
    paddingTop: "12px",
    borderTop: "1px solid #f1f5f9",
  },
  meta: { fontSize: "12px", color: "#94a3b8" },
  viewBtn: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#6366f1",
    textDecoration: "none",
  },
};

export default ProjectCard;
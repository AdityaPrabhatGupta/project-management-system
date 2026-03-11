import { useState } from "react";
import API from "../api/axios";

const STATUS_META = {
  "todo":        { label: "Todo",        icon: "○", color: "#64748b", bg: "rgba(100,116,139,0.1)",  dot: "#94a3b8" },
  "in-progress": { label: "In Progress", icon: "◑", color: "#6366f1", bg: "rgba(99,102,241,0.12)",  dot: "#6366f1" },
  "done":        { label: "Done",        icon: "●", color: "#10b981", bg: "rgba(16,185,129,0.12)",  dot: "#10b981" },
};

const cardCss = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  .tc-card {
    background: rgba(255,255,255,0.72);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.9);
    border-radius: 14px;
    padding: 14px;
    margin-bottom: 10px;
    box-shadow: 0 2px 12px rgba(139,92,246,0.08), 0 1px 3px rgba(0,0,0,0.04);
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s;
    cursor: default;
    animation: tcPop 0.35s cubic-bezier(0.16,1,0.3,1) both;
    position: relative;
    overflow: hidden;
  }
  .tc-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #8b5cf6, #6366f1, #06b6d4);
    opacity: 0;
    transition: opacity 0.2s;
    border-radius: 14px 14px 0 0;
  }
  .tc-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(139,92,246,0.14), 0 2px 6px rgba(0,0,0,0.06);
  }
  .tc-card:hover::before { opacity: 1; }

  @keyframes tcPop {
    from { opacity:0; transform:translateY(10px) scale(0.98); }
    to   { opacity:1; transform:translateY(0)    scale(1);    }
  }

  .tc-header { display:flex; align-items:flex-start; justify-content:space-between; gap:8px; margin-bottom:6px; }
  .tc-title  { font-size:13px; font-weight:700; color:#1e1b4b; line-height:1.3; flex:1; }
  .tc-status-badge {
    display:inline-flex; align-items:center; gap:4px;
    font-size:10px; font-weight:600; padding:3px 8px;
    border-radius:20px; white-space:nowrap; flex-shrink:0;
  }
  .tc-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }

  .tc-desc {
    font-size:11px; color:#64748b; line-height:1.5;
    margin-bottom:10px;
    display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
  }

  .tc-actions { display:flex; gap:5px; }
  .tc-btn {
    flex:1; padding:5px 4px; border-radius:8px; border:1px solid transparent;
    font-size:10px; font-weight:600; cursor:pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: all 0.15s cubic-bezier(0.16,1,0.3,1);
    display:flex; align-items:center; justify-content:center; gap:3px;
  }
  .tc-btn-todo {
    background:rgba(100,116,139,0.08); color:#64748b;
    border-color:rgba(100,116,139,0.18);
  }
  .tc-btn-todo:hover { background:rgba(100,116,139,0.18); color:#475569; border-color:rgba(100,116,139,0.3); }
  .tc-btn-todo.tc-btn-active { background:rgba(100,116,139,0.15); color:#334155; border-color:#94a3b8; font-weight:700; }

  .tc-btn-prog {
    background:rgba(99,102,241,0.08); color:#6366f1;
    border-color:rgba(99,102,241,0.18);
  }
  .tc-btn-prog:hover { background:rgba(99,102,241,0.18); border-color:rgba(99,102,241,0.3); }
  .tc-btn-prog.tc-btn-active { background:rgba(99,102,241,0.15); border-color:#6366f1; font-weight:700; }

  .tc-btn-done {
    background:rgba(16,185,129,0.08); color:#10b981;
    border-color:rgba(16,185,129,0.18);
  }
  .tc-btn-done:hover { background:rgba(16,185,129,0.18); border-color:rgba(16,185,129,0.3); }
  .tc-btn-done.tc-btn-active { background:rgba(16,185,129,0.15); border-color:#10b981; font-weight:700; }

  .tc-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none !important; }
  .tc-saving { font-size:10px; color:#a78bfa; margin-top:6px; text-align:center; }
`;

function TaskCard({ task }) {
  const [status, setStatus]   = useState(task.status || "todo");
  const [saving, setSaving]   = useState(false);

  const updateStatus = async (newStatus) => {
    if (newStatus === status || saving) return;
    setSaving(true);
    try {
      await API.patch(`/tasks/${task._id}/status`, { status: newStatus });
      setStatus(newStatus);
    } catch (error) {
      console.log("Status update failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const meta = STATUS_META[status] || STATUS_META["todo"];

  return (
    <>
      <style>{cardCss}</style>
      <div className="tc-card">

        <div className="tc-header">
          <div className="tc-title">{task.title}</div>
          <div
            className="tc-status-badge"
            style={{ background: meta.bg, color: meta.color }}
          >
            <div className="tc-dot" style={{ background: meta.dot }} />
            {meta.label}
          </div>
        </div>

        {task.description && (
          <div className="tc-desc">{task.description}</div>
        )}

        <div className="tc-actions">
          <button
            className={`tc-btn tc-btn-todo${status === "todo" ? " tc-btn-active" : ""}`}
            onClick={() => updateStatus("todo")}
            disabled={saving}
          >
            ○ Todo
          </button>
          <button
            className={`tc-btn tc-btn-prog${status === "in-progress" ? " tc-btn-active" : ""}`}
            onClick={() => updateStatus("in-progress")}
            disabled={saving}
          >
            ◑ Progress
          </button>
          <button
            className={`tc-btn tc-btn-done${status === "done" ? " tc-btn-active" : ""}`}
            onClick={() => updateStatus("done")}
            disabled={saving}
          >
            ● Done
          </button>
        </div>

        {saving && <div className="tc-saving">Saving…</div>}
      </div>
    </>
  );
}

export default TaskCard;
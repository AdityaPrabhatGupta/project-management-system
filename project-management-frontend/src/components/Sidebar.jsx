import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

// ── Mobile hamburger button (rendered outside sidebar) ────────────────────────
export function MobileMenuButton({ onClick }) {
  return (
    <button className="sb-hamburger" onClick={onClick} aria-label="Open menu">
      <span /><span /><span />
    </button>
  );
}

// ── shared sidebar CSS (import once per page via <style>) ─────────────────────
export const sidebarCss = `
  .dash-sidebar {
    width: 260px; position: fixed; top: 12px; left: 12px; bottom: 12px; z-index: 20;
    padding: 22px 14px; display: flex; flex-direction: column;
    background: rgba(255,255,255,0.55); backdrop-filter: blur(32px) saturate(200%) brightness(1.04);
    -webkit-backdrop-filter: blur(32px) saturate(200%) brightness(1.04);
    border: 1px solid rgba(255,255,255,0.85); border-radius: 22px;
    box-shadow: 0 8px 32px rgba(139,92,246,0.1), 0 2px 8px rgba(0,0,0,0.04),
      inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(203,213,225,0.2);
    overflow: hidden; animation: sideIn 0.55s cubic-bezier(0.16,1,0.3,1) both;
  }
  .dash-sidebar::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 120px;
    background: linear-gradient(180deg, rgba(139,92,246,0.06) 0%, transparent 100%);
    pointer-events: none; border-radius: 22px 22px 0 0;
  }
  .dash-sidebar::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 80px;
    background: linear-gradient(0deg, rgba(99,102,241,0.04) 0%, transparent 100%);
    pointer-events: none; border-radius: 0 0 22px 22px;
  }
  @keyframes sideIn { from{opacity:0;transform:translateX(-28px)} to{opacity:1;transform:translateX(0)} }

  .sb-brand { display:flex; align-items:center; gap:10px; padding:0 8px 22px;
    border-bottom:1px solid rgba(203,213,225,0.35); margin-bottom:10px; flex-shrink:0; }
  .sb-gem { width:38px; height:38px; background:linear-gradient(135deg,#8b5cf6,#6366f1); border-radius:11px;
    display:flex; align-items:center; justify-content:center; font-size:17px; color:#fff;
    box-shadow:0 4px 14px rgba(139,92,246,0.32); transition:transform 0.3s cubic-bezier(0.16,1,0.3,1); flex-shrink:0; }
  .sb-gem:hover { transform:rotate(15deg) scale(1.08); }
  .sb-name { font-size:15px; font-weight:700; color:#1e1b4b; letter-spacing:-0.3px; }

  .sb-nav { flex:1; overflow-y:auto; scrollbar-width:none; min-height:0; }
  .sb-nav::-webkit-scrollbar { display:none; }
  .sb-section { font-size:10px; font-weight:700; color:#c7d2fe; text-transform:uppercase;
    letter-spacing:1.5px; padding:0 8px; margin:16px 0 5px; }
  .sb-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:11px;
    cursor:pointer; transition:all 0.22s cubic-bezier(0.16,1,0.3,1); color:#64748b; font-size:13px;
    font-weight:500; margin-bottom:2px; position:relative; overflow:hidden; }
  .sb-item::before { content:''; position:absolute; left:0; top:50%; transform:translateY(-50%) scaleY(0);
    width:3px; height:60%; background:linear-gradient(180deg,#8b5cf6,#6366f1); border-radius:0 3px 3px 0;
    transition:transform 0.2s cubic-bezier(0.16,1,0.3,1); }
  .sb-item:hover { background:rgba(139,92,246,0.07); color:#7c3aed; transform:translateX(4px); }
  .sb-item:hover::before { transform:translateY(-50%) scaleY(1); }
  .sb-item.active { background:linear-gradient(135deg,rgba(139,92,246,0.12),rgba(99,102,241,0.07)); color:#7c3aed; font-weight:600; }
  .sb-item.active::before { transform:translateY(-50%) scaleY(1); }
  .sb-dot { width:7px; height:7px; border-radius:50%; background:#e2e8f0; flex-shrink:0; transition:all 0.2s; }
  .sb-item.active .sb-dot, .sb-item:hover .sb-dot { background:#8b5cf6; box-shadow:0 0 0 3px rgba(139,92,246,0.15); }
  .sb-badge { margin-left:auto; font-size:10px; font-weight:700; background:rgba(139,92,246,0.1);
    color:#7c3aed; padding:2px 7px; border-radius:100px; }

  /* ── NOTICES PANEL ── */
  .sb-updates { margin:10px 0; padding:13px; background:rgba(139,92,246,0.04);
    border:1px solid rgba(139,92,246,0.1); border-radius:14px; position:relative;
    overflow:hidden; flex-shrink:0; }
  .sb-updates::before { content:''; position:absolute; top:-20px; right:-20px; width:80px; height:80px;
    border-radius:50%; background:radial-gradient(circle,rgba(139,92,246,0.12),transparent); pointer-events:none; }
  .sb-updates-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
  .sb-updates-title { font-size:10px; font-weight:800; color:#7c3aed; text-transform:uppercase;
    letter-spacing:1.5px; display:flex; align-items:center; gap:6px; }
  .sb-updates-dot { width:6px; height:6px; border-radius:50%; background:#8b5cf6;
    animation:livePulse 2s ease-in-out infinite; flex-shrink:0; }
  @keyframes livePulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.6} }
  .sb-updates-count { font-size:10px; font-weight:700;
    background:linear-gradient(135deg,#8b5cf6,#6366f1); color:#fff; padding:2px 7px; border-radius:100px; }

  .sb-update-item { display:flex; align-items:flex-start; gap:8px; padding:7px 0;
    border-bottom:1px solid rgba(139,92,246,0.08); cursor:default; }
  .sb-update-item:last-child { border-bottom:none; padding-bottom:0; }
  .sb-update-icon { width:26px; height:26px; border-radius:7px; display:flex; align-items:center;
    justify-content:center; font-size:12px; flex-shrink:0; transition:transform 0.2s; }
  .sb-update-item:hover .sb-update-icon { transform:scale(1.15) rotate(-5deg); }
  .sb-update-text { flex:1; min-width:0; }
  .sb-update-title { font-size:11px; font-weight:600; color:#1e1b4b; white-space:nowrap;
    overflow:hidden; text-overflow:ellipsis; line-height:1.3; }
  .sb-update-sub { font-size:10px; color:#94a3b8; margin-top:2px;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .sb-update-time { font-size:9px; color:#c7d2fe; flex-shrink:0; margin-top:2px; }
  .sb-notices-empty { font-size:11px; color:#c7d2fe; text-align:center; padding:6px 0; }

  /* ── BOTTOM ── */
  .sb-bottom { padding:12px 0 0; border-top:1px solid rgba(203,213,225,0.35);
    margin-top:8px; flex-shrink:0; }
  .sb-user { display:flex; align-items:center; gap:9px; padding:10px 12px; border-radius:11px;
    cursor:pointer; transition:all 0.2s; margin-bottom:3px; }
  .sb-user:hover { background:rgba(139,92,246,0.06); }
  .sb-avatar { width:34px; height:34px; background:linear-gradient(135deg,#8b5cf6,#6366f1);
    border-radius:50%; display:flex; align-items:center; justify-content:center;
    font-size:13px; font-weight:700; color:#fff; box-shadow:0 3px 10px rgba(139,92,246,0.28); flex-shrink:0; }
  .sb-uname { font-size:13px; font-weight:600; color:#1e1b4b; }
  .sb-urole  { font-size:11px; color:#94a3b8; text-transform:capitalize; }
  .sb-uarrow { font-size:12px; color:#c7d2fe; margin-left:auto; transition:color 0.2s; }
  .sb-user:hover .sb-uarrow { color:#8b5cf6; }
  .sb-logout { display:flex; align-items:center; gap:9px; padding:9px 12px; border-radius:11px;
    cursor:pointer; transition:all 0.2s; color:#94a3b8; font-size:13px; font-weight:500;
    background:transparent; border:none; width:100%; font-family:'Plus Jakarta Sans',sans-serif; }
  .sb-logout:hover { background:rgba(239,68,68,0.06); color:#ef4444; }

  /* ── HAMBURGER ── */
  .sb-hamburger { display:none; position:fixed; top:16px; left:16px; z-index:40;
    width:42px; height:42px; border-radius:12px; border:none; cursor:pointer;
    background:rgba(255,255,255,0.85); backdrop-filter:blur(16px);
    box-shadow:0 4px 16px rgba(139,92,246,0.18); flex-direction:column;
    align-items:center; justify-content:center; gap:5px; padding:0; }
  .sb-hamburger span { display:block; width:18px; height:2px; border-radius:2px;
    background:linear-gradient(90deg,#8b5cf6,#6366f1); transition:all 0.25s; }

  /* ── MOBILE OVERLAY ── */
  .sb-overlay { display:none; position:fixed; inset:0; background:rgba(15,10,40,0.35);
    backdrop-filter:blur(4px); z-index:19; animation:veilIn 0.2s ease both; }
  @keyframes veilIn { from{opacity:0} to{opacity:1} }

  /* ── CLOSE BUTTON INSIDE SIDEBAR (mobile) ── */
  .sb-close { display:none; position:absolute; top:16px; right:16px; width:30px; height:30px;
    border-radius:8px; border:1px solid rgba(203,213,225,0.5); background:rgba(0,0,0,0.04);
    color:#94a3b8; cursor:pointer; align-items:center; justify-content:center;
    font-size:14px; transition:all 0.15s; z-index:1; }
  .sb-close:hover { background:rgba(239,68,68,0.07); color:#ef4444; }

  @media (max-width: 768px) {
    .sb-hamburger { display:flex; }
    .sb-close { display:flex; }
    .dash-sidebar {
      left: -300px; top:0; bottom:0; border-radius:0 22px 22px 0;
      transition: left 0.3s cubic-bezier(0.16,1,0.3,1);
      animation: none;
    }
    .dash-sidebar.sb-open { left:0; }
    .sb-overlay.sb-overlay-visible { display:block; }
    .dash-main { margin-left:0 !important; padding:20px 16px 24px !important; }
  }
`;

// ── timeAgo helper ────────────────────────────────────────────────────────────
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso);
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TYPE_BG = {
  notice:  "rgba(139,92,246,0.1)",
  update:  "rgba(99,102,241,0.1)",
  alert:   "rgba(249,115,22,0.1)",
  success: "rgba(16,185,129,0.1)",
};

// ── Sidebar component ─────────────────────────────────────────────────────────
export default function Sidebar({ activePage }) {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const user   = (() => { try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; } })();
  const letter = (user?.name || "U").charAt(0).toUpperCase();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res  = await API.get("/notices");
        const list = Array.isArray(res.data) ? res.data
                   : Array.isArray(res.data?.notices) ? res.data.notices : [];
        const sorted = [...list].sort((a, b) => {
          if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        }).slice(0, 3);
        if (!cancelled) setNotices(sorted);
      } catch { /* silent */ }
    };
    load();
    const id = setInterval(load, 30000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const nav = (path) => { navigate(path); setMobileOpen(false); };

  return (
    <>
      <button className="sb-hamburger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
        <span /><span /><span />
      </button>
      {mobileOpen && <div className="sb-overlay sb-overlay-visible" onClick={() => setMobileOpen(false)} />}
      <aside className={`dash-sidebar${mobileOpen ? " sb-open" : ""}`}>
        <button className="sb-close" onClick={() => setMobileOpen(false)}>✕</button>
      <div className="sb-brand">
        <div className="sb-gem">⬡</div>
        <span className="sb-name">ProjectManager</span>
      </div>

      <nav className="sb-nav">
        <div className="sb-section">Main</div>
        <div className={`sb-item${activePage === "dashboard" ? " active" : ""}`}
          onClick={() => nav("/dashboard")}>
          <span className="sb-dot"/>Dashboard
        </div>
        <div className={`sb-item${activePage === "projects" ? " active" : ""}`}
          onClick={() => nav("/projects")}>
          <span className="sb-dot"/>Projects
        </div>
        <div className={`sb-item${activePage === "tasks" ? " active" : ""}`}
          onClick={() => nav("/tasks")}>
          <span className="sb-dot"/>Tasks
        </div>
      </nav>

      {/* ── NOTICES ── */}
      <div className="sb-updates">
        <div className="sb-updates-header">
          <div className="sb-updates-title">
            <span className="sb-updates-dot"/>Recent Updates
          </div>
          <span className="sb-updates-count">{notices.length}</span>
        </div>

        {notices.length === 0 ? (
          <div className="sb-notices-empty">No notices yet</div>
        ) : notices.map(n => (
          <div key={n._id} className="sb-update-item">
            <div className="sb-update-icon" style={{ background: TYPE_BG[n.type] || TYPE_BG.notice }}>
              {n.icon || "📌"}
            </div>
            <div className="sb-update-text">
              <div className="sb-update-title">{n.title}</div>
              {n.body && <div className="sb-update-sub">{n.body}</div>}
            </div>
            <div className="sb-update-time">{timeAgo(n.createdAt)}</div>
          </div>
        ))}
      </div>

      <div className="sb-bottom">
        <div className="sb-user">
          <div className="sb-avatar">{letter}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sb-uname">{user?.name || "User"}</div>
            <div className="sb-urole">{user?.role || "member"}</div>
          </div>
          <span className="sb-uarrow">↗</span>
        </div>
        <button className="sb-logout" onClick={logout}>⎋ &nbsp;Sign out</button>
      </div>
    </aside>
    </>
  );
}
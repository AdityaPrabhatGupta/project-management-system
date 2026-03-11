import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import KanbanBoard from "../components/KanbanBoard";

// ══ CUSTOM SELECT ══════════════════════════════════════════════════════════════
function CustomSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} style={{position:"relative", width:"100%", userSelect:"none", zIndex: open ? 1000 : "auto"}}>
      <div onClick={() => setOpen(o => !o)} style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background: open ? "#fff" : "rgba(248,250,252,0.9)",
        border: open ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(203,213,225,0.5)",
        borderRadius: open ? "11px 11px 0 0" : "11px",
        padding:"11px 14px",
        minHeight:44,
        fontSize:13,
        color: selected ? "#1e1b4b" : "#94a3b8",
        fontFamily:"'Plus Jakarta Sans', sans-serif",
        cursor:"pointer",
        fontWeight: 500,
        boxShadow: open ? "0 0 0 3px rgba(139,92,246,0.07)" : "none",
        transition:"all 0.18s",
      }}>
        <span style={{display:"flex", alignItems:"center", gap:8, flex:1}}>
          {selected?.icon && <span>{selected.icon}</span>}
          {selected?.label || "Select…"}
        </span>
        <span style={{color: open ? "#8b5cf6" : "#94a3b8", transition:"transform 0.2s", transform: open ? "rotate(180deg)" : "none", flexShrink:0, marginLeft:8, display:"flex"}}>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>

      {open && (
        <div style={{
          position:"absolute", top:"100%", left:0, right:0, zIndex:9999,
          background:"rgba(255,255,255,0.99)",
          backdropFilter:"blur(24px) saturate(180%)",
          WebkitBackdropFilter:"blur(24px) saturate(180%)",
          border:"1px solid rgba(139,92,246,0.2)",
          borderTop:"none",
          borderRadius:"0 0 11px 11px",
          boxShadow:"0 16px 40px rgba(139,92,246,0.16), 0 4px 12px rgba(0,0,0,0.07)",
          animation:"csDropIn 0.16s cubic-bezier(0.16,1,0.3,1) both",
          overflow:"hidden",
        }}>
          <div style={{padding:6}}>
            {options.map(opt => (
              <div key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }} style={{
                display:"flex", alignItems:"center", gap:8,
                padding:"9px 11px", borderRadius:8, fontSize:13,
                color: opt.value === value ? "#7c3aed" : "#475569",
                fontWeight: opt.value === value ? 600 : 500,
                background: opt.value === value ? "rgba(139,92,246,0.08)" : "transparent",
                cursor:"pointer", transition:"all 0.12s",
                fontFamily:"'Plus Jakarta Sans', sans-serif",
              }}
              onMouseEnter={e => { if (opt.value !== value) { e.currentTarget.style.background = "rgba(139,92,246,0.07)"; e.currentTarget.style.color = "#1e1b4b"; }}}
              onMouseLeave={e => { e.currentTarget.style.background = opt.value === value ? "rgba(139,92,246,0.08)" : "transparent"; e.currentTarget.style.color = opt.value === value ? "#7c3aed" : "#475569"; }}>
                {opt.icon && <span>{opt.icon}</span>}
                <span style={{flex:1}}>{opt.label}</span>
                {opt.value === value && <span style={{color:"#8b5cf6", fontSize:12, fontWeight:700}}>✓</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const STATUS_OPTS = [
  { value:"active",    label:"Active",    icon:"🟢" },
  { value:"on-hold",   label:"On Hold",   icon:"🟡" },
  { value:"completed", label:"Completed", icon:"✅" },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,wght@0,300;0,600;1,300;1,600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes csDropIn { from{opacity:0;transform:translateY(-6px) scaleY(0.95)} to{opacity:1;transform:translateY(0) scaleY(1)} }

  .dash-page { display: flex; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; background: #eef2ff; position: relative; }
  .dash-page::before { content: ''; position: fixed; inset: 0;
    background: radial-gradient(ellipse 70% 50% at 10% 20%, rgba(139,92,246,0.13) 0%, transparent 60%),
      radial-gradient(ellipse 50% 60% at 90% 80%, rgba(6,182,212,0.1) 0%, transparent 60%),
      linear-gradient(135deg, #eef2ff 0%, #f0f9ff 60%, #fdf4ff 100%);
    z-index: 0; }

  .dash-sidebar { width: 260px; position: fixed; top: 12px; left: 12px; bottom: 12px; z-index: 20; padding: 22px 14px;
    display: flex; flex-direction: column; background: rgba(255,255,255,0.55);
    backdrop-filter: blur(32px) saturate(200%) brightness(1.04); -webkit-backdrop-filter: blur(32px) saturate(200%) brightness(1.04);
    border: 1px solid rgba(255,255,255,0.85); border-radius: 22px;
    box-shadow: 0 8px 32px rgba(139,92,246,0.1), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9);
    overflow: hidden; animation: sideIn 0.55s cubic-bezier(0.16,1,0.3,1) both; }
  .dash-sidebar::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 120px; background: linear-gradient(180deg,rgba(139,92,246,0.06) 0%,transparent 100%); pointer-events: none; border-radius: 22px 22px 0 0; }
  @keyframes sideIn { from{opacity:0;transform:translateX(-28px)} to{opacity:1;transform:translateX(0)} }

  .sb-brand { display: flex; align-items: center; gap: 10px; padding: 0 8px 22px; border-bottom: 1px solid rgba(203,213,225,0.35); margin-bottom: 10px; }
  .sb-gem { width: 38px; height: 38px; background: linear-gradient(135deg,#8b5cf6,#6366f1); border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 17px; color: #fff; box-shadow: 0 4px 14px rgba(139,92,246,0.32); transition: transform 0.3s; }
  .sb-gem:hover { transform: rotate(15deg) scale(1.08); }
  .sb-name { font-size: 15px; font-weight: 700; color: #1e1b4b; letter-spacing: -0.3px; }
  .sb-nav { flex: 1; }
  .sb-section { font-size: 10px; font-weight: 700; color: #c7d2fe; text-transform: uppercase; letter-spacing: 1.5px; padding: 0 8px; margin: 16px 0 5px; }
  .sb-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 11px; cursor: pointer; transition: all 0.22s cubic-bezier(0.16,1,0.3,1); color: #64748b; font-size: 13px; font-weight: 500; margin-bottom: 2px; position: relative; overflow: hidden; }
  .sb-item::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%) scaleY(0); width: 3px; height: 60%; background: linear-gradient(180deg,#8b5cf6,#6366f1); border-radius: 0 3px 3px 0; transition: transform 0.2s; }
  .sb-item:hover { background: rgba(139,92,246,0.07); color: #7c3aed; transform: translateX(4px); }
  .sb-item:hover::before { transform: translateY(-50%) scaleY(1); }
  .sb-item.active { background: linear-gradient(135deg,rgba(139,92,246,0.12),rgba(99,102,241,0.07)); color: #7c3aed; font-weight: 600; }
  .sb-item.active::before { transform: translateY(-50%) scaleY(1); }
  .sb-dot { width: 7px; height: 7px; border-radius: 50%; background: #e2e8f0; flex-shrink: 0; transition: all 0.2s; }
  .sb-item.active .sb-dot, .sb-item:hover .sb-dot { background: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,0.15); }
  .sb-bottom { padding: 12px 0 0; border-top: 1px solid rgba(203,213,225,0.35); margin-top: 12px; }
  .sb-user { display: flex; align-items: center; gap: 9px; padding: 10px 12px; border-radius: 11px; cursor: pointer; transition: all 0.2s; margin-bottom: 3px; }
  .sb-user:hover { background: rgba(139,92,246,0.06); }
  .sb-avatar { width: 34px; height: 34px; background: linear-gradient(135deg,#8b5cf6,#6366f1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; box-shadow: 0 3px 10px rgba(139,92,246,0.28); flex-shrink: 0; }
  .sb-uname { font-size: 13px; font-weight: 600; color: #1e1b4b; }
  .sb-urole { font-size: 11px; color: #94a3b8; text-transform: capitalize; }
  .sb-uarrow { font-size: 12px; color: #c7d2fe; margin-left: auto; }
  .sb-logout { display: flex; align-items: center; gap: 9px; padding: 9px 12px; border-radius: 11px; cursor: pointer; transition: all 0.2s; color: #94a3b8; font-size: 13px; font-weight: 500; background: transparent; border: none; width: 100%; font-family: 'Plus Jakarta Sans', sans-serif; }
  .sb-logout:hover { background: rgba(239,68,68,0.06); color: #ef4444; }

  .dash-main { margin-left: 284px; flex: 1; padding: 36px 44px; position: relative; z-index: 1; display: flex; flex-direction: column; gap: 20px; }

  .topbar { display: flex; align-items: flex-start; justify-content: space-between; animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
  .top-eyebrow { font-size: 10px; font-weight: 700; color: #a78bfa; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; }
  .top-title { font-family: 'Fraunces', serif; font-size: 28px; font-weight: 600; color: #1e1b4b; letter-spacing: -0.8px; line-height: 1.1; }
  .top-title em { font-style: italic; font-weight: 300; background: linear-gradient(135deg,#8b5cf6,#06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .top-date { font-size: 12px; color: #94a3b8; margin-top: 5px; }
  .top-actions { display: flex; align-items: center; gap: 10px; }

  .btn-grad { display: flex; align-items: center; gap: 7px; background: linear-gradient(135deg,#8b5cf6 0%,#6366f1 60%,#4f46e5 100%); color: #fff; border: none; padding: 10px 20px; border-radius: 11px; font-size: 13px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.25s cubic-bezier(0.16,1,0.3,1); box-shadow: 0 4px 14px rgba(99,102,241,0.32); }
  .btn-grad:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(99,102,241,0.42); }
  .btn-back { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.7); backdrop-filter: blur(12px); border: 1px solid rgba(203,213,225,0.5); padding: 9px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; color: #7c3aed; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s; }
  .btn-back:hover { background: rgba(255,255,255,0.9); transform: translateX(-2px); }
  .btn-edit { background: rgba(248,250,252,0.9); border: 1px solid rgba(203,213,225,0.5); padding: 9px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; color: #374151; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s; }
  .btn-edit:hover { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .btn-del { background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2); padding: 9px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; color: #ef4444; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s; }
  .btn-del:hover { background: rgba(239,68,68,0.1); }

  .glass { background: rgba(255,255,255,0.7); backdrop-filter: blur(18px) saturate(180%); -webkit-backdrop-filter: blur(18px) saturate(180%); border: 1px solid rgba(255,255,255,0.92); border-radius: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.035), 0 8px 32px rgba(139,92,246,0.05); transition: all 0.3s cubic-bezier(0.16,1,0.3,1); }

  .proj-header-card { padding: 28px; position: relative; overflow: visible; animation: cardPop 0.55s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
  .proj-header-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg,#8b5cf6,#6366f1,#06b6d4); border-radius: 20px 20px 0 0; pointer-events:none; }
  .ph-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
  .status-badge { font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.5px; }
  .s-active    { background: rgba(16,185,129,0.1);  color: #059669; }
  .s-on-hold   { background: rgba(245,158,11,0.1);  color: #d97706; }
  .s-completed { background: rgba(99,102,241,0.1);  color: #4f46e5; }
  .ph-actions { display: flex; gap: 8px; }
  .proj-name { font-family: 'Fraunces', serif; font-size: 26px; font-weight: 600; color: #1e1b4b; letter-spacing: -0.6px; margin-bottom: 8px; }
  .proj-desc { font-size: 14px; color: #64748b; line-height: 1.7; margin-bottom: 14px; }
  .proj-meta-row { display: flex; gap: 20px; flex-wrap: wrap; }
  .proj-meta-item { font-size: 12px; color: #94a3b8; display: flex; align-items: center; gap: 5px; }
  .proj-meta-item strong { color: #64748b; }

  .edit-form { display: flex; flex-direction: column; gap: 14px; }
  .field-wrap { display: flex; flex-direction: column; gap: 6px; position: relative; }
  .field-lbl { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
  .field-inp { padding: 11px 14px; background: rgba(248,250,252,0.9); border: 1px solid rgba(203,213,225,0.5); border-radius: 11px; font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif; color: #1e1b4b; outline: none; transition: border-color 0.2s; width: 100%; resize: none; }
  .field-inp:focus { border-color: rgba(139,92,246,0.4); box-shadow: 0 0 0 3px rgba(139,92,246,0.07); }
  .edit-actions { display: flex; gap: 10px; margin-top: 4px; }
  .btn-cancel { padding: 10px 20px; background: rgba(241,245,249,0.8); border: 1px solid rgba(203,213,225,0.55); border-radius: 10px; color: #64748b; font-size: 13px; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.2s; }
  .btn-cancel:hover { background: #f1f5f9; }
  .btn-save { padding: 10px 24px; background: linear-gradient(135deg,#8b5cf6,#6366f1); border: none; border-radius: 10px; color: #fff; font-size: 13px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
  .btn-save:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(99,102,241,0.4); }

  .progress-card { padding: 26px; animation: cardPop 0.55s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
  .pc-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
  .pc-title { font-family: 'Fraunces', serif; font-size: 18px; font-weight: 600; color: #1e1b4b; letter-spacing: -0.4px; }
  .pc-sub   { font-size: 12px; color: #94a3b8; margin-top: 2px; }
  .pc-rate  { font-family: 'Fraunces', serif; font-size: 36px; font-weight: 600; background: linear-gradient(135deg,#8b5cf6,#06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -1px; }
  .stats-row { display: flex; gap: 32px; margin-bottom: 20px; }
  .stat-box { display: flex; flex-direction: column; gap: 4px; }
  .stat-n   { font-family: 'Fraunces', serif; font-size: 32px; font-weight: 600; color: #1e1b4b; letter-spacing: -1px; }
  .stat-l   { font-size: 12px; color: #94a3b8; font-weight: 500; }
  .prog-track { height: 10px; background: rgba(203,213,225,0.35); border-radius: 100px; overflow: hidden; }
  .prog-fill  { height: 100%; border-radius: 100px; background: linear-gradient(90deg,#8b5cf6,#6366f1,#06b6d4); transition: width 1.4s cubic-bezier(0.16,1,0.3,1); }
  .prog-labels { display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; margin-top: 10px; }
  .prog-labels strong { color: #1e1b4b; }

  .kanban-card { padding: 26px; animation: cardPop 0.55s cubic-bezier(0.16,1,0.3,1) 0.35s both; }
  .kb-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
  .kb-title { font-family: 'Fraunces', serif; font-size: 18px; font-weight: 600; color: #1e1b4b; letter-spacing: -0.4px; }

  .modal-veil { position: fixed; inset: 0; background: rgba(15,10,40,0.28); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); z-index: 100; display: flex; align-items: center; justify-content: center; animation: veilIn 0.2s ease both; }
  @keyframes veilIn { from{opacity:0} to{opacity:1} }
  .confirm-glass { background: rgba(255,255,255,0.92); backdrop-filter: blur(28px) saturate(200%); border: 1px solid rgba(255,255,255,1); border-radius: 20px; width: 340px; padding: 30px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.09); animation: modalPop 0.3s cubic-bezier(0.16,1,0.3,1) both; }
  @keyframes modalPop { from{opacity:0;transform:scale(0.93) translateY(14px)} to{opacity:1;transform:scale(1) translateY(0)} }
  .confirm-emoji { font-size: 36px; margin-bottom: 12px; }
  .confirm-title { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 600; color: #1e1b4b; margin-bottom: 7px; }
  .confirm-text  { font-size: 13px; color: #64748b; margin-bottom: 22px; line-height: 1.65; }
  .confirm-btns  { display: flex; gap: 10px; }
  .btn-stay { flex:1; padding:11px; background:rgba(241,245,249,0.8); border:1px solid rgba(203,213,225,0.55); border-radius:10px; color:#64748b; font-size:13px; font-weight:600; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; }
  .btn-bye  { flex:1; padding:11px; background:linear-gradient(135deg,#ef4444,#dc2626); border:none; border-radius:10px; color:#fff; font-size:13px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; box-shadow:0 4px 12px rgba(239,68,68,0.25); }
  .btn-bye:hover { transform:translateY(-1px); box-shadow:0 6px 18px rgba(239,68,68,0.35); }

  .dash-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; gap: 16px; }
  .loader-ring { width: 42px; height: 42px; border: 3px solid rgba(139,92,246,0.15); border-top-color: #8b5cf6; border-radius: 50%; animation: spin 0.75s linear infinite; }
  .loader-txt  { font-size: 13px; color: #94a3b8; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @keyframes cardPop { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

  /* ── MOBILE ── */
  @media (max-width: 768px) {
    .dash-main { margin-left:0 !important; padding:60px 14px 24px !important; }
    .topbar { flex-direction:column; gap:14px; margin-bottom:20px; }
    .proj-header-card .ph-top { flex-direction:column; gap:12px; }
    .modal-glass { width:calc(100vw - 32px); max-width:480px; }
    .confirm-glass { width:calc(100vw - 32px); }
    .top-actions { width:100%; flex-wrap:wrap; }
    .btn-grad { flex:1; justify-content:center; }
    /* sidebar slide */
    .dash-sidebar { left:-300px; top:0; bottom:0; border-radius:0 22px 22px 0;
      transition:left 0.3s cubic-bezier(0.16,1,0.3,1); animation:none; }
    .dash-sidebar.sb-open { left:0; }
    .pd-hamburger { display:flex; }
    .pd-close { display:flex; }
    .pd-overlay.pd-ov-visible { display:block; }
  }
  @media (max-width: 480px) {
    .top-title { font-size:22px; }
  }

  /* hamburger */
  .pd-hamburger { display:none; position:fixed; top:16px; left:16px; z-index:40;
    width:42px; height:42px; border-radius:12px; border:none; cursor:pointer;
    background:rgba(255,255,255,0.85); backdrop-filter:blur(16px);
    box-shadow:0 4px 16px rgba(139,92,246,0.18); flex-direction:column;
    align-items:center; justify-content:center; gap:5px; padding:0; }
  .pd-hamburger span { display:block; width:18px; height:2px; border-radius:2px;
    background:linear-gradient(90deg,#8b5cf6,#6366f1); }
  .pd-overlay { display:none; position:fixed; inset:0; background:rgba(15,10,40,0.35);
    backdrop-filter:blur(4px); z-index:19; }
  .pd-close { display:none; position:absolute; top:16px; right:16px; width:30px; height:30px;
    border-radius:8px; border:1px solid rgba(203,213,225,0.5); background:rgba(0,0,0,0.04);
    color:#94a3b8; cursor:pointer; align-items:center; justify-content:center;
    font-size:14px; transition:all 0.15s; z-index:1; }
  .pd-close:hover { background:rgba(239,68,68,0.07); color:#ef4444; }
`;

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project,  setProject]  = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [showDel,  setShowDel]  = useState(false);
  const [form, setForm] = useState({ title:"", description:"", status:"active" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "admin";
  const letter  = (user?.name || "U").charAt(0).toUpperCase();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [pRes, prRes] = await Promise.allSettled([
        API.get(`/projects/${id}`),
        API.get(`/projects/${id}/progress`),
      ]);
      if (pRes.status === "fulfilled") {
        const p = pRes.value.data.project;
        setProject(p);
        setForm({ title: p.title, description: p.description||"", status: p.status||"active" });
      }
      if (prRes.status === "fulfilled") setProgress(prRes.value.data);
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await API.put(`/projects/${id}`, form);
      setProject(res.data.updatedProject);
      setEditMode(false);
    } catch(err) { alert(err.response?.data?.message || "Failed to update."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/projects/${id}`);
      navigate("/projects");
    } catch(err) { alert(err.response?.data?.message || "Failed to delete."); }
  };

  const statusCls = s => s === "active" ? "s-active" : s === "on-hold" ? "s-on-hold" : "s-completed";
  const pct = progress ? parseFloat(progress.progress) : 0;

  return (
    <>
      <style>{css}</style>
      <div className="dash-page">

        {/* ── MOBILE HAMBURGER ── */}
        <button className="pd-hamburger" onClick={() => setSidebarOpen(true)}>
          <span /><span /><span />
        </button>
        {sidebarOpen && <div className="pd-overlay pd-ov-visible" onClick={() => setSidebarOpen(false)} />}

        <aside className={`dash-sidebar${sidebarOpen ? " sb-open" : ""}`}>
          <button className="pd-close" onClick={() => setSidebarOpen(false)}>✕</button>
          <div className="sb-brand">
            <div className="sb-gem">⬡</div>
            <span className="sb-name">ProjectManager</span>
          </div>
          <nav className="sb-nav">
            <div className="sb-section">Main</div>
            <div className="sb-item" onClick={() => { navigate("/dashboard"); setSidebarOpen(false); }}><span className="sb-dot"/>Dashboard</div>
            <div className="sb-item active" onClick={() => { navigate("/projects"); setSidebarOpen(false); }}><span className="sb-dot"/>Projects</div>
            <div className="sb-item" onClick={() => { navigate("/tasks"); setSidebarOpen(false); }}><span className="sb-dot"/>Tasks</div>
          </nav>
          <div style={{flex:1}}/>
          <div className="sb-bottom">
            <div className="sb-user">
              <div className="sb-avatar">{letter}</div>
              <div style={{flex:1,minWidth:0}}>
                <div className="sb-uname">{user?.name||"User"}</div>
                <div className="sb-urole">{user?.role||"member"}</div>
              </div>
              <span className="sb-uarrow">↗</span>
            </div>
            <button className="sb-logout" onClick={() => { localStorage.removeItem("token"); navigate("/"); }}>⎋ &nbsp;Sign out</button>
          </div>
        </aside>

        <main className="dash-main">
          <div className="topbar">
            <div>
              <div className="top-eyebrow">Projects</div>
              <h1 className="top-title">
                {project ? <em>{project.title}</em> : <em>Loading…</em>}
              </h1>
              <div className="top-date">{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
            </div>
            <div className="top-actions">
              <button className="btn-back" onClick={() => navigate("/projects")}>← Back</button>
              {isAdmin && !editMode && project && (
                <>
                  <button className="btn-edit" onClick={() => setEditMode(true)}>✏️ Edit</button>
                  <button className="btn-del"  onClick={() => setShowDel(true)}>🗑️ Delete</button>
                </>
              )}
            </div>
          </div>

          {loading ? (
            <div className="dash-loader"><div className="loader-ring"/><span className="loader-txt">Loading project…</span></div>
          ) : !project ? (
            <div style={{textAlign:"center",padding:"60px",color:"#94a3b8"}}>Project not found.</div>
          ) : (
            <>
              <div className="glass proj-header-card">
                {!editMode ? (
                  <>
                    <div className="ph-top">
                      <span className={`status-badge ${statusCls(project.status)}`}>{project.status||"active"}</span>
                    </div>
                    <div className="proj-name">{project.title}</div>
                    <div className="proj-desc">{project.description||"No description provided."}</div>
                    <div className="proj-meta-row">
                      {project.createdBy && <span className="proj-meta-item">👤 Created by <strong>{project.createdBy.name}</strong></span>}
                      {project.assignedTo?.length > 0 && <span className="proj-meta-item">👥 <strong>{project.assignedTo.length}</strong> assignees</span>}
                    </div>
                  </>
                ) : (
                  <div className="edit-form">
                    <div className="field-wrap">
                      <label className="field-lbl">Title *</label>
                      <input className="field-inp" value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="Project title"/>
                    </div>
                    <div className="field-wrap">
                      <label className="field-lbl">Description</label>
                      <textarea className="field-inp" rows={3} value={form.description} onChange={e => setForm({...form,description:e.target.value})} placeholder="Describe this project…"/>
                    </div>
                    <div className="field-wrap">
                      <label className="field-lbl">Status</label>
                      <CustomSelect
                        value={form.status}
                        onChange={v => setForm({...form, status:v})}
                        options={STATUS_OPTS}
                      />
                    </div>
                    <div className="edit-actions">
                      <button className="btn-cancel" onClick={() => setEditMode(false)}>Cancel</button>
                      <button className="btn-save" onClick={handleSave} disabled={saving}>{saving?"Saving…":"Save Changes"}</button>
                    </div>
                  </div>
                )}
              </div>

              {progress && (
                <div className="glass progress-card">
                  <div className="pc-head">
                    <div>
                      <div className="pc-title">Project Progress</div>
                      <div className="pc-sub">Aggregated task completion</div>
                    </div>
                    <div className="pc-rate">{progress.progress}</div>
                  </div>
                  <div className="stats-row">
                    <div className="stat-box"><div className="stat-n">{progress.totalTasks}</div><div className="stat-l">Total Tasks</div></div>
                    <div className="stat-box"><div className="stat-n" style={{color:"#10b981"}}>{progress.completedTasks}</div><div className="stat-l">Completed</div></div>
                    <div className="stat-box"><div className="stat-n" style={{color:"#94a3b8"}}>{progress.totalTasks - progress.completedTasks}</div><div className="stat-l">Remaining</div></div>
                  </div>
                  <div className="prog-track"><div className="prog-fill" style={{width:`${pct}%`}}/></div>
                  <div className="prog-labels">
                    <span><strong>{progress.completedTasks}</strong> done</span>
                    <span><strong>{progress.totalTasks - progress.completedTasks}</strong> remaining</span>
                  </div>
                </div>
              )}

              <div className="glass kanban-card">
                <div className="kb-head"><div className="kb-title">Task Board</div></div>
                <KanbanBoard projectId={id} />
              </div>
            </>
          )}
        </main>
      </div>

      {showDel && (
        <div className="modal-veil" onClick={() => setShowDel(false)}>
          <div className="confirm-glass" onClick={e => e.stopPropagation()}>
            <div className="confirm-emoji">🗑️</div>
            <div className="confirm-title">Delete project?</div>
            <div className="confirm-text">"<strong>{project?.title}</strong>" will be permanently removed. This cannot be undone.</div>
            <div className="confirm-btns">
              <button className="btn-stay" onClick={() => setShowDel(false)}>Cancel</button>
              <button className="btn-bye"  onClick={handleDelete}>Yes, delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
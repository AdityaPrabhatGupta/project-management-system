import { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Sidebar, { sidebarCss } from "../components/Sidebar";

// ══ CUSTOM SELECT ══════════════════════════════════════════════════════════════
function CustomSelect({ value, onChange, options, placeholder = "Select…", disabled = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} style={{position:"relative", width:"100%", userSelect:"none", opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? "none" : "auto", zIndex: open ? 1000 : "auto"}}>
      <div onClick={() => setOpen(o => !o)} style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background: open ? "rgba(255,255,255,1)" : "rgba(248,250,252,0.9)",
        border: open ? "1.5px solid #8b5cf6" : "1px solid rgba(203,213,225,0.5)",
        borderRadius: open ? "11px 11px 0 0" : "11px",
        padding: "11px 14px",
        minHeight: 44,
        fontSize: 13,
        color: selected ? "#1e1b4b" : "#94a3b8",
        fontFamily:"'Plus Jakarta Sans', sans-serif",
        cursor:"pointer",
        boxShadow: open ? "0 0 0 3px rgba(139,92,246,0.07)" : "none",
        transition:"all 0.18s",
        fontWeight: selected ? 500 : 400,
      }}>
        <span style={{display:"flex", alignItems:"center", gap:7, flex:1}}>
          {selected ? (
            <>
              {selected.icon && <span>{selected.icon}</span>}
              {selected.dot  && <span style={{width:8, height:8, borderRadius:"50%", background:selected.dot, flexShrink:0, display:"inline-block"}} />}
              {selected.label}
            </>
          ) : placeholder}
        </span>
        <span style={{color: open ? "#8b5cf6" : "#94a3b8", transition:"transform 0.2s, color 0.2s", transform: open ? "rotate(180deg)" : "none", flexShrink:0, marginLeft:8, display:"flex"}}>
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
          <div style={{padding:6, maxHeight:220, overflowY:"auto", scrollbarWidth:"thin"}}>
            {options.map(opt => (
              <div key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }} style={{
                display:"flex", alignItems:"center", gap:8,
                padding:"9px 11px",
                borderRadius:8,
                fontSize:13,
                color: opt.value === value ? "#7c3aed" : "#475569",
                fontWeight: opt.value === value ? 600 : 500,
                background: opt.value === value
                  ? "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(99,102,241,0.06))"
                  : "transparent",
                cursor:"pointer",
                transition:"all 0.12s",
                fontFamily:"'Plus Jakarta Sans', sans-serif",
              }}
              onMouseEnter={e => { if (opt.value !== value) { e.currentTarget.style.background = "rgba(139,92,246,0.07)"; e.currentTarget.style.color = "#1e1b4b"; }}}
              onMouseLeave={e => { e.currentTarget.style.background = opt.value === value ? "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(99,102,241,0.06))" : "transparent"; e.currentTarget.style.color = opt.value === value ? "#7c3aed" : "#475569"; }}>
                {opt.icon && <span>{opt.icon}</span>}
                {opt.dot  && <span style={{width:8, height:8, borderRadius:"50%", background:opt.dot, flexShrink:0, display:"inline-block"}} />}
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

  .dash-page { display:flex; min-height:100vh; font-family:'Plus Jakarta Sans',sans-serif; background:#eef2ff; position:relative; }
  .dash-page::before { content:''; position:fixed; inset:0; z-index:0;
    background:
      radial-gradient(ellipse 70% 50% at 10% 20%, rgba(139,92,246,0.13) 0%, transparent 60%),
      radial-gradient(ellipse 50% 60% at 90% 80%, rgba(6,182,212,0.1) 0%, transparent 60%),
      radial-gradient(ellipse 40% 40% at 50% 50%, rgba(249,115,22,0.05) 0%, transparent 60%),
      linear-gradient(135deg, #eef2ff 0%, #f0f9ff 60%, #fdf4ff 100%); }

  .dash-main { margin-left:284px; flex:1; padding:36px 44px; position:relative; z-index:1; }
  .topbar { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:32px; animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
  .top-eyebrow { font-size:10px; font-weight:700; color:#a78bfa; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:4px; }
  .top-title { font-family:'Fraunces',serif; font-size:30px; font-weight:600; color:#1e1b4b; letter-spacing:-0.8px; line-height:1; }
  .top-title em { font-style:italic; font-weight:300; background:linear-gradient(135deg,#8b5cf6,#06b6d4); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .top-date { font-size:12px; color:#94a3b8; margin-top:5px; }
  .top-actions { display:flex; align-items:center; gap:10px; }

  .btn-grad { display:flex; align-items:center; gap:7px;
    background:linear-gradient(135deg,#8b5cf6 0%,#6366f1 60%,#4f46e5 100%);
    color:#fff; border:none; padding:10px 20px; border-radius:11px;
    font-size:13px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer;
    transition:all 0.25s cubic-bezier(0.16,1,0.3,1);
    box-shadow:0 4px 14px rgba(99,102,241,0.32), inset 0 1px 0 rgba(255,255,255,0.2); }
  .btn-grad:hover { transform:translateY(-2px); box-shadow:0 8px 22px rgba(99,102,241,0.42); }

  .glass { background:rgba(255,255,255,0.7); backdrop-filter:blur(18px) saturate(180%); -webkit-backdrop-filter:blur(18px) saturate(180%);
    border:1px solid rgba(255,255,255,0.92); border-radius:20px;
    box-shadow:0 2px 12px rgba(0,0,0,0.035), 0 8px 32px rgba(139,92,246,0.05);
    transition:all 0.3s cubic-bezier(0.16,1,0.3,1); }

  .proj-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; margin-bottom:24px; }
  .stat-card { padding:24px; position:relative; overflow:hidden; animation:cardPop 0.55s cubic-bezier(0.16,1,0.3,1) both; cursor:default; }
  .stat-card:nth-child(1){animation-delay:0.12s} .stat-card:nth-child(2){animation-delay:0.22s} .stat-card:nth-child(3){animation-delay:0.32s}
  .stat-card:hover { transform:translateY(-5px) scale(1.01); box-shadow:0 12px 36px rgba(139,92,246,0.14), 0 2px 8px rgba(0,0,0,0.04); }
  .stat-card::before { content:''; position:absolute; top:-30px; right:-30px; width:110px; height:110px; border-radius:50%;
    background:var(--glow); filter:blur(22px); pointer-events:none; transition:transform 0.4s; }
  .stat-card:hover::before { transform:scale(1.3); }
  .stat-card-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .stat-icon { width:44px; height:44px; border-radius:13px; display:flex; align-items:center; justify-content:center;
    font-size:20px; background:var(--icon-bg); transition:transform 0.3s cubic-bezier(0.16,1,0.3,1); }
  .stat-card:hover .stat-icon { transform:rotate(-8deg) scale(1.1); }
  .live-pill { display:flex; align-items:center; gap:5px; font-size:10px; font-weight:700; color:#10b981;
    background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); padding:3px 9px; border-radius:100px; }
  .live-dot { width:5px; height:5px; border-radius:50%; background:#10b981; animation:livePulse 2s ease-in-out infinite; }
  @keyframes livePulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.6} }
  .stat-num { font-family:'Fraunces',serif; font-size:48px; font-weight:600; color:#1e1b4b; letter-spacing:-2.5px; line-height:1; margin-bottom:5px; }
  .stat-lbl { font-size:13px; color:#64748b; margin-bottom:14px; }
  .stat-bar-wrap { height:4px; background:rgba(203,213,225,0.4); border-radius:100px; overflow:hidden; margin-bottom:8px; }
  .stat-bar { height:100%; border-radius:100px; background:var(--bar-color); animation:barGrow 1.2s cubic-bezier(0.16,1,0.3,1) 0.5s both; transform-origin:left; }
  @keyframes barGrow { from{width:0%!important} }
  .stat-footer { font-size:11px; color:#94a3b8; padding-top:10px; border-top:1px solid rgba(203,213,225,0.35); }

  .proj-grid-wrap { padding:26px; animation:cardPop 0.55s cubic-bezier(0.16,1,0.3,1) 0.38s both; }
  .proj-grid-wrap:hover { transform:translateY(-2px); box-shadow:0 10px 30px rgba(139,92,246,0.1); }
  .pg-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; }
  .pg-title { font-family:'Fraunces',serif; font-size:18px; font-weight:600; color:#1e1b4b; letter-spacing:-0.4px; }
  .pg-sub { font-size:12px; color:#94a3b8; margin-top:2px; }
  .pg-filters { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
  .filter-pill { padding:6px 14px; border-radius:100px; font-size:12px; font-weight:600;
    border:1px solid rgba(203,213,225,0.5); background:rgba(248,250,252,0.8); color:#64748b;
    cursor:pointer; transition:all 0.2s; font-family:'Plus Jakarta Sans',sans-serif; }
  .filter-pill:hover { border-color:rgba(139,92,246,0.3); color:#7c3aed; }
  .filter-pill.fpActive { background:linear-gradient(135deg,rgba(139,92,246,0.12),rgba(99,102,241,0.07)); border-color:rgba(139,92,246,0.3); color:#7c3aed; }
  .proj-cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }

  .proj-card { background:rgba(255,255,255,0.75); backdrop-filter:blur(12px);
    border:1px solid rgba(255,255,255,0.95); border-radius:16px; padding:20px;
    transition:all 0.28s cubic-bezier(0.16,1,0.3,1); cursor:pointer; position:relative; overflow:hidden;
    animation:cardPop 0.5s cubic-bezier(0.16,1,0.3,1) both; box-shadow:0 1px 4px rgba(0,0,0,0.04); }
  .proj-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px;
    background:var(--accent, linear-gradient(90deg,#8b5cf6,#6366f1)); border-radius:16px 16px 0 0; }
  .proj-card:hover { transform:translateY(-6px) scale(1.01); box-shadow:0 16px 40px rgba(139,92,246,0.14), 0 2px 8px rgba(0,0,0,0.04); }
  .pc-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
  .status-badge { font-size:10px; font-weight:700; padding:3px 10px; border-radius:100px; text-transform:uppercase; letter-spacing:0.5px; }
  .s-active    { background:rgba(16,185,129,0.1);  color:#059669; }
  .s-on-hold   { background:rgba(245,158,11,0.1);  color:#d97706; }
  .s-completed { background:rgba(99,102,241,0.1);  color:#4f46e5; }
  .pc-actions { display:flex; gap:5px; opacity:0; transition:opacity 0.2s; }
  .proj-card:hover .pc-actions { opacity:1; }
  .icon-btn { background:rgba(248,250,252,0.9); border:1px solid rgba(203,213,225,0.5); border-radius:7px;
    width:28px; height:28px; display:flex; align-items:center; justify-content:center;
    cursor:pointer; font-size:13px; transition:all 0.15s; }
  .icon-btn:hover { background:#fff; box-shadow:0 2px 8px rgba(0,0,0,0.08); }
  .icon-btn.del:hover { background:rgba(239,68,68,0.07); border-color:rgba(239,68,68,0.2); }
  .pc-title { font-family:'Fraunces',serif; font-size:16px; font-weight:600; color:#1e1b4b; margin-bottom:6px; letter-spacing:-0.3px; }
  .pc-desc  { font-size:12px; color:#64748b; line-height:1.6; margin-bottom:16px;
    display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .pc-progress { margin-bottom:14px; }
  .pc-prog-top { display:flex; justify-content:space-between; font-size:11px; color:#94a3b8; margin-bottom:6px; font-weight:500; }
  .pc-prog-pct { color:#7c3aed; font-weight:700; }
  .pc-prog-track { height:5px; background:rgba(203,213,225,0.4); border-radius:100px; overflow:hidden; }
  .pc-prog-fill  { height:100%; border-radius:100px; background:linear-gradient(90deg,#8b5cf6,#06b6d4); transition:width 0.8s cubic-bezier(0.16,1,0.3,1); }
  .pc-footer { display:flex; align-items:center; justify-content:space-between; padding-top:14px; border-top:1px solid rgba(203,213,225,0.3); }
  .pc-meta   { font-size:11px; color:#94a3b8; }
  .pc-meta strong { color:#64748b; }
  .view-link { font-size:12px; font-weight:700; color:#7c3aed; display:flex; align-items:center; gap:4px; transition:gap 0.2s; }
  .proj-card:hover .view-link { gap:7px; }

  .empty-state { text-align:center; padding:60px 20px; animation:fadeUp 0.4s ease both; }
  .empty-emoji { font-size:48px; margin-bottom:14px; }
  .empty-title { font-family:'Fraunces',serif; font-size:20px; font-weight:600; color:#1e1b4b; margin-bottom:7px; }
  .empty-sub   { font-size:13px; color:#94a3b8; margin-bottom:20px; }
  .dash-loader { display:flex; flex-direction:column; align-items:center; justify-content:center; height:300px; gap:16px; }
  .loader-ring { width:42px; height:42px; border:3px solid rgba(139,92,246,0.15); border-top-color:#8b5cf6; border-radius:50%; animation:spin 0.75s linear infinite; }
  .loader-txt  { font-size:13px; color:#94a3b8; }
  @keyframes spin { to{transform:rotate(360deg)} }

  .modal-veil { position:fixed; inset:0; background:rgba(15,10,40,0.28); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); z-index:100; display:flex; align-items:center; justify-content:center; animation:veilIn 0.2s ease both; }
  @keyframes veilIn { from{opacity:0} to{opacity:1} }
  .modal-glass { background:rgba(255,255,255,0.9); backdrop-filter:blur(28px) saturate(200%); -webkit-backdrop-filter:blur(28px) saturate(200%); border:1px solid rgba(255,255,255,1); border-radius:24px; width:440px; overflow:visible; box-shadow:0 20px 60px rgba(139,92,246,0.14), 0 4px 16px rgba(0,0,0,0.07); animation:modalPop 0.3s cubic-bezier(0.16,1,0.3,1) both; }
  @keyframes modalPop { from{opacity:0;transform:scale(0.93) translateY(14px)} to{opacity:1;transform:scale(1) translateY(0)} }
  .modal-head { padding:26px 26px 0; display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
  .modal-title { font-family:'Fraunces',serif; font-size:20px; font-weight:600; color:#1e1b4b; letter-spacing:-0.4px; }
  .modal-x { width:30px; height:30px; border-radius:8px; background:rgba(0,0,0,0.04); border:1px solid rgba(203,213,225,0.5); color:#94a3b8; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px; transition:all 0.15s; }
  .modal-x:hover { background:rgba(239,68,68,0.07); color:#ef4444; }
  .modal-body { padding:0 26px 26px; display:flex; flex-direction:column; gap:14px; }
  .field-wrap { display:flex; flex-direction:column; gap:6px; position:relative; }
  .field-lbl { font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; }
  .field-inp { padding:11px 14px; background:rgba(248,250,252,0.9); border:1px solid rgba(203,213,225,0.5); border-radius:11px; font-size:13px; font-family:'Plus Jakarta Sans',sans-serif; color:#1e1b4b; outline:none; transition:border-color 0.2s; width:100%; resize:none; }
  .field-inp:focus { border-color:rgba(139,92,246,0.4); box-shadow:0 0 0 3px rgba(139,92,246,0.07); }
  .field-inp::placeholder { color:#cbd5e1; }
  .modal-actions { display:flex; gap:10px; margin-top:4px; }
  .btn-cancel { flex:1; padding:11px; background:rgba(241,245,249,0.8); border:1px solid rgba(203,213,225,0.55); border-radius:10px; color:#64748b; font-size:13px; font-weight:600; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:all 0.2s; }
  .btn-cancel:hover { background:#f1f5f9; }
  .confirm-glass { background:rgba(255,255,255,0.92); backdrop-filter:blur(28px) saturate(200%); border:1px solid rgba(255,255,255,1); border-radius:20px; width:340px; padding:30px; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,0.09); animation:modalPop 0.3s cubic-bezier(0.16,1,0.3,1) both; }
  .confirm-emoji { font-size:36px; margin-bottom:12px; }
  .confirm-title { font-family:'Fraunces',serif; font-size:20px; font-weight:600; color:#1e1b4b; margin-bottom:7px; }
  .confirm-text  { font-size:13px; color:#64748b; margin-bottom:22px; line-height:1.65; }
  .confirm-btns  { display:flex; gap:10px; }
  .btn-stay { flex:1; padding:11px; background:rgba(241,245,249,0.8); border:1px solid rgba(203,213,225,0.55); border-radius:10px; color:#64748b; font-size:13px; font-weight:600; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:all 0.2s; }
  .btn-stay:hover { background:#f1f5f9; }
  .btn-bye  { flex:1; padding:11px; background:linear-gradient(135deg,#ef4444,#dc2626); border:none; border-radius:10px; color:#fff; font-size:13px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:all 0.2s; box-shadow:0 4px 12px rgba(239,68,68,0.25); }
  .btn-bye:hover { transform:translateY(-1px); box-shadow:0 6px 18px rgba(239,68,68,0.35); }

  @keyframes cardPop { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

  /* ── MOBILE ── */
  @media (max-width: 768px) {
    .dash-main { margin-left:0; padding:60px 14px 24px; }
    .topbar { flex-direction:column; gap:14px; margin-bottom:20px; }
    .top-actions { width:100%; flex-wrap:wrap; }
    .btn-grad { flex:1; justify-content:center; }
    .proj-stats { grid-template-columns:1fr; gap:12px; }
    .proj-cards { grid-template-columns:1fr; }
    .modal-glass { width:calc(100vw - 32px); max-width:440px; }
    .confirm-glass { width:calc(100vw - 32px); }
    .pg-filters { gap:6px; }
  }
  @media (max-width: 480px) {
    .stat-num { font-size:36px; }
    .top-title { font-size:22px; }
    .modal-actions { flex-direction:column; }
  }
`;

const ACCENTS = [
  "linear-gradient(90deg,#8b5cf6,#6366f1)",
  "linear-gradient(90deg,#06b6d4,#0891b2)",
  "linear-gradient(90deg,#10b981,#059669)",
  "linear-gradient(90deg,#f59e0b,#d97706)",
  "linear-gradient(90deg,#ef4444,#dc2626)",
];
const FILTERS = ["All","active","on-hold","completed"];

export default function Projects() {
  const navigate = useNavigate();
  const [projects,   setProjects]   = useState([]);
  const [progMap,    setProgMap]    = useState({});
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState("All");
  const [showModal,  setShowModal]  = useState(false);
  const [editProj,   setEditProj]   = useState(null);
  const [delProj,    setDelProj]    = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title:"", description:"", status:"active" });

  const user    = (() => { try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; } })();
  const isAdmin = user?.role === "admin";

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res  = await API.get("/projects");
      const list = Array.isArray(res.data) ? res.data : res.data?.projects || [];
      setProjects(list);
      const results = await Promise.allSettled(list.map(p => API.get(`/projects/${p._id}/progress`)));
      const map = {};
      results.forEach((r, i) => { if (r.status === "fulfilled") map[list[i]._id] = r.value.data; });
      setProgMap(map);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setEditProj(null); setForm({ title:"", description:"", status:"active" }); setShowModal(true); };
  const openEdit   = (p, e) => { e.stopPropagation(); setEditProj(p); setForm({ title:p.title, description:p.description||"", status:p.status||"active" }); setShowModal(true); };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      if (editProj) await API.put(`/projects/${editProj._id}`, form);
      else          await API.post("/projects", { ...form, createdBy: user._id });
      await fetchAll();
      setShowModal(false);
    } catch(err) { alert(err.response?.data?.message || "Something went wrong."); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/projects/${delProj._id}`);
      setProjects(prev => prev.filter(p => p._id !== delProj._id));
      setDelProj(null);
    } catch(err) { alert(err.response?.data?.message || "Failed to delete."); }
  };

  const filtered  = filter === "All" ? projects : projects.filter(p => p.status === filter);
  const active    = projects.filter(p => p.status === "active").length;
  const completed = projects.filter(p => p.status === "completed").length;
  const pct = l => projects.length ? Math.round(l / projects.length * 100) : 0;
  const statusCls = s => s === "active" ? "s-active" : s === "on-hold" ? "s-on-hold" : "s-completed";

  return (
    <>
      <style>{sidebarCss + css}</style>
      <div className="dash-page">
        <Sidebar activePage="projects" />

        <main className="dash-main">
          <div className="topbar">
            <div>
              <div className="top-eyebrow">Workspace</div>
              <h1 className="top-title">Your <em>Projects</em></h1>
              <div className="top-date">{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
            </div>
            <div className="top-actions">
              {isAdmin && <button className="btn-grad" onClick={openCreate}>＋ New Project</button>}
            </div>
          </div>

          {loading ? (
            <div className="dash-loader"><div className="loader-ring"/><span className="loader-txt">Loading your projects…</span></div>
          ) : (
            <>
              <div className="proj-stats">
                {[
                  { label:"Total Projects", value:projects.length, icon:"🗂️", glow:"rgba(139,92,246,0.2)", iconBg:"rgba(139,92,246,0.09)", bar:"linear-gradient(90deg,#8b5cf6,#6366f1)", barW: projects.length > 0 ? `${Math.min(100, projects.length * 10)}%` : "4%", foot:"All projects" },
                   { label:"Active",         value:active,          icon:"🔥", glow:"rgba(6,182,212,0.2)",  iconBg:"rgba(6,182,212,0.09)",  bar:"linear-gradient(90deg,#06b6d4,#0891b2)", barW: pct(active) > 0 ? `${pct(active)}%` : "4%",    foot:"Currently running" },
                    { label:"Completed",     value:completed,       icon:"🏆", glow:"rgba(16,185,129,0.2)", iconBg:"rgba(16,185,129,0.09)", bar:"linear-gradient(90deg,#10b981,#059669)", barW: pct(completed) > 0 ? `${pct(completed)}%` : "4%", foot:`${pct(completed)}% done rate` },
                ].map((c,i) => (
                  <div key={i} className="glass stat-card" style={{"--glow":c.glow,"--icon-bg":c.iconBg}}>
                    <div className="stat-card-top">
                      <div className="stat-icon">{c.icon}</div>
                      <div className="live-pill"><span className="live-dot"/>Live</div>
                    </div>
                    <div className="stat-num">{c.value}</div>
                    <div className="stat-lbl">{c.label}</div>
                    <div className="stat-bar-wrap"><div className="stat-bar" style={{width:c.barW,background:c.bar}}/></div>
                    <div className="stat-footer">→ {c.foot}</div>
                  </div>
                ))}
              </div>

              <div className="glass proj-grid-wrap">
                <div className="pg-head">
                  <div>
                    <div className="pg-title">All Projects</div>
                    <div className="pg-sub">{filtered.length} project{filtered.length!==1?"s":""}{filter!=="All"?` · ${filter}`:""}</div>
                  </div>
                </div>
                <div className="pg-filters">
                  {FILTERS.map(f => (
                    <button key={f} className={`filter-pill${filter===f?" fpActive":""}`} onClick={() => setFilter(f)}>
                      {f==="All"?"All":f.charAt(0).toUpperCase()+f.slice(1)}
                    </button>
                  ))}
                </div>
                {filtered.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-emoji">📂</div>
                    <div className="empty-title">No projects here</div>
                    <div className="empty-sub">{filter!=="All"?`No ${filter} projects found.`:"Create your first project to get started."}</div>
                    {isAdmin && filter==="All" && <button className="btn-grad" onClick={openCreate}>＋ Create Project</button>}
                  </div>
                ) : (
                  <div className="proj-cards">
                    {filtered.map((p, idx) => {
                      const prog = progMap[p._id];
                      const pctN = prog ? parseFloat(prog.progress) : 0;
                      return (
                        <div key={p._id} className="proj-card"
                          style={{"--accent":ACCENTS[idx%ACCENTS.length], animationDelay:`${idx*0.06}s`}}
                          onClick={() => navigate(`/projects/${p._id}`)}>
                          <div className="pc-top">
                            <span className={`status-badge ${statusCls(p.status)}`}>{p.status||"active"}</span>
                            {isAdmin && (
                              <div className="pc-actions">
                                <button className="icon-btn" onClick={e => openEdit(p,e)}>✏️</button>
                                <button className="icon-btn del" onClick={e => {e.stopPropagation();setDelProj(p);}}>🗑️</button>
                              </div>
                            )}
                          </div>
                          <div className="pc-title">{p.title}</div>
                          <div className="pc-desc">{p.description||"No description provided."}</div>
                          {prog && (
                            <div className="pc-progress">
                              <div className="pc-prog-top">
                                <span>{prog.completedTasks}/{prog.totalTasks} tasks</span>
                                <span className="pc-prog-pct">{prog.progress}</span>
                              </div>
                              <div className="pc-prog-track">
                                <div className="pc-prog-fill" style={{width:`${pctN}%`}}/>
                              </div>
                            </div>
                          )}
                          <div className="pc-footer">
                            <div className="pc-meta">{p.createdBy?<>By <strong>{p.createdBy.name}</strong></>:"—"}</div>
                            <span className="view-link">View →</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-veil" onClick={() => setShowModal(false)}>
          <div className="modal-glass" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">{editProj?"Edit Project":"New Project"}</span>
              <button className="modal-x" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="field-wrap">
                <label className="field-lbl">Title *</label>
                <input className="field-inp" placeholder="Project title" value={form.title} onChange={e => setForm({...form,title:e.target.value})}/>
              </div>
              <div className="field-wrap">
                <label className="field-lbl">Description</label>
                <textarea className="field-inp" rows={3} placeholder="What's this project about?" value={form.description} onChange={e => setForm({...form,description:e.target.value})}/>
              </div>
              <div className="field-wrap">
                <label className="field-lbl">Status</label>
                <CustomSelect
                  value={form.status}
                  onChange={v => setForm({...form, status:v})}
                  options={STATUS_OPTS}
                />
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-grad" onClick={handleSubmit} disabled={submitting} style={{flex:1,justifyContent:"center",opacity:submitting?0.7:1}}>
                  {submitting?"Saving…":editProj?"Save Changes":"Create Project"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {delProj && (
        <div className="modal-veil" onClick={() => setDelProj(null)}>
          <div className="confirm-glass" onClick={e => e.stopPropagation()}>
            <div className="confirm-emoji">🗑️</div>
            <div className="confirm-title">Delete project?</div>
            <div className="confirm-text">"<strong>{delProj.title}</strong>" will be permanently removed.</div>
            <div className="confirm-btns">
              <button className="btn-stay" onClick={() => setDelProj(null)}>Cancel</button>
              <button className="btn-bye" onClick={handleDelete}>Yes, delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
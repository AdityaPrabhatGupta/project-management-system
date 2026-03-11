import { useEffect, useState, useCallback, useRef } from "react";
import API from "../api/axios";
import Sidebar, { sidebarCss } from "../components/Sidebar";

const fmt = (iso) => iso ? new Date(iso).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—";
const fmtInput = (iso) => iso ? new Date(iso).toISOString().slice(0,10) : "";
const daysLeft = (iso) => { if (!iso) return null; return Math.ceil((new Date(iso) - Date.now()) / 86400000); };
const deadlineBadge = (iso) => {
  const d = daysLeft(iso); if (d === null) return null;
  if (d < 0)  return { label:"Overdue",   cls:"dl-over"   };
  if (d <= 2) return { label:`${d}d left`, cls:"dl-urgent" };
  if (d <= 7) return { label:`${d}d left`, cls:"dl-warn"   };
  return             { label:`${d}d left`, cls:"dl-ok"     };
};

const PRIORITY_META = {
  low:    { label:"Low",    icon:"🟢", color:"#10b981", bg:"rgba(16,185,129,0.1)"  },
  medium: { label:"Medium", icon:"🟡", color:"#f59e0b", bg:"rgba(245,158,11,0.1)"  },
  high:   { label:"High",   icon:"🔴", color:"#ef4444", bg:"rgba(239,68,68,0.1)"   },
};
const STATUS_META = {
  todo:       { label:"To Do",       icon:"⬜", color:"#64748b", bg:"rgba(100,116,139,0.1)" },
  inProgress: { label:"In Progress", icon:"🔵", color:"#6366f1", bg:"rgba(99,102,241,0.1)"  },
  done:       { label:"Done",        icon:"✅", color:"#10b981", bg:"rgba(16,185,129,0.1)"  },
};

const initTask  = { title:"", description:"", project:"", group:"", assignedTo:[], status:"todo", priority:"medium", deadline:"", tags:"" };
const initGroup = { name:"", project:"", members:[], description:"", color:"#8b5cf6" };
const GROUP_COLORS = ["#8b5cf6","#6366f1","#06b6d4","#10b981","#f59e0b","#ef4444","#ec4899","#0ea5e9"];

// ══ CUSTOM SELECT ══════════════════════════════════════════════════════════════
function CustomSelect({ value, onChange, options, placeholder = "Select…", disabled = false, small = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} style={{position:"relative", width:"100%", userSelect:"none", opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? "none" : "auto", zIndex: open ? 100 : "auto"}}>
      {/* Trigger */}
      <div onClick={() => setOpen(o => !o)} style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background: open ? "rgba(255,255,255,1)" : "rgba(248,250,252,0.9)",
        border: open ? "1.5px solid #8b5cf6" : "1.5px solid rgba(203,213,225,0.55)",
        borderRadius: open ? (small ? "9px 9px 0 0" : "10px 10px 0 0") : (small ? "9px" : "10px"),
        padding: small ? "7px 11px" : "10px 13px",
        minHeight: small ? 36 : 42,
        fontSize: small ? 12 : 13,
        color: selected ? "#1e1b4b" : "#94a3b8",
        fontFamily:"'Plus Jakarta Sans', sans-serif",
        cursor:"pointer",
        boxShadow: open ? "0 0 0 3px rgba(139,92,246,0.12)" : "none",
        transition:"all 0.18s",
        fontWeight: selected ? 500 : 400,
      }}>
        <span style={{display:"flex", alignItems:"center", gap:7, flex:1}}>
          {selected ? (
            <>
              {selected.icon && <span style={{fontSize: small ? 12 : 13}}>{selected.icon}</span>}
              {selected.dot  && <span style={{width:8, height:8, borderRadius:"50%", background:selected.dot, flexShrink:0, display:"inline-block"}} />}
              {selected.label}
            </>
          ) : placeholder}
        </span>
        {/* Chevron */}
        <span style={{color: open ? "#8b5cf6" : "#94a3b8", transition:"transform 0.2s, color 0.2s", transform: open ? "rotate(180deg)" : "none", flexShrink:0, marginLeft:8, display:"flex"}}>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position:"absolute", top:"100%", left:0, right:0, zIndex:9999,
          background:"rgba(255,255,255,0.99)",
          backdropFilter:"blur(24px) saturate(180%)",
          WebkitBackdropFilter:"blur(24px) saturate(180%)",
          border:"1.5px solid rgba(139,92,246,0.2)",
          borderTop:"none",
          borderRadius: small ? "0 0 10px 10px" : "0 0 12px 12px",
          boxShadow:"0 16px 40px rgba(139,92,246,0.16), 0 4px 12px rgba(0,0,0,0.07)",
          animation:"dropIn 0.16s cubic-bezier(0.16,1,0.3,1) both",
          overflow:"hidden",
        }}>
          <div style={{padding:6, maxHeight:220, overflowY:"auto", scrollbarWidth:"thin"}}>
            {options.map(opt => (
              <div key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }} style={{
                display:"flex", alignItems:"center", gap:8,
                padding: small ? "7px 10px" : "9px 11px",
                borderRadius:8,
                fontSize: small ? 12 : 13,
                color: opt.value === value ? "#7c3aed" : "#475569",
                fontWeight: opt.value === value ? 600 : 500,
                background: opt.value === value
                  ? "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(99,102,241,0.06))"
                  : "transparent",
                cursor:"pointer",
                transition:"all 0.12s",
                fontFamily:"'Plus Jakarta Sans', sans-serif",
              }}
              onMouseEnter={e => { if (opt.value !== value) e.currentTarget.style.background = "rgba(139,92,246,0.07)"; e.currentTarget.style.color = "#1e1b4b"; }}
              onMouseLeave={e => { e.currentTarget.style.background = opt.value === value ? "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(99,102,241,0.06))" : "transparent"; e.currentTarget.style.color = opt.value === value ? "#7c3aed" : "#475569"; }}>
                {opt.icon && <span style={{fontSize: small ? 12 : 13}}>{opt.icon}</span>}
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

// ══ CSS ════════════════════════════════════════════════════════════════════════
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,wght@0,300;0,600;1,300;1,600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes dropIn { from{opacity:0;transform:translateY(-6px) scaleY(0.95)} to{opacity:1;transform:translateY(0) scaleY(1)} }
  @keyframes veilIn  { from{opacity:0} to{opacity:1} }
  @keyframes modalPop{ from{opacity:0;transform:scale(0.93) translateY(14px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes drawerIn{ from{transform:translateX(100%)} to{transform:translateX(0)} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cardPop { from{opacity:0;transform:translateY(12px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes dlPulse { 0%,100%{opacity:1} 50%{opacity:0.65} }

  .tk-page { min-height:100vh; font-family:'Plus Jakarta Sans',sans-serif; background:#eef2ff; padding:36px 44px; position:relative; }
  .tk-page::before { content:''; position:fixed; inset:0; z-index:0; background: radial-gradient(ellipse 70% 50% at 10% 20%,rgba(139,92,246,0.1) 0%,transparent 60%), radial-gradient(ellipse 50% 60% at 90% 80%,rgba(6,182,212,0.08) 0%,transparent 60%), linear-gradient(135deg,#eef2ff 0%,#f0f9ff 60%,#fdf4ff 100%); }
  .tk-main-content { margin-left:284px; flex:1; overflow-x:hidden; }
  .tk-content { position:relative; z-index:1; max-width:1280px; margin:0 auto; }

  .tk-topbar { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:32px; animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
  .tk-eyebrow { font-size:10px; font-weight:700; color:#a78bfa; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:4px; }
  .tk-title { font-family:'Fraunces',serif; font-size:30px; font-weight:600; color:#1e1b4b; letter-spacing:-0.8px; line-height:1; }
  .tk-title em { font-style:italic; font-weight:300; background:linear-gradient(135deg,#8b5cf6,#06b6d4); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .tk-actions { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }

  .btn-grad { display:flex; align-items:center; gap:7px; background:linear-gradient(135deg,#8b5cf6 0%,#6366f1 60%,#4f46e5 100%); color:#fff; border:none; padding:10px 18px; border-radius:11px; font-size:13px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:all 0.25s cubic-bezier(0.16,1,0.3,1); box-shadow:0 4px 14px rgba(99,102,241,0.32); }
  .btn-grad:hover { transform:translateY(-2px); box-shadow:0 8px 22px rgba(99,102,241,0.42); }
  .btn-outline { display:flex; align-items:center; gap:7px; background:rgba(255,255,255,0.7); color:#6366f1; border:1.5px solid rgba(99,102,241,0.25); padding:9px 16px; border-radius:11px; font-size:13px; font-weight:600; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:all 0.2s; backdrop-filter:blur(8px); }
  .btn-outline:hover { background:rgba(99,102,241,0.07); border-color:#6366f1; }

  .tk-filters { display:flex; align-items:center; gap:10px; margin-bottom:24px; flex-wrap:wrap; animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s both; position: relative; z-index: 50; }
  .tk-search { flex:1; min-width:180px; max-width:280px; background:rgba(255,255,255,0.7); border:1.5px solid rgba(203,213,225,0.6); border-radius:10px; padding:8px 13px; font-size:12px; color:#1e1b4b; font-family:'Plus Jakarta Sans',sans-serif; outline:none; backdrop-filter:blur(8px); transition:border-color 0.2s,box-shadow 0.2s; }
  .tk-search:focus { border-color:#8b5cf6; box-shadow:0 0 0 3px rgba(139,92,246,0.1); }

  .tk-tab-row { display:flex; gap:6px; margin-bottom:24px; }
  .tk-tab { padding:8px 18px; border-radius:100px; font-size:12px; font-weight:600; cursor:pointer; border:1.5px solid transparent; transition:all 0.2s; color:#64748b; background:rgba(255,255,255,0.5); }
  .tk-tab.active { background:linear-gradient(135deg,rgba(139,92,246,0.12),rgba(99,102,241,0.07)); color:#7c3aed; border-color:rgba(139,92,246,0.25); }

  .glass { background:rgba(255,255,255,0.7); backdrop-filter:blur(18px) saturate(180%); -webkit-backdrop-filter:blur(18px) saturate(180%); border:1px solid rgba(255,255,255,0.92); border-radius:20px; box-shadow:0 2px 12px rgba(0,0,0,0.035),0 8px 32px rgba(139,92,246,0.05); transition:all 0.3s cubic-bezier(0.16,1,0.3,1); }

  .tk-board { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both; position: relative; z-index: 1; }
  .tk-col { padding:18px; border-radius:18px; min-height:400px; display:flex; flex-direction:column; gap:12px; }
  .tk-col-todo { background:rgba(241,245,249,0.65); border:1px solid rgba(203,213,225,0.35); }
  .tk-col-prog { background:rgba(238,242,255,0.65); border:1px solid rgba(99,102,241,0.15); }
  .tk-col-done { background:rgba(236,253,245,0.65); border:1px solid rgba(16,185,129,0.15); }
  .tk-col-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:4px; }
  .tk-col-label { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1.2px; }
  .tk-col-todo .tk-col-label{color:#64748b} .tk-col-prog .tk-col-label{color:#6366f1} .tk-col-done .tk-col-label{color:#10b981}
  .tk-col-count { font-size:11px; font-weight:700; padding:2px 8px; border-radius:100px; }
  .tk-col-todo .tk-col-count{background:rgba(100,116,139,0.1);color:#64748b}
  .tk-col-prog .tk-col-count{background:rgba(99,102,241,0.1);color:#6366f1}
  .tk-col-done .tk-col-count{background:rgba(16,185,129,0.1);color:#10b981}

  .tk-card { background:rgba(255,255,255,0.85); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.95); border-radius:14px; padding:15px; box-shadow:0 1px 4px rgba(0,0,0,0.04); transition:all 0.22s cubic-bezier(0.16,1,0.3,1); cursor:pointer; animation:cardPop 0.4s cubic-bezier(0.16,1,0.3,1) both; }
  .tk-card:hover { transform:translateY(-3px) scale(1.01); box-shadow:0 8px 24px rgba(139,92,246,0.12); border-color:rgba(139,92,246,0.2); }
  .tk-card-top { display:flex; align-items:flex-start; justify-content:space-between; gap:8px; margin-bottom:8px; }
  .tk-card-title { font-size:13px; font-weight:600; color:#1e1b4b; line-height:1.4; flex:1; }
  .tk-card-actions { display:flex; gap:5px; opacity:0; transition:opacity 0.2s; flex-shrink:0; }
  .tk-card:hover .tk-card-actions { opacity:1; }
  .tk-card-btn { width:24px; height:24px; border-radius:6px; border:none; cursor:pointer; font-size:11px; display:flex; align-items:center; justify-content:center; transition:all 0.15s; }
  .tk-card-edit{background:rgba(99,102,241,0.1);color:#6366f1} .tk-card-edit:hover{background:rgba(99,102,241,0.2)}
  .tk-card-del{background:rgba(239,68,68,0.08);color:#ef4444}  .tk-card-del:hover{background:rgba(239,68,68,0.18)}
  .tk-card-assign{background:rgba(16,185,129,0.1);color:#10b981} .tk-card-assign:hover{background:rgba(16,185,129,0.2)}
  .tk-card-meta { display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:10px; }
  .tk-badge { font-size:10px; font-weight:600; padding:2px 8px; border-radius:100px; }
  .tk-group-tag { font-size:10px; font-weight:600; padding:2px 8px; border-radius:100px; display:flex; align-items:center; gap:4px; }
  .tk-group-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
  .dl-over  {background:rgba(239,68,68,0.12);color:#dc2626;font-weight:700}
  .dl-urgent{background:rgba(249,115,22,0.12);color:#ea580c;font-weight:700;animation:dlPulse 2s ease-in-out infinite}
  .dl-warn  {background:rgba(245,158,11,0.12);color:#d97706}
  .dl-ok    {background:rgba(16,185,129,0.1);color:#059669}
  .tk-card-footer { display:flex; align-items:center; justify-content:space-between; }
  .tk-assignees { display:flex; }
  .tk-av { width:22px; height:22px; border-radius:50%; background:linear-gradient(135deg,#8b5cf6,#6366f1); border:2px solid #fff; margin-left:-6px; font-size:9px; font-weight:700; color:#fff; display:flex; align-items:center; justify-content:center; }
  .tk-av:first-child{margin-left:0}
  .tk-deadline-txt { font-size:10px; color:#94a3b8; }

  .tk-list { display:flex; flex-direction:column; gap:10px; animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
  .tk-row { display:flex; align-items:center; gap:14px; padding:14px 18px; cursor:pointer; }
  .tk-row:hover { transform:translateX(4px); box-shadow:0 4px 16px rgba(139,92,246,0.09); }
  .tk-row-title { flex:1; font-size:13px; font-weight:600; color:#1e1b4b; }
  .tk-row-project { font-size:11px; color:#94a3b8; min-width:100px; }
  .tk-row-actions { display:flex; gap:5px; opacity:0; transition:opacity 0.2s; }
  .tk-row:hover .tk-row-actions { opacity:1; }

  .tk-groups-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:16px; animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
  .tk-group-card { padding:18px; cursor:default; }
  .tk-group-card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(139,92,246,0.1); }
  .tk-group-card-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
  .tk-group-name { font-size:14px; font-weight:700; }
  .tk-group-project { font-size:11px; color:#94a3b8; margin-top:2px; }
  .tk-group-members { display:flex; flex-wrap:wrap; gap:6px; margin-top:12px; }
  .tk-member-chip { display:flex; align-items:center; gap:5px; padding:4px 9px; background:rgba(248,250,252,0.9); border:1px solid rgba(203,213,225,0.45); border-radius:100px; font-size:11px; color:#475569; font-weight:500; }
  .tk-member-dot { width:18px; height:18px; border-radius:50%; background:linear-gradient(135deg,#8b5cf6,#6366f1); display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:700; color:#fff; flex-shrink:0; }
  .tk-group-empty { font-size:11px; color:#c7d2fe; padding:8px 0; }
  .tk-group-card-actions { display:flex; gap:5px; }

  .modal-veil { position:fixed; inset:0; background:rgba(15,10,40,0.3); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); z-index:200; display:flex; align-items:center; justify-content:center; animation:veilIn 0.2s ease both; }
  .modal-box { background:rgba(255,255,255,0.97); backdrop-filter:blur(28px) saturate(200%); -webkit-backdrop-filter:blur(28px) saturate(200%); border:1px solid rgba(255,255,255,1); border-radius:24px; width:520px; max-height:90vh; overflow-y:auto; overflow-x:visible; scrollbar-width:none; box-shadow:0 24px 64px rgba(139,92,246,0.18),0 4px 16px rgba(0,0,0,0.07); animation:modalPop 0.3s cubic-bezier(0.16,1,0.3,1) both; }
  .modal-box::-webkit-scrollbar{display:none}
  .modal-head { padding:24px 24px 0; display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
  .modal-title { font-family:'Fraunces',serif; font-size:20px; font-weight:600; color:#1e1b4b; letter-spacing:-0.4px; }
  .modal-x { width:30px; height:30px; border-radius:8px; background:rgba(0,0,0,0.04); border:1px solid rgba(203,213,225,0.5); color:#94a3b8; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px; transition:all 0.15s; }
  .modal-x:hover { background:rgba(239,68,68,0.07); color:#ef4444; }
  .modal-body { padding:0 24px 24px; display:flex; flex-direction:column; gap:14px; }
  .m-field { display:flex; flex-direction:column; gap:5px; position:relative; }
  .m-label { font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; }
  .m-input,.m-textarea { background:rgba(248,250,252,0.9); border:1.5px solid rgba(203,213,225,0.55); border-radius:10px; padding:10px 13px; font-size:13px; color:#1e1b4b; font-family:'Plus Jakarta Sans',sans-serif; outline:none; transition:border-color 0.2s,box-shadow 0.2s; width:100%; }
  .m-input:focus,.m-textarea:focus { border-color:#8b5cf6; box-shadow:0 0 0 3px rgba(139,92,246,0.1); }
  .m-textarea { resize:vertical; min-height:80px; }
  .m-row { display:flex; gap:12px; }
  .m-row .m-field { flex:1; }
  .m-err { font-size:12px; color:#ef4444; background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.2); border-radius:8px; padding:8px 12px; }

  .m-user-list { display:flex; flex-direction:column; gap:5px; max-height:200px; overflow-y:auto; border:1.5px solid rgba(203,213,225,0.55); border-radius:10px; padding:8px; background:rgba(248,250,252,0.9); }
  .m-user-list::-webkit-scrollbar{width:4px} .m-user-list::-webkit-scrollbar-thumb{background:rgba(139,92,246,0.2);border-radius:4px}
  .m-user-item { display:flex; align-items:center; gap:9px; padding:7px 9px; border-radius:8px; cursor:pointer; transition:background 0.15s; }
  .m-user-item:hover{background:rgba(139,92,246,0.06)} .m-user-item.selected{background:rgba(139,92,246,0.1)}
  .m-user-av { width:26px; height:26px; border-radius:50%; background:linear-gradient(135deg,#8b5cf6,#6366f1); display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:#fff; flex-shrink:0; }
  .m-user-name{font-size:12px;font-weight:600;color:#1e1b4b} .m-user-role{font-size:10px;color:#94a3b8}
  .m-user-chk { margin-left:auto; width:16px; height:16px; accent-color:#8b5cf6; }
  .color-grid { display:flex; gap:8px; flex-wrap:wrap; }
  .color-opt { width:28px; height:28px; border-radius:50%; border:3px solid transparent; cursor:pointer; transition:all 0.15s; }
  .color-opt.selected { border-color:#1e1b4b; transform:scale(1.2); }
  .deadline-info { padding:10px 13px; background:rgba(249,115,22,0.06); border:1px solid rgba(249,115,22,0.2); border-radius:10px; font-size:11px; color:#92400e; line-height:1.6; }
  .m-submit { display:flex; align-items:center; justify-content:center; gap:7px; background:linear-gradient(135deg,#8b5cf6 0%,#6366f1 60%,#4f46e5 100%); color:#fff; border:none; padding:13px 20px; border-radius:11px; font-size:13px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:all 0.25s cubic-bezier(0.16,1,0.3,1); box-shadow:0 4px 14px rgba(99,102,241,0.32); width:100%; margin-top:4px; }
  .m-submit:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(99,102,241,0.42)} .m-submit:disabled{opacity:0.6;cursor:not-allowed;transform:none}

  .tk-drawer-veil { position:fixed; inset:0; background:rgba(15,10,40,0.2); backdrop-filter:blur(8px); z-index:150; display:flex; justify-content:flex-end; animation:veilIn 0.2s ease both; }
  .tk-drawer { width:420px; height:100vh; background:rgba(255,255,255,0.96); backdrop-filter:blur(28px); border-left:1px solid rgba(203,213,225,0.3); display:flex; flex-direction:column; overflow-y:auto; scrollbar-width:none; animation:drawerIn 0.3s cubic-bezier(0.16,1,0.3,1) both; padding:28px 24px; gap:18px; }
  .tk-drawer::-webkit-scrollbar{display:none}
  .tk-drawer-title { font-family:'Fraunces',serif; font-size:20px; font-weight:600; color:#1e1b4b; letter-spacing:-0.4px; }
  .tk-drawer-section { font-size:10px; font-weight:800; color:#a78bfa; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:6px; }
  .tk-drawer-val { font-size:13px; color:#1e1b4b; font-weight:500; line-height:1.6; }
  .tk-drawer-row { display:flex; flex-direction:column; gap:3px; padding:12px; background:rgba(248,250,252,0.8); border:1px solid rgba(203,213,225,0.35); border-radius:11px; }
  .tk-status-stepper { display:flex; gap:8px; }
  .tk-status-step { flex:1; padding:8px; border-radius:9px; text-align:center; font-size:11px; font-weight:600; cursor:pointer; border:1.5px solid rgba(203,213,225,0.4); transition:all 0.2s; color:#64748b; background:rgba(248,250,252,0.8); }
  .tk-status-step.active-todo{background:rgba(100,116,139,0.12);color:#64748b;border-color:#94a3b8}
  .tk-status-step.active-inProgress{background:rgba(99,102,241,0.12);color:#6366f1;border-color:#6366f1}
  .tk-status-step.active-done{background:rgba(16,185,129,0.12);color:#10b981;border-color:#10b981}

  .tk-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:48px; gap:10px; color:#c7d2fe; }
  .tk-empty-icon{font-size:36px} .tk-empty-txt{font-size:13px}
  .tk-loader { display:flex; align-items:center; justify-content:center; height:300px; }
  .loader-ring { width:40px; height:40px; border:3px solid rgba(139,92,246,0.15); border-top-color:#8b5cf6; border-radius:50%; animation:spin 0.75s linear infinite; }

  /* ── MOBILE ── */
  @media (max-width: 768px) {
    .tk-main-content { margin-left:0 !important; }
    .tk-page { padding:60px 14px 24px; overflow-x:hidden; }
    .tk-content { width:100%; max-width:100%; overflow-x:hidden; }
    .tk-topbar { flex-direction:column; align-items:flex-start; gap:14px; margin-bottom:20px; }
    .tk-actions { width:100%; }
    .tk-actions .btn-grad, .tk-actions .btn-outline { flex:1; justify-content:center; }
    .tk-filters { gap:8px; }
    .tk-search { min-width:0; max-width:100%; flex:1; }
    .tk-board { grid-template-columns:1fr; gap:14px; }
    .tk-stat-row { grid-template-columns:1fr 1fr; }
    .tk-groups-grid { grid-template-columns:1fr; }
    .tk-row { flex-wrap:wrap; gap:8px; padding:12px 14px; }
    .tk-row-title { width:100%; min-width:0; }
    .tk-row-project { min-width:unset; }
    .tk-row-actions { opacity:1; }
    .modal-box { width:calc(100vw - 24px); max-width:100%; max-height:88vh; }
    .tk-drawer { width:100vw; padding:20px 16px; }
    .m-row { flex-direction:column; gap:10px; }
  }
  @media (max-width: 480px) {
    .tk-page { padding:60px 10px 20px; }
    .tk-stat-row { grid-template-columns:1fr; }
    .tk-title { font-size:22px; }
    .tk-tab-row { gap:4px; flex-wrap:wrap; }
    .tk-tab { padding:7px 10px; font-size:11px; }
    .tk-actions { flex-wrap:wrap; }
    .tk-actions .btn-grad, .tk-actions .btn-outline { font-size:12px; padding:9px 12px; }
  }
`;

function UserSelectList({ users, selected, onChange }) {
  const toggle = (id) => onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  return (
    <div className="m-user-list">
      {users.length === 0 && <div style={{fontSize:11,color:"#94a3b8",padding:"4px 8px"}}>No users found</div>}
      {users.map(u => (
        <div key={u._id} className={`m-user-item${selected.includes(u._id)?" selected":""}`} onClick={() => toggle(u._id)}>
          <div className="m-user-av">{u.name[0].toUpperCase()}</div>
          <div><div className="m-user-name">{u.name}</div><div className="m-user-role">{u.role}</div></div>
          <input type="checkbox" className="m-user-chk" readOnly checked={selected.includes(u._id)} />
        </div>
      ))}
    </div>
  );
}

function TaskModal({ task, projects, groups, users, onClose, onSaved }) {
  const isEdit = !!task?._id;
  const [form, setForm] = useState(task?._id ? {
    title:task.title||"", description:task.description||"",
    project:task.project?._id||task.project||"", group:task.group?._id||task.group||"",
    assignedTo:(task.assignedTo||[]).map(u=>u._id||u),
    status:task.status||"todo", priority:task.priority||"medium",
    deadline:fmtInput(task.deadline), tags:(task.tags||[]).join(", "),
  } : {...initTask});
  const [loading,setLoading]=useState(false); const [err,setErr]=useState("");
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const projectGroups=groups.filter(g=>g.project?._id===form.project||g.project===form.project);

  const submit=async()=>{
    if(!form.title.trim()){setErr("Title is required");return}
    if(!form.project){setErr("Project is required");return}
    setErr("");setLoading(true);
    try {
      const payload={...form,tags:form.tags.split(",").map(t=>t.trim()).filter(Boolean),deadline:form.deadline||null,group:form.group||null};
      if(isEdit) await API.put(`/tasks/${task._id}`,payload);
      else       await API.post("/tasks",payload);
      onSaved();onClose();
    } catch(e){setErr(e?.response?.data?.message||"Failed to save task")}
    finally{setLoading(false)}
  };

  const dl=deadlineBadge(form.deadline?new Date(form.deadline):null);
  const projectOpts=[{value:"",label:"— Select Project —"},...projects.map(p=>({value:p._id,label:p.title||p.name}))];
  const groupOpts  =[{value:"",label:"— No Group —"},...projectGroups.map(g=>({value:g._id,label:g.name,dot:g.color}))];
  const priorityOpts=Object.entries(PRIORITY_META).map(([v,m])=>({value:v,label:m.label,icon:m.icon}));
  const statusOpts  =Object.entries(STATUS_META).map(([v,m])=>({value:v,label:m.label,icon:m.icon}));

  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">{isEdit?"Edit Task":"New Task"}</span>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {err&&<div className="m-err">{err}</div>}
          <div className="m-field">
            <span className="m-label">Title *</span>
            <input className="m-input" placeholder="What needs to be done?" maxLength={120} value={form.title} onChange={e=>set("title",e.target.value)}/>
          </div>
          <div className="m-field">
            <span className="m-label">Description</span>
            <textarea className="m-textarea" placeholder="Add details…" maxLength={1000} value={form.description} onChange={e=>set("description",e.target.value)}/>
          </div>
          <div className="m-row">
            <div className="m-field">
              <span className="m-label">Project *</span>
              <CustomSelect value={form.project} onChange={v=>{set("project",v);set("group","")}} options={projectOpts} placeholder="Select project"/>
            </div>
            <div className="m-field">
              <span className="m-label">Group</span>
              <CustomSelect value={form.group} onChange={v=>set("group",v)} options={groupOpts} placeholder="No group" disabled={!form.project}/>
            </div>
          </div>
          <div className="m-row">
            <div className="m-field">
              <span className="m-label">Priority</span>
              <CustomSelect value={form.priority} onChange={v=>set("priority",v)} options={priorityOpts}/>
            </div>
            <div className="m-field">
              <span className="m-label">Status</span>
              <CustomSelect value={form.status} onChange={v=>set("status",v)} options={statusOpts}/>
            </div>
          </div>
          <div className="m-field">
            <span className="m-label">Deadline</span>
            <input className="m-input" type="date" value={form.deadline} onChange={e=>set("deadline",e.target.value)}/>
            {dl&&<div className="deadline-info" style={{marginTop:6}}>⏰ {dl.label} — {dl.cls==="dl-urgent"||dl.cls==="dl-over"?"Auto-notice fires to assignees within 48h.":"Auto-notice fires when ≤48h remain."}</div>}
          </div>
          <div className="m-field">
            <span className="m-label">Assign To (select multiple)</span>
            <UserSelectList users={users} selected={form.assignedTo} onChange={v=>set("assignedTo",v)}/>
          </div>
          <div className="m-field">
            <span className="m-label">Tags (comma separated)</span>
            <input className="m-input" placeholder="design, backend, urgent" value={form.tags} onChange={e=>set("tags",e.target.value)}/>
          </div>
          <button className="m-submit" onClick={submit} disabled={loading}>{loading?"Saving…":isEdit?"Save Changes":"Create Task"}</button>
        </div>
      </div>
    </div>
  );
}

function AssignModal({task,users,groups,onClose,onSaved}){
  const [assignedTo,setAssignedTo]=useState((task.assignedTo||[]).map(u=>u._id||u));
  const [group,setGroup]=useState(task.group?._id||task.group||"");
  const [loading,setLoading]=useState(false); const [err,setErr]=useState("");
  const projectGroups=groups.filter(g=>(g.project?._id||g.project)===(task.project?._id||task.project));
  const groupOpts=[{value:"",label:"— No Group —"},...projectGroups.map(g=>({value:g._id,label:g.name,dot:g.color}))];
  const submit=async()=>{
    setErr("");setLoading(true);
    try{await API.patch(`/tasks/${task._id}/assign`,{assignedTo,group:group||null});onSaved();onClose();}
    catch(e){setErr(e?.response?.data?.message||"Failed to assign")}
    finally{setLoading(false)}
  };
  return(
    <div className="modal-veil" onClick={onClose}>
      <div className="modal-box" style={{width:420}} onClick={e=>e.stopPropagation()}>
        <div className="modal-head"><span className="modal-title">Assign Task</span><button className="modal-x" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          {err&&<div className="m-err">{err}</div>}
          <div style={{fontSize:13,fontWeight:600,color:"#1e1b4b",padding:"4px 0 8px"}}>{task.title}</div>
          <div className="m-field"><span className="m-label">Group (optional)</span><CustomSelect value={group} onChange={setGroup} options={groupOpts} placeholder="No group"/></div>
          <div className="m-field"><span className="m-label">Assign Employees</span><UserSelectList users={users} selected={assignedTo} onChange={setAssignedTo}/></div>
          <button className="m-submit" onClick={submit} disabled={loading}>{loading?"Saving…":"Save Assignment"}</button>
        </div>
      </div>
    </div>
  );
}

function GroupModal({group,projects,users,onClose,onSaved}){
  const isEdit=!!group?._id;
  const [form,setForm]=useState(group?._id?{name:group.name||"",project:group.project?._id||group.project||"",members:(group.members||[]).map(u=>u._id||u),description:group.description||"",color:group.color||"#8b5cf6"}:{...initGroup});
  const [loading,setLoading]=useState(false); const [err,setErr]=useState("");
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const projectOpts=[{value:"",label:"— Select Project —"},...projects.map(p=>({value:p._id,label:p.title||p.name}))];
  const submit=async()=>{
    if(!form.name.trim()){setErr("Name is required");return} if(!form.project){setErr("Project is required");return}
    setErr("");setLoading(true);
    try{if(isEdit)await API.put(`/groups/${group._id}`,form);else await API.post("/groups",form);onSaved();onClose();}
    catch(e){setErr(e?.response?.data?.message||"Failed to save group")}
    finally{setLoading(false)}
  };
  return(
    <div className="modal-veil" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <div className="modal-head"><span className="modal-title">{isEdit?"Edit Group":"New Group"}</span><button className="modal-x" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          {err&&<div className="m-err">{err}</div>}
          <div className="m-field"><span className="m-label">Group Name *</span><input className="m-input" placeholder="e.g. Frontend Team" maxLength={80} value={form.name} onChange={e=>set("name",e.target.value)}/></div>
          <div className="m-field"><span className="m-label">Project *</span><CustomSelect value={form.project} onChange={v=>set("project",v)} options={projectOpts} placeholder="Select project"/></div>
          <div className="m-field"><span className="m-label">Description</span><input className="m-input" placeholder="What does this group handle?" maxLength={300} value={form.description} onChange={e=>set("description",e.target.value)}/></div>
          <div className="m-field"><span className="m-label">Group Colour</span><div className="color-grid">{GROUP_COLORS.map(c=><div key={c} className={`color-opt${form.color===c?" selected":""}`} style={{background:c}} onClick={()=>set("color",c)}/>)}</div></div>
          <div className="m-field"><span className="m-label">Members</span><UserSelectList users={users} selected={form.members} onChange={v=>set("members",v)}/></div>
          <button className="m-submit" onClick={submit} disabled={loading}>{loading?"Saving…":isEdit?"Save Group":"Create Group"}</button>
        </div>
      </div>
    </div>
  );
}

function TaskDrawer({task,currentUser,onClose,onStatusChange}){
  const [status,setStatus]=useState(task.status); const [saving,setSaving]=useState(false);
  const canChangeStatus=["admin","manager"].includes(currentUser?.role)||(task.assignedTo||[]).map(u=>u._id||u).includes(currentUser?._id);
  const updateStatus=async(s)=>{
    if(!canChangeStatus)return; setSaving(true);
    try{await API.patch(`/tasks/${task._id}/status`,{status:s});setStatus(s);onStatusChange(task._id,s);}
    catch(e){console.error(e)} finally{setSaving(false)}
  };
  const dl=deadlineBadge(task.deadline); const pm=PRIORITY_META[task.priority];
  return(
    <div className="tk-drawer-veil" onClick={onClose}>
      <div className="tk-drawer" onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span className="tk-drawer-title">{task.title}</span>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>
        {task.description&&<div className="tk-drawer-row"><div className="tk-drawer-section">Description</div><div className="tk-drawer-val">{task.description}</div></div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div className="tk-drawer-row"><div className="tk-drawer-section">Project</div><div className="tk-drawer-val">{task.project?.name||"—"}</div></div>
          <div className="tk-drawer-row"><div className="tk-drawer-section">Group</div><div className="tk-drawer-val">{task.group?.name||"—"}</div></div>
          <div className="tk-drawer-row"><div className="tk-drawer-section">Priority</div><span className="tk-badge" style={{background:pm.bg,color:pm.color,marginTop:2}}>{pm.icon} {pm.label}</span></div>
          <div className="tk-drawer-row"><div className="tk-drawer-section">Deadline</div><div className="tk-drawer-val">{fmt(task.deadline)}</div>{dl&&<span className={`tk-badge ${dl.cls}`} style={{marginTop:4,alignSelf:"flex-start"}}>{dl.label}</span>}</div>
        </div>
        <div className="tk-drawer-row">
          <div className="tk-drawer-section">Assigned To</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
            {(task.assignedTo||[]).length===0?<span style={{fontSize:12,color:"#94a3b8"}}>Unassigned</span>
              :(task.assignedTo||[]).map(u=><div key={u._id} className="tk-member-chip"><div className="tk-member-dot">{(u.name||"?")[0].toUpperCase()}</div>{u.name}</div>)}
          </div>
        </div>
        {task.tags?.length>0&&<div className="tk-drawer-row"><div className="tk-drawer-section">Tags</div><div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>{task.tags.map(t=><span key={t} className="tk-badge" style={{background:"rgba(139,92,246,0.1)",color:"#7c3aed"}}>{t}</span>)}</div></div>}
        <div className="tk-drawer-row">
          <div className="tk-drawer-section" style={{marginBottom:8}}>Status</div>
          <div className="tk-status-stepper">
            {Object.entries(STATUS_META).map(([key,meta])=>(
              <div key={key} className={`tk-status-step${status===key?` active-${key}`:""}`} onClick={()=>canChangeStatus&&!saving&&updateStatus(key)}>
                {meta.icon} {meta.label}
              </div>
            ))}
          </div>
          {!canChangeStatus&&<div style={{fontSize:11,color:"#94a3b8",marginTop:6}}>Only assignees can change status</div>}
        </div>
        <div style={{fontSize:11,color:"#c7d2fe",marginTop:"auto",paddingTop:8}}>Created by {task.createdBy?.name||"Admin"} · {fmt(task.createdAt)}</div>
      </div>
    </div>
  );
}

export default function Tasks(){
  const [tasks,setTasks]=useState([]); const [groups,setGroups]=useState([]); const [projects,setProjects]=useState([]); const [users,setUsers]=useState([]); const [loading,setLoading]=useState(true);
  const groupsSupported = false;
  const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem("user"))||null}catch{return null}});
  const [view,setView]=useState("board"); const [filterP,setFilterP]=useState(""); const [filterS,setFilterS]=useState(""); const [filterPr,setFilterPr]=useState(""); const [search,setSearch]=useState("");
  const [taskModal,setTaskModal]=useState(null); const [assignModal,setAssignModal]=useState(null); const [groupModal,setGroupModal]=useState(null); const [drawer,setDrawer]=useState(null);
  const isAdmin=user?.role==="admin"; const isManager=user?.role==="manager";

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const [tR,pR,uR,meR]=await Promise.all([
        API.get("/tasks").catch(()=>({data:[]})),
        API.get("/projects").catch(()=>({data:[]})),
        isAdmin||isManager?API.get("/users").catch(()=>({data:[]})):Promise.resolve({data:[]}),
        API.get("/users/me").catch(()=>null),
      ]);
      const toArr=d=>{if(Array.isArray(d))return d;if(Array.isArray(d?.tasks))return d.tasks;if(Array.isArray(d?.groups))return d.groups;if(Array.isArray(d?.projects))return d.projects;if(Array.isArray(d?.users))return d.users;if(Array.isArray(d?.data))return d.data;return[]};
      setTasks(toArr(tR.data));setGroups([]);setProjects(toArr(pR.data));setUsers(toArr(uR.data));
      if(meR){const u=meR.data?.user||meR.data;if(u?._id){setUser(u);localStorage.setItem("user",JSON.stringify(u));}}
    }catch(e){console.error(e)}finally{setLoading(false)}
  },[isAdmin,isManager]);

  useEffect(()=>{load()},[load]);

  const filtered=tasks.filter(t=>{
    if(filterP&&(t.project?._id||t.project)!==filterP)return false;
    if(filterS&&t.status!==filterS)return false;
    if(filterPr&&t.priority!==filterPr)return false;
    if(search&&!t.title.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });
  const byStatus=s=>filtered.filter(t=>t.status===s);
  const updateLocalStatus=(id,status)=>{setTasks(prev=>prev.map(t=>t._id===id?{...t,status}:t));if(drawer?._id===id)setDrawer(d=>({...d,status}));};
  const deleteTask=async(id,e)=>{e.stopPropagation();if(!confirm("Delete this task?"))return;try{await API.delete(`/tasks/${id}`);setTasks(prev=>prev.filter(t=>t._id!==id))}catch(e){console.error(e)}};
  const deleteGroup=async(id)=>{if(!confirm("Delete this group?"))return;try{await API.delete(`/groups/${id}`);setGroups(prev=>prev.filter(g=>g._id!==id))}catch(e){console.error(e)}};

  const TaskCard=({task,delay=0})=>{
    const dl=deadlineBadge(task.deadline);const prio=PRIORITY_META[task.priority];const grp=task.group;
    return(
      <div className="tk-card" style={{animationDelay:`${delay}s`}} onClick={()=>setDrawer(task)}>
        <div className="tk-card-top">
          <div className="tk-card-title">{task.title}</div>
          <div className="tk-card-actions" onClick={e=>e.stopPropagation()}>
            {isAdmin&&<><button className="tk-card-btn tk-card-edit" onClick={e=>{e.stopPropagation();setTaskModal(task)}}>✏️</button><button className="tk-card-btn tk-card-del" onClick={e=>deleteTask(task._id,e)}>🗑</button></>}
            {(isAdmin||isManager)&&<button className="tk-card-btn tk-card-assign" onClick={e=>{e.stopPropagation();setAssignModal(task)}}>👤</button>}
          </div>
        </div>
        <div className="tk-card-meta">
          <span className="tk-badge" style={{background:prio.bg,color:prio.color}}>{prio.icon} {prio.label}</span>
          {grp&&<span className="tk-group-tag" style={{background:`${grp.color}18`,color:grp.color}}><span className="tk-group-dot" style={{background:grp.color}}/>{grp.name}</span>}
          {dl&&<span className={`tk-badge ${dl.cls}`}>{dl.label}</span>}
          {task.tags?.slice(0,2).map(t=><span key={t} className="tk-badge" style={{background:"rgba(139,92,246,0.08)",color:"#7c3aed"}}>{t}</span>)}
        </div>
        <div className="tk-card-footer">
          <div className="tk-assignees">
            {(task.assignedTo||[]).slice(0,4).map(u=><div key={u._id} className="tk-av" title={u.name}>{(u.name||"?")[0].toUpperCase()}</div>)}
            {(task.assignedTo||[]).length>4&&<div className="tk-av" style={{background:"#94a3b8"}}>+{task.assignedTo.length-4}</div>}
          </div>
          <div className="tk-deadline-txt">{task.deadline?fmt(task.deadline):""}</div>
        </div>
      </div>
    );
  };

  const projectFilterOpts=[{value:"",label:"All Projects"},...projects.map(p=>({value:p._id,label:p.title||p.name}))];
  const statusFilterOpts =[{value:"",label:"All Status" },...Object.entries(STATUS_META).map(([v,m])=>({value:v,label:m.label,icon:m.icon}))];
  const prioFilterOpts   =[{value:"",label:"All Priority"},...Object.entries(PRIORITY_META).map(([v,m])=>({value:v,label:m.label,icon:m.icon}))];

  return(
    <>
      <style>{sidebarCss+css}</style>
      <div style={{display:"flex",minHeight:"100vh"}}>
        <Sidebar activePage="tasks"/>
        <div className="tk-page tk-main-content">
          <div className="tk-content">
            <div className="tk-topbar">
              <div><div className="tk-eyebrow">Workspace</div><h1 className="tk-title">Task <em>Board</em></h1></div>
              <div className="tk-actions">
                {(isAdmin||isManager)&&groupsSupported&&<button className="btn-outline" onClick={()=>setGroupModal("new")}>👥 New Group</button>}
                {isAdmin&&<button className="btn-grad" onClick={()=>setTaskModal("new")}>+ New Task</button>}
              </div>
            </div>
            <div className="tk-tab-row">
              {[["board","📋 Board"],["list","☰ List"],...(groupsSupported?[["groups","👥 Groups"]]:[])] .map(([v,l])=>(
                <div key={v} className={`tk-tab${view===v?" active":""}`} onClick={()=>setView(v)}>{l}</div>
              ))}
            </div>
            <div className="tk-filters">
              <input className="tk-search" placeholder="Search tasks…" value={search} onChange={e=>setSearch(e.target.value)}/>
              <div style={{width:160}}><CustomSelect value={filterP} onChange={setFilterP} options={projectFilterOpts} placeholder="All Projects" small/></div>
              <div style={{width:150}}><CustomSelect value={filterS} onChange={setFilterS} options={statusFilterOpts}  placeholder="All Status"   small/></div>
              <div style={{width:150}}><CustomSelect value={filterPr} onChange={setFilterPr} options={prioFilterOpts}  placeholder="All Priority" small/></div>
              <span style={{fontSize:12,color:"#94a3b8",marginLeft:"auto"}}>{filtered.length} task{filtered.length!==1?"s":""}</span>
            </div>
            {loading?(
              <div className="tk-loader"><div className="loader-ring"/></div>
            ):view==="board"?(
              <div className="tk-board">
                {[{key:"todo",label:"To Do",cls:"tk-col-todo"},{key:"inProgress",label:"In Progress",cls:"tk-col-prog"},{key:"done",label:"Done",cls:"tk-col-done"}].map(col=>{
                  const ct=byStatus(col.key);
                  return(<div key={col.key} className={`tk-col ${col.cls}`}><div className="tk-col-head"><span className="tk-col-label">{col.label}</span><span className="tk-col-count">{ct.length}</span></div>{ct.length===0?<div className="tk-empty"><div className="tk-empty-icon">🪹</div><div className="tk-empty-txt">Nothing here</div></div>:ct.map((t,i)=><TaskCard key={t._id} task={t} delay={i*0.05}/>)}</div>);
                })}
              </div>
            ):view==="list"?(
              <div className="tk-list">
                {filtered.length===0?<div className="glass tk-empty" style={{padding:48}}><div className="tk-empty-icon">📭</div><div className="tk-empty-txt">No tasks match your filters</div></div>
                  :filtered.map((t,i)=>{const dl=deadlineBadge(t.deadline);const prio=PRIORITY_META[t.priority];const stat=STATUS_META[t.status];return(
                  <div key={t._id} className="glass tk-row" style={{animationDelay:`${i*0.04}s`}} onClick={()=>setDrawer(t)}>
                    <span className="tk-badge" style={{background:stat.bg,color:stat.color,flexShrink:0}}>{stat.icon} {stat.label}</span>
                    <div className="tk-row-title">{t.title}</div>
                    <div className="tk-row-project">{t.project?.name||"—"}</div>
                    <span className="tk-badge" style={{background:prio.bg,color:prio.color,flexShrink:0}}>{prio.icon} {prio.label}</span>
                    {dl&&<span className={`tk-badge ${dl.cls}`} style={{flexShrink:0}}>{dl.label}</span>}
                    <div className="tk-assignees" style={{flexShrink:0}}>{(t.assignedTo||[]).slice(0,3).map(u=><div key={u._id} className="tk-av" title={u.name}>{(u.name||"?")[0].toUpperCase()}</div>)}</div>
                    <div className="tk-row-actions" onClick={e=>e.stopPropagation()}>
                      {isAdmin&&<><button className="tk-card-btn tk-card-edit" onClick={e=>{e.stopPropagation();setTaskModal(t)}}>✏️</button><button className="tk-card-btn tk-card-del" onClick={e=>deleteTask(t._id,e)}>🗑</button></>}
                      {(isAdmin||isManager)&&<button className="tk-card-btn tk-card-assign" onClick={e=>{e.stopPropagation();setAssignModal(t)}}>👤</button>}
                    </div>
                  </div>);})}
              </div>
            ):(
              <div className="tk-groups-grid">
                {groups.length===0?<div className="glass tk-empty" style={{padding:48,gridColumn:"1/-1"}}><div className="tk-empty-icon">👥</div><div className="tk-empty-txt">No groups yet</div></div>
                  :groups.filter(g=>!filterP||(g.project?._id||g.project)===filterP).map((g,i)=>(
                  <div key={g._id} className="glass tk-group-card" style={{animationDelay:`${i*0.06}s`}}>
                    <div className="tk-group-card-top">
                      <div><div className="tk-group-name" style={{color:g.color}}>{g.name}</div><div className="tk-group-project">{g.project?.name||"—"}</div></div>
                      {(isAdmin||isManager)&&<div className="tk-group-card-actions"><button className="tk-card-btn tk-card-edit" onClick={()=>setGroupModal(g)}>✏️</button>{isAdmin&&<button className="tk-card-btn tk-card-del" onClick={()=>deleteGroup(g._id)}>🗑</button>}</div>}
                    </div>
                    {g.description&&<div style={{fontSize:11,color:"#94a3b8",marginBottom:4}}>{g.description}</div>}
                    <div className="tk-group-members">
                      {(g.members||[]).length===0?<div className="tk-group-empty">No members yet</div>
                        :(g.members||[]).map(m=><div key={m._id} className="tk-member-chip"><div className="tk-member-dot" style={{background:g.color}}>{(m.name||"?")[0].toUpperCase()}</div>{m.name}</div>)}
                    </div>
                    <div style={{marginTop:10,fontSize:11,color:"#94a3b8"}}>{tasks.filter(t=>(t.group?._id||t.group)===g._id).length} task(s) in this group</div>
                  </div>))}
              </div>
            )}
          </div>
        </div>
      </div>
      {taskModal&&isAdmin&&<TaskModal task={taskModal==="new"?null:taskModal} projects={projects} groups={groups} users={users} onClose={()=>setTaskModal(null)} onSaved={load}/>}
      {assignModal&&(isAdmin||isManager)&&<AssignModal task={assignModal} users={users} groups={groups} onClose={()=>setAssignModal(null)} onSaved={load}/>}
      {groupModal&&(isAdmin||isManager)&&<GroupModal group={groupModal==="new"?null:groupModal} projects={projects} users={users} onClose={()=>setGroupModal(null)} onSaved={load}/>}
      {drawer&&<TaskDrawer task={drawer} currentUser={user} onClose={()=>setDrawer(null)} onStatusChange={updateLocalStatus}/>}
    </>
  );
}
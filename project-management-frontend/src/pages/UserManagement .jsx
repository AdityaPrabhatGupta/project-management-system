import { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function CustomSelect({ value, onChange, options, disabled = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} style={{position:"relative", width:160, userSelect:"none", opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? "none" : "auto", zIndex: open ? 1000 : "auto"}}>
      <div onClick={() => setOpen(o => !o)} style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background: open ? "#fff" : "rgba(248,250,252,0.9)",
        border: open ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(203,213,225,0.5)",
        borderRadius: open ? "8px 8px 0 0" : "8px",
        padding:"6px 10px", minHeight:34, fontSize:12,
        color: selected ? "#1e1b4b" : "#94a3b8",
        fontFamily:"'Plus Jakarta Sans', sans-serif", cursor:"pointer", fontWeight:600,
        boxShadow: open ? "0 0 0 3px rgba(139,92,246,0.08)" : "none", transition:"all 0.18s",
      }}>
        <span style={{display:"flex", alignItems:"center", gap:6, flex:1}}>
          {selected?.icon && <span>{selected.icon}</span>}
          {selected?.label || "Select…"}
        </span>
        <span style={{color: open ? "#8b5cf6" : "#94a3b8", transition:"transform 0.2s", transform: open ? "rotate(180deg)" : "none", flexShrink:0, marginLeft:6, display:"flex"}}>
          <svg width="9" height="5" viewBox="0 0 10 6" fill="none">
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
      {open && (
        <div style={{
          position:"absolute", top:"100%", left:0, right:0, zIndex:9999,
          background:"rgba(255,255,255,0.99)", backdropFilter:"blur(24px) saturate(180%)",
          WebkitBackdropFilter:"blur(24px) saturate(180%)",
          border:"1px solid rgba(139,92,246,0.2)", borderTop:"none",
          borderRadius:"0 0 9px 9px",
          boxShadow:"0 12px 32px rgba(139,92,246,0.14), 0 4px 12px rgba(0,0,0,0.07)",
          animation:"csDropIn 0.16s cubic-bezier(0.16,1,0.3,1) both", overflow:"hidden",
        }}>
          <div style={{padding:5}}>
            {options.map(opt => (
              <div key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }} style={{
                display:"flex", alignItems:"center", gap:7, padding:"7px 9px", borderRadius:7, fontSize:12,
                color: opt.value === value ? "#7c3aed" : "#475569",
                fontWeight: opt.value === value ? 600 : 500,
                background: opt.value === value ? "rgba(139,92,246,0.08)" : "transparent",
                cursor:"pointer", transition:"all 0.12s", fontFamily:"'Plus Jakarta Sans', sans-serif",
              }}
              onMouseEnter={e => { if (opt.value !== value) { e.currentTarget.style.background = "rgba(139,92,246,0.06)"; e.currentTarget.style.color = "#1e1b4b"; }}}
              onMouseLeave={e => { e.currentTarget.style.background = opt.value === value ? "rgba(139,92,246,0.08)" : "transparent"; e.currentTarget.style.color = opt.value === value ? "#7c3aed" : "#475569"; }}>
                {opt.icon && <span>{opt.icon}</span>}
                <span style={{flex:1}}>{opt.label}</span>
                {opt.value === value && <span style={{color:"#8b5cf6", fontSize:11, fontWeight:700}}>✓</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const ROLE_OPTS = [
  { value:"employee", label:"Employee", icon:"" },
  { value:"manager",  label:"Manager",  icon:"" },
  { value:"admin",    label:"Admin",    icon:"" },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,wght@0,300;0,600;1,300;1,600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes csDropIn { from{opacity:0;transform:translateY(-6px) scaleY(0.95)} to{opacity:1;transform:translateY(0) scaleY(1)} }

  .um-page { display: flex; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; background: #eef2ff; position: relative; }
  .um-page::before { content: ''; position: fixed; inset: 0;
    background: radial-gradient(ellipse 70% 50% at 10% 20%, rgba(139,92,246,0.13) 0%, transparent 60%),
      radial-gradient(ellipse 50% 60% at 90% 80%, rgba(6,182,212,0.1) 0%, transparent 60%),
      linear-gradient(135deg, #eef2ff 0%, #f0f9ff 60%, #fdf4ff 100%);
    z-index: 0; }

  .dash-sidebar { width: 260px; position: fixed; top: 12px; left: 12px; bottom: 12px; z-index: 20; padding: 22px 14px; display: flex; flex-direction: column; background: rgba(255,255,255,0.55); backdrop-filter: blur(32px) saturate(200%) brightness(1.04); -webkit-backdrop-filter: blur(32px) saturate(200%) brightness(1.04); border: 1px solid rgba(255,255,255,0.85); border-radius: 22px; box-shadow: 0 8px 32px rgba(139,92,246,0.1), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9); overflow: hidden; animation: sideIn 0.55s cubic-bezier(0.16,1,0.3,1) both; }
  .dash-sidebar::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 120px; background: linear-gradient(180deg, rgba(139,92,246,0.06) 0%, transparent 100%); pointer-events: none; border-radius: 22px 22px 0 0; }
  @keyframes sideIn { from{opacity:0;transform:translateX(-28px)} to{opacity:1;transform:translateX(0)} }

  .sb-brand { display: flex; align-items: center; gap: 10px; padding: 0 8px 22px; border-bottom: 1px solid rgba(203,213,225,0.35); margin-bottom: 10px; }
  .sb-gem { width: 38px; height: 38px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 17px; color: #fff; box-shadow: 0 4px 14px rgba(139,92,246,0.32); transition: transform 0.3s; }
  .sb-gem:hover { transform: rotate(15deg) scale(1.08); }
  .sb-name { font-size: 15px; font-weight: 700; color: #1e1b4b; letter-spacing: -0.3px; }
  .sb-nav { flex: 1; }
  .sb-section { font-size: 10px; font-weight: 700; color: #c7d2fe; text-transform: uppercase; letter-spacing: 1.5px; padding: 0 8px; margin: 16px 0 5px; }
  .sb-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 11px; cursor: pointer; transition: all 0.22s cubic-bezier(0.16,1,0.3,1); color: #64748b; font-size: 13px; font-weight: 500; margin-bottom: 2px; position: relative; overflow: hidden; }
  .sb-item::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%) scaleY(0); width: 3px; height: 60%; background: linear-gradient(180deg, #8b5cf6, #6366f1); border-radius: 0 3px 3px 0; transition: transform 0.2s; }
  .sb-item:hover { background: rgba(139,92,246,0.07); color: #7c3aed; transform: translateX(4px); }
  .sb-item:hover::before, .sb-item.active::before { transform: translateY(-50%) scaleY(1); }
  .sb-item.active { background: linear-gradient(135deg, rgba(139,92,246,0.12), rgba(99,102,241,0.07)); color: #7c3aed; font-weight: 600; }
  .sb-dot { width: 7px; height: 7px; border-radius: 50%; background: #e2e8f0; flex-shrink: 0; transition: all 0.2s; }
  .sb-item.active .sb-dot, .sb-item:hover .sb-dot { background: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,0.15); }
  .sb-badge { margin-left: auto; font-size: 10px; font-weight: 700; background: rgba(139,92,246,0.1); color: #7c3aed; padding: 2px 7px; border-radius: 100px; }
  .sb-bottom { padding: 12px 0 0; border-top: 1px solid rgba(203,213,225,0.35); margin-top: 12px; }
  .sb-user { display: flex; align-items: center; gap: 9px; padding: 10px 12px; border-radius: 11px; cursor: pointer; transition: all 0.2s; margin-bottom: 3px; }
  .sb-user:hover { background: rgba(139,92,246,0.06); }
  .sb-avatar { width: 34px; height: 34px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; box-shadow: 0 3px 10px rgba(139,92,246,0.28); flex-shrink: 0; }
  .sb-uname { font-size: 13px; font-weight: 600; color: #1e1b4b; }
  .sb-urole { font-size: 11px; color: #94a3b8; text-transform: capitalize; }
  .sb-uarrow { font-size: 12px; color: #c7d2fe; margin-left: auto; }
  .sb-logout { display: flex; align-items: center; gap: 9px; padding: 9px 12px; border-radius: 11px; cursor: pointer; transition: all 0.2s; color: #94a3b8; font-size: 13px; font-weight: 500; background: transparent; border: none; width: 100%; font-family: 'Plus Jakarta Sans', sans-serif; }
  .sb-logout:hover { background: rgba(239,68,68,0.06); color: #ef4444; }

  .um-main { margin-left: 284px; flex: 1; padding: 36px 44px; position: relative; z-index: 1; }
  .glass { background: rgba(255,255,255,0.7); backdrop-filter: blur(18px) saturate(180%); -webkit-backdrop-filter: blur(18px) saturate(180%); border: 1px solid rgba(255,255,255,0.92); border-radius: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.035), 0 8px 32px rgba(139,92,246,0.05); transition: all 0.3s cubic-bezier(0.16,1,0.3,1); }

  .topbar { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
  .top-eyebrow { font-size: 10px; font-weight: 700; color: #a78bfa; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; }
  .top-title { font-family: 'Fraunces', serif; font-size: 30px; font-weight: 600; color: #1e1b4b; letter-spacing: -0.8px; line-height: 1; }
  .top-title em { font-style: italic; font-weight: 300; background: linear-gradient(135deg, #8b5cf6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .top-date { font-size: 12px; color: #94a3b8; margin-top: 5px; }

  .um-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-bottom: 24px; }
  .stat-mini { padding: 20px 22px; position: relative; overflow: hidden; animation: cardPop 0.55s cubic-bezier(0.16,1,0.3,1) both; }
  .stat-mini:nth-child(1){animation-delay:0.1s} .stat-mini:nth-child(2){animation-delay:0.18s} .stat-mini:nth-child(3){animation-delay:0.26s}
  .stat-mini:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(139,92,246,0.12); }
  .stat-mini::before { content: ''; position: absolute; top: -24px; right: -24px; width: 90px; height: 90px; border-radius: 50%; background: var(--glow); filter: blur(18px); pointer-events: none; }
  .sm-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .sm-icon { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 18px; background: var(--icon-bg); }
  .sm-num { font-family: 'Fraunces', serif; font-size: 38px; font-weight: 600; color: #1e1b4b; letter-spacing: -2px; line-height: 1; margin-bottom: 3px; }
  .sm-lbl { font-size: 12px; color: #64748b; }
  .live-pill { display: flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; color: #10b981; background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); padding: 3px 9px; border-radius: 100px; }
  .live-dot { width: 5px; height: 5px; border-radius: 50%; background: #10b981; animation: livePulse 2s ease-in-out infinite; }
  @keyframes livePulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.6} }

  .um-card { padding: 28px; animation: cardPop 0.55s cubic-bezier(0.16,1,0.3,1) 0.3s both; }
  .um-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
  .um-title { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 600; color: #1e1b4b; letter-spacing: -0.4px; }
  .um-sub   { font-size: 12px; color: #94a3b8; margin-top: 3px; }

  .search-shell { position: relative; }
  .search-icon  { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 14px; opacity: 0.4; pointer-events: none; }
  .search-input { padding: 9px 14px 9px 36px; background: rgba(248,250,252,0.9); border: 1px solid rgba(203,213,225,0.5); border-radius: 10px; font-size: 13px; color: #1e1b4b; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; width: 220px; transition: all 0.2s; }
  .search-input:focus { border-color: rgba(139,92,246,0.4); box-shadow: 0 0 0 3px rgba(139,92,246,0.08); width: 260px; }

  .um-table { width: 100%; border-collapse: collapse; }
  .um-table th { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; padding: 0 16px 14px; text-align: left; border-bottom: 1px solid rgba(203,213,225,0.4); }
  .um-table td { padding: 14px 16px; border-bottom: 1px solid rgba(203,213,225,0.2); vertical-align: middle; }
  .um-table tr:last-child td { border-bottom: none; }
  .um-table tbody tr { transition: background 0.18s; cursor: default; }
  .um-table tbody tr:hover { background: rgba(139,92,246,0.03); }

  .user-cell { display: flex; align-items: center; gap: 12px; }
  .user-av { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #fff; flex-shrink: 0; box-shadow: 0 3px 10px rgba(139,92,246,0.2); }
  .user-name  { font-size: 14px; font-weight: 600; color: #1e1b4b; }
  .user-email { font-size: 12px; color: #94a3b8; margin-top: 1px; }

  .role-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 100px; text-transform: capitalize; }
  .role-admin    { background: rgba(139,92,246,0.1); color: #7c3aed; }
  .role-manager  { background: rgba(6,182,212,0.1);  color: #0891b2; }
  .role-employee { background: rgba(16,185,129,0.1); color: #059669; }

  .action-cell { display: flex; align-items: center; gap: 8px; }
  .save-btn { padding: 6px 14px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border: none; border-radius: 8px; color: #fff; font-size: 12px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.2s; box-shadow: 0 3px 10px rgba(99,102,241,0.28); }
  .save-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(99,102,241,0.38); }
  .save-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .del-btn { padding: 6px 10px; background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2); border-radius: 8px; color: #ef4444; font-size: 12px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.2s; }
  .del-btn:hover { background: rgba(239,68,68,0.13); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(239,68,68,0.18); }
  .saved-tag { font-size: 11px; font-weight: 600; color: #10b981; background: rgba(16,185,129,0.1); padding: 4px 10px; border-radius: 8px; }
  .you-tag { font-size: 10px; font-weight: 700; color: #a78bfa; background: rgba(139,92,246,0.08); padding: 2px 8px; border-radius: 100px; margin-left: 6px; }

  .dash-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; gap: 16px; }
  .loader-ring { width: 42px; height: 42px; border: 3px solid rgba(139,92,246,0.15); border-top-color: #8b5cf6; border-radius: 50%; animation: spin 0.75s linear infinite; }
  .loader-txt  { font-size: 13px; color: #94a3b8; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .access-denied { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; gap: 12px; text-align: center; }
  .ad-emoji { font-size: 52px; }
  .ad-title { font-family: 'Fraunces', serif; font-size: 24px; font-weight: 600; color: #1e1b4b; }
  .ad-sub   { font-size: 14px; color: #94a3b8; }

  /* ── Delete confirm modal ── */
  .modal-veil { position: fixed; inset: 0; background: rgba(15,10,40,0.28); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); z-index: 200; display: flex; align-items: center; justify-content: center; animation: veilIn 0.2s ease both; }
  @keyframes veilIn { from{opacity:0} to{opacity:1} }
  .confirm-glass { background: rgba(255,255,255,0.92); backdrop-filter: blur(28px) saturate(200%); border: 1px solid rgba(255,255,255,1); border-radius: 20px; width: 360px; padding: 32px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.1); animation: modalPop 0.3s cubic-bezier(0.16,1,0.3,1) both; }
  @keyframes modalPop { from{opacity:0;transform:scale(0.93) translateY(14px)} to{opacity:1;transform:scale(1) translateY(0)} }
  .confirm-emoji { font-size: 40px; margin-bottom: 14px; }
  .confirm-title { font-family: 'Fraunces', serif; font-size: 22px; font-weight: 600; color: #1e1b4b; margin-bottom: 8px; }
  .confirm-text  { font-size: 13px; color: #64748b; margin-bottom: 24px; line-height: 1.65; }
  .confirm-btns  { display: flex; gap: 10px; }
  .btn-stay { flex:1; padding:11px; background:rgba(241,245,249,0.8); border:1px solid rgba(203,213,225,0.55); border-radius:10px; color:#64748b; font-size:13px; font-weight:600; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition: all 0.2s; }
  .btn-stay:hover { background: #f1f5f9; }
  .btn-bye  { flex:1; padding:11px; background:linear-gradient(135deg,#ef4444,#dc2626); border:none; border-radius:10px; color:#fff; font-size:13px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; box-shadow:0 4px 12px rgba(239,68,68,0.25); transition: all 0.2s; }
  .btn-bye:hover { transform:translateY(-1px); box-shadow:0 6px 18px rgba(239,68,68,0.35); }

  @keyframes cardPop { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

  /* ── MOBILE ── */
  @media (max-width: 768px) {
    .um-main { margin-left:0 !important; padding:60px 14px 24px !important; }
    .topbar { flex-direction:column; gap:14px; margin-bottom:20px; }
    .top-actions { width:100%; flex-wrap:wrap; }
    .btn-grad { flex:1; justify-content:center; }
    .um-stats { grid-template-columns:1fr 1fr; }
    .modal-glass { width:calc(100vw - 32px); max-width:440px; }

    /* Convert table to cards on mobile */
    .um-table, .um-table thead, .um-table tbody,
    .um-table th, .um-table td, .um-table tr { display:block; }
    .um-table thead { display:none; }
    .um-table tbody tr {
      background: rgba(255,255,255,0.75);
      border-radius: 14px;
      border: 1px solid rgba(203,213,225,0.4);
      margin-bottom: 12px;
      padding: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .um-table tbody tr:hover { background: rgba(255,255,255,0.85); }
    .um-table td { padding: 6px 0; border-bottom: none; }
    .um-table td[data-label]::before {
      content: attr(data-label);
      display: block;
      font-size: 10px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .um-table td[data-label="User"]::before { display:none; }
    .um-table td:last-child { margin-top:8px; padding-top:10px; border-top:1px solid rgba(203,213,225,0.25); }
    .action-cell { flex-wrap:wrap; gap:8px; }
    .save-btn, .del-btn { flex:1; justify-content:center; text-align:center; }
  }
  @media (max-width: 480px) {
    .um-stats { grid-template-columns:1fr; }
    .top-title { font-size:22px; }
  }

  /* hamburger */
  .um-hamburger { display:none; position:fixed; top:16px; left:16px; z-index:40;
    width:42px; height:42px; border-radius:12px; border:none; cursor:pointer;
    background:rgba(255,255,255,0.85); backdrop-filter:blur(16px);
    box-shadow:0 4px 16px rgba(139,92,246,0.18); flex-direction:column;
    align-items:center; justify-content:center; gap:5px; padding:0; }
  .um-hamburger span { display:block; width:18px; height:2px; border-radius:2px;
    background:linear-gradient(90deg,#8b5cf6,#6366f1); }
  .um-overlay { display:none; position:fixed; inset:0; background:rgba(15,10,40,0.35);
    backdrop-filter:blur(4px); z-index:19; }
  .um-close { display:none; position:absolute; top:16px; right:16px; width:30px; height:30px;
    border-radius:8px; border:1px solid rgba(203,213,225,0.5); background:rgba(0,0,0,0.04);
    color:#94a3b8; cursor:pointer; align-items:center; justify-content:center;
    font-size:14px; transition:all 0.15s; z-index:1; }
  .um-close:hover { background:rgba(239,68,68,0.07); color:#ef4444; }

  @media (max-width:768px) {
    .dash-sidebar { left:-300px; top:0; bottom:0; border-radius:0 22px 22px 0;
      transition:left 0.3s cubic-bezier(0.16,1,0.3,1); animation:none; }
    .dash-sidebar.sb-open { left:0; }
    .um-hamburger { display:flex; }
    .um-close { display:flex; }
    .um-overlay.um-ov-visible { display:block; }
  }
`;

const AV_COLORS = [
  "linear-gradient(135deg,#8b5cf6,#6366f1)",
  "linear-gradient(135deg,#06b6d4,#0891b2)",
  "linear-gradient(135deg,#10b981,#059669)",
  "linear-gradient(135deg,#f59e0b,#d97706)",
  "linear-gradient(135deg,#ef4444,#dc2626)",
];

export default function UserManagement() {
  const navigate  = useNavigate();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [editing, setEditing] = useState({});
  const [saving,  setSaving]  = useState({});
  const [saved,   setSaved]   = useState({});
  const [delTarget, setDelTarget] = useState(null);
  const [deleting,  setDeleting]  = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const me      = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = me?.role === "admin";

  useEffect(() => {
    if (!isAdmin) { setLoading(false); return; }
    API.get("/users")
      .then(r => setUsers(r.data.users || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAdmin]);

  const handleRoleChange = (userId, newRole) => {
    setEditing(prev => ({ ...prev, [userId]: newRole }));
    setSaved(prev => ({ ...prev, [userId]: false }));
  };

  const handleSave = async (userId) => {
    const newRole = editing[userId];
    if (!newRole) return;
    setSaving(prev => ({ ...prev, [userId]: true }));
    try {
      await API.put(`/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      setSaved(prev => ({ ...prev, [userId]: true }));
      setEditing(prev => { const n = {...prev}; delete n[userId]; return n; });
      setTimeout(() => setSaved(prev => ({ ...prev, [userId]: false })), 2000);
    } catch (e) {
      alert(e.response?.data?.message || "Failed to update role.");
    } finally {
      setSaving(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!delTarget) return;
    setDeleting(true);
    try {
      await API.delete(`/users/${delTarget._id}`);
      setUsers(prev => prev.filter(u => u._id !== delTarget._id));
      setDelTarget(null);
    } catch (e) {
      alert(e.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  };

  const doLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/"); };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const managers  = users.filter(u => u.role === "manager").length;
  const employees = users.filter(u => u.role === "employee").length;
  const uName  = me?.name || "User";
  const letter = uName.charAt(0).toUpperCase();

  return (
    <>
      <style>{css}</style>
      <div className="um-page">
        <button className="um-hamburger" onClick={() => setSidebarOpen(true)}>
          <span /><span /><span />
        </button>
        {sidebarOpen && <div className="um-overlay um-ov-visible" onClick={() => setSidebarOpen(false)} />}
        <aside className={`dash-sidebar${sidebarOpen ? " sb-open" : ""}`}>
          <button className="um-close" onClick={() => setSidebarOpen(false)}>✕</button>
          <div className="sb-brand">
            <div className="sb-gem">⬡</div>
            <span className="sb-name">ProjectManager</span>
          </div>
          <nav className="sb-nav">
            <div className="sb-section">Main</div>
            <div className="sb-item" onClick={() => { navigate("/dashboard"); setSidebarOpen(false); }}><span className="sb-dot" /> Dashboard</div>
            <div className="sb-item" onClick={() => { navigate("/projects"); setSidebarOpen(false); }}><span className="sb-dot" /> Projects</div>
            <div className="sb-item" onClick={() => { navigate("/tasks"); setSidebarOpen(false); }}><span className="sb-dot" /> Tasks</div>
            {isAdmin && (
              <>
                <div className="sb-section">Admin</div>
                <div className="sb-item active"><span className="sb-dot" /> Users <span className="sb-badge">{users.length}</span></div>
              </>
            )}
          </nav>
          <div className="sb-bottom">
            <div className="sb-user">
              <div className="sb-avatar">{letter}</div>
              <div style={{flex:1,minWidth:0}}>
                <div className="sb-uname">{uName}</div>
                <div className="sb-urole">{me?.role || "member"}</div>
              </div>
              <span className="sb-uarrow">↗</span>
            </div>
            <button className="sb-logout" onClick={doLogout}>⎋ &nbsp;Sign out</button>
          </div>
        </aside>

        <main className="um-main">
          <div className="topbar">
            <div>
              <div className="top-eyebrow">Admin</div>
              <h1 className="top-title">User <em>Management</em></h1>
              <div className="top-date">{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
            </div>
          </div>

          {!isAdmin && !loading && (
            <div className="access-denied">
              <div className="ad-emoji">🔒</div>
              <div className="ad-title">Access Denied</div>
              <div className="ad-sub">Only admins can manage user roles.</div>
            </div>
          )}

          {isAdmin && (
            <>
              <div className="um-stats">
                {[
                  { label:"Total Users", value:users.length, icon:"👨‍💼", glow:"rgba(139,92,246,0.18)", iconBg:"rgba(139,92,246,0.09)" },
                  { label:"Managers",    value:managers,     icon:"👥",  glow:"rgba(6,182,212,0.18)",  iconBg:"rgba(6,182,212,0.09)"  },
                  { label:"Employees",   value:employees,    icon:"💼",  glow:"rgba(16,185,129,0.18)", iconBg:"rgba(16,185,129,0.09)" },
                ].map((s,i) => (
                  <div key={i} className="glass stat-mini" style={{"--glow":s.glow,"--icon-bg":s.iconBg}}>
                    <div className="sm-top">
                      <div className="sm-icon">{s.icon}</div>
                      <div className="live-pill"><span className="live-dot"/>Live</div>
                    </div>
                    <div className="sm-num">{s.value}</div>
                    <div className="sm-lbl">{s.label}</div>
                  </div>
                ))}
              </div>

              {loading ? (
                <div className="dash-loader"><div className="loader-ring"/><span className="loader-txt">Loading users…</span></div>
              ) : (
                <div className="glass um-card">
                  <div className="um-head">
                    <div>
                      <div className="um-title">All Users</div>
                      <div className="um-sub">Manage roles and remove users</div>
                    </div>
                    <div className="search-shell">
                      <span className="search-icon">🔍</span>
                      <input className="search-input" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)}/>
                    </div>
                  </div>

                  <table className="um-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Current Role</th>
                        <th>Change Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((u, i) => {
                        const isMe        = u._id === me?.id;
                        const isOtherAdmin = u.role === "admin" && !isMe;
                        const pendingRole = editing[u._id];
                        const isSaving    = saving[u._id];
                        const wasSaved    = saved[u._id];
                        const hasChange   = pendingRole && pendingRole !== u.role;

                        return (
                          <tr key={u._id}>
                            <td data-label="User">
                              <div className="user-cell">
                                <div className="user-av" style={{background: AV_COLORS[i % AV_COLORS.length]}}>
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="user-name">
                                    {u.name}
                                    {isMe && <span className="you-tag">You</span>}
                                  </div>
                                  <div className="user-email">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td data-label="Current Role">
                              <span className={`role-badge role-${u.role}`}>{u.role}</span>
                            </td>
                            <td data-label="Change Role">
                              {isMe || isOtherAdmin ? (
                                <span style={{fontSize:"12px",color:"#94a3b8"}}>
                                  {isMe ? "Cannot change own role" : "—"}
                                </span>
                              ) : (
                                <CustomSelect
                                  value={pendingRole || u.role}
                                  onChange={v => handleRoleChange(u._id, v)}
                                  options={ROLE_OPTS}
                                />
                              )}
                            </td>
                            <td data-label="Actions">
                              {isMe || isOtherAdmin ? (
                                <span style={{fontSize:"12px",color:"#c7d2fe"}}>—</span>
                              ) : (
                                <div className="action-cell">
                                  {wasSaved ? (
                                    <span className="saved-tag">✓ Saved</span>
                                  ) : (
                                    <button
                                      className="save-btn"
                                      disabled={!hasChange || isSaving}
                                      onClick={() => handleSave(u._id)}
                                    >
                                      {isSaving ? "Saving…" : "Save"}
                                    </button>
                                  )}
                                  <button
                                    className="del-btn"
                                    onClick={() => setDelTarget(u)}
                                    title="Delete user"
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={4} style={{textAlign:"center",padding:"40px",color:"#94a3b8",fontSize:"14px"}}>
                            No users match your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Delete confirm modal ─────────────────────────────────────── */}
      {delTarget && (
        <div className="modal-veil" onClick={() => setDelTarget(null)}>
          <div className="confirm-glass" onClick={e => e.stopPropagation()}>
            <div className="confirm-emoji">🗑️</div>
            <div className="confirm-title">Delete user?</div>
            <div className="confirm-text">
              <strong>{delTarget.name}</strong> ({delTarget.email}) will be permanently removed.
              This cannot be undone.
            </div>
            <div className="confirm-btns">
              <button className="btn-stay" onClick={() => setDelTarget(null)}>Cancel</button>
              <button className="btn-bye" onClick={handleDeleteConfirm} disabled={deleting}>
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
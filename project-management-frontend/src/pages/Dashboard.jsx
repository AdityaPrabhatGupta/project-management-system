import { useEffect, useState, useCallback, useRef } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

// ── helpers ──────────────────────────────────────────────────────────────────
const timeAgo = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)    return `${diff}s`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

const TYPE_META = {
  notice:  { bg: "rgba(139,92,246,0.12)" },
  update:  { bg: "rgba(99,102,241,0.12)" },
  alert:   { bg: "rgba(249,115,22,0.12)" },
  success: { bg: "rgba(16,185,129,0.12)" },
};

// ── CSS ───────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,wght@0,300;0,600;1,300;1,600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .dash-page {
    display: flex; min-height: 100vh;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #eef2ff; position: relative;
  }
  .dash-page::before {
    content: ''; position: fixed; inset: 0;
    background:
      radial-gradient(ellipse 70% 50% at 10% 20%, rgba(139,92,246,0.13) 0%, transparent 60%),
      radial-gradient(ellipse 50% 60% at 90% 80%, rgba(6,182,212,0.1) 0%, transparent 60%),
      radial-gradient(ellipse 40% 40% at 50% 50%, rgba(249,115,22,0.05) 0%, transparent 60%),
      linear-gradient(135deg, #eef2ff 0%, #f0f9ff 60%, #fdf4ff 100%);
    z-index: 0;
  }

  /* ── SIDEBAR ── */
  .dash-sidebar {
    width: 260px; position: fixed; top: 12px; left: 12px; bottom: 12px;
    z-index: 20; padding: 20px 14px; display: flex; flex-direction: column;
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(32px) saturate(200%) brightness(1.04);
    -webkit-backdrop-filter: blur(32px) saturate(200%) brightness(1.04);
    border: 1px solid rgba(255,255,255,0.85); border-radius: 22px;
    box-shadow: 0 8px 32px rgba(139,92,246,0.1), 0 2px 8px rgba(0,0,0,0.04),
      inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(203,213,225,0.2);
    overflow: hidden; scrollbar-width: none; -ms-overflow-style: none;
    animation: sideIn 0.55s cubic-bezier(0.16,1,0.3,1) both;
  }
  .dash-sidebar::-webkit-scrollbar { display: none; }
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

  .db-hamburger { display:none; position:fixed; top:16px; left:16px; z-index:40;
    width:42px; height:42px; border-radius:12px; border:none; cursor:pointer;
    background:rgba(255,255,255,0.85); backdrop-filter:blur(16px);
    box-shadow:0 4px 16px rgba(139,92,246,0.18); flex-direction:column;
    align-items:center; justify-content:center; gap:5px; padding:0; }
  .db-hamburger span { display:block; width:18px; height:2px; border-radius:2px;
    background:linear-gradient(90deg,#8b5cf6,#6366f1); }
  .db-overlay { display:none; position:fixed; inset:0; background:rgba(15,10,40,0.35);
    backdrop-filter:blur(4px); z-index:19; }
  .db-close { display:none; position:absolute; top:16px; right:16px; width:30px; height:30px;
    border-radius:8px; border:1px solid rgba(203,213,225,0.5); background:rgba(0,0,0,0.04);
    color:#94a3b8; cursor:pointer; align-items:center; justify-content:center;
    font-size:14px; transition:all 0.15s; z-index:1; }
  .db-close:hover { background:rgba(239,68,68,0.07); color:#ef4444; }

  @media (max-width:768px) {
    .db-hamburger { display:flex; }
    .db-close { display:flex; }
    .dash-sidebar {
      left:-300px; top:0; bottom:0; border-radius:0 22px 22px 0;
      transition:left 0.3s cubic-bezier(0.16,1,0.3,1);
      animation:none;
    }
    .dash-sidebar.sb-open { left:0; }
    .db-overlay.db-ov-visible { display:block; }
  }

  .sb-brand { display: flex; align-items: center; gap: 10px; padding: 0 8px 16px; border-bottom: 1px solid rgba(203,213,225,0.35); margin-bottom: 6px; flex-shrink: 0; }
  .sb-gem { width: 36px; height: 36px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #fff; box-shadow: 0 4px 14px rgba(139,92,246,0.32); transition: transform 0.3s cubic-bezier(0.16,1,0.3,1); flex-shrink: 0; }
  .sb-gem:hover { transform: rotate(15deg) scale(1.08); }
  .sb-name { font-size: 14px; font-weight: 700; color: #1e1b4b; letter-spacing: -0.3px; }

  .sb-nav { overflow: hidden; flex-shrink: 0; }
  .sb-section { font-size: 10px; font-weight: 700; color: #c7d2fe; text-transform: uppercase; letter-spacing: 1.5px; padding: 0 8px; margin: 10px 0 4px; }
  .sb-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 11px; cursor: pointer; transition: all 0.22s cubic-bezier(0.16,1,0.3,1); color: #64748b; font-size: 13px; font-weight: 500; margin-bottom: 2px; position: relative; overflow: hidden; }
  .sb-item::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%) scaleY(0); width: 3px; height: 60%; background: linear-gradient(180deg, #8b5cf6, #6366f1); border-radius: 0 3px 3px 0; transition: transform 0.2s cubic-bezier(0.16,1,0.3,1); }
  .sb-item:hover { background: rgba(139,92,246,0.07); color: #7c3aed; transform: translateX(4px); }
  .sb-item:hover::before { transform: translateY(-50%) scaleY(1); }
  .sb-item.active { background: linear-gradient(135deg, rgba(139,92,246,0.12), rgba(99,102,241,0.07)); color: #7c3aed; font-weight: 600; }
  .sb-item.active::before { transform: translateY(-50%) scaleY(1); }
  .sb-dot { width: 7px; height: 7px; border-radius: 50%; background: #e2e8f0; flex-shrink: 0; transition: all 0.2s; }
  .sb-item.active .sb-dot, .sb-item:hover .sb-dot { background: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,0.15); }
  .sb-badge { margin-left: auto; font-size: 10px; font-weight: 700; background: rgba(139,92,246,0.1); color: #7c3aed; padding: 2px 7px; border-radius: 100px; }
  .sb-spacer { flex: 1; min-height: 0; }

  /* ── RECENT UPDATES ── */
  .sb-updates { margin: 10px 0 8px; padding: 11px 12px; background: rgba(139,92,246,0.04); border: 1px solid rgba(139,92,246,0.1); border-radius: 14px; position: relative; overflow: hidden; flex-shrink: 0; }
  .sb-updates::before { content: ''; position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; border-radius: 50%; background: radial-gradient(circle, rgba(139,92,246,0.12), transparent); pointer-events: none; }
  .sb-updates-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 9px; }
  .sb-updates-title { font-size: 10px; font-weight: 800; color: #7c3aed; text-transform: uppercase; letter-spacing: 1.5px; display: flex; align-items: center; gap: 6px; }
  .sb-updates-dot { width: 6px; height: 6px; border-radius: 50%; background: #8b5cf6; animation: livePulse 2s ease-in-out infinite; }
  .sb-updates-count { font-size: 10px; font-weight: 700; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: #fff; padding: 2px 7px; border-radius: 100px; }
  .sb-update-item { display: flex; align-items: flex-start; gap: 8px; padding: 6px 0; border-bottom: 1px solid rgba(139,92,246,0.08); animation: fadeUp 0.35s ease both; position: relative; }
  .sb-update-item:last-child { border-bottom: none; padding-bottom: 0; }
  .sb-update-item.pinned-item { background: rgba(139,92,246,0.04); margin: 0 -4px; padding: 6px 4px; border-radius: 7px; border-bottom: 1px solid rgba(139,92,246,0.08); }
  .sb-update-icon { width: 26px; height: 26px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; transition: transform 0.2s; }
  .sb-update-item:hover .sb-update-icon { transform: scale(1.15) rotate(-5deg); }
  .sb-update-text { flex: 1; min-width: 0; }
  .sb-update-title { font-size: 11px; font-weight: 600; color: #1e1b4b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sb-update-sub { font-size: 10px; color: #94a3b8; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sb-update-time { font-size: 10px; color: #c7d2fe; flex-shrink: 0; margin-top: 1px; }
  .sb-update-del { position: absolute; right: 0; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; border-radius: 5px; border: none; background: rgba(239,68,68,0.08); color: #ef4444; cursor: pointer; font-size: 10px; display: none; align-items: center; justify-content: center; transition: all 0.15s; line-height: 1; }
  .sb-update-item:hover .sb-update-del { display: flex; }
  .sb-update-del:hover { background: rgba(239,68,68,0.18); }
  .sb-pin-badge { font-size: 9px; margin-right: 2px; }
  .sb-updates-empty { font-size: 11px; color: #c7d2fe; text-align: center; padding: 8px 0 2px; }
  .sb-updates-spin { display: flex; justify-content: center; padding: 8px 0; }
  .sb-spin-ring { width: 18px; height: 18px; border: 2px solid rgba(139,92,246,0.15); border-top-color: #8b5cf6; border-radius: 50%; animation: spin 0.7s linear infinite; }
  .sb-add-notice-btn { display: flex; align-items: center; justify-content: center; gap: 5px; width: 100%; margin-top: 8px; padding: 6px 10px; border: 1px dashed rgba(139,92,246,0.35); border-radius: 9px; background: transparent; color: #8b5cf6; font-size: 11px; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.2s; }
  .sb-add-notice-btn:hover { background: rgba(139,92,246,0.07); border-color: #8b5cf6; }

  /* ── NOTICE MODAL ── */
  .notice-veil { position: fixed; inset: 0; background: rgba(15,10,40,0.28); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); z-index: 200; display: flex; align-items: center; justify-content: center; animation: veilIn 0.2s ease both; }
  .notice-modal { background: rgba(255,255,255,0.95); backdrop-filter: blur(28px) saturate(200%); -webkit-backdrop-filter: blur(28px) saturate(200%); border: 1px solid rgba(255,255,255,1); border-radius: 22px; width: 420px; overflow: hidden; box-shadow: 0 20px 60px rgba(139,92,246,0.16), 0 4px 16px rgba(0,0,0,0.07); animation: modalPop 0.3s cubic-bezier(0.16,1,0.3,1) both; }
  .nm-head { padding: 22px 22px 0; display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
  .nm-title { font-family: 'Fraunces', serif; font-size: 19px; font-weight: 600; color: #1e1b4b; letter-spacing: -0.4px; }
  .nm-x { width: 30px; height: 30px; border-radius: 8px; background: rgba(0,0,0,0.04); border: 1px solid rgba(203,213,225,0.5); color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: all 0.15s; }
  .nm-x:hover { background: rgba(239,68,68,0.07); color: #ef4444; }
  .nm-body { padding: 0 22px 22px; display: flex; flex-direction: column; gap: 12px; }
  .nm-field { display: flex; flex-direction: column; gap: 5px; }
  .nm-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
  .nm-input, .nm-textarea, .nm-select { background: rgba(248,250,252,0.9); border: 1px solid rgba(203,213,225,0.55); border-radius: 10px; padding: 10px 13px; font-size: 13px; color: #1e1b4b; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; transition: border-color 0.2s, box-shadow 0.2s; width: 100%; }
  .nm-input:focus, .nm-textarea:focus, .nm-select:focus { border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,0.1); }
  .nm-textarea { resize: vertical; min-height: 70px; }
  .nm-row { display: flex; gap: 10px; }
  .nm-row .nm-field { flex: 1; }
  .nm-icon-grid { display: flex; gap: 6px; flex-wrap: wrap; }
  .nm-icon-opt { width: 34px; height: 34px; border-radius: 8px; border: 1.5px solid rgba(203,213,225,0.5); background: rgba(248,250,252,0.8); cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
  .nm-icon-opt:hover { border-color: #8b5cf6; background: rgba(139,92,246,0.07); }
  .nm-icon-opt.selected { border-color: #8b5cf6; background: rgba(139,92,246,0.12); box-shadow: 0 0 0 3px rgba(139,92,246,0.12); }
  .nm-pin-row { display: flex; align-items: center; gap: 9px; padding: 10px 13px; background: rgba(248,250,252,0.8); border: 1px solid rgba(203,213,225,0.45); border-radius: 10px; cursor: pointer; }
  .nm-pin-chk { width: 16px; height: 16px; accent-color: #8b5cf6; cursor: pointer; }
  .nm-pin-lbl { font-size: 12px; color: #64748b; font-weight: 500; }
  .nm-submit { display: flex; align-items: center; justify-content: center; gap: 7px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 60%, #4f46e5 100%); color: #fff; border: none; padding: 12px 20px; border-radius: 11px; font-size: 13px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.25s cubic-bezier(0.16,1,0.3,1); box-shadow: 0 4px 14px rgba(99,102,241,0.32); width: 100%; margin-top: 4px; }
  .nm-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(99,102,241,0.42); }
  .nm-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .nm-err { font-size: 12px; color: #ef4444; background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2); border-radius: 8px; padding: 8px 12px; }

  /* ── BOTTOM ── */
  .sb-bottom { padding: 10px 0 0; border-top: 1px solid rgba(203,213,225,0.35); margin-top: 4px; flex-shrink: 0; }
  .sb-user { display: flex; align-items: center; gap: 9px; padding: 9px 12px; border-radius: 11px; cursor: pointer; transition: all 0.2s; margin-bottom: 2px; }
  .sb-user:hover { background: rgba(139,92,246,0.06); }
  .sb-avatar { width: 32px; height: 32px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; box-shadow: 0 3px 10px rgba(139,92,246,0.28); flex-shrink: 0; }
  .sb-uname { font-size: 12px; font-weight: 600; color: #1e1b4b; }
  .sb-urole { font-size: 10px; color: #94a3b8; text-transform: capitalize; }
  .sb-uarrow { font-size: 12px; color: #c7d2fe; margin-left: auto; transition: color 0.2s; }
  .sb-user:hover .sb-uarrow { color: #8b5cf6; }
  .sb-logout { display: flex; align-items: center; gap: 9px; padding: 8px 12px; border-radius: 11px; cursor: pointer; transition: all 0.2s; color: #94a3b8; font-size: 12px; font-weight: 500; background: transparent; border: none; width: 100%; font-family: 'Plus Jakarta Sans', sans-serif; }
  .sb-logout:hover { background: rgba(239,68,68,0.06); color: #ef4444; }

  /* ── MAIN ── */
  .dash-main { margin-left: 284px; flex: 1; padding: 36px 44px; position: relative; z-index: 1; }
  .topbar { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
  .top-eyebrow { font-size: 10px; font-weight: 700; color: #a78bfa; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; }
  .top-title { font-family: 'Fraunces', serif; font-size: 30px; font-weight: 600; color: #1e1b4b; letter-spacing: -0.8px; line-height: 1; }
  .top-title em { font-style: italic; font-weight: 300; background: linear-gradient(135deg, #8b5cf6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .top-date { font-size: 12px; color: #94a3b8; margin-top: 5px; }
  .btn-grad { display: flex; align-items: center; gap: 7px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 60%, #4f46e5 100%); color: #fff; border: none; padding: 10px 20px; border-radius: 11px; font-size: 13px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.25s cubic-bezier(0.16,1,0.3,1); box-shadow: 0 4px 14px rgba(99,102,241,0.32), inset 0 1px 0 rgba(255,255,255,0.2); position: relative; overflow: hidden; }
  .btn-grad::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.18), transparent); opacity: 0; transition: opacity 0.2s; }
  .btn-grad:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(99,102,241,0.42); }
  .btn-grad:hover::after { opacity: 1; }
  .dash-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 18px; }
  .glass { background: rgba(255,255,255,0.7); backdrop-filter: blur(18px) saturate(180%); -webkit-backdrop-filter: blur(18px) saturate(180%); border: 1px solid rgba(255,255,255,0.92); border-radius: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.035), 0 8px 32px rgba(139,92,246,0.05); transition: all 0.3s cubic-bezier(0.16,1,0.3,1); }
  .stat-card { grid-column: span 4; padding: 24px; position: relative; overflow: hidden; animation: cardPop 0.55s cubic-bezier(0.16,1,0.3,1) both; cursor: default; }
  .stat-card:nth-child(1){animation-delay:0.12s} .stat-card:nth-child(2){animation-delay:0.22s} .stat-card:nth-child(3){animation-delay:0.32s}
  .stat-card:hover { transform: translateY(-5px) scale(1.01); box-shadow: 0 12px 36px rgba(139,92,246,0.14), 0 2px 8px rgba(0,0,0,0.04); border-color: rgba(255,255,255,1); }
  .stat-card::before { content: ''; position: absolute; top: -30px; right: -30px; width: 110px; height: 110px; border-radius: 50%; background: var(--glow); filter: blur(22px); pointer-events: none; transition: transform 0.4s; }
  .stat-card:hover::before { transform: scale(1.3); }
  .stat-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .stat-icon { width: 44px; height: 44px; border-radius: 13px; display: flex; align-items: center; justify-content: center; font-size: 20px; background: var(--icon-bg); transition: transform 0.3s cubic-bezier(0.16,1,0.3,1); }
  .stat-card:hover .stat-icon { transform: rotate(-8deg) scale(1.1); }
  .live-pill { display: flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; color: #10b981; background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); padding: 3px 9px; border-radius: 100px; }
  .live-dot { width: 5px; height: 5px; border-radius: 50%; background: #10b981; animation: livePulse 2s ease-in-out infinite; }
  @keyframes livePulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.6} }
  .stat-num { font-family: 'Fraunces', serif; font-size: 48px; font-weight: 600; color: #1e1b4b; letter-spacing: -2.5px; line-height: 1; margin-bottom: 5px; }
  .stat-lbl { font-size: 13px; color: #64748b; margin-bottom: 14px; }
  .stat-bar-wrap { height: 4px; background: rgba(203,213,225,0.4); border-radius: 100px; overflow: hidden; margin-bottom: 8px; }
  .stat-bar { height: 100%; border-radius: 100px; background: var(--bar-color); animation: barGrow 1.2s cubic-bezier(0.16,1,0.3,1) 0.5s both; transform-origin: left; }
  @keyframes barGrow { from { width: 0% !important; } }
  .stat-footer { font-size: 11px; color: #94a3b8; padding-top: 10px; border-top: 1px solid rgba(203,213,225,0.35); }

  /* ── PROGRESS CARD ── */
  .progress-card { grid-column: span 12; padding: 26px; animation: cardPop 0.55s cubic-bezier(0.16,1,0.3,1) 0.38s both; }
  .progress-card:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(139,92,246,0.1); }
  .pc-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
  .pc-title { font-family: 'Fraunces', serif; font-size: 18px; font-weight: 600; color: #1e1b4b; letter-spacing: -0.4px; }
  .pc-sub { font-size: 12px; color: #94a3b8; margin-top: 2px; }
  .pc-rate { font-family: 'Fraunces', serif; font-size: 36px; font-weight: 600; background: linear-gradient(135deg, #8b5cf6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -1px; }
  .prog-track { height: 10px; background: rgba(203,213,225,0.35); border-radius: 100px; overflow: hidden; margin-bottom: 12px; }
  .prog-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, #8b5cf6, #6366f1, #06b6d4); background-size: 200% 100%; transition: width 1.4s cubic-bezier(0.16,1,0.3,1); animation: shimmer 3s ease-in-out infinite; position: relative; min-width: ${0}; }
  .prog-fill::after { content: ''; position: absolute; right: -1px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; background: #fff; border: 3px solid #8b5cf6; border-radius: 50%; box-shadow: 0 2px 8px rgba(139,92,246,0.4); }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .prog-labels { display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; }
  .prog-labels strong { color: #1e1b4b; }
  .prog-milestones { display: flex; gap: 12px; margin-top: 20px; flex-wrap: wrap; }
  .milestone { display: flex; align-items: center; gap: 7px; padding: 7px 12px; border-radius: 8px; background: rgba(248,250,252,0.8); border: 1px solid rgba(203,213,225,0.4); font-size: 12px; color: #64748b; transition: all 0.2s; }
  .milestone:hover { border-color: rgba(139,92,246,0.3); color: #7c3aed; }
  .milestone-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

  /* ── KANBAN (real data) ── */
  .kanban-card { grid-column: span 12; padding: 26px; animation: cardPop 0.55s cubic-bezier(0.16,1,0.3,1) 0.48s both; }
  .kanban-card:hover { transform: translateY(-2px); }
  .kb-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
  .kb-title { font-family: 'Fraunces', serif; font-size: 18px; font-weight: 600; color: #1e1b4b; letter-spacing: -0.4px; }
  .kb-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .kb-col { padding: 16px; border-radius: 14px; min-height: 180px; }
  .kb-col-todo { background: rgba(241,245,249,0.7); }
  .kb-col-prog { background: rgba(238,242,255,0.7); }
  .kb-col-done { background: rgba(236,253,245,0.7); }
  .kb-col-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .kb-col-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
  .kb-col-todo .kb-col-title { color: #64748b; }
  .kb-col-prog .kb-col-title { color: #6366f1; }
  .kb-col-done .kb-col-title { color: #10b981; }
  .kb-count { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 100px; }
  .kb-col-todo .kb-count { background: rgba(100,116,139,0.1); color: #64748b; }
  .kb-col-prog .kb-count { background: rgba(99,102,241,0.1); color: #6366f1; }
  .kb-col-done .kb-count { background: rgba(16,185,129,0.1); color: #10b981; }
  .kb-task { background: rgba(255,255,255,0.8); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.95); border-radius: 11px; padding: 13px; margin-bottom: 10px; transition: all 0.22s cubic-bezier(0.16,1,0.3,1); cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
  .kb-task:hover { transform: translateY(-2px) scale(1.01); box-shadow: 0 6px 20px rgba(139,92,246,0.1); border-color: rgba(139,92,246,0.2); }
  .kb-task-title { font-size: 13px; font-weight: 600; color: #1e1b4b; margin-bottom: 6px; }
  .kb-task-meta { display: flex; align-items: center; justify-content: space-between; }
  .kb-tag { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 100px; }
  .kb-tag-low    { background: rgba(16,185,129,0.1);  color: #10b981; }
  .kb-tag-medium { background: rgba(245,158,11,0.1);  color: #d97706; }
  .kb-tag-high   { background: rgba(239,68,68,0.1);   color: #ef4444; }
  .kb-avatar-row { display: flex; }
  .kb-mini-av { width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6, #6366f1); border: 2px solid #fff; margin-left: -5px; font-size: 9px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; }
  .kb-mini-av:first-child { margin-left: 0; }
  .kb-empty { font-size: 12px; color: #cbd5e1; text-align: center; padding: 20px 0; }

  .dash-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; gap: 16px; }
  .loader-ring { width: 42px; height: 42px; border: 3px solid rgba(139,92,246,0.15); border-top-color: #8b5cf6; border-radius: 50%; animation: spin 0.75s linear infinite; }
  .loader-txt { font-size: 13px; color: #94a3b8; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .modal-veil { position: fixed; inset: 0; background: rgba(15,10,40,0.28); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); z-index: 100; display: flex; align-items: center; justify-content: center; animation: veilIn 0.2s ease both; }
  @keyframes veilIn { from{opacity:0} to{opacity:1} }
  .modal-glass { background: rgba(255,255,255,0.9); backdrop-filter: blur(28px) saturate(200%); -webkit-backdrop-filter: blur(28px) saturate(200%); border: 1px solid rgba(255,255,255,1); border-radius: 24px; width: 400px; overflow: hidden; box-shadow: 0 20px 60px rgba(139,92,246,0.14), 0 4px 16px rgba(0,0,0,0.07); animation: modalPop 0.3s cubic-bezier(0.16,1,0.3,1) both; }
  @keyframes modalPop { from{opacity:0;transform:scale(0.93) translateY(14px)} to{opacity:1;transform:scale(1) translateY(0)} }
  .modal-head { padding: 26px 26px 0; display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .modal-title { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 600; color: #1e1b4b; letter-spacing: -0.4px; }
  .modal-x { width: 30px; height: 30px; border-radius: 8px; background: rgba(0,0,0,0.04); border: 1px solid rgba(203,213,225,0.5); color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: all 0.15s; }
  .modal-x:hover { background: rgba(239,68,68,0.07); color: #ef4444; }
  .modal-body { padding: 0 26px 26px; }
  .big-avatar { width: 72px; height: 72px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; color: #fff; margin: 0 auto 18px; box-shadow: 0 8px 24px rgba(139,92,246,0.3); }
  .p-fields { display: flex; flex-direction: column; gap: 10px; }
  .p-field { background: rgba(248,250,252,0.8); border: 1px solid rgba(203,213,225,0.45); border-radius: 11px; padding: 13px 15px; }
  .p-lbl { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
  .p-val { font-size: 14px; color: #1e1b4b; font-weight: 500; }
  .role-chip { display: inline-flex; align-items: center; background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(99,102,241,0.07)); border: 1px solid rgba(139,92,246,0.2); color: #7c3aed; font-size: 12px; font-weight: 600; padding: 3px 12px; border-radius: 100px; text-transform: capitalize; }
  .confirm-glass { background: rgba(255,255,255,0.92); backdrop-filter: blur(28px) saturate(200%); -webkit-backdrop-filter: blur(28px) saturate(200%); border: 1px solid rgba(255,255,255,1); border-radius: 20px; width: 340px; padding: 30px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.09); animation: modalPop 0.3s cubic-bezier(0.16,1,0.3,1) both; }
  .confirm-emoji { font-size: 36px; margin-bottom: 12px; }
  .confirm-title { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 600; color: #1e1b4b; margin-bottom: 7px; }
  .confirm-text { font-size: 13px; color: #64748b; margin-bottom: 22px; line-height: 1.65; }
  .confirm-btns { display: flex; gap: 10px; }
  .btn-stay { flex:1; padding:11px; background:rgba(241,245,249,0.8); border:1px solid rgba(203,213,225,0.55); border-radius:10px; color:#64748b; font-size:13px; font-weight:600; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:all 0.2s; }
  .btn-stay:hover { background:#f1f5f9; }
  .btn-bye { flex:1; padding:11px; background:linear-gradient(135deg,#ef4444,#dc2626); border:none; border-radius:10px; color:#fff; font-size:13px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:all 0.2s; box-shadow:0 4px 12px rgba(239,68,68,0.25); }
  .btn-bye:hover { transform:translateY(-1px); box-shadow:0 6px 18px rgba(239,68,68,0.35); }
  @keyframes cardPop { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

  @media (max-width: 768px) {
    .dash-main { margin-left:0; padding:60px 14px 24px; }
    .topbar { flex-direction:column; gap:14px; margin-bottom:20px; }
    .dash-grid { grid-template-columns:1fr; gap:14px; }
    .stat-card { grid-column:span 1; }
    .progress-card { grid-column:span 1; }
    .kanban-card { grid-column:span 1; }
    .kb-cols { grid-template-columns:1fr; gap:12px; }
    .modal-glass { width:calc(100vw - 32px); max-width:400px; }
    .confirm-glass { width:calc(100vw - 32px); }
    .notice-modal { width:calc(100vw - 32px); }
    .prog-milestones { gap:8px; }
    .btn-grad { flex:1; justify-content:center; }
  }
  @media (max-width: 480px) {
    .stat-num { font-size:36px; }
    .top-title { font-size:22px; }
    .nm-row { flex-direction:column; gap:12px; }
  }
`;

const NOTICE_ICONS = ["📢","🚀","✅","⚠️","🔔","📌","💡","🎯","🔧","🎉","👥","📊"];

// ── Notice Modal ──────────────────────────────────────────────────────────────
function NoticeModal({ onClose, onPosted, userRole }) {
  const [form,    setForm]    = useState({ title:"", body:"", icon:"📢", type:"notice", pinned:false });
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.title.trim()) { setErr("Title is required."); return; }
    setErr(""); setLoading(true);
    try {
      await API.post("/notices", form);
      onPosted();
      onClose();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to post notice.");
    } finally { setLoading(false); }
  };

  return (
    <div className="notice-veil" onClick={onClose}>
      <div className="notice-modal" onClick={e => e.stopPropagation()}>
        <div className="nm-head">
          <span className="nm-title">Float a Notice</span>
          <button className="nm-x" onClick={onClose}>✕</button>
        </div>
        <div className="nm-body">
          {err && <div className="nm-err">{err}</div>}
          <div className="nm-field">
            <span className="nm-label">Title *</span>
            <input className="nm-input" placeholder="e.g. Server maintenance tonight" maxLength={80}
              value={form.title} onChange={e => set("title", e.target.value)} />
          </div>
          <div className="nm-field">
            <span className="nm-label">Description (optional)</span>
            <textarea className="nm-textarea" placeholder="Add more details…" maxLength={300}
              value={form.body} onChange={e => set("body", e.target.value)} />
          </div>
          <div className="nm-field">
            <span className="nm-label">Type</span>
            <select className="nm-select" value={form.type} onChange={e => set("type", e.target.value)}>
              <option value="notice">📢 Notice</option>
              <option value="update">🚀 Update</option>
              <option value="alert">⚠️ Alert</option>
              <option value="success">✅ Success</option>
            </select>
          </div>
          <div className="nm-field">
            <span className="nm-label">Icon</span>
            <div className="nm-icon-grid">
              {NOTICE_ICONS.map(ic => (
                <button key={ic} className={`nm-icon-opt${form.icon === ic ? " selected" : ""}`}
                  onClick={() => set("icon", ic)}>{ic}</button>
              ))}
            </div>
          </div>
          {userRole === "admin" && (
            <label className="nm-pin-row">
              <input className="nm-pin-chk" type="checkbox" checked={form.pinned}
                onChange={e => set("pinned", e.target.checked)} />
              <span className="nm-pin-lbl">📌 Pin this notice to the top</span>
            </label>
          )}
          <button className="nm-submit" onClick={submit} disabled={loading}>
            {loading ? "Posting…" : "Post Notice"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats,       setStats]       = useState({ totalProjects:0, totalTasks:0, completedTasks:0 });
  // ✅ Real tasks state — grouped by status
  const [kanban,      setKanban]      = useState({ todo:[], inProgress:[], done:[] });
  const [user,        setUser]        = useState(() => { try { return JSON.parse(localStorage.getItem("user")) || null; } catch { return null; } });
  const [loading,     setLoading]     = useState(true);
  const [showP,       setShowP]       = useState(false);
  const [showL,       setShowL]       = useState(false);
  const [notices,     setNotices]     = useState([]);
  const [noticesLoad, setNoticesLoad] = useState(true);
  const [showNoticeM, setShowNoticeM] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate  = useNavigate();
  const pollTimer = useRef(null);

  const isAdmin   = user?.role === "admin";
  const isManager = user?.role === "manager";
  const canPost   = isAdmin || isManager;

  const fetchNotices = useCallback(async () => {
    try {
      const res = await API.get("/notices");
      setNotices(res.data);
    } catch (e) { console.error("notices:", e); }
    finally { setNoticesLoad(false); }
  }, []);

  const deleteNotice = async (id) => {
    try {
      await API.delete(`/notices/${id}`);
      setNotices(prev => prev.filter(n => n._id !== id));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    (async () => {
      try {
        const [sR, uR, tR] = await Promise.all([
          API.get("/dashboard/stats"),
          API.get("/users/me").catch(() => null),
          API.get("/tasks").catch(() => ({ data: [] })),   // ✅ fetch real tasks
        ]);

        setStats(sR.data);

        if (uR) {
          const u = uR.data?.user || uR.data;
          setUser(u);
          localStorage.setItem("user", JSON.stringify(u));
        }

        // ✅ Group tasks by status — matches your STATUS_META keys exactly
        const allTasks = Array.isArray(tR.data) ? tR.data
          : Array.isArray(tR.data?.tasks) ? tR.data.tasks : [];

        setKanban({
          todo:       allTasks.filter(t => t.status === "todo"),
          inProgress: allTasks.filter(t => t.status === "inProgress"),
          done:       allTasks.filter(t => t.status === "done"),
        });

      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();

    fetchNotices();
    pollTimer.current = setInterval(fetchNotices, 30_000);
    return () => clearInterval(pollTimer.current);
  }, [fetchNotices]);

  const doLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const rate   = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  const uName  = user?.name  || "User";
  const uRole  = user?.role  || "member";
  const uEmail = user?.email || "";
  const letter = uName.charAt(0).toUpperCase();

  const STAT_CARDS = [
    { label:"Total Projects",  value:stats.totalProjects,  icon:"🗂️", glow:"rgba(139,92,246,0.2)",  iconBg:"rgba(139,92,246,0.09)", bar:"linear-gradient(90deg,#8b5cf6,#6366f1)", barW:"72%",      foot:"Active & tracked" },
    { label:"Total Tasks",     value:stats.totalTasks,     icon:"📌", glow:"rgba(6,182,212,0.2)",   iconBg:"rgba(6,182,212,0.09)",  bar:"linear-gradient(90deg,#06b6d4,#0891b2)", barW:"58%",      foot:"Across all projects" },
    { label:"Completed Tasks", value:stats.completedTasks, icon:"🏆", glow:"rgba(16,185,129,0.2)",  iconBg:"rgba(16,185,129,0.09)", bar:"linear-gradient(90deg,#10b981,#059669)", barW:`${rate}%`, foot:`${rate}% completion rate` },
  ];

  const pinned   = notices.filter(n => n.pinned);
  const unpinned = notices.filter(n => !n.pinned);
  const displayNotices = [...pinned.slice(0, 2), ...unpinned.slice(0, Math.max(1, 3 - pinned.length))];

  // Priority tag styles for kanban cards
  const prioStyle = {
    low:    { cls:"kb-tag-low",    label:"Low" },
    medium: { cls:"kb-tag-medium", label:"Medium" },
    high:   { cls:"kb-tag-high",   label:"High" },
  };

  return (
    <>
      <style>{css}</style>
      <div className="dash-page">

        {/* ── MOBILE HAMBURGER ── */}
        <button className="db-hamburger" onClick={() => setSidebarOpen(true)}>
          <span /><span /><span />
        </button>
        {sidebarOpen && <div className="db-overlay db-ov-visible" onClick={() => setSidebarOpen(false)} />}

        {/* ── SIDEBAR ── */}
        <aside className={`dash-sidebar${sidebarOpen ? " sb-open" : ""}`}>
          <button className="db-close" onClick={() => setSidebarOpen(false)}>✕</button>
          <div className="sb-brand">
            <div className="sb-gem">⬡</div>
            <span className="sb-name">ProjectManager</span>
          </div>

          <nav className="sb-nav">
            <div className="sb-section">Main</div>
            <div className="sb-item active"><span className="sb-dot" /> Dashboard</div>
            <div className="sb-item" onClick={() => { navigate("/projects"); setSidebarOpen(false); }}>
              <span className="sb-dot" /> Projects
              <span className="sb-badge">{stats.totalProjects}</span>
            </div>
            <div className="sb-item" onClick={() => { navigate("/tasks"); setSidebarOpen(false); }}>
              <span className="sb-dot" /> Tasks
              <span className="sb-badge">{stats.totalTasks}</span>
            </div>
            {isAdmin && (
              <>
                <div className="sb-section">Admin</div>
                <div className="sb-item" onClick={() => { navigate("/admin/users"); setSidebarOpen(false); }}>
                  <span className="sb-dot" /> Manage Users
                </div>
              </>
            )}
          </nav>

          <div className="sb-spacer" />

          {/* ── DYNAMIC RECENT UPDATES ── */}
          <div className="sb-updates">
            <div className="sb-updates-header">
              <div className="sb-updates-title">
                <span className="sb-updates-dot" />
                Recent Updates
              </div>
              <span className="sb-updates-count">{notices.length}</span>
            </div>

            {noticesLoad ? (
              <div className="sb-updates-spin"><div className="sb-spin-ring" /></div>
            ) : displayNotices.length === 0 ? (
              <div className="sb-updates-empty">No updates yet</div>
            ) : (
              displayNotices.map((n, i) => {
                const bg     = (TYPE_META[n.type] || TYPE_META.notice).bg;
                const canDel = isAdmin || (isManager && String(n.postedBy) === String(user?._id));
                return (
                  <div key={n._id}
                    className={`sb-update-item${n.pinned ? " pinned-item" : ""}`}
                    style={{ animationDelay:`${i * 0.07}s` }}>
                    <div className="sb-update-icon" style={{ background: bg }}>{n.icon}</div>
                    <div className="sb-update-text">
                      <div className="sb-update-title">
                        {n.pinned && <span className="sb-pin-badge">📌</span>}
                        {n.title}
                      </div>
                      <div className="sb-update-sub">
                        {n.body || `by ${n.postedByName || "Team"}`}
                      </div>
                    </div>
                    <div className="sb-update-time">{timeAgo(n.createdAt)}</div>
                    {canDel && (
                      <button className="sb-update-del" title="Delete"
                        onClick={() => deleteNotice(n._id)}>✕</button>
                    )}
                  </div>
                );
              })
            )}

            {canPost && (
              <button className="sb-add-notice-btn" onClick={() => setShowNoticeM(true)}>
                + Float a notice
              </button>
            )}
          </div>

          <div className="sb-bottom">
            <div className="sb-user" onClick={() => setShowP(true)}>
              <div className="sb-avatar">{letter}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div className="sb-uname">{uName}</div>
                <div className="sb-urole">{uRole}</div>
              </div>
              <span className="sb-uarrow">↗</span>
            </div>
            <button className="sb-logout" onClick={() => setShowL(true)}>⎋ &nbsp;Sign out</button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="dash-main">
          <div className="topbar">
            <div>
              <div className="top-eyebrow">Overview</div>
              <h1 className="top-title">Your <em>Dashboard</em></h1>
              <div className="top-date">{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
            </div>
          </div>

          {loading ? (
            <div className="dash-loader">
              <div className="loader-ring" />
              <span className="loader-txt">Loading your workspace…</span>
            </div>
          ) : (
            <div className="dash-grid">
              {/* ── STAT CARDS ── */}
              {STAT_CARDS.map((c, i) => (
                <div key={i} className="glass stat-card" style={{"--glow":c.glow,"--icon-bg":c.iconBg,"--bar-color":c.bar}}>
                  <div className="stat-card-top">
                    <div className="stat-icon">{c.icon}</div>
                    <div className="live-pill"><span className="live-dot"/>Live</div>
                  </div>
                  <div className="stat-num">{c.value}</div>
                  <div className="stat-lbl">{c.label}</div>
                  <div className="stat-bar-wrap">
                    <div className="stat-bar" style={{width:c.barW,background:c.bar}} />
                  </div>
                  <div className="stat-footer">→ {c.foot}</div>
                </div>
              ))}

              {/* ── PROGRESS CARD ── */}
              <div className="glass progress-card">
                <div className="pc-head">
                  <div>
                    <div className="pc-title">Overall Completion</div>
                    <div className="pc-sub">Aggregated task progress across all projects</div>
                  </div>
                  <div className="pc-rate">{rate}%</div>
                </div>
                <div className="prog-track">
                  {/* ✅ Uses real rate calculated from actual completedTasks / totalTasks */}
                  <div className="prog-fill" style={{width: rate > 0 ? `${rate}%` : "2px"}} />
                </div>
                <div className="prog-labels">
                  <span><strong>{stats.completedTasks}</strong> tasks done</span>
                  <span><strong>{stats.totalTasks - stats.completedTasks}</strong> remaining</span>
                </div>
                <div className="prog-milestones">
                  {[["🚀","Kickoff","#10b981"],["🎨","Design","#8b5cf6"],["🔧","Build","#06b6d4"],["🚢","Launch","#f59e0b"]].map(([e,l,c])=>(
                    <div key={l} className="milestone">
                      <span className="milestone-dot" style={{background:c}}/>
                      {e} {l}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── KANBAN CARD — real data ── */}
              <div className="glass kanban-card">
                <div className="kb-head">
                  <div className="kb-title">Task Board</div>
                  <button className="btn-grad" style={{padding:"7px 16px",fontSize:12}} onClick={() => navigate("/tasks")}>
                    Full Board →
                  </button>
                </div>
                <div className="kb-cols">
                  {[
                    { key:"todo",       label:"To Do",       cls:"kb-col-todo", data: kanban.todo       },
                    { key:"inProgress", label:"In Progress", cls:"kb-col-prog", data: kanban.inProgress },
                    { key:"done",       label:"Done",        cls:"kb-col-done", data: kanban.done       },
                  ].map(col => (
                    <div key={col.key} className={`kb-col ${col.cls}`}>
                      <div className="kb-col-head">
                        <span className="kb-col-title">{col.label}</span>
                        <span className="kb-count">{col.data.length}</span>
                      </div>
                      {col.data.length === 0 ? (
                        <div className="kb-empty">Nothing here yet</div>
                      ) : (
                        // Show max 4 tasks per column to keep dashboard clean
                        col.data.slice(0, 4).map((t, i) => {
                          const prio = prioStyle[t.priority] || prioStyle.medium;
                          const assignees = (t.assignedTo || []).slice(0, 3);
                          return (
                            <div key={t._id || i} className="kb-task" onClick={() => navigate("/tasks")}>
                              <div className="kb-task-title">{t.title}</div>
                              <div className="kb-task-meta">
                                <span className={`kb-tag ${prio.cls}`}>{prio.label}</span>
                                <div className="kb-avatar-row">
                                  {assignees.map((u, j) => (
                                    <div key={j} className="kb-mini-av">
                                      {(u.name || "?")[0].toUpperCase()}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      {col.data.length > 4 && (
                        <div style={{fontSize:11,color:"#94a3b8",textAlign:"center",marginTop:4}}>
                          +{col.data.length - 4} more
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {showNoticeM && (
        <NoticeModal
          onClose={() => setShowNoticeM(false)}
          onPosted={fetchNotices}
          userRole={uRole}
        />
      )}

      {showP && (
        <div className="modal-veil" onClick={() => setShowP(false)}>
          <div className="modal-glass" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">Your Profile</span>
              <button className="modal-x" onClick={() => setShowP(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="big-avatar">{letter}</div>
              <div className="p-fields">
                {[["Full Name", uName], ["Email", uEmail || "—"]].map(([l, v]) => (
                  <div key={l} className="p-field">
                    <div className="p-lbl">{l}</div>
                    <div className="p-val">{v}</div>
                  </div>
                ))}
                <div className="p-field">
                  <div className="p-lbl">Role</div>
                  <div className="p-val"><span className="role-chip">{uRole}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showL && (
        <div className="modal-veil" onClick={() => setShowL(false)}>
          <div className="confirm-glass" onClick={e => e.stopPropagation()}>
            <div className="confirm-emoji">👋</div>
            <div className="confirm-title">Signing out?</div>
            <div className="confirm-text">You'll be taken back to the login screen. See you soon!</div>
            <div className="confirm-btns">
              <button className="btn-stay" onClick={() => setShowL(false)}>Stay</button>
              <button className="btn-bye"  onClick={doLogout}>Yes, sign out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
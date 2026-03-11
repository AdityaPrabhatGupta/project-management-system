import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,wght@0,300;0,600;1,300;1,600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .login-page {
    min-height: 100vh; width: 100%; display: flex;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #f0f4ff; position: relative; overflow: hidden;
  }

  .login-page::before {
    content: ''; position: fixed; inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 20% 10%, rgba(139,92,246,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 80%, rgba(6,182,212,0.15) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 60% 30%, rgba(249,115,22,0.08) 0%, transparent 60%),
      linear-gradient(135deg, #eef2ff 0%, #f0f9ff 50%, #fdf4ff 100%);
    z-index: 0; animation: meshShift 12s ease-in-out infinite alternate;
  }

  @keyframes meshShift { 0%{filter:hue-rotate(0deg) brightness(1)} 100%{filter:hue-rotate(15deg) brightness(1.03)} }

  .blob { position: fixed; border-radius: 50%; filter: blur(60px); opacity: 0.5; z-index: 0; animation: blobFloat 8s ease-in-out infinite alternate; }
  .blob-1 { width: 500px; height: 500px; top: -150px; left: -100px; background: radial-gradient(circle, rgba(139,92,246,0.3), rgba(99,102,241,0.1)); animation-delay: 0s; }
  .blob-2 { width: 400px; height: 400px; bottom: -100px; right: 20%; background: radial-gradient(circle, rgba(6,182,212,0.25), rgba(14,165,233,0.1)); animation-delay: -3s; }
  .blob-3 { width: 300px; height: 300px; top: 40%; right: -80px; background: radial-gradient(circle, rgba(249,115,22,0.2), rgba(251,146,60,0.05)); animation-delay: -5s; }
  @keyframes blobFloat { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(30px,-40px) scale(1.08)} }

  .login-left { flex: 1.1; display: flex; flex-direction: column; justify-content: center; padding: 60px 80px; position: relative; z-index: 1; }

  .brand-row { display: flex; align-items: center; gap: 12px; margin-bottom: 80px; animation: slideDown 0.6s cubic-bezier(0.16,1,0.3,1) both; }
  .brand-gem { width: 42px; height: 42px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 8px 24px rgba(139,92,246,0.35); }
  .brand-text { font-size: 17px; font-weight: 700; color: #1e1b4b; letter-spacing: -0.4px; }

  .hero-area { animation: slideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
  .hero-tag { display: inline-flex; align-items: center; gap: 8px; background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.2); color: #7c3aed; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; padding: 6px 14px; border-radius: 100px; margin-bottom: 24px; }
  .hero-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: #8b5cf6; animation: ping 2s ease-in-out infinite; }
  @keyframes ping { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:0.6} }

  .hero-title { font-family: 'Fraunces', serif; font-size: 58px; font-weight: 600; color: #1e1b4b; line-height: 1.05; letter-spacing: -2px; margin-bottom: 22px; }
  .hero-title em { font-style: italic; font-weight: 300; background: linear-gradient(135deg, #8b5cf6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .hero-sub { font-size: 16px; color: #64748b; line-height: 1.8; max-width: 400px; font-weight: 400; }

  .stats-strip { display: flex; gap: 0; margin-top: 64px; animation: slideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
  .stat-pill { display: flex; flex-direction: column; gap: 4px; padding: 0 32px 0 0; border-right: 1px solid rgba(139,92,246,0.15); margin-right: 32px; }
  .stat-pill:last-child { border-right: none; margin-right: 0; }
  .stat-num { font-family: 'Fraunces', serif; font-size: 32px; font-weight: 600; color: #1e1b4b; letter-spacing: -1px; }
  .stat-lbl { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }

  .login-right { width: 500px; display: flex; align-items: center; justify-content: center; padding: 40px; position: relative; z-index: 1; }

  .glass-card { width: 100%; max-width: 400px; background: rgba(255,255,255,0.72); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%); border: 1px solid rgba(255,255,255,0.9); border-radius: 24px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.02), 0 12px 40px rgba(139,92,246,0.08), 0 40px 80px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9); animation: cardEntrance 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
  @keyframes cardEntrance { from{opacity:0;transform:translateY(30px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }

  .card-title { font-family: 'Fraunces', serif; font-size: 26px; font-weight: 600; color: #1e1b4b; letter-spacing: -0.6px; margin-bottom: 6px; }
  .card-sub { font-size: 13px; color: #94a3b8; margin-bottom: 32px; font-weight: 400; }
  .card-sub-link { color: #7c3aed; cursor: pointer; font-weight: 600; text-decoration: none; transition: color 0.2s; }
  .card-sub-link:hover { color: #6d28d9; }

  .field { margin-bottom: 16px; }
  .field-label { display: block; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .input-shell { position: relative; display: flex; align-items: center; }
  .input-prefix { position: absolute; left: 14px; font-size: 15px; pointer-events: none; z-index: 1; opacity: 0.4; }

  .glass-input { width: 100%; background: rgba(255,255,255,0.6); border: 1.5px solid rgba(203,213,225,0.8); border-radius: 12px; padding: 12px 14px 12px 42px; font-size: 14px; color: #1e1b4b; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; transition: all 0.25s cubic-bezier(0.16,1,0.3,1); backdrop-filter: blur(8px); }
  .glass-input:focus { border-color: rgba(139,92,246,0.6); background: rgba(255,255,255,0.9); box-shadow: 0 0 0 4px rgba(139,92,246,0.1), 0 2px 8px rgba(139,92,246,0.08); transform: translateY(-1px); }
  .glass-input::placeholder { color: #cbd5e1; }

  .glass-select { width: 100%; background: rgba(255,255,255,0.6); border: 1.5px solid rgba(203,213,225,0.8); border-radius: 12px; padding: 12px 14px; font-size: 14px; color: #1e1b4b; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; cursor: pointer; transition: all 0.25s; appearance: none; }
  .glass-select:focus { border-color: rgba(139,92,246,0.6); box-shadow: 0 0 0 4px rgba(139,92,246,0.1); }

  /* Role badge shown after login */
  .role-banner { display: flex; align-items: center; gap: 8px; background: rgba(139,92,246,0.06); border: 1px solid rgba(139,92,246,0.15); border-radius: 10px; padding: 10px 14px; font-size: 12px; color: #7c3aed; margin-bottom: 14px; font-weight: 600; }
  .role-dot { width: 6px; height: 6px; border-radius: 50%; background: #8b5cf6; }

  .error-pill { display: flex; align-items: center; gap: 8px; background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2); border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #dc2626; margin-bottom: 14px; animation: shake 0.4s cubic-bezier(0.36,0.07,0.19,0.97); }
  @keyframes shake { 10%,90%{transform:translateX(-2px)} 20%,80%{transform:translateX(3px)} 30%,70%{transform:translateX(-3px)} 40%,60%{transform:translateX(2px)} 50%{transform:translateX(-2px)} }

  .btn-main { width: 100%; padding: 14px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%); border: none; border-radius: 12px; color: #fff; font-size: 14px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; margin-top: 8px; position: relative; overflow: hidden; transition: all 0.3s cubic-bezier(0.16,1,0.3,1); letter-spacing: 0.3px; box-shadow: 0 4px 15px rgba(99,102,241,0.35); }
  .btn-main::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent); opacity: 0; transition: opacity 0.3s; }
  .btn-main:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99,102,241,0.45); }
  .btn-main:hover::after { opacity: 1; }
  .btn-main:active { transform: translateY(0); }
  .btn-main:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

  .btn-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 8px; vertical-align: middle; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
  .divider-line { flex: 1; height: 1px; background: rgba(203,213,225,0.6); }
  .divider-text { font-size: 11px; color: #cbd5e1; text-transform: uppercase; letter-spacing: 1px; }

  .btn-ghost { width: 100%; padding: 13px; background: rgba(255,255,255,0.5); border: 1.5px solid rgba(203,213,225,0.8); border-radius: 12px; color: #64748b; font-size: 13px; font-weight: 500; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.25s; backdrop-filter: blur(8px); }
  .btn-ghost:hover { background: rgba(255,255,255,0.8); border-color: rgba(139,92,246,0.3); color: #7c3aed; transform: translateY(-1px); }

  @keyframes slideDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideUp   { from{opacity:0;transform:translateY(24px)}  to{opacity:1;transform:translateY(0)} }

  /* ── MOBILE ── */
  @media (max-width: 768px) {
    .login-page { flex-direction:column; }
    .login-left { display:none; }
    .login-right { width:100%; min-height:100vh; padding:24px 20px; align-items:flex-start; padding-top:48px; }
    .glass-card { max-width:100%; }
  }
  @media (max-width: 480px) {
    .glass-card { padding:28px 20px; }
    .card-title { font-size:22px; }
  }
`;

// Roles are assigned by admin only — registration always creates an employee

export default function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  // role is always "employee" — admin assigns roles later
  const [isReg,    setIsReg]    = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const navigate = useNavigate();

  const toggle = () => { setIsReg(p => !p); setError(""); };

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      if (isReg) {
        await API.post("/users/register", { name, email, password, role: "employee" });
        alert("Account created! Please sign in.");
        toggle();
      } else {
        const res = await API.post("/users/login", { email, password });

        // ── FIXED: save both token AND user object ──
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user",  JSON.stringify(res.data.user));
        // ────────────────────────────────────────────

        navigate("/dashboard");
      }
    } catch (e) {
      setError(e.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onKey = e => e.key === "Enter" && handleSubmit();

  return (
    <>
      <style>{css}</style>
      <div className="login-page">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        {/* LEFT */}
        <div className="login-left">
          <div className="brand-row">
            <div className="brand-gem">⬡</div>
            <span className="brand-text">ProjectManager</span>
          </div>

          <div className="hero-area">
            <div className="hero-tag">
              <span className="hero-tag-dot" />
              Project Management
            </div>
            <h1 className="hero-title">
              Build great<br />
              things <em>together.</em>
            </h1>
            <p className="hero-sub">
              One elegant workspace to plan projects, assign tasks, and track everything — beautifully.
            </p>
          </div>

          <div className="stats-strip">
            {[["3×","Faster delivery"],["100%","Visibility"],["Zero","Missed deadlines"]].map(([v,l]) => (
              <div key={l} className="stat-pill">
                <span className="stat-num">{v}</span>
                <span className="stat-lbl">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="login-right">
          <div className="glass-card">
            <h2 className="card-title">{isReg ? "Create account" : "Welcome !"}</h2>
            <p className="card-sub">
              {isReg ? "Already have an account? " : "No account yet? "}
              <span className="card-sub-link" onClick={toggle}>
                {isReg ? "Sign in" : "Sign up free"}
              </span>
            </p>

            {isReg && (
              <div className="field">
                <label className="field-label">Full Name</label>
                <div className="input-shell">
                  <span className="input-prefix">👤</span>
                  <input className="glass-input" placeholder="Jane Smith"
                    value={name} onChange={e => setName(e.target.value)} onKeyDown={onKey} />
                </div>
              </div>
            )}

            <div className="field">
              <label className="field-label">Email</label>
              <div className="input-shell">
                <span className="input-prefix">✉</span>
                <input className="glass-input" placeholder="you@company.com"
                  value={email} onChange={e => setEmail(e.target.value)} onKeyDown={onKey} />
              </div>
            </div>

            <div className="field">
              <label className="field-label">Password</label>
              <div className="input-shell">
                <span className="input-prefix">🔑</span>
                <input type="password" className="glass-input" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} onKeyDown={onKey} />
              </div>
            </div>

            {error && <div className="error-pill">⚠ {error}</div>}

            <button className="btn-main" onClick={handleSubmit} disabled={loading}>
              {loading && <span className="btn-spinner" />}
              {loading ? "Please wait…" : isReg ? "Create Account →" : "Sign In →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
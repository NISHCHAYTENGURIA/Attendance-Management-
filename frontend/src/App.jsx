import { useState, useEffect, useRef } from "react";
import AttendanceTracker from "./AttendanceTracker";

const INITIAL_USERS = [
  { id: "1", name: "Arjun Sharma", email: "student1@demo.com", password: "student123", role: "student", rollNumber: "CS21B042", department: "Computer Science", approved: true },
  { id: "2", name: "Priya Singh", email: "student2@demo.com", password: "student123", role: "student", rollNumber: "CS21B089", department: "Computer Science", approved: true },
  { id: "3", name: "Parth Maheshwari", email: "student3@demo.com", password: "student123", role: "student", rollNumber: "CS21B059", department: "Computer Science", approved: true },
  { id: "4", name: "NishChaye Tenguriya", email: "student4@demo.com", password: "student123", role: "student", rollNumber: "CS21B087", department: "Computer Science", approved: true },
  { id: "5", name: "Prof. Shiv Kumar Verma", email: "teacher@demo.com", password: "teacher123", role: "teacher", department: "Computer Science", approved: true },
  { id: "6", name: "Yash Sharma", email: "admin@demo.com", password: "admin123", role: "admin", department: "Administration", approved: true },
];

function CustomCursor() {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);
  useEffect(() => {
    const move = (e) => {
      if (cursorRef.current) { cursorRef.current.style.left = e.clientX + "px"; cursorRef.current.style.top = e.clientY + "px"; }
      setTimeout(() => { if (followerRef.current) { followerRef.current.style.left = e.clientX + "px"; followerRef.current.style.top = e.clientY + "px"; } }, 80);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return (
    <>
      <div ref={cursorRef} style={{ position: "fixed", pointerEvents: "none", zIndex: 99999, width: 8, height: 8, borderRadius: "50%", background: "#7c3aed", transform: "translate(-50%, -50%)", boxShadow: "0 0 10px #7c3aed, 0 0 20px rgba(124,58,237,0.5)" }} />
      <div ref={followerRef} style={{ position: "fixed", pointerEvents: "none", zIndex: 99998, width: 28, height: 28, borderRadius: "50%", border: "1.5px solid rgba(124,58,237,0.5)", transform: "translate(-50%, -50%)", transition: "left 0.1s ease, top 0.1s ease" }} />
    </>
  );
}

// ============================================================
// 📝 REGISTER PAGE
// ============================================================
function RegisterPage({ onBack, onRegister }) {
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", rollNumber: "", department: "", semester: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.password) { setError("Name, email and password are required!"); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match!"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters!"); return; }
    const newUser = {
      id: Date.now().toString(),
      name: form.name, email: form.email, password: form.password,
      role, rollNumber: form.rollNumber, department: form.department,
      semester: form.semester, approved: false,
      registeredAt: new Date().toISOString(),
    };
    onRegister(newUser);
    setSuccess(true);
  };

  if (success) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; cursor: none !important; }`}</style>
      <div style={{ width: "100vw", height: "100vh", background: "radial-gradient(ellipse at 30% 50%, #1a0040 0%, #0a0015 60%, #000008 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Poppins', sans-serif" }}>
        <div style={{ textAlign: "center", animation: "fadeUp 0.5s ease both" }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>⏳</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "white", marginBottom: 8 }}>Registration Submitted!</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 24, maxWidth: 320 }}>
            Your request has been sent to admin. You can login after approval.
          </div>
          <button onClick={onBack} style={{ padding: "12px 32px", borderRadius: 25, background: "linear-gradient(135deg, #7c3aed, #4c1d95)", border: "none", color: "white", fontSize: 14, fontWeight: 600, cursor: "none", fontFamily: "'Poppins', sans-serif" }}>
            Go to Login
          </button>
        </div>
      </div>
    </>
  );

  const inputStyle = { width: "100%", padding: "10px 0", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.15)", color: "white", fontSize: 13, fontFamily: "'Poppins', sans-serif", outline: "none", marginBottom: 16 };
  const labelStyle = { fontSize: 10, fontWeight: 600, color: "rgba(124,58,237,0.8)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2, display: "block" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; cursor: none !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 25px rgba(124,58,237,0.4); } 50% { box-shadow: 0 0 40px rgba(124,58,237,0.7); } }
        input::placeholder { color: rgba(255,255,255,0.25); }
        input:focus { border-bottom-color: #7c3aed !important; }
        select option { background: #1a0040; }
      `}</style>
      <div style={{ width: "100vw", height: "100vh", background: "radial-gradient(ellipse at 30% 50%, #1a0040 0%, #0a0015 60%, #000008 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Poppins', sans-serif", padding: 20 }}>
        <div style={{ width: "100%", maxWidth: 500, background: "linear-gradient(135deg, #0d0020, #1e0845)", border: "1px solid rgba(124,58,237,0.4)", borderRadius: 20, padding: 36, animation: "glow 3s ease-in-out infinite, fadeUp 0.5s ease both" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "none", fontSize: 13, marginBottom: 20, display: "flex", alignItems: "center", gap: 6, fontFamily: "'Poppins', sans-serif" }}>
            ← Back to Login
          </button>
          <div style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 4 }}>Register</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>Login available after admin approval</div>

          {/* Role */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {["student", "teacher"].map(r => (
              <button key={r} onClick={() => setRole(r)}
                style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${role === r ? "rgba(124,58,237,0.7)" : "rgba(255,255,255,0.1)"}`, background: role === r ? "rgba(124,58,237,0.25)" : "transparent", color: role === r ? "white" : "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: 600, cursor: "none", fontFamily: "'Poppins', sans-serif", textTransform: "capitalize" }}>
                {r}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <div><label style={labelStyle}>Full Name *</label><input style={inputStyle} placeholder="Enter Full name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><label style={labelStyle}>Email *</label><input style={inputStyle} type="email" placeholder="Enter email..." value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
            <div><label style={labelStyle}>Password *</label><input style={inputStyle} type="password" placeholder="Enter password..." value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>
            <div><label style={labelStyle}>Confirm Password *</label><input style={inputStyle} type="password" placeholder="Confirm password..." value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} /></div>
            <div><label style={labelStyle}>Department</label><input style={inputStyle} placeholder="e.g. Computer Science" value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></div>
            {role === "student" && <div><label style={labelStyle}>Roll Number</label><input style={inputStyle} placeholder="e.g. CS21B099" value={form.rollNumber} onChange={e => setForm({...form, rollNumber: e.target.value})} /></div>}
            {role === "student" && (
              <div style={{ gridColumn: "1/-1" }}>
                <label style={labelStyle}>Semester</label>
                <select value={form.semester} onChange={e => setForm({...form, semester: e.target.value})}
                  style={{ ...inputStyle, cursor: "none" }}>
                  <option value="">Select Semester</option>
                  {["I","II","III","IV","V","VI","VII","VIII"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>

          {error && <div style={{ fontSize: 12, color: "#f87171", marginBottom: 12 }}>⚠ {error}</div>}

          <button onClick={handleSubmit}
            style={{ width: "100%", padding: "13px", borderRadius: 25, background: "linear-gradient(135deg, #7c3aed, #4c1d95)", border: "none", color: "white", fontSize: 14, fontWeight: 600, cursor: "none", fontFamily: "'Poppins', sans-serif", marginTop: 8 }}>
            Submit Registration →
          </button>
        </div>
      </div>
    </>
  );
}

// ============================================================
// 🔐 LOGIN PAGE
// ============================================================
function LoginPage({ onLogin, onRegister, pendingRegistrations }) {
  const [activeRole, setActiveRole] = useState("student");
  const [email, setEmail] = useState("student1@demo.com");
  const [password, setPassword] = useState("student123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [vanish, setVanish] = useState(false);
  const [logoReady, setLogoReady] = useState(false);
  const [formReady, setFormReady] = useState(false);

  useEffect(() => {
    setTimeout(() => setLogoReady(true), 200);
    setTimeout(() => setFormReady(true), 600);
  }, []);

  const handleRoleSelect = (role) => {
    setActiveRole(role);
    setError("");
    if (role === "student") { setEmail("student1@demo.com"); setPassword("student123"); }
    if (role === "teacher") { setEmail("teacher@demo.com"); setPassword("teacher123"); }
    if (role === "admin") { setEmail("admin@demo.com"); setPassword("admin123"); }
  };

  const handleLogin = () => {
    setError("");
    if (!email || !password) { setError("Email aur password dono bharo!"); return; }
    setLoading(true);
    setTimeout(() => {
      const result = onLogin(email, password, activeRole);
      if (!result.success) { setError(result.message); setLoading(false); return; }
      setVanish(true);
    }, 600);
  };

  const roles = [{ id: "student", label: "Student" }, { id: "teacher", label: "Teacher" }, { id: "admin", label: "Admin" }];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; cursor: none !important; }
        @keyframes logoPop { 0% { transform: scale(0) rotate(-180deg); opacity: 0; } 60% { transform: scale(1.2) rotate(10deg); opacity: 1; } 80% { transform: scale(0.9) rotate(-5deg); } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
        @keyframes slideInLeft { from { transform: translateX(-60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes shimmer { 0% { left: -100%; } 100% { left: 200%; } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 25px rgba(124,58,237,0.4), 0 0 50px rgba(124,58,237,0.15); } 50% { box-shadow: 0 0 35px rgba(124,58,237,0.7), 0 0 70px rgba(124,58,237,0.3); } }
        @keyframes vanishOut { 0% { transform: scale(1); opacity: 1; filter: blur(0); } 100% { transform: scale(1.1); opacity: 0; filter: blur(20px); } }
        @keyframes bgPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .login-card { display: flex; width: 860px; max-width: 95vw; height: 480px; border-radius: 20px; overflow: hidden; border: 1px solid rgba(124,58,237,0.45); animation: glow 3s ease-in-out infinite; position: relative; }
        .login-card.vanish { animation: vanishOut 0.7s ease forwards !important; }
        .left-panel { width: 42%; background: linear-gradient(135deg, #0d001f 0%, #1a0040 100%); display: flex; flex-direction: column; justify-content: center; padding: 44px 40px; position: relative; overflow: hidden; clip-path: polygon(0 0, 88% 0, 100% 100%, 0 100%); }
        .left-panel::after { content: ''; position: absolute; top: 0; left: -100%; width: 60%; height: 100%; background: linear-gradient(90deg, transparent, rgba(124,58,237,0.08), transparent); animation: shimmer 4s ease-in-out infinite; }
        .right-panel { flex: 1; background: linear-gradient(150deg, #0d0020 0%, #180840 60%, #220d55 100%); display: flex; flex-direction: column; justify-content: center; padding: 44px 44px 44px 54px; }
        .login-input { width: 100%; padding: 10px 0; background: transparent; border: none; border-bottom: 1px solid rgba(255,255,255,0.15); color: white; font-size: 14px; font-family: 'Poppins', sans-serif; outline: none; transition: border-color 0.3s ease; }
        .login-input:focus { border-bottom-color: #7c3aed; }
        .login-input::placeholder { color: rgba(255,255,255,0.25); font-size: 13px; }
        .login-input-wrap { position: relative; margin-bottom: 18px; }
        .input-label { font-size: 10px; font-weight: 600; color: rgba(124,58,237,0.8); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px; font-family: 'Poppins', sans-serif; }
        .input-line { position: absolute; bottom: 0; left: 0; height: 1px; width: 0; background: #7c3aed; transition: width 0.3s ease; }
        .login-input:focus ~ .input-line { width: 100%; }
        .login-btn { width: 100%; padding: 12px; background: linear-gradient(135deg, #7c3aed, #4c1d95); border: none; border-radius: 25px; color: white; font-size: 14px; font-weight: 600; font-family: 'Poppins', sans-serif; cursor: none; transition: all 0.3s ease; margin-bottom: 14px; position: relative; overflow: hidden; }
        .login-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(124,58,237,0.5); }
        .login-btn::after { content: ''; position: absolute; top: -50%; left: -60%; width: 40%; height: 200%; background: rgba(255,255,255,0.12); transform: skewX(-20deg); transition: left 0.6s ease; }
        .login-btn:hover::after { left: 130%; }
        .role-tab { flex: 1; padding: 7px 4px; background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: rgba(255,255,255,0.35); font-size: 11px; font-weight: 600; font-family: 'Poppins', sans-serif; cursor: none; transition: all 0.25s ease; }
        .role-tab.active { background: rgba(124,58,237,0.35); border-color: rgba(124,58,237,0.7); color: white; }
        .role-tab:hover:not(.active) { border-color: rgba(124,58,237,0.4); color: rgba(255,255,255,0.6); }
      `}</style>

      <div style={{ width: "100vw", height: "100vh", background: "radial-gradient(ellipse at 30% 50%, #1a0040 0%, #0a0015 60%, #000008 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Poppins', sans-serif", overflow: "hidden", position: "relative" }}>
        {[{ w: 300, h: 300, top: "10%", left: "5%", delay: "0s" }, { w: 200, h: 200, top: "60%", right: "8%", delay: "1s" }, { w: 150, h: 150, top: "20%", right: "20%", delay: "2s" }].map((o, i) => (
          <div key={i} style={{ position: "absolute", width: o.w, height: o.h, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)", top: o.top, left: o.left, right: o.right, animation: `bgPulse ${3 + i}s ease-in-out infinite`, animationDelay: o.delay }} />
        ))}

        <div className={`login-card ${vanish ? "vanish" : ""}`}>
          {/* LEFT */}
          <div className="left-panel">
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #7c3aed, #4c1d95)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 20, boxShadow: "0 8px 30px rgba(124,58,237,0.5)", animation: logoReady ? "logoPop 0.8s cubic-bezier(0.34,1.56,0.64,1) both" : "none", opacity: logoReady ? 1 : 0 }}>⬡</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(124,58,237,0.7)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10, animation: formReady ? "slideInLeft 0.5s ease both" : "none", opacity: formReady ? 1 : 0 }}>AttendX System</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: "white", lineHeight: 1.15, marginBottom: 12, textTransform: "uppercase", animation: formReady ? "slideInLeft 0.5s ease 0.1s both" : "none", opacity: formReady ? 1 : 0, animationFillMode: "both" }}>WELCOME<br />BACK!</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.7, animation: formReady ? "slideInLeft 0.5s ease 0.2s both" : "none", opacity: formReady ? 1 : 0, animationFillMode: "both" }}>Track, manage & analyze attendance seamlessly.</div>
              <div style={{ marginTop: 28, fontSize: 10, color: "rgba(255,255,255,0.15)", fontStyle: "italic" }}>Developed by Yash Sharma</div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="right-panel">
            <div style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 16, animation: formReady ? "slideInRight 0.5s ease both" : "none", opacity: formReady ? 1 : 0 }}>Login</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 20, animation: formReady ? "slideInRight 0.5s ease 0.1s both" : "none", opacity: formReady ? 1 : 0, animationFillMode: "both" }}>
              {roles.map(r => (
                <button key={r.id} className={`role-tab ${activeRole === r.id ? "active" : ""}`} onClick={() => handleRoleSelect(r.id)}>{r.label}</button>
              ))}
            </div>
            <div style={{ animation: formReady ? "slideInRight 0.5s ease 0.2s both" : "none", opacity: formReady ? 1 : 0, animationFillMode: "both" }}>
              <div className="input-label">Email</div>
              <div className="login-input-wrap">
                <input className="login-input" type="email" placeholder="Enter email..." value={email} onChange={e => { setEmail(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && handleLogin()} />
                <div className="input-line" />
              </div>
            </div>
            <div style={{ animation: formReady ? "slideInRight 0.5s ease 0.3s both" : "none", opacity: formReady ? 1 : 0, animationFillMode: "both" }}>
              <div className="input-label">Password</div>
              <div className="login-input-wrap">
                <input className="login-input" type="password" placeholder="Enter password..." value={password} onChange={e => { setPassword(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && handleLogin()} />
                <div className="input-line" />
              </div>
            </div>
            {error && <div style={{ fontSize: 11, color: "#f87171", marginBottom: 10 }}>⚠ {error}</div>}
            <div style={{ animation: formReady ? "slideInRight 0.5s ease 0.4s both" : "none", opacity: formReady ? 1 : 0, animationFillMode: "both" }}>
              <button className="login-btn" onClick={handleLogin} disabled={loading}>{loading ? "Logging in..." : "Login →"}</button>
            </div>
            <div style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)", animation: formReady ? "slideInRight 0.5s ease 0.5s both" : "none", opacity: formReady ? 1 : 0, animationFillMode: "both" }}>
              Demo: <span style={{ color: "rgba(124,58,237,0.7)", fontWeight: 600 }}>{activeRole}@demo.com / {activeRole}123</span>
            </div>
            <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "rgba(255,255,255,0.25)", animation: formReady ? "slideInRight 0.5s ease 0.6s both" : "none", opacity: formReady ? 1 : 0, animationFillMode: "both" }}>
              New here?{" "}
              <span onClick={onRegister} style={{ color: "#7c3aed", cursor: "none", fontWeight: 600 }}>Register</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================
// 🏠 MAIN APP
// ============================================================
export default function App() {
  const [users, setUsers] = useState(() => {
    try { return JSON.parse(localStorage.getItem("attendx_all_users")) || INITIAL_USERS; }
    catch { return INITIAL_USERS; }
  });
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("attendx_user")); }
    catch { return null; }
  });
  const [page, setPage] = useState("login"); // login | register

  const saveUsers = (updated) => {
    setUsers(updated);
    localStorage.setItem("attendx_all_users", JSON.stringify(updated));
  };

  const handleLogin = (email, password, role) => {
    const found = users.find(u => u.email === email && u.password === password && u.role === role);
    if (!found) return { success: false, message: "Email, password ya role galat hai!" };
    if (!found.approved) return { success: false, message: "Aapka account abhi admin se approve nahi hua!" };
    localStorage.setItem("attendx_user", JSON.stringify(found));
    setTimeout(() => setUser(found), 800);
    return { success: true };
  };

  const handleRegister = (newUser) => {
    saveUsers([...users, newUser]);
    setPage("login");
  };

  const handleLogout = () => {
    localStorage.removeItem("attendx_user");
    setUser(null);
    setPage("login");
  };

  const pendingRegistrations = users.filter(u => !u.approved).length;

  return (
    <>
      <style>{`
        @keyframes dashboardEnter { from { opacity: 0; filter: blur(20px); transform: scale(0.95); } to { opacity: 1; filter: blur(0); transform: scale(1); } }
        .dashboard-enter { animation: dashboardEnter 0.6s ease both; }
      `}</style>
      <CustomCursor />
      {!user ? (
        page === "register"
          ? <RegisterPage onBack={() => setPage("login")} onRegister={handleRegister} />
          : <LoginPage onLogin={handleLogin} onRegister={() => setPage("register")} pendingRegistrations={pendingRegistrations} />
      ) : (
        <div className="dashboard-enter">
          <AttendanceTracker user={user} onLogout={handleLogout} allUsers={users} saveUsers={saveUsers} pendingRegistrations={pendingRegistrations} />
        </div>
      )}
    </>
  );
}

import { useState } from "react";
import { supabase } from "./supabase";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      background: "#f0efed",
    }}>
      {/* Left panel — logo/branding */}
      <div style={{
        flex: 1,
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        borderRight: "0.5px solid rgba(0,0,0,0.10)",
      }}>
        <img
          src="/logo.jpeg"
          alt="Restoran Khan Jee"
          style={{
            width: "100%",
            maxWidth: 380,
            objectFit: "contain",
          }}
        />
        <p style={{
          marginTop: 24,
          fontSize: 14,
          color: "#888",
          textAlign: "center",
          letterSpacing: "0.5px",
        }}>
          Warehouse Inventory Management System
        </p>
      </div>

      {/* Right panel — login form */}
      <div style={{
        width: 420,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 48px",
        background: "#ffffff",
      }}>
        {/* Small logo above form */}
        <img
          src="/logo.jpeg"
          alt="Khan Jee"
          style={{
            width: 110,
            objectFit: "contain",
            marginBottom: 28,
          }}
        />

        <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 4px", color: "#1a1a18" }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 13, color: "#888", margin: "0 0 28px" }}>
          Sign in to your warehouse account
        </p>

        <form onSubmit={handleLogin} style={{ width: "100%" }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 5, fontWeight: 500 }}>
              Email address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "0.5px solid rgba(0,0,0,0.22)",
                borderRadius: 8,
                fontSize: 13,
                background: "#fff",
                color: "#1a1a18",
                boxSizing: "border-box",
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={e => e.target.style.borderColor = "#1D9E75"}
              onBlur={e  => e.target.style.borderColor = "rgba(0,0,0,0.22)"}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 5, fontWeight: 500 }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "0.5px solid rgba(0,0,0,0.22)",
                borderRadius: 8,
                fontSize: 13,
                background: "#fff",
                color: "#1a1a18",
                boxSizing: "border-box",
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={e => e.target.style.borderColor = "#1D9E75"}
              onBlur={e  => e.target.style.borderColor = "rgba(0,0,0,0.22)"}
            />
          </div>

          {error && (
            <div style={{
              background: "#FCEBEB",
              border: "0.5px solid #f5c6c6",
              borderRadius: 8,
              padding: "9px 12px",
              fontSize: 13,
              color: "#A32D2D",
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "11px",
              background: loading ? "#7ecfb3" : "#1D9E75",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s",
              letterSpacing: "0.3px",
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ marginTop: 32, fontSize: 12, color: "#aaa", textAlign: "center" }}>
          © {new Date().getFullYear()} Restoran Khan Jee · We Serve Passion
        </p>
      </div>
    </div>
  );
}
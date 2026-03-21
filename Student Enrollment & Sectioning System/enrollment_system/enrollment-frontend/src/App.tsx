import React, { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Subjects from "./pages/Subjects";
import Sections from "./pages/Sections";
import Enrollments from "./pages/Enrollments";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/students", label: "Students" },
  { to: "/subjects", label: "Subjects" },
  { to: "/sections", label: "Sections" },
  { to: "/enrollments", label: "Enrollments" },
];

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const current = navItems.find((n) =>
    n.to === "/" ? location.pathname === "/" : location.pathname.startsWith(n.to)
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f5f5f0", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { -webkit-font-smoothing: antialiased; }
      `}</style>

      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #ddd8d0" }} className="px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden" style={{ color: "#6b6560" }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>
          <span style={{ fontFamily: "'Lora', serif", fontSize: "1.05rem", fontWeight: 600, color: "#1a1814", letterSpacing: "0.015em" }}>
            Enrollment System
          </span>
        </div>
        <span style={{ fontSize: "0.8rem", color: "#8c8680", fontWeight: 500, letterSpacing: "0.02em" }} className="hidden sm:block">
          {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </span>
      </header>

      <div className="flex flex-1">
        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-20 bg-black bg-opacity-20 md:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* Sidebar */}
        <aside
          style={{ background: "#ffffff", borderRight: "1px solid #ddd8d0" }}
          className={`
            fixed top-0 left-0 h-full z-30 w-52 pt-20 px-5 pb-8 flex flex-col
            transition-transform duration-200
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:static md:z-auto md:pt-8
          `}
        >
          <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "#a09890", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.625rem" }}>
            Navigation
          </p>
          <nav className="flex flex-col gap-0.5">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                style={({ isActive }) => ({
                  display: "block",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.375rem",
                  fontSize: "0.9rem",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#1a1814" : "#6b6560",
                  background: isActive ? "#eeebe6" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  letterSpacing: "0.01em",
                  lineHeight: "1.5",
                })}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0" style={{ padding: "2.5rem 3rem" }}>
          {/* Page heading */}
          <div style={{ marginBottom: "2rem", paddingBottom: "1.25rem", borderBottom: "1px solid #ddd8d0" }}>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: "1.5rem", fontWeight: 600, color: "#1a1814", letterSpacing: "-0.01em", lineHeight: 1.3 }}>
              {current?.label ?? ""}
            </h2>
          </div>

          {/* Page content */}
          <div style={{ maxWidth: "900px" }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/students" element={<Students />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/sections" element={<Sections />} />
              <Route path="/enrollments" element={<Enrollments />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Subjects from "./pages/Subjects";
import Sections from "./pages/Sections";
import Enrollments from "./pages/Enrollments";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/students", label: "Products" }, // renamed visually only
  { to: "/subjects", label: "Brands" },
  { to: "/sections", label: "Categories" },
  { to: "/enrollments", label: "Orders" },
];

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const current = navItems.find((n) =>
    n.to === "/" ? location.pathname === "/" : location.pathname.startsWith(n.to)
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 to-gray-200 font-inter">
      
      {/* HEADER */}
      <header className="px-8 py-4 flex items-center justify-between bg-white/80 backdrop-blur shadow-sm border-b">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-500"
          >
            ☰
          </button>

          <div>
            <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
              PhoneStore Admin
            </h1>
            <p className="text-xs text-gray-500">
              Manage products, orders & inventory
            </p>
          </div>
        </div>

        <span className="text-sm text-gray-500 hidden sm:block">
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </header>

      <div className="flex flex-1">
        
        {/* OVERLAY */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`
            fixed md:static top-0 left-0 h-full w-60 z-30
            bg-white shadow-lg md:shadow-none
            px-5 pt-20 md:pt-8 pb-8
            transform transition-transform duration-200
            ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Menu
          </p>

          <nav className="flex flex-col gap-2">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `
                  px-3 py-2 rounded-lg text-sm transition-all
                  ${isActive
                    ? "bg-blue-100 text-blue-600 font-semibold shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"}
                  `
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-6 md:p-10">
          
          {/* PAGE HEADER */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              {current?.label}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {current?.label === "Dashboard" && "Overview of store performance"}
              {current?.label === "Products" && "Manage phone listings and inventory"}
              {current?.label === "Brands" && "Organize phone brands"}
              {current?.label === "Categories" && "Group products by type"}
              {current?.label === "Orders" && "Track customer purchases"}
            </p>
          </div>

          {/* CONTENT CARD */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
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

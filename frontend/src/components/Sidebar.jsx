import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition
     ${
       pathname === path
         ? "bg-blue-600 text-white"
         : "text-slate-300 hover:bg-slate-800"
     }`;

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      <div className="px-6 py-5 text-2xl font-extrabold tracking-wide">
        Project<span className="text-blue-500">Flow</span>
      </div>

      <nav className="px-3 space-y-1 mt-6">
        <Link to="/" className={linkClass("/")}>
          📊 Dashboard
        </Link>
        <Link to="/projects" className={linkClass("/projects")}>
          📁 Projects
        </Link>
        
        {/* --- AJOUT DU LIEN PROFIL --- */}
        <Link to="/profile" className={linkClass("/profile")}>
          👤 Mon Profil
        </Link>
      </nav>
    </aside>
  );
}
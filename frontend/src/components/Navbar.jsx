import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed left-64 right-0 top-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
      <h1 className="text-lg font-semibold text-slate-700">
        Dashboard
      </h1>

      <div className="flex items-center gap-4">
        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
          {user?.email?.[0]?.toUpperCase()}
        </div>
        <button
          onClick={logout}
          className="text-sm text-slate-600 hover:text-red-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

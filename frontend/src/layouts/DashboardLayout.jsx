import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <Sidebar />
      <Navbar />

      <main className="ml-64 pt-20 px-8">
        <Outlet />
      </main>
    </div>
  );
}

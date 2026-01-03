import { useState, useEffect } from "react";
import api from "../api/axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, Legend 
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({ projects: 0, tasks: 0, members: 0, todo: 0, doing: 0, done: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/projects/stats/all");
        setStats(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur stats:", err);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const barData = [
    { name: 'Projets', value: stats.projects || 0, color: '#3b82f6' },
    { name: 'Tâches', value: stats.tasks || 0, color: '#6366f1' },
    { name: 'Équipe', value: stats.members || 0, color: '#8b5cf6' },
  ];

  const pieData = [
    { name: 'À faire', value: stats.todo || 0, color: '#e2e8f0' },
    { name: 'En cours', value: stats.doing || 0, color: '#6366f1' },
    { name: 'Terminé', value: stats.done || 0, color: '#22c55e' },
  ];

  if (loading) return <div className="p-8 font-black text-indigo-600 animate-pulse">Chargement...</div>;

  return (
    <div className="p-8 space-y-10 bg-[#f8fafc] min-h-screen">
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tableau de Bord</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GRAPHIQUE ACTIVITÉ GLOBALE */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-[400px]">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 px-2">Activité Globale</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={60}>
                  {barData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPHIQUE ÉTAT DES TÂCHES */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center h-[400px]">
          <h3 className="text-xs font-black text-slate-400 uppercase mb-8">État des Tâches</h3>
          <div className="relative w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius="65%" outerRadius="85%" paddingAngle={8} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-10">
              <span className="text-4xl font-black text-slate-800">{stats.tasks}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
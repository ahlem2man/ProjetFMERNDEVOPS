import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ firstName: "", lastName: "", bio: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Charger le profil (READ)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profiles/me");
        if (res.data) setProfile(res.data);
      } catch (err) {
        console.error("Erreur de chargement", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Mettre à jour le profil (UPDATE)
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put("/profiles/me", profile);
      setMessage({ type: "success", text: "Profil mis à jour !" });
    } catch (err) {
      setMessage({ type: "error", text: "Erreur lors de la mise à jour." });
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500 font-bold">Chargement...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 mt-10">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-3xl font-black text-slate-900 mb-6">Mon Profil</h2>
        
        {message && (
          <div className={`p-4 mb-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Prénom</label>
              <input 
                type="text" 
                value={profile.firstName} 
                onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Nom</label>
              <input 
                type="text" 
                value={profile.lastName} 
                onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Email (Compte)</label>
            <input type="text" value={user?.email} disabled className="w-full p-4 bg-slate-100 border rounded-2xl text-slate-400 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Biographie</label>
            <textarea 
              value={profile.bio} 
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-indigo-500 h-32"
            />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-indigo-600 transition-all">
            Sauvegarder le profil
          </button>
        </form>
      </div>
    </div>
  );
}
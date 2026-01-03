import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  // --- ÉTATS DU FORMULAIRE ---
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Mise à jour des champs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- SOUMISSION DU FORMULAIRE ---
 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (formData.password !== formData.confirmPassword) {
    return setError("Les mots de passe ne correspondent pas.");
  }

  // --- LOGIQUE DE SÉPARATION DU NOM ---
  // On sépare le "Nom complet" par l'espace
  const nameParts = formData.username.trim().split(" ");
  const firstName = nameParts[0]; // Le premier mot
  const lastName = nameParts.slice(1).join(" ") || "-"; // Le reste, ou un tiret si vide

  setLoading(true);
  try {
    // On envoie maintenant les champs EXACTS attendus par le backend
    await api.post("/auth/register", {
      firstName: firstName,
      lastName: lastName,
      email: formData.email,
      password: formData.password,
    });

    alert("Compte créé avec succès !");
    navigate("/login");
  } catch (err) {
    const message = err.response?.data?.message || "Erreur lors de l'inscription.";
    setError(message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        
        {/* LOGO / TITRE */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Project<span className="text-blue-600">Flow</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Créez votre compte gratuitement</p>
        </div>

        {/* MESSAGE D'ERREUR */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-lg animate-pulse">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* NOM D'UTILISATEUR */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 ml-1 mb-1">Nom complet</label>
            <input
              type="text"
              name="username"
              placeholder="Ex: Jean Dupont"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 ml-1 mb-1">Adresse Email</label>
            <input
              type="email"
              name="email"
              placeholder="nom@exemple.com"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* MOT DE PASSE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 ml-1 mb-1">Mot de passe</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 ml-1 mb-1">Confirmation</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          {/* BOUTON D'INSCRIPTION */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Création en cours..." : "Créer mon compte"}
          </button>
        </form>

        {/* LIEN VERS CONNEXION */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 font-medium">
            Déjà membre ?{" "}
            <Link to="/login" className="text-blue-600 font-black hover:underline ml-1">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
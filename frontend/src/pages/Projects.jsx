import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ÉTATS CRÉATION ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  
  // NOUVEAU : État pour le chargement de l'IA
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- ÉTATS ÉDITION ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const isAdmin = user?.role === 'admin';

  // NOUVEAU : Fonction pour générer la description avec l'IA
  const handleGenerateAiDescription = async () => {
    if (!title) {
      alert("Veuillez d'abord saisir un titre pour orienter l'IA.");
      return;
    }

    setIsAiLoading(true);
    try {
      const res = await api.post("/ai/generate-description", { title });
      setDescription(res.data.description);
    } catch (err) {
      console.error("Erreur IA:", err);
      alert("Impossible de générer la description pour le moment.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- LOGIQUE DE CHARGEMENT, CRÉATION, MODIFICATION ET SUPPRESSION (INCHANGÉE) ---
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects");
        setProjects(res.data);
      } catch (error) {
        console.error("Erreur chargement projets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/projects", { title, description });
      setProjects([res.data, ...projects]);
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
    } catch (err) {
      setError("Erreur lors de la création");
    }
  };

  const openEditModal = (project) => {
    setEditingProjectId(project._id);
    setEditTitle(project.title);
    setEditDescription(project.description || "");
    setIsEditModalOpen(true);
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/projects/${editingProjectId}`, {
        title: editTitle,
        description: editDescription,
      });
      setProjects(projects.map((p) => (p._id === editingProjectId ? res.data : p)));
      setIsEditModalOpen(false);
    } catch (err) {
      alert("Erreur lors de la modification");
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce projet ?")) return;
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(projects.filter((p) => p._id !== projectId));
    } catch (err) {
      alert(err.response?.status === 403 ? "Action non autorisée." : "Erreur lors de la suppression.");
    }
  };

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-800">Projets</h2>
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            + Nouveau Projet
          </button>
        )}
      </div>

      {/* --- TABLEAU DES PROJETS (INCHANGÉ) --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Nom du Projet</th>
              <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Statut</th>
              <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Créé le</th>
              <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400 animate-pulse">Chargement...</td></tr>
            ) : projects.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-bold">Aucun projet trouvé.</td></tr>
            ) : (
              projects.map((project) => {
                const isOwner = project.owner === user?._id || project.owner?._id === user?._id;
                return (
                  <tr key={project._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 font-bold text-slate-800">
                      <Link to={`/projects/${project._id}`} className="hover:text-blue-600 transition-colors">
                        {project.title}
                      </Link>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 border border-emerald-200">Actif</span>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500 font-medium">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                      {(isAdmin || isOwner) && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditModal(project)} className="text-amber-600 hover:text-amber-700 text-[10px] font-black uppercase bg-amber-50 px-3 py-2 rounded-xl border border-amber-100 transition-all">Modifier</button>
                          <button onClick={() => handleDeleteProject(project._id)} className="text-red-500 hover:text-red-700 text-[10px] font-black uppercase bg-red-50 px-3 py-2 rounded-xl border border-red-100 transition-all">Supprimer</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODALES --- */}
      {/* CRÉATION (MODIFIÉE POUR L'IA) */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl">
            <h3 className="text-3xl font-black text-slate-900 mb-6">Nouveau Projet</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <input
                type="text"
                placeholder="Titre du projet"
                className="w-full p-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              
              {/* SECTION DESCRIPTION AVEC BOUTON IA */}
              <div className="relative">
                <textarea
                  placeholder="Description"
                  className="w-full p-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 h-32 resize-none transition-all"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleGenerateAiDescription}
                  disabled={isAiLoading}
                  className="absolute right-3 bottom-3 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border border-indigo-100 hover:bg-indigo-100 transition-all disabled:opacity-50"
                >
                  {isAiLoading ? "🪄 Génération..." : "✨ IA Description"}
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors">Annuler</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ÉDITION (INCHANGÉE) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl border-t-8 border-amber-500">
            <h3 className="text-3xl font-black text-slate-900 mb-6">Modifier</h3>
            <form onSubmit={handleUpdateProject} className="space-y-4">
              <input
                type="text"
                className="w-full p-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-amber-500 transition-all font-bold"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
              <textarea
                className="w-full p-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-amber-500 h-32 resize-none transition-all"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 text-slate-400 font-bold">Annuler</button>
                <button type="submit" className="flex-1 bg-amber-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-amber-100 hover:bg-amber-600 transition-all">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
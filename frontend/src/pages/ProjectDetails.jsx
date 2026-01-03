import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- ÉTATS ---
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ÉTATS MODAUX ---
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  // --- ÉTATS FORMULAIRES ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [memberEmail, setMemberEmail] = useState("");

  // --- ÉTATS COMMENTAIRES ---
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [comments, setComments] = useState({}); 
  const [commentText, setCommentText] = useState("");

  // --- LOGIQUE DE PERMISSION ---
  const userId = user?._id?.toString();
  const isOwner = project?.owner?.toString() === userId || project?.owner?._id?.toString() === userId;
  const isAdmin = user?.role === "admin";
  const canManage = isOwner || isAdmin; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const projectRes = await api.get(`/projects/${id}`);
        setProject(projectRes.data);
        setEditTitle(projectRes.data.title);
        setEditDescription(projectRes.data.description || "");

        const tasksRes = await api.get("/tasks", { params: { projectId: id } });
        setTasks(tasksRes.data);
      } catch (err) {
        console.error("Erreur chargement:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  // --- ACTIONS PROJET (Inchangées) ---
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/projects/${id}`, { title: editTitle, description: editDescription });
      setProject(res.data);
      setShowEditProject(false);
    } catch (err) { alert("Erreur modification"); }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm("🚨 Supprimer définitivement ce projet ?")) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate("/dashboard");
    } catch (err) { alert("Action non autorisée"); }
  };

  // --- GESTION DES MEMBRES (Inchangée) ---
  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/projects/${id}/members`, { email: memberEmail });
      setProject(res.data);
      setMemberEmail("");
    } catch (err) { alert("Utilisateur introuvable ou déjà présent"); }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Retirer ce membre ?")) return;
    try {
      const res = await api.delete(`/projects/${id}/members/${memberId}`);
      setProject(res.data);
    } catch (err) { alert("Erreur lors de la suppression du membre"); }
  };

  // --- ACTIONS TÂCHES (Inchangées) ---
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/tasks", { title, description, projectId: id });
      setTasks((prev) => [...prev, res.data]);
      setShowTaskModal(false);
      setTitle(""); setDescription("");
    } catch (err) { alert("Erreur : Seul le responsable peut créer des tâches"); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data : t)));
    } catch (error) {
      if (error.response?.status === 403) {
        alert("Permission refusée.");
      } else {
        alert("Erreur lors du changement de statut");
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Supprimer cette tâche ?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (error) { alert("Action réservée au responsable"); }
  };

  /// Dans ProjectDetails.jsx
const toggleComments = async (taskId) => {
  // Si on ferme le volet, on réinitialise juste l'ID actif
  if (activeTaskId === taskId) {
    setActiveTaskId(null);
    return;
  }

  try {
    // 1. On active l'affichage du volet
    setActiveTaskId(taskId);

    // 2. On récupère les commentaires frais depuis le serveur
    // Assurez-vous d'avoir une route GET /api/tasks/:taskId/comments ou similaire
    const res = await api.get(`/tasks/${taskId}/comments`);
    
    // 3. On met à jour l'état local avec TOUS les commentaires reçus
    setComments(prev => ({ ...prev, [taskId]: res.data }));
  } catch (err) {
    console.error("Erreur lors de la récupération des commentaires:", err);
    // Fallback : si l'API échoue, on regarde ce qu'on a déjà
    const task = tasks.find(t => t._id === taskId);
    if (task && task.comments) {
      setComments(prev => ({ ...prev, [taskId]: task.comments }));
    }
  }
};
  const handleAddComment = async (e, taskId) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await api.post("/comments", { content: commentText, taskId });
      
      // Mise à jour immédiate de la liste des commentaires affichés
      setComments(prev => ({ ...prev, [taskId]: [...(prev[taskId] || []), res.data] }));
      setCommentText("");
      
      // Mise à jour du compteur 💬 dans l'objet task
      setTasks(prev => prev.map(t => 
        t._id === taskId ? { ...t, comments: [...(t.comments || []), res.data] } : t
      ));
    } catch (err) { alert("Erreur envoi commentaire"); }
  };

  const handleDeleteComment = async (commentId, taskId) => {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    try {
      // Route backend validée par vos logs : DELETE /api/tasks/:taskId/comments/:commentId
      await api.delete(`/tasks/${taskId}/comments/${commentId}`); 
      
      // 1. Mise à jour de la liste locale des commentaires (UI)
      setComments(prev => ({
        ...prev,
        [taskId]: (prev[taskId] || []).filter(c => c._id !== commentId)
      }));

      // 2. Mise à jour du compteur dans l'état global des tâches
      setTasks(prev => prev.map(t => 
        t._id === taskId 
          ? { ...t, comments: (t.comments || []).filter(c => c._id !== commentId) } 
          : t
      ));
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-500 font-bold">Chargement du projet...</div>;
  if (!project) return <div className="p-10 text-center text-red-500 font-bold">Projet introuvable</div>;

  return (
    <div className="space-y-8 p-4 max-w-6xl mx-auto pb-20">
      
      {/* --- EN-TÊTE DU PROJET --- */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{project.title}</h2>
            <p className="text-slate-500 text-lg leading-relaxed max-w-2xl">{project.description || "Aucune description fournie."}</p>
            <div className="flex flex-wrap gap-2 mt-4">
               <span className="text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-full text-blue-600 border border-blue-100">
                 👥 {project.members?.length || 0} Membres
               </span>
               {isAdmin && (
                 <span className="text-xs font-bold bg-rose-100 px-3 py-1.5 rounded-full text-rose-600 border border-rose-200">
                   🛡️ Administration
                 </span>
               )}
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            {canManage && (
              <>
                <button onClick={() => setShowMembersModal(true)} className="flex-1 md:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-bold text-sm transition-all">
                  Membres
                </button>
                <button onClick={() => setShowEditProject(true)} className="flex-1 md:flex-none bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-amber-100 text-sm transition-all">
                  Paramètres
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- SECTION TÂCHES --- */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Tableau des tâches</h3>
          {canManage && (
            <button onClick={() => setShowTaskModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-100 transition-all flex items-center gap-2">
              <span className="text-xl">+</span> Nouvelle tâche
            </button>
          )}
        </div>

        <ul className="grid grid-cols-1 gap-4">
          {tasks.map((task) => (
            <li key={task._id} className="group border border-slate-100 rounded-2xl overflow-hidden bg-white hover:border-indigo-300 hover:shadow-lg transition-all duration-300">
              <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1 space-y-1">
                  <p className="font-black text-slate-800 text-xl group-hover:text-indigo-600 transition-colors">{task.title}</p>
                  <button onClick={() => toggleComments(task._id)} className="text-xs font-bold text-slate-400 hover:text-indigo-500 transition-colors flex items-center gap-1">
                    💬 {task.comments?.length || 0} commentaires
                  </button>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <select 
                    value={task.status || "todo"} 
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    className="flex-1 md:flex-none text-xs font-bold px-4 py-2.5 rounded-xl border bg-slate-50 border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="todo">🎯 À FAIRE</option>
                    <option value="doing">⚡ EN COURS</option>
                    <option value="done">✅ TERMINÉ</option>
                  </select>
                  {canManage && (
                    <button onClick={() => handleDeleteTask(task._id)} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              {/* --- SECTION COMMENTAIRES --- */}
{activeTaskId === task._id && (
  <div className="bg-slate-50/50 p-6 border-t border-slate-100">
    {/* --- AFFICHAGE DE TOUS LES COMMENTAIRES --- */}
<div className="space-y-4 mb-6">
  {(comments[task._id] || []).map((c) => {
    // 1. Identification (Backend Populate obligatoire)
    const authorEmail = c.user?.email || "Membre";
    const authorId = c.user?._id?.toString() || c.user?.toString();
    const currentUserId = user?._id?.toString() || user?.id?.toString();

    // 2. Logique de droits : Voir la corbeille ?
    const isMyComment = authorId === currentUserId;
    const canDelete = isMyComment || isAdmin;

    return (
      <div key={c._id} className={`p-4 rounded-2xl border flex justify-between items-start ${isMyComment ? 'bg-indigo-50/30 border-indigo-100 ml-8' : 'bg-white border-slate-100 mr-8'}`}>
        <div className="flex-1">
          {/* Email de l'auteur (Visible par tous les membres) */}
          <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${isMyComment ? 'text-indigo-600' : 'text-slate-400'}`}>
            {authorEmail} {isMyComment && "(Moi)"}
          </span>
          
          {/* Contenu du message (Visible par tous les membres) */}
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {c.content}
          </p>
        </div>

        {/* Bouton Supprimer : Masqué pour les commentaires des autres membres */}
        {canDelete && (
          <button 
            onClick={() => handleDeleteComment(c._id, task._id)} 
            className="ml-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Supprimer"
          >
            🗑️
          </button>
        )}
      </div>
    );
  })}
</div>

    {/* Formulaire d'ajout de commentaire */}
    <form onSubmit={(e) => handleAddComment(e, task._id)} className="flex gap-2">
      <input 
        value={commentText} 
        onChange={(e) => setCommentText(e.target.value)} 
        placeholder="Écrire un message..." 
        className="flex-1 border-2 border-slate-100 p-3 rounded-xl text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all bg-white" 
      />
      <button type="submit" className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all">
        Poster
      </button>
    </form>
  </div>
)}
            </li>
          ))}
        </ul>
      </div>

      {/* --- MODAL MEMBRES --- */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white w-full max-w-lg p-10 rounded-[2.5rem] shadow-2xl relative">
            <h3 className="text-3xl font-black mb-8 text-slate-900">Équipe projet</h3>
            <form onSubmit={handleAddMember} className="flex gap-3 mb-10">
              <input 
                type="email" 
                placeholder="Email de l'invité..." 
                value={memberEmail} 
                onChange={(e) => setMemberEmail(e.target.value)} 
                required 
                className="flex-1 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all font-medium" 
              />
              <button type="submit" className="bg-indigo-600 text-white px-6 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">+</button>
            </form>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {project.members?.map((m) => (
                <div key={m._id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                      {m.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-slate-700">{m.email}</span>
                  </div>
                  {canManage && m._id !== (project.owner?._id || project.owner) && (
                    <button onClick={() => handleRemoveMember(m._id)} className="text-red-400 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all">Retirer</button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => setShowMembersModal(false)} className="w-full mt-10 py-4 font-black text-slate-400 hover:text-slate-600 transition-colors uppercase text-xs tracking-widest">Fermer</button>
          </div>
        </div>
      )}

      {/* --- MODAL TÂCHE --- */}
      {showTaskModal && canManage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl">
            <h3 className="text-3xl font-black mb-8">Nouveau défi</h3>
            <form onSubmit={handleCreateTask} className="space-y-5">
              <input placeholder="Titre..." value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border-2 border-slate-100 p-4 rounded-2xl font-bold focus:border-indigo-500 outline-none" />
              <textarea placeholder="Détails..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border-2 border-slate-100 p-4 rounded-2xl h-32 focus:border-indigo-500 outline-none" />
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 py-4 font-bold text-slate-400">Annuler</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-200">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL PARAMÈTRES --- */}
      {showEditProject && canManage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl">
            <h3 className="text-3xl font-black mb-8 text-amber-600">Configuration</h3>
            <form onSubmit={handleUpdateProject} className="space-y-5">
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full border-2 border-slate-100 p-4 rounded-2xl font-bold focus:border-amber-500 outline-none" />
              <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full border-2 border-slate-100 p-4 rounded-2xl h-32 focus:border-amber-500 outline-none" />
              <div className="flex flex-col gap-4 pt-6">
                <button type="submit" className="bg-amber-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-amber-100">Enregistrer</button>
                <button type="button" onClick={handleDeleteProject} className="text-red-500 text-xs font-bold uppercase tracking-widest mt-4">🚨 Supprimer le projet</button>
                <button type="button" onClick={() => setShowEditProject(false)} className="py-2 text-slate-400 font-bold">Retour</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      // Correction : On vérifie si la chaîne est valide avant de parser
      if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
        return JSON.parse(storedUser);
      }
      return null;
    } catch (error) {
      console.error("Erreur lecture localStorage:", error);
      return null;
    }
  });

  const login = async (email, password) => {
    try {
      console.log("Envoi de la requête login..."); // Log de suivi
      const res = await api.post("/auth/login", { email, password });

      // On vérifie que le backend renvoie bien les données attendues
      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
        console.log("Connexion réussie, utilisateur stocké.");
      }
    } catch (error) {
      console.error("Erreur dans AuthContext Login:", error.response?.data || error.message);
      throw error; // On renvoie l'erreur pour que le composant Login.jsx l'affiche
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
import { createContext, useContext, useMemo, useState } from "react";
import api from "../api/client";

const AdminAuthContext = createContext(null);

const getStoredSession = () => {
  const token = localStorage.getItem("opticeye_admin_token");
  const userRaw = localStorage.getItem("opticeye_admin_user");

  return {
    token,
    user: userRaw ? JSON.parse(userRaw) : null,
  };
};

export const AdminAuthProvider = ({ children }) => {
  const initial = getStoredSession();

  const [token, setToken] = useState(initial.token || "");
  const [user, setUser] = useState(initial.user || null);

  const setSession = (payload) => {
    setToken(payload.token);
    setUser(payload.user);
    localStorage.setItem("opticeye_admin_token", payload.token);
    localStorage.setItem("opticeye_admin_user", JSON.stringify(payload.user));
  };

  const clearSession = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("opticeye_admin_token");
    localStorage.removeItem("opticeye_admin_user");
  };

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);

    if (!data.user?.isAdmin) {
      throw new Error("Admin access required");
    }

    setSession(data);
    return data;
  };

  const logout = () => {
    clearSession();
  };

  const value = useMemo(
    () => ({
      token,
      user,
      login,
      logout,
      isAuthenticated: Boolean(token),
    }),
    [token, user]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  }
  return context;
};

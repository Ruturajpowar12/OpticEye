import { createContext, useContext, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

const getStoredSession = () => {
  const token = localStorage.getItem("opticeye_token");
  const userRaw = localStorage.getItem("opticeye_user");

  return {
    token,
    user: userRaw ? JSON.parse(userRaw) : null,
  };
};

export const AuthProvider = ({ children }) => {
  const initial = getStoredSession();
  const [token, setToken] = useState(initial.token || "");
  const [user, setUser] = useState(initial.user);

  const setSession = (payload) => {
    setToken(payload.token);
    setUser(payload.user);
    localStorage.setItem("opticeye_token", payload.token);
    localStorage.setItem("opticeye_user", JSON.stringify(payload.user));
  };

  const clearSession = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("opticeye_token");
    localStorage.removeItem("opticeye_user");
  };

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    setSession(data);
    return data;
  };

  const register = async (formData) => {
    const { data } = await api.post("/auth/register", formData);
    setSession(data);
    return data;
  };

  const updateProfile = async (payload) => {
    const { data } = await api.put("/auth/profile", payload);
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
      register,
      updateProfile,
      logout,
      isAuthenticated: Boolean(token),
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

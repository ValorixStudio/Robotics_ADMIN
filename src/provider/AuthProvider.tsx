import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  saveToken: (val: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("teachly-access-token") || null,
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem("teachly-access-token", token);
      localStorage.setItem("isAuthenticated", "true");
      document.documentElement.setAttribute("data-token", token);
    } else {
      localStorage.removeItem("teachly-access-token");
      localStorage.removeItem("isAuthenticated");
      document.documentElement.removeAttribute("data-token");
    }
  }, [token]);

  const saveToken = (val: string | null) => {
    setToken(val);
  };

  return (
    <AuthContext.Provider value={{ token, saveToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
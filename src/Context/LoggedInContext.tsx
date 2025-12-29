"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { AuthContextType } from "../utils/Interfaces";

export const MyLoggedInContext = createContext<AuthContextType | undefined>(undefined);

export const LoggedInProvider = ({ children }: { children: React.ReactNode }) => {
  const [authData, setAuthData] = useState<string>("");
  const [providerName, setProviderName] = useState<string>("");
  const [isExist, setIsExist] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const isInitialMount = useRef(true);

  useEffect(() => {
    setLoading(true);
    const stored = localStorage.getItem("authData");
    const storedProvider = localStorage.getItem("providerName");
    const storedExist = localStorage.getItem("isExist");

    if (stored) setAuthData(stored);
    if (storedProvider) setProviderName(storedProvider);
    if (storedExist) setIsExist(storedExist === "true");

    setLoading(false);
    isInitialMount.current = false;
  }, []);

  useEffect(() => {
    if (isInitialMount.current) return;

    if (authData) localStorage.setItem("authData", authData);
    else localStorage.removeItem("authData");
    if (providerName) localStorage.setItem("providerName", providerName);
    else localStorage.removeItem("providerName");
    if (isExist) localStorage.setItem("isExist", "true");
    else localStorage.removeItem("isExist");
  }, [authData, providerName, isExist]);

  const logout = () => {
    setAuthData("");
    setProviderName("");
    setIsExist(false);

    sessionStorage.clear();
    localStorage.clear();

    window.location.href = "/landing";
  };

  return (
    <MyLoggedInContext.Provider
      value={{
        authData,
        setAuthData,
        providerName,
        setProviderName,
        loading,
        logout,
        isExist,
        setIsExist,
      }}
    >
      {children}
    </MyLoggedInContext.Provider>
  );
};

export const useIsLoggedIn = (): AuthContextType => {
  const context = useContext(MyLoggedInContext);
  if (!context) {
    throw new Error("useIsLoggedIn must be used within a LoggedInProvider");
  }

  return context;
};

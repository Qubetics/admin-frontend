"use client";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  authData: string;
  setAuthData: React.Dispatch<React.SetStateAction<string>>;
  providerName: string;
  setProviderName: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  logout: () => void;
  isExist: boolean;
  setIsExist: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MyLoggedInContext = createContext<AuthContextType | undefined>(undefined);

export const LoggedInProvider = ({ children }: { children: React.ReactNode }) => {
  const [authData, setAuthData] = useState<string>("");
  const [providerName, setProviderName] = useState<string>("");
  const [isExist, setIsExist] = useState(false);

  const [loading, setLoading] = useState<boolean>(true);

  // Load from localStorage on mount
  useEffect(() => {
    const fetchAuthToken = async () => {
      setLoading(true);
      const stored = localStorage.getItem("authData");
      const storedProvider = localStorage.getItem("providerName");

      if (stored) setAuthData(stored);
      if (storedProvider) setProviderName(storedProvider);

      setLoading(false);
    };
    fetchAuthToken();
  }, []);

  // Save to localStorage when authData changes
  useEffect(() => {
    if (authData) {
      localStorage.setItem("authData", authData);
    } else {
      localStorage.removeItem("authData");
    }
  }, [authData]);

  useEffect(() => {
    if (providerName) localStorage.setItem("providerName", providerName);
    else localStorage.removeItem("providerName");
  }, [providerName]);

  const logout = () => {
    setAuthData("");
    setProviderName("");
    localStorage.removeItem("authData");
    localStorage.removeItem("providerName");

    sessionStorage.clear();
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
        setIsExist,
        isExist,
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

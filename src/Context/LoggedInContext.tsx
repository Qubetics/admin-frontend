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

export const MyLoggedInContext = createContext<AuthContextType | undefined>(
  undefined
);

export const LoggedInProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [authData, setAuthData] = useState<string>("");
  const [providerName, setProviderName] = useState<string>("");
  const [isExist, setIsExist] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);

  // Load from localStorage on mount
  useEffect(() => {
    const fetchAuthToken = async () => {
      setLoading(true);
      const stored = localStorage.getItem("authData");
      const storedProvider = localStorage.getItem("providerName");
      const storedExist = localStorage.getItem("isExist");

      if (stored) setAuthData(stored);
      if (storedProvider) setProviderName(storedProvider);
      if (storedExist) setIsExist(storedExist === "true");

      setLoading(false);
    };

    fetchAuthToken();
  }, []);

  // Save to localStorage when authData changes
  useEffect(() => {
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

    localStorage.removeItem("authData");
    localStorage.removeItem("providerName");
    localStorage.removeItem("isExist");

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

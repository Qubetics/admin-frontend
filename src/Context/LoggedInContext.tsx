"use client";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  authData: string;
  setAuthData: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  logout: () => void;
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
  const [loading, setLoading] = useState<boolean>(true);

  // Load from localStorage on mount
  useEffect(() => {
    const fetchAuthToken = async () => {
      setLoading(true);
      const stored = localStorage.getItem("authData");
      if (stored) {
        setAuthData(stored);
      }
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

  const logout = () => {
    setAuthData("");
    localStorage.removeItem("authData");
    sessionStorage.clear();
    window.location.href = "/landing";
  };

  return (
    <MyLoggedInContext.Provider
      value={{ authData, setAuthData, loading, logout }}
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

import { createContext, useContext, useState } from "react";

interface AuthContextType {
    authData: string;
    setAuthData: React.Dispatch<React.SetStateAction<string>>;
}

// Create context with default value `undefined` for safety
export const MyLoggedInContext = createContext<AuthContextType | undefined>(undefined);


export const LoggedInProvider = ({ children }:any) => {
    const [authData, setAuthData] = useState<string>("");

    return (
        <MyLoggedInContext.Provider value={{ authData, setAuthData }}>
            {children}
        </MyLoggedInContext.Provider>
    );
};

// Custom hook with type-safety
export const useIsLoggedIn = (): AuthContextType => {
  const context = useContext(MyLoggedInContext);

  if (!context) {
    throw new Error("useIsLoggedIn must be used within a LoggedInProvider");
  }

  return context; // Now TypeScript knows context is definitely AuthContextType
};
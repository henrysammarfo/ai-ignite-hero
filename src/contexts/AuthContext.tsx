import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  loginMethod: "email" | "wallet" | "google" | "apple" | null;
  login: (email: string, method: "email" | "wallet" | "google" | "apple") => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userEmail: null,
  loginMethod: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem("fortis_auth") === "true"
  );
  const [userEmail, setUserEmail] = useState<string | null>(
    () => sessionStorage.getItem("fortis_email")
  );
  const [loginMethod, setLoginMethod] = useState<AuthContextType["loginMethod"]>(
    () => sessionStorage.getItem("fortis_method") as AuthContextType["loginMethod"]
  );

  const login = useCallback((email: string, method: "email" | "wallet" | "google" | "apple") => {
    setIsAuthenticated(true);
    setUserEmail(email);
    setLoginMethod(method);
    sessionStorage.setItem("fortis_auth", "true");
    sessionStorage.setItem("fortis_email", email);
    sessionStorage.setItem("fortis_method", method);
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUserEmail(null);
    setLoginMethod(null);
    sessionStorage.removeItem("fortis_auth");
    sessionStorage.removeItem("fortis_email");
    sessionStorage.removeItem("fortis_method");
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, loginMethod, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

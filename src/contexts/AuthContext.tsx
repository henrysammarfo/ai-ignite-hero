import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type LoginMethod = "email" | "wallet" | "google";

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  loginMethod: LoginMethod | null;
  login: (email: string, method: LoginMethod) => void;
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
  const [loginMethod, setLoginMethod] = useState<LoginMethod | null>(
    () => sessionStorage.getItem("fortis_method") as LoginMethod | null
  );

  const login = useCallback((email: string, method: LoginMethod) => {
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

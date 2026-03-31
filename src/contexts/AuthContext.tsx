import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

type LoginMethod = "email" | "wallet" | "google" | "entra_b2c";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  userEmail: string | null;
  loginMethod: LoginMethod | null;
  loginWithEntra: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  userEmail: null,
  loginMethod: null,
  loginWithEntra: async () => { },
  logout: async () => { },
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loginMethod, setLoginMethod] = useState<LoginMethod | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setLoginMethod(session.user.app_metadata.provider as LoginMethod || "email");
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setLoginMethod(session.user.app_metadata.provider as LoginMethod || "email");
      } else {
        setLoginMethod(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithEntra = useCallback(async () => {
    setLoading(true);
    try {
      // Mocking Microsoft Entra B2C OAuth Flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockUser = {
        id: "entra-b2c-mock-id",
        email: "institutional-admin@amina.bank",
        app_metadata: { provider: "entra_b2c" },
        user_metadata: { full_name: "AMINA Institutional Admin" }
      } as unknown as User;

      setUser(mockUser);
      setLoginMethod("entra_b2c");
      toast.success("Authenticated via Microsoft Entra B2C");
    } catch (error: any) {
      toast.error("Microsoft Entra authentication failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  }, []);

  const isAuthenticated = !!user;
  const userEmail = user?.email ?? null;

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      userEmail,
      loginMethod,
      loginWithEntra,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

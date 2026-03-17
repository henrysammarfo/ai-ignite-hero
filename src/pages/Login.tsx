import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Wallet, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import WalletConnectModal from "@/components/dashboard/WalletConnectModal";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

type AuthMode = "signin" | "signup" | "forgot";

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    // If we're authenticated and auth state has stopped loading, go to dashboard
    if (!authLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) { toast.error(error.message); return; }
      setResetSent(true);
      toast.success("Password reset link sent to your email");
      return;
    }
    setLoading(true);
    try {
      let error;
      if (mode === "signup") {
        ({ error } = await supabase.auth.signUp({ email, password, options: { data: { org_name: orgName } } }));
        if (!error) toast.success("Account created! Check your email to verify.");
      } else {
        ({ error } = await supabase.auth.signInWithPassword({ email, password }));
        if (!error) toast.success("Signed in successfully");
      }
      if (error) { toast.error(error.message); return; }
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnected = (walletName: string) => {
    toast.success(`${walletName} connected! Redirecting...`);
    setTimeout(() => navigate("/dashboard"), 600);
  };

  // Forgot password view
  if (mode === "forgot") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-block">
              <h1 className="font-serif text-3xl font-bold text-primary tracking-tight">Fortis</h1>
            </Link>
          </div>

          <Card className="shadow-lg border-border/50">
            <CardHeader className="pb-2 pt-6 px-6">
              <h2 className="text-xl font-serif font-bold text-foreground">Reset Password</h2>
              <p className="text-sm text-muted-foreground font-sans">
                Enter your email and we'll send a reset link
              </p>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {resetSent ? (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle2 size={40} className="text-green-500 mx-auto" />
                  <p className="text-sm font-sans text-foreground font-medium">Reset link sent!</p>
                  <p className="text-xs text-muted-foreground font-sans">
                    Check your email for a password reset link. It may take a few minutes.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 font-sans"
                    onClick={() => { setMode("signin"); setResetSent(false); }}
                  >
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-sans uppercase tracking-wider">Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="institution@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 font-sans"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full gap-2 rounded-lg font-sans font-semibold" size="lg">
                    Send Reset Link
                    <ArrowRight size={16} />
                  </Button>
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="w-full text-sm text-muted-foreground font-sans hover:text-foreground text-center"
                  >
                    Back to Sign In
                  </button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main sign in / sign up view
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="font-serif text-3xl font-bold text-primary tracking-tight">Fortis</h1>
          </Link>
          <p className="text-sm text-muted-foreground font-sans mt-2">
            Institutional-grade DeFi vault infrastructure
          </p>
        </div>

        <Card className="shadow-lg border-border/50">
          <CardHeader className="pb-2 pt-6 px-6">
            <h2 className="text-xl font-serif font-bold text-foreground">
              {mode === "signup" ? "Create Account" : "Sign In"}
            </h2>
            <p className="text-sm text-muted-foreground font-sans">
              {mode === "signup"
                ? "Register for institutional vault access"
                : "Access your institutional dashboard"}
            </p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground font-sans uppercase tracking-wider">
                    Organization Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Acme Capital AG"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="font-sans"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-sans uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="institution@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 font-sans"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-sans uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 font-sans"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode === "signin" && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-xs text-primary font-sans hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button type="submit" className="w-full gap-2 rounded-lg font-sans font-semibold" size="lg" disabled={loading}>
                {loading ? "Please wait..." : (mode === "signup" ? "Create Account" : "Sign In")}
                {!loading && <ArrowRight size={16} />}
              </Button>
            </form>

            {/* Wallet connect option */}
            <div className="mt-5">
              <Button
                variant="outline"
                className="w-full gap-2 font-sans text-sm"
                onClick={() => setWalletModalOpen(true)}
              >
                <Wallet size={16} />
                Connect with Solana Wallet
              </Button>
            </div>

            <div className="mt-5">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-3 text-muted-foreground font-sans">or continue with</span>
                </div>
              </div>

              <div className="mt-4">
                <Button
                  variant="outline"
                  className="w-full font-sans text-sm gap-2"
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    const { error } = await supabase.auth.signInWithOAuth({ 
                      provider: "google", 
                      options: { 
                        redirectTo: `${window.location.origin}/dashboard` 
                      } 
                    });
                    if (error) {
                      toast.error(error.message);
                      setLoading(false);
                    }
                  }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                  Continue with Google
                </Button>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground font-sans">
              {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                className="text-primary font-medium hover:underline"
              >
                {mode === "signup" ? "Sign in" : "Register"}
              </button>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-muted-foreground/60 font-sans">
          By continuing, you agree to Fortis Terms of Service and Privacy Policy.
        </p>
      </div>

      <WalletConnectModal
        open={walletModalOpen}
        onOpenChange={setWalletModalOpen}
      />
    </div>
  );
};

export default Login;

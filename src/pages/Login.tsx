import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Wallet, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type AuthMode = "signin" | "signup" | "forgot" | "wallet";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [walletConnecting, setWalletConnecting] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "forgot") {
      setResetSent(true);
      toast.success("Password reset link sent to your email");
      return;
    }
    if (mode === "signup") {
      toast.success("Account created! Redirecting to dashboard...");
    } else {
      toast.success("Signed in successfully");
    }
    login(email, "email");
    setTimeout(() => navigate("/dashboard"), 600);
  };

  const handleWalletConnect = (walletName: string) => {
    setWalletConnecting(true);
    toast.loading(`Connecting ${walletName}...`, { id: "wallet" });
    setTimeout(() => {
      setWalletConnecting(false);
      login(`${walletName.toLowerCase()}@wallet`, "wallet");
      toast.success(`${walletName} connected! Redirecting...`, { id: "wallet" });
      setTimeout(() => navigate("/dashboard"), 600);
    }, 1500);
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

  // Wallet connect view
  if (mode === "wallet") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-block">
              <h1 className="font-serif text-3xl font-bold text-primary tracking-tight">Fortis</h1>
            </Link>
            <p className="text-sm text-muted-foreground font-sans mt-2">
              Connect your Solana wallet to access the vault
            </p>
          </div>

          <Card className="shadow-lg border-border/50">
            <CardHeader className="pb-2 pt-6 px-6">
              <h2 className="text-xl font-serif font-bold text-foreground">Connect Wallet</h2>
              <p className="text-sm text-muted-foreground font-sans">
                Select your preferred Solana wallet
              </p>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-14 font-sans text-sm"
                onClick={() => handleWalletConnect("Phantom")}
                disabled={walletConnecting}
              >
                <img src="https://raw.githubusercontent.com/nicnocquee/cryptocurrency-icons/master/icons/sol.svg" alt="" className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-medium text-foreground">Phantom</p>
                  <p className="text-xs text-muted-foreground">Most popular Solana wallet</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-14 font-sans text-sm"
                onClick={() => handleWalletConnect("Solflare")}
                disabled={walletConnecting}
              >
                <Wallet size={20} className="text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium text-foreground">Solflare</p>
                  <p className="text-xs text-muted-foreground">Advanced Solana wallet</p>
                </div>
              </Button>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground font-sans text-center mb-3">
                  First time? Your wallet will be verified for KYC/AML compliance before vault access is granted.
                </p>
              </div>

              <button
                onClick={() => setMode("signin")}
                className="w-full text-sm text-primary font-sans font-medium hover:underline text-center"
              >
                Sign in with email instead
              </button>
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

              <Button type="submit" className="w-full gap-2 rounded-lg font-sans font-semibold" size="lg">
                {mode === "signup" ? "Create Account" : "Sign In"}
                <ArrowRight size={16} />
              </Button>
            </form>

            {/* Wallet connect option */}
            <div className="mt-5">
              <Button
                variant="outline"
                className="w-full gap-2 font-sans text-sm"
                onClick={() => setMode("wallet")}
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

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="font-sans text-sm gap-2"
                  type="button"
                  onClick={() => {
                    login(email || "user@google.com", "google");
                    toast.success("Google sign-in — redirecting...");
                    setTimeout(() => navigate("/dashboard"), 800);
                  }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Google
                </Button>
                <Button
                  variant="outline"
                  className="font-sans text-sm gap-2"
                  type="button"
                  onClick={() => {
                    login(email || "user@apple.com", "apple");
                    toast.success("Apple sign-in — redirecting...");
                    setTimeout(() => navigate("/dashboard"), 800);
                  }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  Apple
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
    </div>
  );
};

export default Login;

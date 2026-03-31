import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogIn, Link as LinkIcon, CheckCircle, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { EntraService } from "@/services/EntraService";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/integrations/supabase/client";

const EntraLoginButton = () => {
    const [loading, setLoading] = useState(false);
    const [identity, setIdentity] = useState<{ linked: boolean, email?: string, name?: string } | null>(null);
    const { toast } = useToast();
    const { publicKey } = useWallet();

    useEffect(() => {
        // 1. Initial Identity Check
        if (publicKey) {
            checkIdentity();
        }

        // 2. Handle OAuth Redirect Completion
        const handleAuthChange = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session && publicKey && !identity?.linked) {
                // If we have a session but no link, attempt to link now
                await autoLink(session.access_token);
            }
        };

        handleAuthChange();
    }, [publicKey]);

    const checkIdentity = async () => {
        try {
            const data = await EntraService.getLinkedIdentity(publicKey!.toString());
            setIdentity(data);
        } catch (err) {
            console.error("Failed to fetch Entra identity:", err);
        }
    };

    const autoLink = async (token: string) => {
        setLoading(true);
        try {
            await EntraService.linkWallet(token, publicKey!.toString());
            await checkIdentity();
            toast({
                title: "Real Identity Linked ✓",
                description: "Your Microsoft Entra B2C account is now securely bridged to Solana.",
            });
        } catch (err: any) {
            console.error("Auto-link failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMicrosoftLogin = async () => {
        if (!publicKey) {
            toast({
                title: "Wallet Not Connected",
                description: "Connect your Solana wallet before linking identity.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            // Initiate Real OAuth Flow
            await EntraService.login();
            // User will be redirected
        } catch (err: any) {
            toast({
                title: "Login Failed",
                description: err.message,
                variant: "destructive"
            });
            setLoading(false);
        }
    };

    if (identity?.linked) {
        return (
            <div className="flex flex-col gap-3 p-5 border border-emerald-500/30 bg-emerald-500/5 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2 text-emerald-600 font-sans font-bold text-sm">
                    <ShieldCheck size={20} className="fill-emerald-500/10" />
                    LIVE IDENTITY VERIFIED
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-semibold font-sans text-foreground">{identity.name || "Institutional User"}</p>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tight">{identity.email}</p>
                </div>
                <div className="pt-2 border-t border-emerald-500/10 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-600/70 font-sans uppercase font-bold tracking-widest">Microsoft Entra B2C</span>
                    <CheckCircle size={14} className="text-emerald-500" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-1">
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold font-sans tracking-tight">Institutional Authentication</h3>
                    <span className="bg-primary/10 text-primary text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">Required</span>
                </div>
                <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                    AMINA Bank uses Microsoft Entra B2C for institutional-grade identity verification. Link your wallet to proceed with compliant token operations.
                </p>
            </div>
            
            <Button
                onClick={handleMicrosoftLogin}
                disabled={loading || !publicKey}
                className="w-full bg-[#0078d4] hover:bg-[#006cc0] text-white flex items-center justify-center gap-3 font-sans py-7 shadow-lg shadow-[#0078d4]/20 transition-all duration-200 active:scale-[0.98]"
            >
                {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                ) : (
                    <img 
                        src="https://authjs.dev/img/providers/azure.svg" 
                        alt="Microsoft" 
                        className="w-6 h-6 invert grayscale brightness-200"
                    />
                )}
                <div className="flex flex-col items-start leading-none gap-1">
                    <span className="text-xs font-bold uppercase tracking-wider">Sign in with Microsoft</span>
                    <span className="text-[10px] opacity-70 font-normal">Institutional Login Portal</span>
                </div>
            </Button>

            {!publicKey && (
                <div className="flex items-center gap-2 justify-center py-1 opacity-60">
                    <AlertCircle size={12} className="text-amber-500" />
                    <p className="text-[10px] text-amber-600 font-sans font-medium uppercase tracking-tighter">
                        Wallet connection required for identity bridging
                    </p>
                </div>
            )}
        </div>
    );
};

export default EntraLoginButton;

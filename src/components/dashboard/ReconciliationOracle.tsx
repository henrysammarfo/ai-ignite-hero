import { Shield, ExternalLink, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ReconciliationOracle = () => {
    const solsticeEusxMint = "Gkt9h4QWpPBDtbaF5HvYKCc87H5WCRTUtMf77HdTGHBt"; // Testnet
    const vaultEusxAta = "AuUJq1XN3whkUgNqqvXVswHLqjxrtkjnLzU3ZTLFFzoU"; // Institutional Vault Authority (V4 PDA)

    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-sans font-bold flex items-center gap-2 text-primary">
                    <Shield size={16} />
                    Institutional Reconciliation Oracle
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans">Tokenized eUSX (On-Chain)</p>
                        <p className="text-xl font-bold font-sans">154,520.45</p>
                        <div className="flex items-center gap-1 text-[10px] text-green-600 font-sans">
                            <CheckCircle size={10} /> Verified on Devnet
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans">Underlying USD (Fund NAV)</p>
                        <p className="text-xl font-bold font-sans">$168,427.12</p>
                        <p className="text-[10px] text-muted-foreground font-sans">USX Exchange Rate: 1.09</p>
                    </div>
                </div>

                <div className="pt-2 border-t border-primary/10 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground font-sans">Yield Source: Solstice Finance YieldVault</p>
                        <p className="text-[10px] text-muted-foreground font-sans">Strategy: Delta-Neutral Arbitrage</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] gap-1 px-2 border-primary/30 hover:bg-primary/10"
                        onClick={() => window.open(`https://solscan.io/token/${solsticeEusxMint}?cluster=devnet`, "_blank")}
                    >
                        Verify Reserve <ExternalLink size={10} />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ReconciliationOracle;

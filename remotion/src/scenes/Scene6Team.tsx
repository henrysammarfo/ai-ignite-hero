import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/InstrumentSans";
import { COLORS } from "../theme";

const { fontFamily: serif } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: sans } = loadSans("normal", { weights: ["400", "600"], subsets: ["latin"] });

const team = [
  { initials: "M1", role: "Solana Smart Contracts", focus: "Anchor, PDA Vaults" },
  { initials: "M2", role: "Backend & Integration", focus: "KYC/AML, Oracles" },
  { initials: "M3", role: "Security & Compliance", focus: "Threat Modeling, Audits" },
  { initials: "M4", role: "Frontend & Demo", focus: "Dashboard, UX Flows" },
];

export const Scene6Team: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 60%, #0F0D08 0%, ${COLORS.bg} 80%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ opacity: headerOp, textAlign: "center", marginBottom: 60 }}>
        <div
          style={{
            fontFamily: sans,
            fontSize: 18,
            color: COLORS.gold,
            letterSpacing: 6,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          The Team
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 56,
            color: COLORS.cream,
          }}
        >
          Built by <span style={{ fontStyle: "italic", color: COLORS.gold }}>specialists</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 40 }}>
        {team.map((m, i) => {
          const delay = 25 + i * 20;
          const s = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 120 } });
          const op = interpolate(frame, [delay, delay + 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const y = interpolate(s, [0, 1], [50, 0]);

          return (
            <div
              key={i}
              style={{
                opacity: op,
                transform: `translateY(${y}px)`,
                width: 260,
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.gold}18`,
                borderRadius: 20,
                padding: "40px 24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${COLORS.gold}20, ${COLORS.gold}08)`,
                  border: `2px solid ${COLORS.gold}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  fontFamily: sans,
                  fontSize: 24,
                  fontWeight: 600,
                  color: COLORS.gold,
                }}
              >
                {m.initials}
              </div>
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 20,
                  fontWeight: 600,
                  color: COLORS.cream,
                  marginBottom: 8,
                }}
              >
                {m.role}
              </div>
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 15,
                  color: COLORS.creamDim,
                }}
              >
                {m.focus}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

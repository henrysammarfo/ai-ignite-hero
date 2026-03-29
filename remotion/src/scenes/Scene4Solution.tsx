import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";
import { loadFont } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/InstrumentSans";
import { COLORS } from "../theme";

const { fontFamily: serif } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: sans } = loadSans("normal", { weights: ["400", "600"], subsets: ["latin"] });

const features = [
  {
    icon: "🛡️",
    title: "PDA Vaults",
    desc: "Permissioned Program-Derived Address vaults with configurable lock periods, strategies, and access controls.",
  },
  {
    icon: "✅",
    title: "4-Layer Compliance",
    desc: "KYC (Civic) → AML (TRM Labs) → Accreditation → Travel Rule (Notabene). All 4 must pass before vault operations.",
  },
  {
    icon: "📈",
    title: "Real-Time Yield",
    desc: "Pyth Oracle integration for live APY tracking, performance charts, and automated yield distribution.",
  },
  {
    icon: "📊",
    title: "Institutional Dashboard",
    desc: "Full treasury management UI with reports, transaction history, vault management, and theme support.",
  },
];

export const Scene4Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOp = interpolate(frame, [0, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        padding: "80px 100px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", gap: 80 }}>
        {/* Left — header */}
        <div style={{ flex: "0 0 420px", opacity: headerOp }}>
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
            The Solution
          </div>
          <div
            style={{
              fontFamily: serif,
              fontSize: 56,
              color: COLORS.cream,
              lineHeight: 1.2,
              marginBottom: 24,
            }}
          >
            Fortis
            <br />
            <span style={{ color: COLORS.gold }}>Treasury Platform</span>
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              color: COLORS.creamDim,
              lineHeight: 1.6,
            }}
          >
            A full-stack platform for managing stablecoin treasuries with regulatory compliance baked in.
          </div>

          {/* Decorative vault graphic */}
          <div
            style={{
              marginTop: 48,
              width: 200,
              height: 200,
              border: `2px solid ${COLORS.gold}30`,
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `linear-gradient(135deg, ${COLORS.gold}08, transparent)`,
            }}
          >
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <rect x="10" y="20" width="60" height="50" rx="6" stroke={COLORS.gold} strokeWidth="2" />
              <circle cx="40" cy="45" r="10" stroke={COLORS.gold} strokeWidth="2" />
              <rect x="30" y="10" width="20" height="15" rx="4" stroke={COLORS.gold} strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Right — feature cards */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
          {features.map((f, i) => {
            const delay = 30 + i * 40;
            const s = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 150 } });
            const op = interpolate(frame, [delay, delay + 20], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const x = interpolate(s, [0, 1], [60, 0]);
            return (
              <div
                key={i}
                style={{
                  opacity: op,
                  transform: `translateX(${x}px)`,
                  background: COLORS.bgCard,
                  border: `1px solid ${COLORS.gold}15`,
                  borderRadius: 16,
                  padding: "28px 32px",
                  display: "flex",
                  gap: 20,
                  alignItems: "flex-start",
                }}
              >
                <div style={{ fontSize: 36, lineHeight: 1 }}>{f.icon}</div>
                <div>
                  <div
                    style={{
                      fontFamily: sans,
                      fontSize: 22,
                      fontWeight: 600,
                      color: COLORS.cream,
                      marginBottom: 6,
                    }}
                  >
                    {f.title}
                  </div>
                  <div
                    style={{
                      fontFamily: sans,
                      fontSize: 16,
                      color: COLORS.creamDim,
                      lineHeight: 1.5,
                    }}
                  >
                    {f.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

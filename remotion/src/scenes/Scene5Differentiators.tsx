import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/InstrumentSans";
import { COLORS } from "../theme";

const { fontFamily: serif } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: sans } = loadSans("normal", { weights: ["400", "600"], subsets: ["latin"] });

const diffs = [
  { label: "First permissioned vault protocol on Solana", icon: "⚡" },
  { label: "4-layer compliance — not 1, not 2, but 4 verification pillars", icon: "🔐" },
  { label: "Action gating — no compliance = no access to vault operations", icon: "🚧" },
  { label: "Institutional-grade UX — not another DEX", icon: "🏛️" },
  { label: "Full audit trail with PDF reporting", icon: "📋" },
];

export const Scene5Differentiators: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOp = interpolate(frame, [0, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${COLORS.bg} 0%, #08060A 100%)`,
        padding: "80px 140px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div style={{ opacity: headerOp, marginBottom: 60 }}>
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
          Why Fortis
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 60,
            color: COLORS.cream,
            lineHeight: 1.15,
          }}
        >
          Key{" "}
          <span style={{ color: COLORS.gold, fontStyle: "italic" }}>
            Differentiators
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {diffs.map((d, i) => {
          const delay = 30 + i * 25;
          const s = spring({ frame: frame - delay, fps, config: { damping: 20 } });
          const op = interpolate(frame, [delay, delay + 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const x = interpolate(s, [0, 1], [-80, 0]);
          const lineW = interpolate(s, [0, 1], [0, 100]);

          return (
            <div key={i} style={{ opacity: op, transform: `translateX(${x}px)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    background: `${COLORS.gold}12`,
                    border: `1px solid ${COLORS.gold}25`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                  }}
                >
                  {d.icon}
                </div>
                <div
                  style={{
                    fontFamily: sans,
                    fontSize: 26,
                    color: COLORS.cream,
                    fontWeight: 500,
                  }}
                >
                  {d.label}
                </div>
              </div>
              {/* Gold underline */}
              <div
                style={{
                  marginLeft: 80,
                  marginTop: 12,
                  width: `${lineW}%`,
                  maxWidth: 600,
                  height: 1,
                  background: `linear-gradient(90deg, ${COLORS.gold}30, transparent)`,
                }}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";
import { loadFont } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/InstrumentSans";
import { COLORS } from "../theme";

const { fontFamily: serif } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: sans } = loadSans("normal", { weights: ["400", "600"], subsets: ["latin"] });

const problems = [
  { stat: "$2.4T", label: "stablecoin volume lacks institutional infrastructure" },
  { stat: "87%", label: "of institutions cite compliance as DeFi's top barrier" },
  { stat: "0", label: "permissioned vault solutions on Solana — until now" },
];

export const Scene2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOp = interpolate(frame, [0, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headerY = interpolate(frame, [0, 25], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${COLORS.bg} 0%, #0A0806 100%)`,
        padding: "80px 120px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {/* Pre-header */}
      <div
        style={{
          fontFamily: sans,
          fontSize: 18,
          color: COLORS.gold,
          letterSpacing: 6,
          textTransform: "uppercase",
          marginBottom: 16,
          opacity: headerOp,
        }}
      >
        The Problem
      </div>

      <div
        style={{
          fontFamily: serif,
          fontSize: 64,
          color: COLORS.cream,
          lineHeight: 1.15,
          maxWidth: 900,
          opacity: headerOp,
          transform: `translateY(${headerY}px)`,
          marginBottom: 80,
        }}
      >
        DeFi wasn't built for
        <br />
        <span style={{ color: COLORS.red }}>institutional money.</span>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 60 }}>
        {problems.map((p, i) => {
          const delay = 40 + i * 30;
          const s = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 150 } });
          const op = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{ opacity: op, transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)` }}>
              <div
                style={{
                  fontFamily: serif,
                  fontSize: 72,
                  color: COLORS.gold,
                  marginBottom: 12,
                }}
              >
                {p.stat}
              </div>
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 20,
                  color: COLORS.creamDim,
                  maxWidth: 320,
                  lineHeight: 1.5,
                }}
              >
                {p.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Decorative red line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 4,
          height: `${interpolate(frame, [0, 120], [0, 100], { extrapolateRight: "clamp" })}%`,
          background: COLORS.red,
        }}
      />
    </AbsoluteFill>
  );
};

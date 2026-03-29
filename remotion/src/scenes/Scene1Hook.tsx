import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/InstrumentSans";
import { COLORS } from "../theme";

const { fontFamily: serif } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: sans } = loadSans("normal", { weights: ["400", "600"], subsets: ["latin"] });

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Shield icon scale
  const shieldScale = spring({ frame, fps, config: { damping: 15, stiffness: 80, mass: 2 } });

  // Title reveal
  const titleY = interpolate(spring({ frame: frame - 20, fps, config: { damping: 20 } }), [0, 1], [60, 0]);
  const titleOp = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Subtitle
  const subOp = interpolate(frame, [50, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subY = interpolate(frame, [50, 75], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Gold line expand
  const lineW = interpolate(frame, [30, 80], [0, 400], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${COLORS.bgCard} 0%, ${COLORS.bg} 70%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {/* Shield / Logo mark */}
      <div
        style={{
          width: 120,
          height: 140,
          marginBottom: 40,
          transform: `scale(${shieldScale})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="120" height="140" viewBox="0 0 120 140" fill="none">
          <path
            d="M60 0L120 30V75C120 110 95 132 60 140C25 132 0 110 0 75V30L60 0Z"
            fill={COLORS.gold}
            opacity={0.15}
          />
          <path
            d="M60 10L110 35V75C110 105 88 125 60 132C32 125 10 105 10 75V35L60 10Z"
            stroke={COLORS.gold}
            strokeWidth={2}
            fill="none"
          />
          <text
            x="60"
            y="82"
            textAnchor="middle"
            fill={COLORS.gold}
            fontFamily={serif}
            fontSize="48"
            fontWeight="400"
          >
            F
          </text>
        </svg>
      </div>

      {/* Title */}
      <div
        style={{
          fontFamily: serif,
          fontSize: 96,
          color: COLORS.cream,
          letterSpacing: 8,
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
        }}
      >
        FORTIS
      </div>

      {/* Gold line */}
      <div
        style={{
          width: lineW,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${COLORS.gold}, transparent)`,
          marginTop: 20,
          marginBottom: 20,
        }}
      />

      {/* Subtitle */}
      <div
        style={{
          fontFamily: sans,
          fontSize: 28,
          color: COLORS.creamDim,
          letterSpacing: 6,
          textTransform: "uppercase",
          opacity: subOp,
          transform: `translateY(${subY}px)`,
        }}
      >
        Institutional Treasury on Solana
      </div>
    </AbsoluteFill>
  );
};

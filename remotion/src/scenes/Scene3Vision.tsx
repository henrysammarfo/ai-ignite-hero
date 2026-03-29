import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/InstrumentSans";
import { COLORS } from "../theme";

const { fontFamily: serif } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: sans } = loadSans("normal", { weights: ["400", "600"], subsets: ["latin"] });

export const Scene3Vision: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 200 } });
  const textOp = interpolate(frame, [15, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textY = interpolate(frame, [15, 40], [50, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const subOp = interpolate(frame, [45, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Gold ring rotation
  const ringRotation = frame * 0.5;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 50%, #12100A 0%, ${COLORS.bg} 80%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Decorative rings */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          border: `1px solid ${COLORS.gold}20`,
          borderRadius: "50%",
          transform: `rotate(${ringRotation}deg) scale(${scale})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          border: `1px solid ${COLORS.gold}10`,
          borderRadius: "50%",
          transform: `rotate(${-ringRotation * 0.7}deg) scale(${scale})`,
        }}
      />

      <div style={{ textAlign: "center", zIndex: 1 }}>
        <div
          style={{
            fontFamily: sans,
            fontSize: 18,
            color: COLORS.gold,
            letterSpacing: 6,
            textTransform: "uppercase",
            marginBottom: 24,
            opacity: textOp,
          }}
        >
          Our Vision
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 72,
            color: COLORS.cream,
            lineHeight: 1.2,
            maxWidth: 1000,
            opacity: textOp,
            transform: `translateY(${textY}px)`,
          }}
        >
          Bring{" "}
          <span style={{ color: COLORS.gold, fontStyle: "italic" }}>
            institutional-grade
          </span>
          <br />
          treasury management on-chain.
        </div>

        <div
          style={{
            fontFamily: sans,
            fontSize: 24,
            color: COLORS.creamDim,
            marginTop: 32,
            opacity: subOp,
            maxWidth: 700,
            lineHeight: 1.6,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Compliant. Permissioned. Built on Solana.
        </div>
      </div>
    </AbsoluteFill>
  );
};

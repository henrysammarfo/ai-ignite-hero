import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/InstrumentSans";
import { COLORS } from "../theme";

const { fontFamily: serif } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: sans } = loadSans("normal", { weights: ["400", "600"], subsets: ["latin"] });

const stack = [
  "React + Vite + TypeScript",
  "Supabase (Auth, DB, Edge Functions)",
  "Solana Devnet + Anchor",
  "Civic · TRM Labs · Notabene",
  "Pyth Oracle · jsPDF",
];

export const Scene7Close: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Tech stack (frames 0-180)
  const stackHeaderOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Phase 2: Final CTA (frames 180-360)
  const ctaPhase = frame - 180;
  const ctaOp = interpolate(ctaPhase, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ctaScale = spring({ frame: ctaPhase, fps, config: { damping: 15, stiffness: 80, mass: 2 } });

  const taglineOp = interpolate(ctaPhase, [40, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Fade out stack
  const stackFade = interpolate(frame, [160, 185], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 50%, #0D0B06 0%, ${COLORS.bg} 75%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Phase 1: Tech Stack */}
      <div
        style={{
          position: "absolute",
          opacity: stackFade,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 18,
            color: COLORS.gold,
            letterSpacing: 6,
            textTransform: "uppercase",
            marginBottom: 16,
            opacity: stackHeaderOp,
          }}
        >
          Built With
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 48,
            color: COLORS.cream,
            marginBottom: 48,
            opacity: stackHeaderOp,
          }}
        >
          Production-Grade Stack
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          {stack.map((s, i) => {
            const delay = 20 + i * 18;
            const op = interpolate(frame, [delay, delay + 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const sp = spring({ frame: frame - delay, fps, config: { damping: 20 } });
            const y = interpolate(sp, [0, 1], [30, 0]);
            return (
              <div
                key={i}
                style={{
                  opacity: op,
                  transform: `translateY(${y}px)`,
                  fontFamily: sans,
                  fontSize: 24,
                  color: COLORS.cream,
                  background: `${COLORS.gold}08`,
                  border: `1px solid ${COLORS.gold}20`,
                  borderRadius: 12,
                  padding: "14px 40px",
                }}
              >
                {s}
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase 2: Final CTA */}
      <div
        style={{
          opacity: ctaOp,
          transform: `scale(${interpolate(ctaScale, [0, 1], [0.8, 1])})`,
          textAlign: "center",
        }}
      >
        {/* Shield */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <svg width="90" height="105" viewBox="0 0 120 140" fill="none">
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

        <div
          style={{
            fontFamily: serif,
            fontSize: 84,
            color: COLORS.cream,
            letterSpacing: 6,
            marginBottom: 20,
          }}
        >
          FORTIS
        </div>
        <div
          style={{
            width: interpolate(ctaPhase, [30, 70], [0, 500], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            height: 2,
            background: `linear-gradient(90deg, transparent, ${COLORS.gold}, transparent)`,
            margin: "0 auto 24px",
          }}
        />
        <div
          style={{
            fontFamily: sans,
            fontSize: 28,
            color: COLORS.creamDim,
            letterSpacing: 4,
            opacity: taglineOp,
          }}
        >
          INSTITUTIONAL TREASURY ON SOLANA
        </div>
        <div
          style={{
            fontFamily: sans,
            fontSize: 18,
            color: COLORS.goldDim,
            marginTop: 32,
            opacity: taglineOp,
          }}
        >
          StableHacks 2026 · Devnet
        </div>
      </div>
    </AbsoluteFill>
  );
};

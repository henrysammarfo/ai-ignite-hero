import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { slide } from "@remotion/transitions/slide";
import { COLORS } from "./theme";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Problem } from "./scenes/Scene2Problem";
import { Scene3Vision } from "./scenes/Scene3Vision";
import { Scene4Solution } from "./scenes/Scene4Solution";
import { Scene5Differentiators } from "./scenes/Scene5Differentiators";
import { Scene6Team } from "./scenes/Scene6Team";
import { Scene7Close } from "./scenes/Scene7Close";

export const MainVideo = () => {
  const frame = useCurrentFrame();

  // Persistent subtle gold accent line at bottom
  const lineWidth = interpolate(frame, [0, 1800], [0, 100], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Persistent background gradient */}
      <AbsoluteFill>
        <div
          style={{
            position: "absolute",
            width: 800,
            height: 800,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${COLORS.gold}08 0%, transparent 70%)`,
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${1 + Math.sin(frame * 0.01) * 0.1})`,
          }}
        />
      </AbsoluteFill>

      <TransitionSeries>
        {/* Scene 1: Hook — 5s */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene1Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 2: Problem — 8s */}
        <TransitionSeries.Sequence durationInFrames={240}>
          <Scene2Problem />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 3: Vision — 6s */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene3Vision />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 4: Solution — 12s */}
        <TransitionSeries.Sequence durationInFrames={360}>
          <Scene4Solution />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 5: Differentiators — 10s */}
        <TransitionSeries.Sequence durationInFrames={300}>
          <Scene5Differentiators />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 6: Team — 7s */}
        <TransitionSeries.Sequence durationInFrames={210}>
          <Scene6Team />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 25 })}
        />

        {/* Scene 7: Close — 12s */}
        <TransitionSeries.Sequence durationInFrames={360}>
          <Scene7Close />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Progress line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: `${lineWidth}%`,
          height: 3,
          background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.goldLight})`,
        }}
      />
    </AbsoluteFill>
  );
};

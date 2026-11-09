import { useEffect, useRef, useState } from "react";

/**
 * RobotAvatarLive
 * ----------------
 * A fully vector (SVG) AI mascot — replaces the old static PNG.
 * Everything you see (eyes, mouth, antenna glow, waving arm) is drawn
 * and animated in real time, so the character feels genuinely alive
 * instead of being a bouncing flat image.
 *
 * It plugs directly into the existing `robotAction` state machine
 * ("intro" | "idle" | "wave") already used in AiWelcomeAssistant,
 * and optionally reacts to `thinking` (true while the AI is composing
 * a reply) by switching to a "pondering" face.
 */

type RobotGesture = "intro" | "idle" | "wave";

interface RobotAvatarLiveProps {
  action: RobotGesture;
  thinking?: boolean;
  className?: string;
}

export default function RobotAvatarLive({ action, thinking = false, className = "" }: RobotAvatarLiveProps) {
  const [blink, setBlink] = useState(false);
  const [lookX, setLookX] = useState(0);
  const blinkTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lookTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Natural, irregular blinking — never perfectly rhythmic, feels more alive
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 2200 + Math.random() * 2600;
      blinkTimeout.current = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 120);
        scheduleBlink();
      }, delay);
    };
    scheduleBlink();
    return () => clearTimeout(blinkTimeout.current);
  }, []);

  // Slow, subtle "looking around" — small horizontal glance
  useEffect(() => {
    const scheduleLook = () => {
      const delay = 2600 + Math.random() * 2400;
      lookTimeout.current = setTimeout(() => {
        setLookX((Math.random() - 0.5) * 6);
        scheduleLook();
      }, delay);
    };
    scheduleLook();
    return () => clearTimeout(lookTimeout.current);
  }, []);

  const isWaving = action === "intro" || action === "wave";
  const armClass = isWaving ? "robot-arm-waving" : "robot-arm-idle";

  return (
    <svg
      viewBox="0 0 200 220"
      className={className}
      role="img"
      aria-label="AI assistant character"
    >
      <defs>
        <linearGradient id="rb-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e7f6f1" />
        </linearGradient>
        <linearGradient id="rb-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b1f1c" />
          <stop offset="100%" stopColor="#04100e" />
        </linearGradient>
        <radialGradient id="rb-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#34d9c4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#34d9c4" stopOpacity="0" />
        </radialGradient>
        <filter id="rb-soft-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="100" cy="207" rx="34" ry="6" fill="#0f766e" opacity="0.12" />

      {/* ===== Legs ===== */}
      <rect x="76" y="168" width="17" height="30" rx="8" fill="#dff5ef" stroke="#8fd9c9" strokeWidth="1.5" />
      <rect x="107" y="168" width="17" height="30" rx="8" fill="#dff5ef" stroke="#8fd9c9" strokeWidth="1.5" />
      <rect x="72" y="191" width="25" height="12" rx="6" fill="#0e2a26" />
      <rect x="103" y="191" width="25" height="12" rx="6" fill="#0e2a26" />
      <rect x="76" y="195" width="17" height="2.4" rx="1.2" fill="#2dd4bf" />
      <rect x="107" y="195" width="17" height="2.4" rx="1.2" fill="#2dd4bf" />

      {/* ===== Idle arm (viewer's right side) ===== */}
      <g className="robot-arm-idle-static">
        <rect x="128" y="110" width="15" height="42" rx="7.5" fill="#dff5ef" stroke="#8fd9c9" strokeWidth="1.5" />
        <circle cx="135.5" cy="154" r="9" fill="#e7f6f1" stroke="#8fd9c9" strokeWidth="1.5" />
      </g>

      {/* ===== Torso ===== */}
      <rect x="60" y="98" width="80" height="72" rx="26" fill="url(#rb-body)" stroke="#bdeade" strokeWidth="1.5" />
      {/* side accent panels */}
      <rect x="66" y="112" width="7" height="42" rx="3.5" fill="#5eead4" opacity="0.55" />
      <rect x="127" y="112" width="7" height="42" rx="3.5" fill="#5eead4" opacity="0.55" />
      {/* chest emblem */}
      <circle cx="100" cy="128" r="15" fill="#0b1f1c" />
      <circle cx="100" cy="128" r="15" fill="none" stroke="#2dd4bf" strokeWidth="2" filter="url(#rb-soft-glow)" />
      <text x="100" y="133" textAnchor="middle" fontSize="12" fontWeight="800" fill="#5eead4" fontFamily="Arial, sans-serif">
        AI
      </text>
      {/* belt */}
      <rect x="72" y="158" width="56" height="8" rx="4" fill="#0e2a26" />
      <rect x="90" y="160.5" width="20" height="3" rx="1.5" fill="#2dd4bf" />

      {/* ===== Waving arm (viewer's left side) — animated group ===== */}
      {/* Pivot is the shoulder (top of the rect, where it meets the torso).
          The hand sits at the FAR end of the arm so it swings rigidly
          together with it instead of floating near the pivot. */}
      <g className={armClass}>
        <rect x="54" y="108" width="15" height="38" rx="7.5" fill="#dff5ef" stroke="#8fd9c9" strokeWidth="1.5" />
        <circle cx="61.5" cy="150" r="10" fill="#e7f6f1" stroke="#8fd9c9" strokeWidth="1.5" />
        <circle cx="61.5" cy="150" r="3" fill="#2dd4bf" opacity="0.85" />
      </g>

      {/* ===== Head ===== */}
      <g>
        {/* antenna */}
        <line x1="128" y1="16" x2="136" y2="2" stroke="#8fd9c9" strokeWidth="3" strokeLinecap="round" />
        <circle cx="136" cy="2" r="6" fill="#2dd4bf" className="robot-antenna-glow" filter="url(#rb-soft-glow)" />

        {/* ear discs */}
        <circle cx="49" cy="55" r="9" fill="#34d9c4" opacity="0.9" />
        <circle cx="151" cy="55" r="9" fill="#34d9c4" opacity="0.9" />
        <circle cx="49" cy="55" r="4" fill="#0b1f1c" opacity="0.35" />
        <circle cx="151" cy="55" r="4" fill="#0b1f1c" opacity="0.35" />

        {/* skull */}
        <rect x="54" y="14" width="92" height="80" rx="34" fill="url(#rb-body)" stroke="#bdeade" strokeWidth="1.5" />
        {/* crown accent */}
        <rect x="82" y="20" width="36" height="6" rx="3" fill="#5eead4" opacity="0.6" />

        {/* face screen */}
        <rect x="68" y="34" width="64" height="46" rx="18" fill="url(#rb-screen)" />
        <rect x="68" y="34" width="64" height="46" rx="18" fill="none" stroke="#134e46" strokeWidth="1" />

        {/* eyes group — handles blink + subtle look-around */}
        <g
          style={{
            transform: `translateX(${lookX}px) scaleY(${blink ? 0.08 : 1})`,
            transformOrigin: "100px 54px",
            transition: "transform 110ms ease",
          }}
        >
          {/* Left eye (viewer's left) */}
          <path
            d="M 84 58 Q 90 48 96 58"
            stroke="#5eead4"
            strokeWidth="4.4"
            strokeLinecap="round"
            fill="none"
            filter="url(#rb-soft-glow)"
            opacity={thinking ? 0.35 : 1}
            style={{ transition: "opacity 260ms ease" }}
          />
          <ellipse
            cx="90"
            cy="54"
            rx="4.6"
            ry="5.6"
            fill="#5eead4"
            filter="url(#rb-soft-glow)"
            opacity={thinking ? 1 : 0}
            style={{ transition: "opacity 260ms ease" }}
          />

          {/* Right eye (viewer's right) */}
          <path
            d="M 104 58 Q 110 48 116 58"
            stroke="#5eead4"
            strokeWidth="4.4"
            strokeLinecap="round"
            fill="none"
            filter="url(#rb-soft-glow)"
            opacity={thinking ? 0.35 : 1}
            style={{ transition: "opacity 260ms ease" }}
          />
          <ellipse
            cx="110"
            cy="54"
            rx="4.6"
            ry="5.6"
            fill="#5eead4"
            filter="url(#rb-soft-glow)"
            opacity={thinking ? 1 : 0}
            style={{ transition: "opacity 260ms ease" }}
          />
        </g>

        {/* mouth — smiling curve vs. small pondering "o" while thinking */}
        <path
          d="M 91 70 Q 100 76 109 70"
          stroke="#5eead4"
          strokeWidth="3.6"
          strokeLinecap="round"
          fill="none"
          filter="url(#rb-soft-glow)"
          opacity={thinking ? 0 : 1}
          style={{ transition: "opacity 260ms ease" }}
        />
        <circle
          cx="100"
          cy="70"
          r="3.6"
          fill="#5eead4"
          filter="url(#rb-soft-glow)"
          opacity={thinking ? 1 : 0}
          className={thinking ? "robot-mouth-pulse" : ""}
          style={{ transition: "opacity 260ms ease", transformOrigin: "100px 70px" }}
        />

        {/* thinking dots */}
        {thinking && (
          <g className="robot-thinking-dots">
            <circle cx="140" cy="30" r="2.4" fill="#5eead4" />
            <circle cx="148" cy="24" r="2" fill="#5eead4" />
            <circle cx="155" cy="17" r="1.6" fill="#5eead4" />
          </g>
        )}
      </g>
    </svg>
  );
}

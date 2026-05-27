import { useEffect, useRef } from "react";

// Compact synthetic ECG / pleth / capnography waveform. Pure SVG, no deps.
export function MiniWaveform({
  kind = "ecg",
  color = "var(--vital-hr)",
  height = 40,
  width = 200,
  speed = 1,
}: {
  kind?: "ecg" | "pleth" | "capno" | "art";
  color?: string;
  height?: number;
  width?: number;
  speed?: number;
}) {
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => {
    let raf = 0;
    let t = 0;
    const generate = () => {
      t += 0.04 * speed;
      const pts: string[] = [];
      const N = 120;
      for (let i = 0; i < N; i++) {
        const x = (i / (N - 1)) * width;
        const phase = (i / 8) + t;
        let y = height / 2;
        if (kind === "ecg") {
          const beat = phase % (Math.PI * 2);
          const isQRS = Math.abs(beat - 3.5) < 0.18;
          const isP = Math.abs(beat - 2.6) < 0.25;
          const isT = Math.abs(beat - 4.6) < 0.45;
          y = height / 2
            + (isQRS ? -Math.sin((beat - 3.5) * 30) * (height * 0.42) : 0)
            + (isP ? -Math.sin((beat - 2.6) * 12) * (height * 0.10) : 0)
            + (isT ? -Math.sin((beat - 4.6) * 6) * (height * 0.14) : 0)
            + (Math.sin(i * 0.6 + t * 2) * 0.4);
        } else if (kind === "pleth") {
          y = height / 2 - Math.sin(phase) * height * 0.28 - Math.sin(phase * 2 + 1) * height * 0.05;
        } else if (kind === "capno") {
          const p = phase % (Math.PI * 2);
          y = height * 0.8 - (p > 1 && p < 5 ? Math.min(height * 0.55, (p - 1) * height * 0.4) : 0);
        } else if (kind === "art") {
          const p = phase % (Math.PI * 2);
          y = height / 2 - (Math.sin(p) * height * 0.30 + (p < 0.6 ? Math.sin(p * 8) * height * 0.18 : 0));
        }
        pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
      }
      if (ref.current) ref.current.setAttribute("d", pts.join(" "));
      raf = requestAnimationFrame(generate);
    };
    raf = requestAnimationFrame(generate);
    return () => cancelAnimationFrame(raf);
  }, [kind, height, width, speed]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none" className="block">
      <defs>
        <linearGradient id={`g-${kind}-${color}`} x1="0" x2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.2" />
          <stop offset="0.85" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <path ref={ref} fill="none" stroke={`url(#g-${kind}-${color})`} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

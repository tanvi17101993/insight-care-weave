import { useEffect, useState } from "react";
import type { Patient } from "../lib/mock-data";

export interface LiveVitals {
  hr: number;
  spo2: number;
  sys: number;
  dia: number;
  map: number;
  rr: number;
  temp: number;
  etco2: number;
  cvp: number;
}

function jitter(base: number, amp: number) {
  return base + (Math.random() - 0.5) * amp;
}

export function useLiveVitals(p: Patient | undefined, intervalMs = 1500): LiveVitals | null {
  const [v, setV] = useState<LiveVitals | null>(null);
  useEffect(() => {
    if (!p) return;
    const compute = (): LiveVitals => {
      const sys = Math.round(jitter(p.baseSysBP, 6));
      const dia = Math.round(jitter(p.baseDiaBP, 4));
      return {
        hr: Math.round(jitter(p.baseHR, p.severity === "critical" ? 8 : 4)),
        spo2: Math.max(70, Math.min(100, Math.round(jitter(p.baseSpO2, p.severity === "critical" ? 2.5 : 1)))),
        sys,
        dia,
        map: Math.round((sys + 2 * dia) / 3),
        rr: Math.round(jitter(p.baseRR, 1.5)),
        temp: Number(jitter(p.baseTemp, 0.15).toFixed(1)),
        etco2: Math.round(jitter(p.ventilated ? 38 : 34, 2)),
        cvp: Math.round(jitter(8, 2)),
      };
    };
    setV(compute());
    const id = setInterval(() => setV(compute()), intervalMs);
    return () => clearInterval(id);
  }, [p?.id, intervalMs]);
  return v;
}

export function useTickingNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

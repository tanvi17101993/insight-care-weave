import { Link } from "@tanstack/react-router";
import { useLiveVitals } from "../../hooks/use-live-vitals";
import type { Patient } from "../../lib/mock-data";
import { getHospital, SEVERITY_DOT, SEVERITY_BG_SOFT, SEVERITY_LABEL } from "../../lib/mock-data";
import { MiniWaveform } from "./MiniWaveform";
import { Activity, Wind } from "lucide-react";

export function PatientMonitorCard({ patient }: { patient: Patient }) {
  const v = useLiveVitals(patient, 1800);
  const h = getHospital(patient.hospitalId);
  const sev = patient.severity;
  const borderColor =
    sev === "critical" ? "border-l-[color:var(--critical)]" :
    sev === "risk"     ? "border-l-[color:var(--risk)]" :
    sev === "watch"    ? "border-l-[color:var(--watch)]" :
                         "border-l-[color:var(--stable)]";

  return (
    <Link
      to="/patient/$id"
      params={{ id: patient.id }}
      className={`group block rounded-lg bg-card border border-border border-l-4 ${borderColor} hover:shadow-md hover:-translate-y-px transition`}
    >
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`size-1.5 rounded-full ${SEVERITY_DOT[sev]} ${sev === "critical" ? "live-dot" : ""}`} />
              <span className="text-[13px] font-semibold truncate">{patient.name}</span>
            </div>
            <div className="text-[10.5px] text-muted-foreground font-mono">
              {patient.uhid} · {patient.age}{patient.sex} · {h.code} {patient.ward} · {patient.bed}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {patient.ventilated && (
              <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded bg-[color:var(--vital-spo2)]/15 text-[color:var(--vital-spo2)] flex items-center gap-1">
                <Wind className="size-2.5" /> VENT
              </span>
            )}
            <span className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded ${SEVERITY_BG_SOFT[sev]}`}>
              {SEVERITY_LABEL[sev]}
            </span>
          </div>
        </div>

        <div className="h-10 -mx-1 px-1">
          <MiniWaveform kind="ecg" color="var(--vital-hr)" height={40} />
        </div>

        <div className="grid grid-cols-4 gap-1 text-center">
          <Vital label="HR" value={v?.hr ?? "—"} unit="bpm" color="var(--vital-hr)" />
          <Vital label="SpO₂" value={v?.spo2 ?? "—"} unit="%" color="var(--vital-spo2)" warn={v && v.spo2 < 92} />
          <Vital label="BP" value={v ? `${v.sys}/${v.dia}` : "—"} unit="mmHg" color="var(--vital-bp)" small />
          <Vital label="RR" value={v?.rr ?? "—"} unit="/min" color="var(--vital-rr)" />
        </div>

        <div className="flex items-center justify-between text-[10.5px] text-muted-foreground">
          <span className="truncate">{patient.diagnosis}</span>
          <span className="flex items-center gap-1 font-mono"><Activity className="size-3" /> Risk {patient.riskScore}</span>
        </div>
      </div>
    </Link>
  );
}

function Vital({
  label, value, unit, color, warn, small,
}: { label: string; value: React.ReactNode; unit: string; color: string; warn?: boolean | null; small?: boolean }) {
  return (
    <div className={`rounded-md px-1 py-1 ${warn ? "bg-[color:var(--critical)]/10" : "bg-muted/60"}`}>
      <div className="text-[9px] uppercase tracking-wide text-muted-foreground leading-none">{label}</div>
      <div className={`${small ? "text-[13px]" : "text-[16px]"} font-semibold tabular-nums leading-tight`} style={{ color }}>
        {value}
      </div>
      <div className="text-[8.5px] text-muted-foreground leading-none">{unit}</div>
    </div>
  );
}

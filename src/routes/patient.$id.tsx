import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { ScrollArea } from "../components/ui/scroll-area";
import { SeverityBadge } from "../components/clinical/SeverityBadge";
import { MiniWaveform } from "../components/clinical/MiniWaveform";
import {
  getHospital, getPatient, PATIENTS, SAMPLE_LABS, SAMPLE_MEDS, SAMPLE_TIMELINE,
} from "../lib/mock-data";
import { useLiveVitals } from "../hooks/use-live-vitals";
import {
  Activity, AlertTriangle, BedDouble, Calendar, ChevronLeft, ChevronRight,
  ClipboardList, FileText, FlaskConical, HeartPulse, MessageSquare, Pill,
  ShieldAlert, Stethoscope, Wind,
} from "lucide-react";

export const Route = createFileRoute("/patient/$id")({
  component: Patient360,
  loader: ({ params }) => {
    const p = getPatient(params.id);
    if (!p) throw notFound();
    return { patient: p };
  },
});

function Patient360() {
  const { patient } = Route.useLoaderData();
  const v = useLiveVitals(patient, 1500);
  const h = getHospital(patient.hospitalId);
  const los = Math.max(1, Math.floor((Date.now() - new Date(patient.admittedAt).getTime()) / 86400000));

  // sibling navigation
  const idx = PATIENTS.findIndex(p => p.id === patient.id);
  const prev = PATIENTS[(idx - 1 + PATIENTS.length) % PATIENTS.length];
  const next = PATIENTS[(idx + 1) % PATIENTS.length];

  return (
    <AppShell>
      {/* Sticky header */}
      <div className="sticky top-14 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 lg:px-6 py-3 max-w-[1900px]">
          <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
            <Link to="/surveillance" className="flex items-center gap-1 hover:text-foreground"><ChevronLeft className="size-3.5" /> Surveillance</Link>
            <span>/</span>
            <span className="text-foreground">Patient 360</span>
            <div className="ml-auto flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild><Link to="/patient/$id" params={{ id: prev.id }}><ChevronLeft className="size-4" /> Prev</Link></Button>
              <Button variant="ghost" size="sm" asChild><Link to="/patient/$id" params={{ id: next.id }}>Next <ChevronRight className="size-4" /></Link></Button>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-primary/10 text-primary grid place-items-center font-semibold">
                {patient.name.split(" ").map(s => s[0]).slice(0, 2).join("")}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold leading-tight">{patient.name}</h1>
                  <SeverityBadge severity={patient.severity} />
                  {patient.ventilated && <Badge variant="outline" className="gap-1 text-[10px]"><Wind className="size-3" /> Ventilated</Badge>}
                  {patient.isolation && <Badge variant="outline" className="gap-1 text-[10px]"><ShieldAlert className="size-3" /> Isolation</Badge>}
                </div>
                <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                  UHID {patient.uhid} · MRN {patient.mrn} · {patient.age}{patient.sex}
                </div>
              </div>
            </div>

            <Separator orientation="vertical" className="h-10 hidden md:block" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 text-[12px]">
              <Field icon={Stethoscope} label="Consultant" value={patient.consultant} />
              <Field icon={BedDouble} label="Bed" value={`${h.code} · ${patient.ward} · ${patient.bed}`} />
              <Field icon={Calendar} label="Admitted" value={`${new Date(patient.admittedAt).toLocaleDateString()} (LOS ${los}d)`} />
              <Field icon={ClipboardList} label="Diagnosis" value={patient.diagnosis} />
            </div>

            <div className="ml-auto flex gap-1.5">
              <Button variant="outline" size="sm" className="gap-1.5"><MessageSquare className="size-4" /> Message team</Button>
              <Button size="sm" className="gap-1.5"><Stethoscope className="size-4" /> Start tele-consult</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-4 max-w-[1900px]">
        <div className="grid grid-cols-12 gap-4">
          {/* Left: vitals + ventilator */}
          <div className="col-span-12 xl:col-span-8 space-y-4">
            <VitalsPanel v={v} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <VentilatorPanel ventilated={patient.ventilated} />
              <DefibPanel />
            </div>

            <Card className="p-0">
              <Tabs defaultValue="labs">
                <div className="flex items-center justify-between border-b border-border px-3">
                  <TabsList className="bg-transparent gap-1 h-11">
                    <TabsTrigger value="labs" className="data-[state=active]:bg-muted gap-1.5"><FlaskConical className="size-4" /> Labs</TabsTrigger>
                    <TabsTrigger value="meds" className="data-[state=active]:bg-muted gap-1.5"><Pill className="size-4" /> Medication</TabsTrigger>
                    <TabsTrigger value="plan" className="data-[state=active]:bg-muted gap-1.5"><ClipboardList className="size-4" /> Treatment plan</TabsTrigger>
                    <TabsTrigger value="nursing" className="data-[state=active]:bg-muted gap-1.5"><Activity className="size-4" /> Nursing</TabsTrigger>
                    <TabsTrigger value="docs" className="data-[state=active]:bg-muted gap-1.5"><FileText className="size-4" /> Documents</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="labs" className="p-4"><LabsPanel /></TabsContent>
                <TabsContent value="meds" className="p-4"><MedsPanel /></TabsContent>
                <TabsContent value="plan" className="p-4"><PlanPanel diagnosis={patient.diagnosis} /></TabsContent>
                <TabsContent value="nursing" className="p-4"><NursingPanel /></TabsContent>
                <TabsContent value="docs" className="p-4"><DocsPanel /></TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Right: timeline + risk */}
          <div className="col-span-12 xl:col-span-4 space-y-4">
            <RiskPanel patient={patient} />
            <TimelinePanel />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-1.5">
      <Icon className="size-3.5 text-muted-foreground mt-0.5" />
      <div>
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground leading-none">{label}</div>
        <div className="text-[12.5px] font-medium leading-tight">{value}</div>
      </div>
    </div>
  );
}

function VitalsPanel({ v }: { v: ReturnType<typeof useLiveVitals> }) {
  const cells = [
    { label: "HR",   value: v?.hr,   unit: "bpm",  color: "var(--vital-hr)",   kind: "ecg" as const },
    { label: "SpO₂", value: v?.spo2, unit: "%",    color: "var(--vital-spo2)", kind: "pleth" as const },
    { label: "ART",  value: v ? `${v.sys}/${v.dia}` : "—", unit: `MAP ${v?.map ?? "—"}`, color: "var(--vital-bp)", kind: "art" as const },
    { label: "RR",   value: v?.rr,   unit: "/min", color: "var(--vital-rr)",   kind: "capno" as const },
    { label: "Temp", value: v?.temp, unit: "°C",   color: "var(--vital-hr)",   kind: "ecg" as const, hideWave: true },
    { label: "EtCO₂",value: v?.etco2,unit: "mmHg", color: "var(--vital-rr)",   kind: "capno" as const, hideWave: true },
    { label: "CVP",  value: v?.cvp,  unit: "mmHg", color: "var(--vital-bp)",   kind: "art" as const,   hideWave: true },
  ];
  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <HeartPulse className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">Real-time vitals</h2>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-500 live-dot" /> Streaming
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px]">
          {["1h","6h","24h","72h"].map((t, i) => (
            <button key={t} className={`px-2 py-0.5 rounded ${i === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{t}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
        {cells.map((c) => (
          <div key={c.label} className="bg-card p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{c.label}</span>
              <span className="text-[10px] text-muted-foreground">{c.unit}</span>
            </div>
            <div className="text-3xl font-semibold tabular-nums leading-tight mt-1" style={{ color: c.color }}>
              {c.value ?? "—"}
            </div>
            {!c.hideWave && (
              <div className="h-9 mt-1 -mx-1">
                <MiniWaveform kind={c.kind} color={c.color} height={36} />
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function VentilatorPanel({ ventilated }: { ventilated: boolean }) {
  if (!ventilated) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2"><Wind className="size-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Ventilator</h2></div>
        <div className="text-xs text-muted-foreground py-8 text-center">Patient is not currently ventilated.</div>
      </Card>
    );
  }
  const rows = [
    ["Mode", "PSV"], ["FiO₂", "0.45"], ["PEEP", "8 cmH₂O"],
    ["Tidal Vol", "420 mL"], ["RR set", "16"], ["Plateau", "22 cmH₂O"],
    ["Compliance", "38 mL/cmH₂O"], ["Pressure Sup.", "12 cmH₂O"],
  ];
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><Wind className="size-4 text-[color:var(--vital-spo2)]" /><h2 className="text-sm font-semibold">Ventilator</h2></div>
        <Badge variant="outline" className="text-[10px]">Drager Evita V600</Badge>
      </div>
      <div className="h-12 mb-3"><MiniWaveform kind="capno" color="var(--vital-rr)" height={48} /></div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12.5px]">
        {rows.map(([k, val]) => (
          <div key={k} className="flex justify-between border-b border-dashed border-border py-1">
            <span className="text-muted-foreground">{k}</span><span className="font-semibold tabular-nums">{val}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DefibPanel() {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><Activity className="size-4 text-[color:var(--vital-hr)]" /><h2 className="text-sm font-semibold">Defibrillator / Rhythm</h2></div>
        <Badge variant="outline" className="text-[10px]">Sinus rhythm</Badge>
      </div>
      <div className="h-16 -mx-1"><MiniWaveform kind="ecg" color="var(--vital-hr)" height={64} /></div>
      <div className="mt-3 text-[12px] space-y-1.5">
        <Row k="Last shock" v="—" />
        <Row k="Cardiac events 24h" v="2 (PVC runs)" />
        <Row k="Code Blue" v="None on record" />
      </div>
    </Card>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between border-b border-dashed border-border py-1"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>;
}

function LabsPanel() {
  const sections = [
    { key: "hematology", label: "Hematology" },
    { key: "biochemistry", label: "Biochemistry" },
    { key: "abg", label: "ABG" },
    { key: "cardiac", label: "Cardiac" },
    { key: "microbiology", label: "Micro" },
  ] as const;
  return (
    <Tabs defaultValue="hematology">
      <TabsList className="bg-muted">
        {sections.map(s => <TabsTrigger key={s.key} value={s.key}>{s.label}</TabsTrigger>)}
      </TabsList>
      {sections.map(s => (
        <TabsContent key={s.key} value={s.key} className="mt-3">
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="text-left text-muted-foreground text-[11px] border-b border-border">
                  <th className="py-1.5 pr-4">Test</th><th className="pr-4">Value</th><th className="pr-4">Unit</th><th className="pr-4">Ref.</th><th>Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(SAMPLE_LABS as any)[s.key].map((row: any) => (
                  <tr key={row.name}>
                    <td className="py-1.5 pr-4 font-medium">{row.name}</td>
                    <td className="pr-4 tabular-nums">{row.value}</td>
                    <td className="pr-4 text-muted-foreground">{row.unit}</td>
                    <td className="pr-4 text-muted-foreground">{row.ref}</td>
                    <td>{<FlagBadge flag={row.flag} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

function FlagBadge({ flag }: { flag: string }) {
  if (flag === "critical") return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[color:var(--critical)]/15 text-[color:var(--critical)]">CRIT</span>;
  if (flag === "high") return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[color:var(--risk)]/15 text-[color:var(--risk-foreground)]">HIGH</span>;
  if (flag === "low") return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[color:var(--watch)]/30 text-[color:var(--watch-foreground)]">LOW</span>;
  return <span className="text-[10px] text-muted-foreground">—</span>;
}

function MedsPanel() {
  return (
    <table className="w-full text-[12.5px]">
      <thead>
        <tr className="text-left text-muted-foreground text-[11px] border-b border-border">
          <th className="py-1.5 pr-4">Medication</th><th className="pr-4">Dose</th><th className="pr-4">Route</th><th className="pr-4">Last</th><th>Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {SAMPLE_MEDS.map(m => (
          <tr key={m.name}>
            <td className="py-1.5 pr-4 font-medium">{m.name}</td>
            <td className="pr-4">{m.dose}</td>
            <td className="pr-4 text-muted-foreground">{m.route}</td>
            <td className="pr-4 text-muted-foreground tabular-nums">{m.last}</td>
            <td>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                m.flag === "missed" ? "bg-[color:var(--critical)]/15 text-[color:var(--critical)]" :
                m.flag === "delay" ? "bg-[color:var(--watch)]/30 text-[color:var(--watch-foreground)]" :
                m.flag === "active" ? "bg-primary/15 text-primary" :
                "bg-[color:var(--stable)]/20 text-[color:var(--stable-foreground)]"
              }`}>{m.status}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PlanPanel({ diagnosis }: { diagnosis: string }) {
  return (
    <div className="grid md:grid-cols-2 gap-4 text-[12.5px]">
      <div>
        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-2">Goals</h3>
        <ul className="list-disc pl-4 space-y-1">
          <li>Source control for {diagnosis.toLowerCase()} within 6h</li>
          <li>MAP &gt; 65 mmHg with minimum vasopressor</li>
          <li>SpO₂ ≥ 94%, lung-protective ventilation</li>
          <li>Glycemic control 140–180 mg/dL</li>
        </ul>
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-2">Care plan</h3>
        <ul className="list-disc pl-4 space-y-1">
          <li>Sepsis bundle re-evaluation q6h</li>
          <li>De-escalate antibiotics per culture sensitivity</li>
          <li>Daily SBT once FiO₂ ≤ 0.4 & PEEP ≤ 8</li>
          <li>DVT prophylaxis, stress ulcer prophylaxis</li>
        </ul>
      </div>
    </div>
  );
}

function NursingPanel() {
  const items = [
    ["Intake (24h)", "2,180 mL"], ["Output (24h)", "1,640 mL"], ["Balance", "+540 mL"],
    ["Fall risk", "Moderate (Morse 45)"], ["Pain score", "3 / 10"],
    ["GCS", "11 (E3 V3 M5)"], ["Braden score", "14"], ["Pressure ulcer", "Stage I sacral"],
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[12.5px]">
      {items.map(([k, v]) => (
        <div key={k} className="rounded-md border border-border p-3">
          <div className="text-[10.5px] uppercase tracking-wide text-muted-foreground">{k}</div>
          <div className="font-semibold mt-0.5">{v}</div>
        </div>
      ))}
    </div>
  );
}

function DocsPanel() {
  const docs = [
    "Admission consent.pdf", "ECG admission.pdf", "CT chest report.pdf",
    "Referral letter — Dr Khan.pdf", "Previous discharge summary.pdf", "Echocardiogram report.pdf",
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {docs.map(d => (
        <button key={d} className="text-left rounded-md border border-border p-3 hover:border-primary/40 transition">
          <FileText className="size-5 text-primary mb-2" />
          <div className="text-[12.5px] font-medium truncate">{d}</div>
          <div className="text-[10.5px] text-muted-foreground">PDF · 2 pages</div>
        </button>
      ))}
    </div>
  );
}

function RiskPanel({ patient }: { patient: ReturnType<typeof getPatient> }) {
  if (!patient) return null;
  const score = patient.riskScore;
  const ring = score > 75 ? "var(--critical)" : score > 50 ? "var(--risk)" : score > 30 ? "var(--watch)" : "var(--stable)";
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><AlertTriangle className="size-4 text-[color:var(--risk)]" /><h2 className="text-sm font-semibold">Risk stratification</h2></div>
        <Badge variant="outline" className="text-[10px]">AI assisted</Badge>
      </div>
      <div className="flex items-center gap-5 mt-4">
        <div className="relative size-24">
          <svg viewBox="0 0 100 100" className="-rotate-90">
            <circle cx="50" cy="50" r="42" stroke="var(--muted)" strokeWidth="10" fill="none" />
            <circle cx="50" cy="50" r="42" stroke={ring} strokeWidth="10" fill="none"
              strokeDasharray={`${(score / 100) * 264} 264`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="text-xl font-semibold tabular-nums">{score}</div>
              <div className="text-[9.5px] uppercase tracking-wide text-muted-foreground">risk</div>
            </div>
          </div>
        </div>
        <ul className="text-[12px] space-y-1.5">
          <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-[color:var(--critical)]" /> Sepsis risk · High</li>
          <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-[color:var(--risk)]" /> Respiratory failure · Moderate</li>
          <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-[color:var(--watch)]" /> Cardiac event · Low</li>
          <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-[color:var(--stable)]" /> Neuro deterioration · Low</li>
        </ul>
      </div>
    </Card>
  );
}

function TimelinePanel() {
  return (
    <Card className="p-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">Clinical timeline</h2>
        <Badge variant="outline" className="text-[10px]">Last 48h</Badge>
      </div>
      <ScrollArea className="h-[520px]">
        <ol className="relative pl-8 pr-4 py-4 space-y-4 before:absolute before:left-4 before:top-4 before:bottom-4 before:w-px before:bg-border">
          {SAMPLE_TIMELINE.map((e, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-4 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
              <div className="flex items-center justify-between text-[10.5px] text-muted-foreground">
                <span className="font-medium uppercase tracking-wide">{e.kind}</span><span>{e.at}</span>
              </div>
              <div className="text-[12.5px] mt-0.5">{e.text}</div>
            </li>
          ))}
        </ol>
      </ScrollArea>
    </Card>
  );
}

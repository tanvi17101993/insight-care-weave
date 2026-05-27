import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { PATIENTS, SAMPLE_LABS } from "../lib/mock-data";
import { useLiveVitals } from "../hooks/use-live-vitals";
import { MiniWaveform } from "../components/clinical/MiniWaveform";
import { SeverityBadge } from "../components/clinical/SeverityBadge";
import { Camera, Mic, MicOff, PhoneOff, Send, Video, VideoOff } from "lucide-react";

export const Route = createFileRoute("/tele-icu")({ component: TeleICU });

function TeleICU() {
  const [patientId, setPatientId] = useState(PATIENTS.find(p => p.severity === "critical")!.id);
  const patient = PATIENTS.find(p => p.id === patientId)!;
  const v = useLiveVitals(patient, 1500);

  return (
    <AppShell>
      <div className="p-4 lg:p-6 space-y-4 max-w-[1900px]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Tele-ICU Consultation Workspace</h1>
            <p className="text-sm text-muted-foreground">Remote intensivist review · Dr. R. Iyer on call</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger className="h-9 w-[260px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PATIENTS.filter(p => p.severity !== "stable").slice(0, 20).map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name} · {p.uhid} · {p.diagnosis}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">View EMR</Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Video pane */}
          <div className="col-span-12 xl:col-span-5 space-y-4">
            <Card className="p-0 overflow-hidden">
              <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="absolute inset-0 grid place-items-center text-slate-300">
                  <div className="text-center">
                    <Camera className="size-10 mx-auto opacity-50" />
                    <div className="mt-2 text-sm">Bedside camera · {patient.ward} {patient.bed}</div>
                    <div className="text-[10.5px] mt-1 text-slate-400 font-mono">1080p · 24 fps · Encrypted</div>
                  </div>
                </div>
                <div className="absolute top-2 left-2 flex items-center gap-1.5 text-[10px] text-white bg-black/40 backdrop-blur px-2 py-1 rounded">
                  <span className="size-1.5 rounded-full bg-red-500 live-dot" /> LIVE
                </div>
                <div className="absolute bottom-3 right-3 w-32 aspect-video rounded-md border border-white/20 bg-gradient-to-br from-slate-700 to-slate-900 grid place-items-center text-[10px] text-slate-300">
                  Dr. R. Iyer
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-2 border-t border-border">
                <div className="text-[12px]">
                  <span className="font-medium">{patient.name}</span>
                  <span className="text-muted-foreground"> · {patient.age}{patient.sex} · {patient.diagnosis}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="size-8"><Mic className="size-4" /></Button>
                  <Button variant="ghost" size="icon" className="size-8"><Video className="size-4" /></Button>
                  <Button variant="ghost" size="icon" className="size-8"><MicOff className="size-4" /></Button>
                  <Button variant="ghost" size="icon" className="size-8"><VideoOff className="size-4" /></Button>
                  <Button variant="destructive" size="icon" className="size-8"><PhoneOff className="size-4" /></Button>
                </div>
              </div>
            </Card>

            <RecommendationPanel patient={patient} />
          </div>

          {/* Vitals + EMR */}
          <div className="col-span-12 xl:col-span-7 space-y-4">
            <Card className="p-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
                <Tile label="HR" value={v?.hr} unit="bpm" color="var(--vital-hr)" kind="ecg" />
                <Tile label="SpO₂" value={v?.spo2} unit="%" color="var(--vital-spo2)" kind="pleth" />
                <Tile label="ART" value={v ? `${v.sys}/${v.dia}` : "—"} unit={`MAP ${v?.map ?? "—"}`} color="var(--vital-bp)" kind="art" />
                <Tile label="RR" value={v?.rr} unit="/min" color="var(--vital-rr)" kind="capno" />
              </div>
            </Card>

            <Card className="p-4">
              <Tabs defaultValue="emr">
                <TabsList className="bg-muted">
                  <TabsTrigger value="emr">EMR snapshot</TabsTrigger>
                  <TabsTrigger value="labs">Latest labs</TabsTrigger>
                  <TabsTrigger value="vent">Ventilator</TabsTrigger>
                </TabsList>
                <TabsContent value="emr" className="mt-3 grid md:grid-cols-2 gap-3 text-[12.5px]">
                  <Field k="Severity" v={<SeverityBadge severity={patient.severity} />} />
                  <Field k="Risk score" v={`${patient.riskScore}/100`} />
                  <Field k="Ventilator" v={patient.ventilated ? "Yes (PSV mode)" : "No"} />
                  <Field k="Consultant" v={patient.consultant} />
                  <Field k="Diagnosis" v={patient.diagnosis} />
                  <Field k="Allergies" v="NKDA" />
                  <Field k="Code status" v="Full code" />
                  <Field k="Last review" v="38 min ago" />
                </TabsContent>
                <TabsContent value="labs" className="mt-3">
                  <table className="w-full text-[12.5px]">
                    <thead><tr className="text-left text-muted-foreground text-[11px] border-b border-border"><th className="py-1.5 pr-4">Test</th><th>Value</th><th>Ref</th></tr></thead>
                    <tbody className="divide-y divide-border">
                      {SAMPLE_LABS.abg.concat(SAMPLE_LABS.cardiac).map(r => (
                        <tr key={r.name}><td className="py-1.5 pr-4 font-medium">{r.name}</td><td className="tabular-nums">{r.value} {r.unit}</td><td className="text-muted-foreground">{r.ref}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </TabsContent>
                <TabsContent value="vent" className="mt-3 grid grid-cols-2 gap-3 text-[12.5px]">
                  {[["Mode","PSV"],["FiO₂","0.45"],["PEEP","8"],["TV","420 mL"],["RR","16"],["Plateau","22"]].map(([k,vv]) => <Field key={k} k={k} v={vv} />)}
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Tile({ label, value, unit, color, kind }: any) {
  return (
    <div className="bg-card p-3">
      <div className="flex justify-between"><span className="text-[10px] uppercase text-muted-foreground tracking-wide">{label}</span><span className="text-[10px] text-muted-foreground">{unit}</span></div>
      <div className="text-3xl font-semibold tabular-nums mt-1" style={{ color }}>{value ?? "—"}</div>
      <div className="h-9 mt-1 -mx-1"><MiniWaveform kind={kind} color={color} height={36} /></div>
    </div>
  );
}

function Field({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-dashed border-border py-1.5">
      <span className="text-muted-foreground text-[11.5px]">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}

function RecommendationPanel({ patient }: { patient: typeof PATIENTS[number] }) {
  const [text, setText] = useState(
    `Re-evaluate sepsis bundle for ${patient.name}.\nSuggest: increase norepinephrine titration cap to 0.25 mcg/kg/min, target MAP ≥ 65.\nObtain repeat lactate at 2h.`
  );
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold">Tele-ICU recommendation</h2>
        <Badge variant="outline" className="text-[10px]">Draft · v3</Badge>
      </div>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="text-[12.5px]" />
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1 text-[10.5px] text-muted-foreground">
          {["Draft","Sent","Acknowledged","Accepted","Implemented"].map((s, i) => (
            <span key={s} className="flex items-center gap-1">
              <span className={`size-1.5 rounded-full ${i === 0 ? "bg-primary" : "bg-muted-foreground/40"}`} />
              {s}{i < 4 ? " ›" : ""}
            </span>
          ))}
        </div>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm">Save draft</Button>
          <Button size="sm" className="gap-1.5"><Send className="size-3.5" /> Send to bedside</Button>
        </div>
      </div>
    </Card>
  );
}

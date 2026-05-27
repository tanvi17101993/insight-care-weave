import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { SeverityBadge } from "../components/clinical/SeverityBadge";
import { ALERTS, getHospital, PATIENTS, SEVERITY_DOT } from "../lib/mock-data";
import { AlertTriangle, Bell, BellRing, Phone, Radio, ShieldAlert, Stethoscope } from "lucide-react";

export const Route = createFileRoute("/alerts")({ component: Alerts });

const STEPS = ["generated","assigned","acknowledged","escalated","resolved"] as const;

function Alerts() {
  const counts = {
    all: ALERTS.length,
    physiological: ALERTS.filter(a => a.category === "physiological").length,
    device: ALERTS.filter(a => a.category === "device").length,
    clinical: ALERTS.filter(a => a.category === "clinical").length,
    operational: ALERTS.filter(a => a.category === "operational").length,
  };
  return (
    <AppShell>
      <div className="p-4 lg:p-6 space-y-4 max-w-[1900px]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2"><BellRing className="size-5 text-[color:var(--critical)]" /> Alerts &amp; Escalations</h1>
            <p className="text-sm text-muted-foreground">{counts.all} active alerts across the network · Median ack 1m 42s</p>
          </div>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" className="gap-1.5"><Radio className="size-4" /> Broadcast</Button>
            <Button size="sm" className="gap-1.5"><Phone className="size-4" /> Call intensivist</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Pill label="Physiological" value={counts.physiological} icon={AlertTriangle} accent="text-[color:var(--vital-hr)]" />
          <Pill label="Device" value={counts.device} icon={ShieldAlert} accent="text-[color:var(--vital-spo2)]" />
          <Pill label="Clinical" value={counts.clinical} icon={Stethoscope} accent="text-[color:var(--critical)]" />
          <Pill label="Operational" value={counts.operational} icon={Bell} accent="text-[color:var(--watch-foreground)]" />
        </div>

        <Tabs defaultValue="all">
          <TabsList className="bg-muted">
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="physiological">Physiological ({counts.physiological})</TabsTrigger>
            <TabsTrigger value="device">Device ({counts.device})</TabsTrigger>
            <TabsTrigger value="clinical">Clinical ({counts.clinical})</TabsTrigger>
            <TabsTrigger value="operational">Operational ({counts.operational})</TabsTrigger>
          </TabsList>
          {(["all","physiological","device","clinical","operational"] as const).map(cat => (
            <TabsContent key={cat} value={cat} className="mt-3">
              <AlertTable items={cat === "all" ? ALERTS : ALERTS.filter(a => a.category === cat)} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppShell>
  );
}

function Pill({ label, value, icon: Icon, accent }: { label: string; value: number; icon: any; accent: string }) {
  return (
    <Card className="p-3.5 flex items-center justify-between">
      <div>
        <div className="text-[10.5px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
      </div>
      <Icon className={`size-6 ${accent}`} />
    </Card>
  );
}

function AlertTable({ items }: { items: typeof ALERTS }) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px]">
          <thead className="bg-muted/50">
            <tr className="text-left text-muted-foreground text-[11px]">
              <th className="px-4 py-2.5">Time</th>
              <th className="py-2.5 pr-4">Patient</th>
              <th className="py-2.5 pr-4">Hospital · Bed</th>
              <th className="py-2.5 pr-4">Alert</th>
              <th className="py-2.5 pr-4">Severity</th>
              <th className="py-2.5 pr-4">Workflow</th>
              <th className="py-2.5 pr-4">SLA</th>
              <th className="py-2.5 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map(a => {
              const p = PATIENTS.find(x => x.id === a.patientId)!;
              const h = getHospital(p.hospitalId);
              const stepIdx = STEPS.indexOf(a.status);
              return (
                <tr key={a.id} className="hover:bg-muted/40">
                  <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                    {new Date(a.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="py-2.5 pr-4">
                    <Link to="/patient/$id" params={{ id: p.id }} className="font-medium hover:underline">{p.name}</Link>
                    <div className="text-[10.5px] text-muted-foreground">{p.uhid}</div>
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{h.code} · {p.ward} · {p.bed}</td>
                  <td className="py-2.5 pr-4">
                    <div className="font-medium">{a.type}</div>
                    <div className="text-[10.5px] text-muted-foreground">{a.message}</div>
                  </td>
                  <td className="py-2.5 pr-4"><SeverityBadge severity={a.severity} className="text-[10px]" /></td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-1">
                      {STEPS.map((s, i) => (
                        <span key={s} className={`h-1.5 rounded-full ${i <= stepIdx ? "bg-primary" : "bg-muted"}`} style={{ width: 22 }} title={s} />
                      ))}
                    </div>
                    <div className="text-[10px] mt-1 capitalize text-muted-foreground">{a.status}</div>
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-[11px]">
                    <span className={a.slaSeconds < 120 ? "text-[color:var(--critical)]" : "text-muted-foreground"}>
                      {Math.floor(a.slaSeconds / 60)}m {a.slaSeconds % 60}s
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-7 text-[11px]">Ack</Button>
                      <Button variant="ghost" size="sm" className="h-7 text-[11px]">Escalate</Button>
                      <Button size="sm" className="h-7 text-[11px]">Call</Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

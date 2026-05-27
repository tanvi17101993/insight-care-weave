import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { PatientMonitorCard } from "../components/clinical/PatientMonitorCard";
import { HOSPITALS, PATIENTS } from "../lib/mock-data";
import { Grid2x2, LayoutGrid, Search, ShieldAlert, Wind, HeartPulse, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/surveillance")({ component: Surveillance });

function Surveillance() {
  const [q, setQ] = useState("");
  const [hospital, setHospital] = useState("all");
  const [risk, setRisk] = useState("all");
  const [vent, setVent] = useState("any");
  const [density, setDensity] = useState<"comfortable" | "dense">("comfortable");

  const patients = useMemo(() => PATIENTS.filter(p => {
    if (hospital !== "all" && p.hospitalId !== hospital) return false;
    if (risk !== "all" && p.severity !== risk) return false;
    if (vent === "yes" && !p.ventilated) return false;
    if (vent === "no" && p.ventilated) return false;
    if (q && !`${p.name} ${p.uhid} ${p.bed} ${p.consultant}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [q, hospital, risk, vent]);

  return (
    <AppShell>
      <div className="p-4 lg:p-6 space-y-4 max-w-[1900px]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Patient Surveillance Center</h1>
            <p className="text-sm text-muted-foreground">Central monitoring station — {patients.length} of {PATIENTS.length} patients shown</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant={density === "comfortable" ? "secondary" : "ghost"} size="sm" onClick={() => setDensity("comfortable")}><LayoutGrid className="size-4" /></Button>
            <Button variant={density === "dense" ? "secondary" : "ghost"} size="sm" onClick={() => setDensity("dense")}><Grid2x2 className="size-4" /></Button>
            <Button variant="outline" size="sm">Full-screen mode</Button>
          </div>
        </div>

        {/* Strip stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <StripStat icon={HeartPulse} label="ICU census" value={patients.filter(p => /ICU|CCU/.test(p.ward)).length} accent="text-[color:var(--vital-hr)]" />
          <StripStat icon={Wind} label="On ventilator" value={patients.filter(p => p.ventilated).length} accent="text-[color:var(--vital-spo2)]" />
          <StripStat icon={ShieldAlert} label="Critical" value={patients.filter(p => p.severity === "critical").length} accent="text-[color:var(--critical)]" />
          <StripStat icon={AlertTriangle} label="High risk" value={patients.filter(p => p.severity === "risk").length} accent="text-[color:var(--risk)]" />
        </div>

        {/* Filters */}
        <Card className="p-3">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-2">
            <div className="md:col-span-4 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, UHID, bed, consultant…" className="pl-8 h-9 text-sm" />
            </div>
            <Filter v={hospital} onChange={setHospital} placeholder="Hospital" options={[{ v: "all", l: "All hospitals" }, ...HOSPITALS.map(h => ({ v: h.id, l: `${h.code} · ${h.city}` }))]} cls="md:col-span-2" />
            <Filter v={risk} onChange={setRisk} options={[{ v: "all", l: "Any acuity" }, { v: "stable", l: "Stable" }, { v: "watch", l: "Watchlist" }, { v: "risk", l: "High risk" }, { v: "critical", l: "Critical" }]} cls="md:col-span-2" />
            <Filter v={vent} onChange={setVent} options={[{ v: "any", l: "Any vent" }, { v: "yes", l: "Ventilated" }, { v: "no", l: "Not vented" }]} cls="md:col-span-2" />
            <div className="md:col-span-2 flex items-center justify-end gap-1">
              <Badge variant="outline" className="text-[10px]">{patients.length} patients</Badge>
              <Button variant="ghost" size="sm" onClick={() => { setQ(""); setHospital("all"); setRisk("all"); setVent("any"); }}>Reset</Button>
            </div>
          </div>
        </Card>

        {/* Grid */}
        <div className={`grid gap-3 ${density === "dense" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"}`}>
          {patients.map(p => <PatientMonitorCard key={p.id} patient={p} />)}
        </div>
      </div>
    </AppShell>
  );
}

function Filter({ v, onChange, options, cls = "", placeholder }: { v: string; onChange: (v: string) => void; options: { v: string; l: string }[]; cls?: string; placeholder?: string }) {
  return (
    <div className={cls}>
      <Select value={v} onValueChange={onChange}>
        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>{options.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

function StripStat({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number; accent: string }) {
  return (
    <Card className="px-3.5 py-2.5 flex items-center gap-3">
      <Icon className={`size-5 ${accent}`} />
      <div className="leading-tight">
        <div className="text-[10px] uppercase text-muted-foreground tracking-wide">{label}</div>
        <div className="text-lg font-semibold tabular-nums">{value}</div>
      </div>
    </Card>
  );
}

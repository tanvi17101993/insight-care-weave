import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  ACTIVITIES, ALERTS, HOSPITALS, KPIS, PATIENTS,
  SEVERITY_BG_SOFT, SEVERITY_DOT,
} from "../lib/mock-data";
import { SeverityBadge } from "../components/clinical/SeverityBadge";
import {
  Activity, AlertTriangle, ArrowUpRight, BedDouble, ChevronRight,
  HeartPulse, MapPin, ShieldAlert, Siren, Stethoscope, Wind, ArrowDownRight,
} from "lucide-react";
import { useTickingNow } from "../hooks/use-live-vitals";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  return (
    <AppShell>
      <div className="p-4 lg:p-6 space-y-5 max-w-[1800px]">
        <PageHeader />
        <KpiRow />

        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 xl:col-span-8 space-y-5">
            <AcuityOverview />
            <HospitalOverview />
            <GeoMap />
          </div>
          <div className="col-span-12 xl:col-span-4 space-y-5">
            <LiveAlertFeed />
            <ActivityTimeline />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function PageHeader() {
  const now = useTickingNow(1000);
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground uppercase tracking-wider">
          <span className="size-1.5 rounded-full bg-emerald-500 live-dot" />
          Live operations • {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">Enterprise Command Center</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Real-time clinical and operational oversight across {HOSPITALS.length} hospitals and {KPIS.admitted} admitted patients.
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">Shift handoff</Button>
        <Button variant="outline" size="sm">Export snapshot</Button>
        <Button size="sm" className="gap-1.5"><Siren className="size-4" /> Declare incident</Button>
      </div>
    </div>
  );
}

function KpiRow() {
  const items = [
    { k: "Admitted", v: KPIS.admitted, trend: "+12", up: true, icon: BedDouble, accent: "text-primary" },
    { k: "ICU", v: KPIS.icu, trend: "+3", up: true, icon: HeartPulse, accent: "text-[color:var(--vital-hr)]" },
    { k: "Ventilator", v: KPIS.vent, trend: "−1", up: false, icon: Wind, accent: "text-[color:var(--vital-spo2)]" },
    { k: "Critical", v: KPIS.critical, trend: "+2", up: true, icon: ShieldAlert, accent: "text-[color:var(--critical)]", critical: true },
    { k: "Active alerts", v: KPIS.alerts, trend: "+5", up: true, icon: AlertTriangle, accent: "text-[color:var(--risk)]" },
    { k: "New admissions", v: KPIS.newAdmissions, trend: "+8", up: true, icon: ArrowUpRight, accent: "text-emerald-600" },
    { k: "Pending escalations", v: KPIS.pendingEscalations, trend: "−2", up: false, icon: Activity, accent: "text-[color:var(--watch-foreground)]" },
    { k: "Code Blue (24h)", v: KPIS.codeBlue, trend: "0", up: false, icon: Siren, accent: "text-[color:var(--critical)]" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <Card key={it.k} className={`p-3.5 ${it.critical ? "ring-1 ring-[color:var(--critical)]/30" : ""}`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{it.k}</span>
              <Icon className={`size-4 ${it.accent}`} />
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="text-2xl font-semibold tabular-nums">{it.v}</span>
              <span className={`text-[11px] font-medium flex items-center ${it.up ? "text-emerald-600" : "text-muted-foreground"}`}>
                {it.up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                {it.trend}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function AcuityOverview() {
  const counts = {
    stable: PATIENTS.filter(p => p.severity === "stable").length,
    watch: PATIENTS.filter(p => p.severity === "watch").length,
    risk: PATIENTS.filter(p => p.severity === "risk").length,
    critical: PATIENTS.filter(p => p.severity === "critical").length,
  };
  const total = counts.stable + counts.watch + counts.risk + counts.critical;
  const pct = (n: number) => Math.round((n / total) * 100);
  // donut chart calc
  const segments = [
    { key: "stable", val: counts.stable, color: "var(--stable)" },
    { key: "watch", val: counts.watch, color: "var(--watch)" },
    { key: "risk", val: counts.risk, color: "var(--risk)" },
    { key: "critical", val: counts.critical, color: "var(--critical)" },
  ];
  let acc = 0;
  const R = 60, C = 2 * Math.PI * R;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold">Enterprise patient acuity</h2>
          <p className="text-xs text-muted-foreground">Distribution across all monitored beds</p>
        </div>
        <Badge variant="outline" className="text-[10px]">Updated 2s ago</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
        <div className="flex items-center gap-5">
          <svg viewBox="0 0 160 160" className="size-40 -rotate-90">
            <circle cx="80" cy="80" r={R} stroke="var(--muted)" strokeWidth="20" fill="none" />
            {segments.map((s) => {
              const len = (s.val / total) * C;
              const dash = `${len} ${C - len}`;
              const el = (
                <circle key={s.key} cx="80" cy="80" r={R} stroke={s.color} strokeWidth="20" fill="none"
                  strokeDasharray={dash} strokeDashoffset={-acc} strokeLinecap="butt" />
              );
              acc += len;
              return el;
            })}
            <text x="80" y="78" textAnchor="middle" transform="rotate(90 80 80)" className="fill-foreground" style={{ fontSize: 26, fontWeight: 600 }}>{total}</text>
            <text x="80" y="96" textAnchor="middle" transform="rotate(90 80 80)" className="fill-muted-foreground" style={{ fontSize: 10 }}>monitored</text>
          </svg>
          <div className="space-y-2 text-sm">
            {segments.map(s => (
              <div key={s.key} className="flex items-center gap-2 min-w-[140px]">
                <span className="size-2.5 rounded-sm" style={{ background: s.color }} />
                <span className="capitalize text-foreground/80 flex-1">{s.key === "risk" ? "High risk" : s.key === "watch" ? "Watchlist" : s.key}</span>
                <span className="tabular-nums font-medium">{s.val}</span>
                <span className="tabular-nums text-muted-foreground text-xs w-9 text-right">{pct(s.val)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
              <span>Acuity distribution</span><span>{total} patients</span>
            </div>
            <div className="flex h-7 rounded-md overflow-hidden border border-border">
              {segments.map(s => (
                <div key={s.key} title={`${s.key} ${s.val}`} style={{ width: `${pct(s.val)}%`, background: s.color }} />
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <Mini label="Sepsis suspected" value="14" tone="risk" />
            <Mini label="Cardiac watch" value="9" tone="watch" />
            <Mini label="Respiratory failure risk" value="6" tone="critical" />
            <Mini label="Neuro deterioration" value="3" tone="risk" />
          </div>
        </div>
      </div>
    </Card>
  );
}

function Mini({ label, value, tone }: { label: string; value: string; tone: keyof typeof SEVERITY_BG_SOFT }) {
  return (
    <div className={`flex items-center justify-between px-2.5 py-2 rounded-md ${SEVERITY_BG_SOFT[tone as any]}`}>
      <span>{label}</span><span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function HospitalOverview() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold">Hospital overview</h2>
          <p className="text-xs text-muted-foreground">Live capacity and clinical load</p>
        </div>
        <Link to="/surveillance" className="text-xs text-primary flex items-center gap-1">Open surveillance <ChevronRight className="size-3" /></Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {HOSPITALS.map(h => {
          const occ = Math.round((h.occupied / h.beds) * 100);
          const icu = Math.round((h.icuOccupied / h.icuBeds) * 100);
          const vent = Math.round((h.ventInUse / h.ventilators) * 100);
          return (
            <div key={h.id} className="rounded-md border border-border p-3.5 bg-card hover:border-primary/40 transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-mono text-muted-foreground">{h.code}</div>
                  <div className="text-[13px] font-semibold">{h.name}</div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <MapPin className="size-3" /> {h.city}
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <Bar label="Beds" used={h.occupied} total={h.beds} pct={occ} />
                <Bar label="ICU" used={h.icuOccupied} total={h.icuBeds} pct={icu} accent="var(--vital-hr)" />
                <Bar label="Vent" used={h.ventInUse} total={h.ventilators} pct={vent} accent="var(--vital-spo2)" />
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 text-[color:var(--critical)] font-medium">
                  <ShieldAlert className="size-3" /> {h.critical} critical
                </span>
                <span className="flex items-center gap-1 text-[color:var(--risk)] font-medium">
                  <AlertTriangle className="size-3" /> {h.activeAlerts} alerts
                </span>
                <span className="text-muted-foreground">Cap. {h.beds - h.occupied} free</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function Bar({ label, used, total, pct, accent = "var(--primary)" }: { label: string; used: number; total: number; pct: number; accent?: string }) {
  return (
    <div>
      <div className="flex justify-between text-[10.5px] text-muted-foreground">
        <span>{label}</span><span className="tabular-nums">{used}/{total} · {pct}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: accent }} />
      </div>
    </div>
  );
}

function GeoMap() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold">Network map</h2>
          <p className="text-xs text-muted-foreground">Hospitals, active alerts and ambulance movement</p>
        </div>
        <div className="flex gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className={`size-2 rounded-full ${SEVERITY_DOT.critical}`} /> Critical alerts</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-primary" /> Hospital</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-px bg-foreground/40" /> Transfer</span>
        </div>
      </div>
      <div className="relative h-72 rounded-md overflow-hidden bg-[linear-gradient(180deg,oklch(0.96_0.012_240),oklch(0.98_0.008_220))] border border-border">
        {/* grid */}
        <svg className="absolute inset-0 w-full h-full opacity-50">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* connecting lines */}
        <svg className="absolute inset-0 w-full h-full">
          {HOSPITALS.slice(1).map((h, i) => (
            <line key={h.id} x1={`${HOSPITALS[0].lng}%`} y1={`${HOSPITALS[0].lat}%`}
              x2={`${h.lng}%`} y2={`${h.lat}%`} stroke="var(--primary)" strokeOpacity="0.25" strokeDasharray="3 4" strokeWidth={1 + (i % 2)} />
          ))}
        </svg>
        {HOSPITALS.map(h => (
          <div key={h.id} className="absolute -translate-x-1/2 -translate-y-1/2"
               style={{ left: `${h.lng}%`, top: `${h.lat}%` }}>
            <div className="relative">
              {h.critical > 0 && <span className="absolute inset-0 rounded-full bg-[color:var(--critical)]/30 animate-ping" />}
              <div className="relative size-3 rounded-full bg-primary ring-2 ring-background" />
            </div>
            <div className="mt-1.5 -translate-x-1/2 absolute left-1/2 whitespace-nowrap text-[10px] font-medium bg-card/95 border border-border rounded px-1.5 py-0.5 shadow-sm">
              {h.code} · {h.activeAlerts}⚠ · {h.critical}🔴
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function LiveAlertFeed() {
  const recent = ALERTS.slice(0, 10);
  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-[color:var(--critical)] live-dot" />
          <h2 className="text-sm font-semibold">Live alert feed</h2>
        </div>
        <Link to="/alerts" className="text-xs text-primary flex items-center gap-1">All alerts <ChevronRight className="size-3" /></Link>
      </div>
      <ScrollArea className="h-[440px]">
        <ul className="divide-y divide-border">
          {recent.map(a => {
            const p = PATIENTS.find(x => x.id === a.patientId)!;
            const isCritical = a.severity === "critical";
            return (
              <li key={a.id} className={`px-4 py-3 hover:bg-muted/40 ${isCritical ? "alert-critical-flash" : ""}`}>
                <div className="flex items-start gap-3">
                  <span className={`mt-1 size-2 rounded-full shrink-0 ${SEVERITY_DOT[a.severity]}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-medium truncate">{a.type}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(a.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="text-[11.5px] text-muted-foreground truncate">
                      {p.name} · {p.uhid} · {p.ward} {p.bed}
                    </div>
                    <div className="text-[11.5px] mt-0.5">{a.message}</div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <SeverityBadge severity={a.severity} className="text-[10px] py-0" />
                      <Link to="/patient/$id" params={{ id: p.id }} className="text-[10.5px] text-primary hover:underline">View patient</Link>
                      <span className="text-[10.5px] text-muted-foreground">·</span>
                      <button className="text-[10.5px] text-foreground hover:underline">Notify team</button>
                      <span className="text-[10.5px] text-muted-foreground">·</span>
                      <button className="text-[10.5px] text-foreground hover:underline">Escalate</button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </Card>
  );
}

function ActivityTimeline() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">Recent activity</h2>
        <Stethoscope className="size-4 text-muted-foreground" />
      </div>
      <ol className="relative pl-4 space-y-3 before:absolute before:left-1 before:top-1 before:bottom-1 before:w-px before:bg-border">
        {ACTIVITIES.map(a => (
          <li key={a.id} className="relative">
            <span className={`absolute -left-3.5 top-1 size-2 rounded-full ${SEVERITY_DOT[a.severity]} ring-2 ring-background`} />
            <div className="flex items-center justify-between text-[10.5px] text-muted-foreground">
              <span>{a.kind}</span><span>{a.t}</span>
            </div>
            <div className="text-[12.5px]">{a.text}</div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

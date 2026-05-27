import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Download } from "lucide-react";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/analytics")({ component: Analytics });

function Analytics() {
  return (
    <AppShell>
      <div className="p-4 lg:p-6 space-y-4 max-w-[1900px]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Analytics &amp; Performance</h1>
            <p className="text-sm text-muted-foreground">Executive KPIs · Last 30 days · Compared to previous period</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5"><Download className="size-4" /> Export report</Button>
        </div>

        <Tabs defaultValue="clinical">
          <TabsList className="bg-muted">
            <TabsTrigger value="clinical">Clinical</TabsTrigger>
            <TabsTrigger value="operational">Operational</TabsTrigger>
            <TabsTrigger value="command">Command Center</TabsTrigger>
          </TabsList>

          <TabsContent value="clinical" className="mt-4 space-y-4">
            <Kpis items={[
              { k: "ICU mortality", v: "6.2%", d: "−0.8pp", up: false, good: true },
              { k: "Sepsis mortality", v: "11.4%", d: "−1.2pp", up: false, good: true },
              { k: "30-day readmission", v: "8.1%", d: "+0.3pp", up: true, good: false },
              { k: "Ventilator utilization", v: "72%", d: "+4pp", up: true, good: null },
            ]} />
            <ChartGrid />
          </TabsContent>

          <TabsContent value="operational" className="mt-4 space-y-4">
            <Kpis items={[
              { k: "Bed occupancy", v: "88%", d: "+2pp", up: true, good: null },
              { k: "Avg length of stay", v: "5.2d", d: "−0.4d", up: false, good: true },
              { k: "Transfer rate", v: "4.1%", d: "+0.6pp", up: true, good: null },
              { k: "Referral volume", v: "1,248", d: "+9.4%", up: true, good: true },
            ]} />
            <ChartGrid />
          </TabsContent>

          <TabsContent value="command" className="mt-4 space-y-4">
            <Kpis items={[
              { k: "Alerts generated", v: "12,408", d: "+6%", up: true, good: null },
              { k: "Alerts acknowledged", v: "97.8%", d: "+1.2pp", up: true, good: true },
              { k: "Median response", v: "1m 42s", d: "−18s", up: false, good: true },
              { k: "Escalation rate", v: "14.3%", d: "−1.1pp", up: false, good: true },
            ]} />
            <ChartGrid />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function Kpis({ items }: { items: { k: string; v: string; d: string; up: boolean; good: boolean | null }[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map(it => (
        <Card key={it.k} className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{it.k}</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-semibold tabular-nums">{it.v}</span>
            <span className={`text-[12px] flex items-center font-medium ${
              it.good === true ? "text-emerald-600" : it.good === false ? "text-[color:var(--critical)]" : "text-muted-foreground"
            }`}>
              {it.up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
              {it.d}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ChartGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold">Trend — daily</h2>
            <p className="text-[11px] text-muted-foreground">Last 30 days</p>
          </div>
          <Badge variant="outline" className="text-[10px]">All hospitals</Badge>
        </div>
        <LineChart />
      </Card>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold">By hospital</h2>
            <p className="text-[11px] text-muted-foreground">Current week</p>
          </div>
          <Badge variant="outline" className="text-[10px]">Comparative</Badge>
        </div>
        <BarChart />
      </Card>
      <Card className="p-4 lg:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold">Distribution</h2>
            <p className="text-[11px] text-muted-foreground">Across departments</p>
          </div>
        </div>
        <StackChart />
      </Card>
    </div>
  );
}

function LineChart() {
  const pts = Array.from({ length: 30 }).map((_, i) => 30 + Math.sin(i / 3) * 12 + ((i * 7) % 9));
  const max = Math.max(...pts);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${(i / 29) * 100},${100 - (p / max) * 90}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-44">
      <defs>
        <linearGradient id="ag" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--primary)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[20, 40, 60, 80].map(y => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="var(--border)" strokeWidth="0.2" />)}
      <path d={`${path} L100,100 L0,100 Z`} fill="url(#ag)" />
      <path d={path} fill="none" stroke="var(--primary)" strokeWidth="1.2" />
    </svg>
  );
}

function BarChart() {
  const data = [
    { l: "BLR-01", v: 78 }, { l: "DEL-02", v: 92 }, { l: "MUM-03", v: 64 },
    { l: "CHN-04", v: 48 }, { l: "HYD-05", v: 71 }, { l: "PUN-06", v: 39 },
  ];
  const max = 100;
  return (
    <div className="flex items-end justify-between gap-3 h-44">
      {data.map(d => (
        <div key={d.l} className="flex-1 flex flex-col items-center gap-1.5">
          <div className="w-full bg-muted rounded-sm relative" style={{ height: "100%" }}>
            <div className="absolute bottom-0 left-0 right-0 rounded-sm bg-gradient-to-t from-primary to-[color:var(--vital-spo2)]"
              style={{ height: `${(d.v / max) * 100}%` }} />
          </div>
          <div className="text-[10.5px] font-mono text-muted-foreground">{d.l}</div>
          <div className="text-[11px] font-semibold tabular-nums">{d.v}</div>
        </div>
      ))}
    </div>
  );
}

function StackChart() {
  const rows = ["MICU","SICU","CCU","HDU","Trauma","Neuro","Step-down"].map((l, i) => ({
    l, stable: 30 + (i * 6) % 25, watch: 15 + (i * 4) % 12, risk: 8 + (i % 5), critical: 3 + (i % 4),
  }));
  return (
    <div className="space-y-2">
      {rows.map(r => {
        const total = r.stable + r.watch + r.risk + r.critical;
        return (
          <div key={r.l} className="flex items-center gap-3">
            <div className="w-24 text-[12px] text-muted-foreground">{r.l}</div>
            <div className="flex-1 flex h-5 rounded overflow-hidden border border-border">
              <div style={{ width: `${(r.stable / total) * 100}%`, background: "var(--stable)" }} />
              <div style={{ width: `${(r.watch / total) * 100}%`, background: "var(--watch)" }} />
              <div style={{ width: `${(r.risk / total) * 100}%`, background: "var(--risk)" }} />
              <div style={{ width: `${(r.critical / total) * 100}%`, background: "var(--critical)" }} />
            </div>
            <div className="w-12 text-right text-[11.5px] tabular-nums">{total}</div>
          </div>
        );
      })}
      <div className="flex justify-end gap-3 text-[10.5px] text-muted-foreground pt-2">
        {[["Stable","var(--stable)"],["Watch","var(--watch)"],["High risk","var(--risk)"],["Critical","var(--critical)"]].map(([l,c]) => (
          <span key={l} className="flex items-center gap-1.5"><span className="size-2 rounded-sm" style={{ background: c }} />{l}</span>
        ))}
      </div>
    </div>
  );
}

import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Activity, UserSquare2, BellRing, Stethoscope,
  MessagesSquare, BarChart3, Settings2, Hospital, ShieldCheck,
  Search, Bell, Sun, Moon, Phone, Radio,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { HOSPITALS, KPIS } from "../../lib/mock-data";
import { useTickingNow } from "../../hooks/use-live-vitals";

const NAV = [
  { to: "/", label: "Enterprise Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/surveillance", label: "Patient Surveillance", icon: Activity },
  { to: "/patient/p1", label: "Patient 360", icon: UserSquare2, match: "/patient" },
  { to: "/alerts", label: "Alerts & Escalations", icon: BellRing, badge: KPIS.alerts },
  { to: "/tele-icu", label: "Tele-ICU", icon: Stethoscope },
  { to: "/communication", label: "Communication", icon: MessagesSquare },
  { to: "/analytics", label: "Analytics & Reporting", icon: BarChart3 },
  { to: "/administration", label: "Administration", icon: Settings2 },
];

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return { dark, setDark };
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const now = useTickingNow(1000);
  const { dark, setDark } = useTheme();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-sidebar-border">
          <div className="size-9 rounded-md bg-sidebar-primary/15 grid place-items-center">
            <ShieldCheck className="size-5 text-sidebar-primary" />
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold tracking-wide">APEX COMMAND</div>
            <div className="text-[11px] text-sidebar-foreground/60">Enterprise Tele-ICU</div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.to
              : pathname.startsWith(item.match ?? item.to);
            return (
              <Link
                key={item.label}
                to={item.to}
                className={[
                  "group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                ].join(" ")}
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge ? (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[color:var(--critical)] text-[color:var(--critical-foreground)]">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-sidebar-border text-[11px] text-sidebar-foreground/60 space-y-1">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-400 live-dot" />
            All telemetry streams nominal
          </div>
          <div className="flex items-center gap-2">
            <Radio className="size-3" /> 6 hospitals • 312 monitored beds
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur border-b border-border">
          <div className="flex items-center gap-3 px-4 lg:px-6 h-14">
            <div className="hidden md:flex items-center gap-2 text-[12px] text-muted-foreground">
              <Hospital className="size-4 text-primary" />
              <span className="font-medium text-foreground">Apex Health Network</span>
              <span>/</span>
              <span>Command Center</span>
            </div>

            <div className="flex-1 max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search patient, UHID, bed, consultant…"
                  className="pl-9 h-9 bg-muted/50 border-transparent focus-visible:bg-card"
                />
              </div>
            </div>

            <div className="hidden xl:flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="h-9 w-[150px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All hospitals</SelectItem>
                  {HOSPITALS.map(h => <SelectItem key={h.id} value={h.id}>{h.code} · {h.city}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select defaultValue="icu">
                <SelectTrigger className="h-9 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="icu">All ICUs</SelectItem>
                  <SelectItem value="micu">MICU</SelectItem>
                  <SelectItem value="sicu">SICU</SelectItem>
                  <SelectItem value="ccu">CCU</SelectItem>
                  <SelectItem value="neuro">Neuro ICU</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="any">
                <SelectTrigger className="h-9 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any acuity</SelectItem>
                  <SelectItem value="critical">Critical only</SelectItem>
                  <SelectItem value="risk">High risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted text-[11px] font-mono tabular-nums">
                <span className="size-1.5 rounded-full bg-emerald-500 live-dot" />
                LIVE {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>
              <Button variant="ghost" size="icon" className="size-9" onClick={() => setDark(!dark)} aria-label="Toggle theme">
                {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="size-9 relative" aria-label="Notifications">
                <Bell className="size-4" />
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[color:var(--critical)]" />
              </Button>
              <Button variant="ghost" size="icon" className="size-9" aria-label="On-call line"><Phone className="size-4" /></Button>
              <div className="flex items-center gap-2 pl-2 ml-1 border-l border-border">
                <Avatar className="size-8"><AvatarFallback className="text-[11px] bg-primary text-primary-foreground">RI</AvatarFallback></Avatar>
                <div className="leading-tight hidden md:block">
                  <div className="text-[12px] font-medium">Dr. R. Iyer</div>
                  <div className="text-[10px] text-muted-foreground">Tele-ICU Intensivist</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile pill nav */}
          <div className="lg:hidden flex gap-1 overflow-x-auto px-3 pb-2 -mt-1">
            {NAV.map(item => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.match ?? item.to);
              return (
                <Link key={item.label} to={item.to}
                  className={["whitespace-nowrap text-[11px] px-2.5 py-1 rounded-full border",
                    active ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"].join(" ")}>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </header>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

export function StatChip({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-[12px] font-semibold tabular-nums">{value}</span>
    </div>
  );
}

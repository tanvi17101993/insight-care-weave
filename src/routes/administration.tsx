import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { HOSPITALS } from "../lib/mock-data";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/administration")({ component: Administration });

const USERS = [
  { name: "Dr. R. Iyer", role: "Tele-ICU Intensivist", scope: "All hospitals", status: "Active", initials: "RI" },
  { name: "Dr. M. Khan", role: "Intensivist", scope: "BLR-01, DEL-02", status: "Active", initials: "MK" },
  { name: "Nurse A. Sharma", role: "ICU Nurse", scope: "BLR-01 · MICU", status: "Active", initials: "AS" },
  { name: "Dr. P. Reddy", role: "Cardiology Consultant", scope: "All hospitals", status: "On leave", initials: "PR" },
  { name: "S. Bose", role: "Hospital Administrator", scope: "MUM-03", status: "Active", initials: "SB" },
  { name: "Dr. K. Mehta", role: "Neurology Consultant", scope: "HYD-05", status: "Active", initials: "KM" },
];

const ROLES = [
  { role: "Tele-ICU Intensivist", perms: ["View all patients","Issue recommendations","Escalate","Initiate teleconsultation"] },
  { role: "Bedside Intensivist", perms: ["View hospital patients","Accept recommendations","Manage orders"] },
  { role: "ICU Nurse", perms: ["View unit patients","Acknowledge alerts","Document vitals"] },
  { role: "Hospital Administrator", perms: ["View operational dashboards","Manage hospital users"] },
  { role: "Command Center Doctor", perms: ["Cross-hospital monitoring","Escalate","Broadcast"] },
];

function Administration() {
  return (
    <AppShell>
      <div className="p-4 lg:p-6 space-y-4 max-w-[1900px]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Administration</h1>
            <p className="text-sm text-muted-foreground">Network configuration, users, roles, integrations and audit</p>
          </div>
          <Button size="sm">Invite user</Button>
        </div>

        <Tabs defaultValue="hospitals">
          <TabsList className="bg-muted">
            <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roles">Roles &amp; access</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="audit">Audit log</TabsTrigger>
          </TabsList>

          <TabsContent value="hospitals" className="mt-4">
            <Card className="p-0 overflow-hidden">
              <table className="w-full text-[12.5px]">
                <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground">
                  <tr><th className="px-4 py-2.5">Code</th><th>Name</th><th>City</th><th>Beds</th><th>ICU</th><th>Vent</th><th>Status</th><th></th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {HOSPITALS.map(h => (
                    <tr key={h.id}>
                      <td className="px-4 py-2.5 font-mono">{h.code}</td>
                      <td className="font-medium">{h.name}</td>
                      <td className="text-muted-foreground">{h.city}</td>
                      <td className="tabular-nums">{h.beds}</td>
                      <td className="tabular-nums">{h.icuBeds}</td>
                      <td className="tabular-nums">{h.ventilators}</td>
                      <td><Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-600/30">Connected</Badge></td>
                      <td className="text-right pr-4"><Button variant="ghost" size="sm">Configure</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <Card className="p-0 overflow-hidden">
              <table className="w-full text-[12.5px]">
                <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground">
                  <tr><th className="px-4 py-2.5">User</th><th>Role</th><th>Hospital scope</th><th>Status</th><th></th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {USERS.map(u => (
                    <tr key={u.name}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-7"><AvatarFallback className="text-[10px]">{u.initials}</AvatarFallback></Avatar>
                          <span className="font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td>{u.role}</td>
                      <td className="text-muted-foreground">{u.scope}</td>
                      <td>
                        <Badge variant="outline" className={`text-[10px] ${u.status === "Active" ? "text-emerald-600 border-emerald-600/30" : "text-muted-foreground"}`}>{u.status}</Badge>
                      </td>
                      <td className="text-right pr-4"><Button variant="ghost" size="sm">Manage</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ROLES.map(r => (
                <Card key={r.role} className="p-4">
                  <div className="flex items-center gap-2 mb-2"><ShieldCheck className="size-4 text-primary" /><h3 className="text-sm font-semibold">{r.role}</h3></div>
                  <ul className="text-[12.5px] text-muted-foreground space-y-1">
                    {r.perms.map(p => <li key={p}>· {p}</li>)}
                  </ul>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { n: "HIMS / EMR", desc: "Bi-directional sync of admissions, orders, results", on: true },
                { n: "Bedside monitors", desc: "Philips IntelliVue, GE CARESCAPE, Mindray", on: true },
                { n: "Ventilators", desc: "Dräger, Hamilton, Maquet", on: true },
                { n: "Laboratory LIS", desc: "Real-time critical value pushes", on: true },
                { n: "Radiology PACS", desc: "Image and report access", on: false },
                { n: "Pharmacy", desc: "MAR & medication reconciliation", on: true },
                { n: "Bed management", desc: "Live bed status and transfers", on: true },
                { n: "Identity (SSO)", desc: "SAML / OIDC", on: true },
              ].map(i => (
                <Card key={i.n} className="p-4 flex items-start justify-between">
                  <div className="pr-3">
                    <div className="text-[13px] font-semibold">{i.n}</div>
                    <div className="text-[11.5px] text-muted-foreground mt-0.5">{i.desc}</div>
                  </div>
                  <Switch defaultChecked={i.on} />
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="audit" className="mt-4">
            <Card className="p-0 overflow-hidden">
              <table className="w-full text-[12.5px]">
                <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground">
                  <tr><th className="px-4 py-2.5">When</th><th>Actor</th><th>Action</th><th>Target</th><th>IP</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["09:42", "Dr. R. Iyer", "Sent tele-ICU recommendation", "Patient UH100037", "10.4.12.18"],
                    ["09:38", "Nurse A. Sharma", "Acknowledged alert", "Low SpO₂ · BLR-01 ICU-1 B4", "10.4.18.42"],
                    ["09:31", "system", "Sepsis alert generated", "Patient UH100018", "—"],
                    ["09:22", "Dr. M. Khan", "Updated medication order", "Norepi 0.18 mcg/kg/min", "10.4.12.21"],
                    ["09:18", "S. Bose (Admin)", "Granted access", "Dr. N. Bose → HYD-05", "10.4.4.7"],
                  ].map((row, i) => (
                    <tr key={i}>
                      {row.map((c, j) => <td key={j} className={`px-4 py-2 ${j === 0 ? "font-mono text-[11px] text-muted-foreground" : ""}`}>{c}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

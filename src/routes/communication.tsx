import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Phone, PhoneCall, Search, Send, Siren, Users, Video } from "lucide-react";

export const Route = createFileRoute("/communication")({ component: Comms });

const CONVOS = [
  { id: "c1", title: "ICU-1 Nursing Channel", last: "Vitals charted for bed 4", time: "2m", unread: 3, group: true },
  { id: "c2", title: "Dr. M. Khan", last: "Will call back after CT review", time: "9m", unread: 1, group: false },
  { id: "c3", title: "Code Blue Response", last: "Standing down, ROSC achieved", time: "23m", unread: 0, group: true, urgent: true },
  { id: "c4", title: "Pharmacy Liaison", last: "Vancomycin level result available", time: "41m", unread: 0, group: false },
  { id: "c5", title: "Apex Bengaluru Admin", last: "Bed availability snapshot shared", time: "1h", unread: 0, group: true },
  { id: "c6", title: "Dr. P. Reddy", last: "Sepsis bundle re-eval done", time: "1h", unread: 0, group: false },
];

const MESSAGES = [
  { who: "Nurse Asha (BLR-01)", at: "08:42", text: "Bed 4 SpO₂ dipping to 88%. Increased FiO₂ to 0.5. Stabilized.", mine: false },
  { who: "Dr. R. Iyer", at: "08:43", text: "Acknowledged. ABG in 20 min, send results immediately.", mine: true },
  { who: "Nurse Asha (BLR-01)", at: "08:44", text: "Will do. Patient pain score now 4/10, repositioned.", mine: false },
  { who: "Dr. M. Khan", at: "08:45", text: "I'll join the bedside in 10. Suggest small fluid bolus 250 mL.", mine: false },
  { who: "Dr. R. Iyer", at: "08:46", text: "Agreed. Continuing norepi at 0.18 mcg/kg/min for now.", mine: true },
];

function Comms() {
  const [active, setActive] = useState("c1");
  const [draft, setDraft] = useState("");
  return (
    <AppShell>
      <div className="p-4 lg:p-6 max-w-[1900px]">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Communication Center</h1>
            <p className="text-sm text-muted-foreground">Secure messaging, voice and video for clinical teams</p>
          </div>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" className="gap-1.5"><Phone className="size-4" /> Voice call</Button>
            <Button variant="outline" size="sm" className="gap-1.5"><Video className="size-4" /> Video call</Button>
            <Button size="sm" variant="destructive" className="gap-1.5"><Siren className="size-4" /> Emergency broadcast</Button>
          </div>
        </div>

        <Card className="p-0 overflow-hidden h-[calc(100vh-200px)] min-h-[600px]">
          <div className="grid grid-cols-12 h-full">
            {/* Conversation list */}
            <div className="col-span-12 md:col-span-3 border-r border-border flex flex-col">
              <div className="p-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input placeholder="Search conversations" className="pl-8 h-9 text-sm" />
                </div>
              </div>
              <ScrollArea className="flex-1">
                {CONVOS.map(c => (
                  <button key={c.id} onClick={() => setActive(c.id)}
                    className={`w-full text-left flex items-start gap-2.5 px-3 py-2.5 border-b border-border hover:bg-muted/40 ${active === c.id ? "bg-muted" : ""}`}>
                    <Avatar className="size-9 mt-0.5"><AvatarFallback className="text-[11px]">{c.group ? <Users className="size-4" /> : c.title.split(" ").map(x => x[0]).slice(0, 2).join("")}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <span className="text-[12.5px] font-medium truncate">{c.title}</span>
                        <span className="text-[10px] text-muted-foreground">{c.time}</span>
                      </div>
                      <div className="text-[11.5px] text-muted-foreground truncate">{c.last}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {c.urgent && <Badge variant="outline" className="text-[9px] text-[color:var(--critical)] border-[color:var(--critical)]/40">URGENT</Badge>}
                        {c.unread > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">{c.unread}</span>}
                      </div>
                    </div>
                  </button>
                ))}
              </ScrollArea>
            </div>

            {/* Thread */}
            <div className="col-span-12 md:col-span-6 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div>
                  <div className="text-[13px] font-semibold">ICU-1 Nursing Channel</div>
                  <div className="text-[10.5px] text-muted-foreground">12 members · BLR-01 · Active now</div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="size-8"><Phone className="size-4" /></Button>
                  <Button variant="ghost" size="icon" className="size-8"><Video className="size-4" /></Button>
                </div>
              </div>
              <ScrollArea className="flex-1 px-4 py-4">
                <div className="space-y-3">
                  {MESSAGES.map((m, i) => (
                    <div key={i} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-[12.5px] ${m.mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"}`}>
                        <div className={`flex items-center gap-2 text-[10px] mb-0.5 ${m.mine ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                          <span className="font-semibold">{m.who}</span><span>{m.at}</span>
                        </div>
                        <div>{m.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="px-3 py-3 border-t border-border flex items-center gap-2">
                <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Secure message — encrypted in transit" className="h-10" />
                <Button size="icon" className="size-10"><Send className="size-4" /></Button>
              </div>
            </div>

            {/* Right rail */}
            <div className="col-span-12 md:col-span-3 border-l border-border p-4 space-y-3">
              <div>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-2">Active calls</h3>
                <div className="rounded-md border border-border p-3 flex items-center gap-2 bg-emerald-500/5">
                  <PhoneCall className="size-4 text-emerald-600 live-dot" />
                  <div className="leading-tight text-[12px] flex-1">
                    <div className="font-medium">Dr. Khan · BLR-01 ICU-2</div>
                    <div className="text-[10.5px] text-muted-foreground">04:12 elapsed</div>
                  </div>
                  <Button size="sm" variant="outline">Join</Button>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-2">Escalation channels</h3>
                <ul className="space-y-1.5 text-[12px]">
                  <li className="flex justify-between"><span>Code Blue</span><span className="text-muted-foreground">#code-blue</span></li>
                  <li className="flex justify-between"><span>Rapid Response</span><span className="text-muted-foreground">#rrt</span></li>
                  <li className="flex justify-between"><span>Stroke Alert</span><span className="text-muted-foreground">#stroke</span></li>
                  <li className="flex justify-between"><span>Sepsis Bundle</span><span className="text-muted-foreground">#sepsis</span></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-2">On-call today</h3>
                <ul className="space-y-2 text-[12px]">
                  {["Dr. R. Iyer · Tele-ICU","Dr. M. Khan · Intensivist","Dr. P. Reddy · Cardiology","Dr. A. Nair · Neurology"].map(x => (
                    <li key={x} className="flex items-center gap-2">
                      <Avatar className="size-7"><AvatarFallback className="text-[10px]">{x.split(" ")[1][0]}{x.split(" ")[2][0]}</AvatarFallback></Avatar>
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

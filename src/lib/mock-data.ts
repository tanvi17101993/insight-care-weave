// Mock data for the Hospital Enterprise Command Center
// All data is deterministic so the UI feels stable between renders.

export type Severity = "stable" | "watch" | "risk" | "critical";

export const SEVERITY_LABEL: Record<Severity, string> = {
  stable: "Stable",
  watch: "Watchlist",
  risk: "High Risk",
  critical: "Critical",
};

export const SEVERITY_RING: Record<Severity, string> = {
  stable: "ring-[color:var(--stable)]",
  watch: "ring-[color:var(--watch)]",
  risk: "ring-[color:var(--risk)]",
  critical: "ring-[color:var(--critical)]",
};

export const SEVERITY_BG_SOFT: Record<Severity, string> = {
  stable: "bg-[color:color-mix(in_oklch,var(--stable)_18%,transparent)] text-[color:var(--stable-foreground)]",
  watch: "bg-[color:color-mix(in_oklch,var(--watch)_28%,transparent)] text-[color:var(--watch-foreground)]",
  risk: "bg-[color:color-mix(in_oklch,var(--risk)_22%,transparent)] text-[color:var(--risk-foreground)]",
  critical: "bg-[color:color-mix(in_oklch,var(--critical)_22%,transparent)] text-[color:var(--critical-foreground)]",
};

export const SEVERITY_DOT: Record<Severity, string> = {
  stable: "bg-[color:var(--stable)]",
  watch: "bg-[color:var(--watch)]",
  risk: "bg-[color:var(--risk)]",
  critical: "bg-[color:var(--critical)]",
};

export interface Hospital {
  id: string;
  code: string;
  name: string;
  city: string;
  beds: number;
  occupied: number;
  icuBeds: number;
  icuOccupied: number;
  ventilators: number;
  ventInUse: number;
  activeAlerts: number;
  critical: number;
  lat: number;
  lng: number;
}

export const HOSPITALS: Hospital[] = [
  { id: "h1", code: "BLR-01", name: "Apex Bengaluru Central", city: "Bengaluru", beds: 420, occupied: 386, icuBeds: 64, icuOccupied: 58, ventilators: 32, ventInUse: 24, activeAlerts: 14, critical: 7, lat: 35, lng: 55 },
  { id: "h2", code: "DEL-02", name: "Apex Delhi Cantonment", city: "New Delhi", beds: 510, occupied: 472, icuBeds: 80, icuOccupied: 71, ventilators: 40, ventInUse: 31, activeAlerts: 22, critical: 11, lat: 28, lng: 42 },
  { id: "h3", code: "MUM-03", name: "Apex Mumbai Bandra", city: "Mumbai", beds: 380, occupied: 341, icuBeds: 56, icuOccupied: 49, ventilators: 28, ventInUse: 21, activeAlerts: 9, critical: 4, lat: 52, lng: 38 },
  { id: "h4", code: "CHN-04", name: "Apex Chennai Adyar", city: "Chennai", beds: 290, occupied: 248, icuBeds: 42, icuOccupied: 36, ventilators: 22, ventInUse: 15, activeAlerts: 6, critical: 3, lat: 60, lng: 70 },
  { id: "h5", code: "HYD-05", name: "Apex Hyderabad Jubilee", city: "Hyderabad", beds: 340, occupied: 298, icuBeds: 48, icuOccupied: 41, ventilators: 24, ventInUse: 18, activeAlerts: 11, critical: 5, lat: 48, lng: 60 },
  { id: "h6", code: "PUN-06", name: "Apex Pune Kharadi", city: "Pune", beds: 260, occupied: 219, icuBeds: 36, icuOccupied: 29, ventilators: 18, ventInUse: 12, activeAlerts: 5, critical: 2, lat: 44, lng: 48 },
];

export interface Patient {
  id: string;
  name: string;
  uhid: string;
  mrn: string;
  age: number;
  sex: "M" | "F";
  hospitalId: string;
  ward: string;
  room: string;
  bed: string;
  consultant: string;
  admittedAt: string; // ISO
  diagnosis: string;
  severity: Severity;
  ventilated: boolean;
  isolation: boolean;
  riskScore: number; // 0-100
  baseHR: number;
  baseSpO2: number;
  baseSysBP: number;
  baseDiaBP: number;
  baseRR: number;
  baseTemp: number;
  flags: string[];
}

const FIRSTS = ["Aarav","Vivaan","Aditya","Vihaan","Arjun","Sai","Reyansh","Ayaan","Krishna","Ishaan","Rohan","Kabir","Anaya","Aadhya","Diya","Saanvi","Myra","Ira","Pari","Aisha","Kiara","Riya","Meera","Aanya","Neha","Rahul","Karan","Vikram","Manish","Sunita","Pooja","Anita","Rakesh","Suresh","Geeta","Lakshmi","Anil","Deepak","Sanjay","Priya"];
const LASTS = ["Sharma","Verma","Iyer","Khan","Singh","Reddy","Nair","Mehta","Gupta","Joshi","Patel","Rao","Das","Bose","Kapoor","Malhotra","Chopra","Bansal","Agarwal","Saxena"];
const DIAGNOSES = ["Sepsis","Acute MI","Post-op CABG","COPD exacerbation","Pneumonia","Stroke (Ischemic)","DKA","ARDS","CKD on HD","Polytrauma","Pancreatitis","Hepatic encephalopathy","Status epilepticus","UGI bleed","Severe dengue"];
const WARDS = ["MICU","SICU","CCU","HDU","Trauma ICU","Neuro ICU","Step-down"];
const CONSULTANTS = ["Dr. R. Iyer","Dr. M. Khan","Dr. S. Sharma","Dr. P. Reddy","Dr. A. Nair","Dr. K. Mehta","Dr. V. Singh","Dr. N. Bose"];

function seeded(i: number) {
  // simple deterministic prng
  let x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function pick<T>(arr: T[], i: number): T {
  return arr[Math.floor(seeded(i) * arr.length)];
}

export const PATIENTS: Patient[] = Array.from({ length: 64 }).map((_, i) => {
  const sev: Severity = (() => {
    const r = seeded(i + 1000);
    if (r < 0.55) return "stable";
    if (r < 0.78) return "watch";
    if (r < 0.92) return "risk";
    return "critical";
  })();
  const h = HOSPITALS[i % HOSPITALS.length];
  const age = 24 + Math.floor(seeded(i + 7) * 60);
  const sex: "M" | "F" = seeded(i + 3) > 0.5 ? "M" : "F";
  const ventilated = sev === "critical" ? seeded(i + 11) > 0.2 : seeded(i + 11) > 0.85;
  const baseHR = sev === "critical" ? 110 + Math.floor(seeded(i + 21) * 35) : sev === "risk" ? 95 + Math.floor(seeded(i + 21) * 20) : 70 + Math.floor(seeded(i + 21) * 18);
  const baseSpO2 = sev === "critical" ? 86 + Math.floor(seeded(i + 31) * 6) : sev === "risk" ? 92 + Math.floor(seeded(i + 31) * 3) : 96 + Math.floor(seeded(i + 31) * 3);
  return {
    id: `p${i + 1}`,
    name: `${pick(FIRSTS, i)} ${pick(LASTS, i + 100)}`,
    uhid: `UH${(100000 + i * 37).toString().slice(0, 6)}`,
    mrn: `MRN${(2000 + i).toString()}`,
    age,
    sex,
    hospitalId: h.id,
    ward: pick(WARDS, i + 5),
    room: `${200 + (i % 24)}`,
    bed: `B${(i % 12) + 1}`,
    consultant: pick(CONSULTANTS, i + 9),
    admittedAt: new Date(Date.now() - (1 + Math.floor(seeded(i + 19) * 12)) * 86400000).toISOString(),
    diagnosis: pick(DIAGNOSES, i + 13),
    severity: sev,
    ventilated,
    isolation: seeded(i + 41) > 0.88,
    riskScore: sev === "critical" ? 78 + Math.floor(seeded(i + 51) * 18) : sev === "risk" ? 58 + Math.floor(seeded(i + 51) * 18) : sev === "watch" ? 38 + Math.floor(seeded(i + 51) * 18) : 8 + Math.floor(seeded(i + 51) * 22),
    baseHR,
    baseSpO2,
    baseSysBP: sev === "critical" ? 88 + Math.floor(seeded(i + 61) * 12) : 118 + Math.floor(seeded(i + 61) * 18),
    baseDiaBP: sev === "critical" ? 52 + Math.floor(seeded(i + 71) * 8) : 72 + Math.floor(seeded(i + 71) * 12),
    baseRR: sev === "critical" ? 26 + Math.floor(seeded(i + 81) * 6) : 16 + Math.floor(seeded(i + 81) * 4),
    baseTemp: 36.6 + seeded(i + 91) * 2.2,
    flags: [
      ...(sev === "critical" || sev === "risk" ? ["Sepsis ↑"] : []),
      ...(ventilated ? ["Vent"] : []),
      ...(seeded(i + 101) > 0.85 ? ["Cardiac"] : []),
    ],
  };
});

export interface AlertItem {
  id: string;
  patientId: string;
  hospitalId: string;
  type: string;
  category: "physiological" | "device" | "clinical" | "operational";
  severity: Severity;
  message: string;
  at: string; // ISO
  status: "generated" | "assigned" | "acknowledged" | "escalated" | "resolved";
  slaSeconds: number;
}

const ALERT_TEMPLATES = [
  { t: "Low SpO₂", c: "physiological", s: "critical", m: "SpO₂ 86% • last 60s avg" },
  { t: "Bradycardia", c: "physiological", s: "risk", m: "HR 41 bpm • sustained" },
  { t: "Hypotension", c: "physiological", s: "critical", m: "MAP 52 mmHg" },
  { t: "Tachycardia", c: "physiological", s: "watch", m: "HR 138 bpm" },
  { t: "Ventilator Disconnect", c: "device", s: "critical", m: "Circuit disconnected 18s" },
  { t: "Lead Off", c: "device", s: "watch", m: "ECG Lead II" },
  { t: "Critical Lab", c: "clinical", s: "risk", m: "K⁺ 6.8 mmol/L" },
  { t: "Sepsis Alert", c: "clinical", s: "critical", m: "qSOFA 3 • lactate 4.1" },
  { t: "Missed Medication", c: "clinical", s: "watch", m: "Piperacillin 4g overdue 22m" },
  { t: "Transfer Delay", c: "operational", s: "watch", m: "Cath lab handoff +35m" },
  { t: "Code Blue", c: "clinical", s: "critical", m: "Initiated by RRT" },
] as const;

export const ALERTS: AlertItem[] = Array.from({ length: 28 }).map((_, i) => {
  const tpl = ALERT_TEMPLATES[i % ALERT_TEMPLATES.length];
  const p = PATIENTS[(i * 5) % PATIENTS.length];
  return {
    id: `a${i + 1}`,
    patientId: p.id,
    hospitalId: p.hospitalId,
    type: tpl.t,
    category: tpl.c,
    severity: tpl.s as Severity,
    message: tpl.m,
    at: new Date(Date.now() - i * 1000 * 60 * (1 + (i % 5))).toISOString(),
    status: (["generated","assigned","acknowledged","escalated","resolved"] as const)[i % 5],
    slaSeconds: 60 + (i % 6) * 60,
  };
});

export const KPIS = {
  admitted: PATIENTS.length,
  icu: PATIENTS.filter(p => /ICU|CCU/.test(p.ward)).length,
  vent: PATIENTS.filter(p => p.ventilated).length,
  critical: PATIENTS.filter(p => p.severity === "critical").length,
  alerts: ALERTS.filter(a => a.status !== "resolved").length,
  newAdmissions: 8,
  pendingEscalations: ALERTS.filter(a => a.status === "escalated").length,
  codeBlue: 1,
};

export function getHospital(id: string) {
  return HOSPITALS.find(h => h.id === id)!;
}
export function getPatient(id: string) {
  return PATIENTS.find(p => p.id === id);
}

// Recent activity timeline
export const ACTIVITIES = [
  { id: "v1", t: "2 min ago", kind: "Code Blue", text: "Code Blue called — BLR-01 • ICU Bed 4", severity: "critical" as Severity },
  { id: "v2", t: "6 min ago", kind: "Tele-ICU", text: "Dr. Iyer reviewed P-12 (Sepsis bundle escalated)", severity: "risk" as Severity },
  { id: "v3", t: "11 min ago", kind: "Admission", text: "New admission — DEL-02 • Pneumonia", severity: "watch" as Severity },
  { id: "v4", t: "18 min ago", kind: "Transfer", text: "Inter-hospital transfer MUM-03 → BLR-01 in transit", severity: "stable" as Severity },
  { id: "v5", t: "24 min ago", kind: "Escalation", text: "Hypotension acknowledged & treated — CHN-04", severity: "stable" as Severity },
  { id: "v6", t: "31 min ago", kind: "Critical Lab", text: "K⁺ 6.8 mmol/L flagged on P-04", severity: "risk" as Severity },
];

// Lab results sample for Patient 360
export const SAMPLE_LABS = {
  hematology: [
    { name: "Hemoglobin", value: "9.2", unit: "g/dL", ref: "12–16", flag: "low" },
    { name: "WBC", value: "18.4", unit: "10³/µL", ref: "4–11", flag: "high" },
    { name: "Platelets", value: "112", unit: "10³/µL", ref: "150–450", flag: "low" },
    { name: "Hematocrit", value: "28.1", unit: "%", ref: "37–47", flag: "low" },
  ],
  biochemistry: [
    { name: "Creatinine", value: "2.4", unit: "mg/dL", ref: "0.6–1.3", flag: "high" },
    { name: "Urea", value: "78", unit: "mg/dL", ref: "15–45", flag: "high" },
    { name: "Sodium", value: "131", unit: "mmol/L", ref: "135–145", flag: "low" },
    { name: "Potassium", value: "6.8", unit: "mmol/L", ref: "3.5–5.0", flag: "critical" },
    { name: "Glucose", value: "248", unit: "mg/dL", ref: "70–140", flag: "high" },
  ],
  abg: [
    { name: "pH", value: "7.21", unit: "", ref: "7.35–7.45", flag: "critical" },
    { name: "pCO₂", value: "52", unit: "mmHg", ref: "35–45", flag: "high" },
    { name: "pO₂", value: "62", unit: "mmHg", ref: "80–100", flag: "low" },
    { name: "HCO₃⁻", value: "16", unit: "mmol/L", ref: "22–26", flag: "low" },
    { name: "Lactate", value: "4.1", unit: "mmol/L", ref: "<2", flag: "critical" },
  ],
  cardiac: [
    { name: "Troponin I", value: "1.82", unit: "ng/mL", ref: "<0.04", flag: "critical" },
    { name: "CK-MB", value: "38", unit: "U/L", ref: "<25", flag: "high" },
    { name: "BNP", value: "1240", unit: "pg/mL", ref: "<100", flag: "critical" },
  ],
  microbiology: [
    { name: "Blood culture", value: "Gram-neg rods", unit: "", ref: "Sterile", flag: "critical" },
    { name: "Urine culture", value: "E. coli >10⁵", unit: "CFU/mL", ref: "<10⁴", flag: "high" },
  ],
};

export const SAMPLE_MEDS = [
  { name: "Noradrenaline infusion", dose: "0.18 mcg/kg/min", route: "IV", status: "Running", last: "Continuous", flag: "active" },
  { name: "Piperacillin-Tazobactam", dose: "4.5 g q6h", route: "IV", status: "Administered", last: "02:00", flag: "ok" },
  { name: "Insulin (sliding scale)", dose: "Variable", route: "SC", status: "Administered", last: "04:00", flag: "ok" },
  { name: "Pantoprazole", dose: "40 mg OD", route: "IV", status: "Missed", last: "06:00", flag: "missed" },
  { name: "Enoxaparin", dose: "40 mg OD", route: "SC", status: "Delayed", last: "07:30", flag: "delay" },
];

export const SAMPLE_TIMELINE = [
  { at: "Day 1 08:12", kind: "Admission", text: "Admitted via ED with septic shock, lactate 4.8" },
  { at: "Day 1 09:00", kind: "Order", text: "Broad spectrum antibiotics initiated within 1h bundle" },
  { at: "Day 1 11:30", kind: "Procedure", text: "Central line (R-IJV) inserted, no immediate complications" },
  { at: "Day 1 14:00", kind: "Lab", text: "Repeat lactate 3.2 (↓)" },
  { at: "Day 2 02:10", kind: "Escalation", text: "Vasopressor escalated; norepi → 0.18 mcg/kg/min" },
  { at: "Day 2 06:45", kind: "Tele-ICU", text: "Tele-ICU review by Dr. Iyer; sepsis re-bundling" },
  { at: "Day 2 09:00", kind: "Imaging", text: "CT abdomen — suspected source: cholangitis" },
];

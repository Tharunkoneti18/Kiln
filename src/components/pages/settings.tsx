"use client";

import { useState } from "react";
import { Bell, Brain, CalendarBlank, DownloadSimple, GithubLogo, Lock, Plugs, ShieldCheck, SpeakerHigh, Trash, UserCircle } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PageHeader, PageShell } from "@/components/shell/page-header";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { learner } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

const sections = [
  { id: "account", label: "Account", icon: UserCircle },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "learning", label: "Learning and Tutor", icon: SpeakerHigh },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "ai", label: "AI preferences", icon: Brain },
  { id: "integrations", label: "Integrations", icon: Plugs },
  { id: "data", label: "Your data", icon: ShieldCheck },
] as const;

export function SettingsView() {
  const [active, setActive] = useState<(typeof sections)[number]["id"]>("account");
  const [connected, setConnected] = useState({ github: true, calendar: false, jobs: true });

  return (
    <PageShell className="flex flex-col gap-6">
      <PageHeader icon="puzzle" title="Settings and Integrations" description="Your account, privacy, learning and notification preferences, connected services and your data." />
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Settings sections" className="flex flex-row flex-wrap gap-1 lg:flex-col">
          {sections.map((section) => (
            <button key={section.id} type="button" onClick={() => setActive(section.id)} aria-pressed={active === section.id}
              className={cn("flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-[12.5px] font-semibold transition-colors", active === section.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-raised")}>
              <section.icon size={15} weight={active === section.id ? "fill" : "regular"} /> {section.label}
            </button>
          ))}
        </nav>

        <Card><CardContent className="flex flex-col gap-5">
          {active === "account" && (<>
            <h2 className="text-[16px] font-bold">Account</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field><Label htmlFor="st-name">Name</Label><Input id="st-name" defaultValue={learner.name} /></Field>
              <Field><Label htmlFor="st-email">Email</Label><Input id="st-email" type="email" defaultValue={learner.email} /></Field>
            </div>
            <Row label="Theme" hint="Light, dark, or follow your system."><ThemeToggle /></Row>
            <Button size="sm" className="self-start">Save changes</Button>
          </>)}
          {active === "privacy" && (<>
            <h2 className="text-[16px] font-bold">Profile privacy</h2>
            <Toggle label="Portfolio visible by link" hint="Off means only you can see projects." defaultChecked />
            <Toggle label="Allow recruiters to find my profile" hint="Never on unless you choose it." />
            <Toggle label="Use my data to improve recommendations" hint="Only within your own account." defaultChecked />
          </>)}
          {active === "learning" && (<>
            <h2 className="text-[16px] font-bold">Learning and Tutor preferences</h2>
            <Row label="Instructor voice" hint="Used for lecture narration."><SelectBox id="voice" options={["Warm, measured", "Brisk, energetic", "Calm, slow"]} /></Row>
            <Row label="Default explanation depth" hint="You can change it during any lecture."><SelectBox id="depth" options={["Standard", "Simple", "Deep"]} /></Row>
            <Toggle label="Captions on by default" hint="The transcript is always available." defaultChecked />
            <Toggle label="3D instructor" hint="Turn off for a static portrait." defaultChecked />
            <Toggle label="Reduce motion" hint="Your system setting is respected either way." />
          </>)}
          {active === "notifications" && (<>
            <h2 className="text-[16px] font-bold">Notification preferences</h2>
            {["Daily learning reminders", "Weekly summaries", "Assessment reminders", "Interview reminders", "Application follow-ups", "Opportunity alerts", "Missed-session recovery"].map((label, index) => <Toggle key={label} label={label} defaultChecked={index !== 5} />)}
          </>)}
          {active === "ai" && (<>
            <h2 className="text-[16px] font-bold">AI model preferences</h2>
            <Row label="Reasoning model" hint="Where supported by your plan."><SelectBox id="model" options={["Balanced", "Most capable", "Fastest"]} /></Row>
            <Toggle label="Explain why for every recommendation" defaultChecked />
          </>)}
          {active === "integrations" && (<>
            <h2 className="text-[16px] font-bold">Connected accounts</h2>
            {([
              { key: "github", label: "GitHub", icon: GithubLogo, detail: "Read access to public repositories" },
              { key: "calendar", label: "Calendar", icon: CalendarBlank, detail: "Schedule lessons and interviews" },
              { key: "jobs", label: "Job data sources", icon: Plugs, detail: "Permitted job APIs for market analysis" },
            ] as const).map((item) => (
              <div key={item.key} className="flex items-center gap-3 rounded-lg border p-3.5">
                <item.icon size={20} />
                <span className="flex-1"><span className="block text-[13px] font-semibold">{item.label}</span><span className="text-muted-foreground text-[11.5px]">{item.detail}</span></span>
                {connected[item.key] && <Badge variant="demonstrated">Connected</Badge>}
                <Button size="sm" variant={connected[item.key] ? "ghost" : "primary"} onClick={() => setConnected((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}>{connected[item.key] ? "Disconnect" : "Connect"}</Button>
              </div>
            ))}
            <p className="text-muted-foreground text-[11.5px]">Each connection lists the permissions it holds. Disconnecting removes access immediately.</p>
          </>)}
          {active === "data" && (<>
            <h2 className="text-[16px] font-bold">Your data</h2>
            <p className="text-muted-foreground text-[12.5px] leading-relaxed">Export everything Career OS holds about you, or delete it. Deletion removes your profile, uploads, lessons, assessments, projects and applications and cannot be undone.</p>
            <div className="flex flex-wrap gap-2"><Button variant="secondary" size="sm"><DownloadSimple size={14} /> Export my data</Button><Button variant="destructive" size="sm"><Trash size={14} /> Delete my account</Button></div>
          </>)}
        </CardContent></Card>
      </div>
    </PageShell>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 last:border-b-0"><span className="flex flex-col"><span className="text-[13px] font-semibold">{label}</span>{hint && <span className="text-muted-foreground text-[11.5px]">{hint}</span>}</span>{children}</div>;
}

function Toggle({ label, hint, defaultChecked }: { label: string; hint?: string; defaultChecked?: boolean }) {
  return <Row label={label} hint={hint}><Switch defaultChecked={defaultChecked} aria-label={label} /></Row>;
}

function SelectBox({ id, options }: { id: string; options: string[] }) {
  return (
    <Select defaultValue={options[0]}>
      <SelectTrigger id={id} aria-label={id} className="w-[200px]"><SelectValue /></SelectTrigger>
      <SelectContent>{options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
    </Select>
  );
}

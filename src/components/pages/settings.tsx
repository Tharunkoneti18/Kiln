"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bell, Brain, CalendarBlank, DownloadSimple, GithubLogo, Lock, Plugs, ShieldCheck, SpeakerHigh, Trash, UserCircle } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldHint, Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/system/toast";
import { PageHeader, PageShell, Rise } from "@/components/shell/page-header";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { learner } from "@/lib/mock/data";
import { ease, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const sections = [
  { id: "account", label: "Account", icon: UserCircle },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "learning", label: "Learning", icon: SpeakerHigh },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "ai", label: "AI model", icon: Brain },
  { id: "integrations", label: "Integrations", icon: Plugs },
  { id: "data", label: "Data", icon: ShieldCheck },
] as const;

type SectionId = (typeof sections)[number]["id"];

export function SettingsView() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<SectionId>("account");
  const current = sections.find((section) => section.id === active)!;

  return (
    <PageShell>
      <PageHeader title="Settings" description="Your account, privacy, learning preferences and connected services." />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[200px_minmax(0,1fr)]">
        <Rise className="lg:sticky lg:top-[72px]">
          <nav aria-label="Settings sections" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-px lg:px-0">
            {sections.map((section) => {
              const selected = active === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActive(section.id)}
                  aria-current={selected ? "page" : undefined}
                  className={cn(
                    "relative flex h-8 shrink-0 items-center gap-2.5 rounded-[7px] px-2.5 text-left text-[13px] whitespace-nowrap transition-colors",
                    selected ? "font-medium text-foreground" : "text-gray-11 hover:bg-gray-3 hover:text-foreground",
                  )}
                >
                  {selected && <motion.span layoutId={reduce ? undefined : "settings-nav"} transition={spring.layout} className="bg-gray-4 absolute inset-0 rounded-[7px]" />}
                  <section.icon size={15} weight={selected ? "fill" : "regular"} className="relative" />
                  <span className="relative">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </Rise>

        <Rise className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={{ duration: 0.26, ease: ease.out }}
              className="flex flex-col gap-6"
            >
              <h2 className="sr-only">{current.label}</h2>
              {active === "account" && <AccountSection />}
              {active === "privacy" && (
                <Group title="Visibility" description="Who can see your profile and work.">
                  <Toggle label="Share portfolio by link" hint="Off keeps every project private to your account." defaultChecked />
                  <Toggle label="Let verified recruiters find me" hint="Never turned on without your explicit opt-in." />
                  <Toggle label="Use my activity to tune recommendations" hint="Only ever used for your own account." defaultChecked />
                </Group>
              )}
              {active === "learning" && (
                <Group title="Tutor" description="How lessons sound and look.">
                  <Row label="Instructor voice" hint="Used for narrated lessons.">
                    <SelectBox id="voice" label="Instructor voice" options={["Warm and measured", "Brisk and energetic", "Calm and analytical"]} />
                  </Row>
                  <Row label="Default depth" hint="You can change it during any lesson.">
                    <SelectBox id="depth" label="Default depth" options={["Theory and code", "Applied intuition only", "Full mathematical detail"]} />
                  </Row>
                  <Toggle label="Captions" hint="Also saved to your searchable transcripts." defaultChecked />
                  <Toggle label="3D whiteboard instructor" hint="Turn off for a lighter static portrait." defaultChecked />
                  <Toggle label="Reduce motion" hint="Already follows your device setting automatically." />
                </Group>
              )}
              {active === "notifications" && (
                <Group title="What to notify me about" description="Each can also be changed from the notification itself.">
                  {[
                    "Daily learning reminders",
                    "Weekly progress summary",
                    "Assessment reminders",
                    "Mock interview reminders",
                    "Application follow-ups",
                    "New matching jobs",
                    "Missed session rescheduling",
                  ].map((label, index) => (
                    <Toggle key={label} label={label} defaultChecked={index !== 5} />
                  ))}
                </Group>
              )}
              {active === "ai" && (
                <Group title="Model" description="The model behind plan adaptation, feedback and the assistant.">
                  <Row label="Primary model" hint="Changing it affects new sessions only.">
                    <SelectBox id="model" label="Primary model" options={["Claude Sonnet 5.5 (balanced)", "Claude Opus 5.5 (deepest reasoning)", "Claude Haiku 5.5 (fastest)"]} />
                  </Row>
                  <Toggle label="Show reasoning behind rubric scores" hint="Adds a short explanation to every graded answer." defaultChecked />
                </Group>
              )}
              {active === "integrations" && <IntegrationsSection />}
              {active === "data" && <DataSection />}
            </motion.div>
          </AnimatePresence>
        </Rise>
      </div>
    </PageShell>
  );
}

function AccountSection() {
  const { toast } = useToast();
  const [saved, setSaved] = useState({ name: learner.name, email: learner.email });
  const [name, setName] = useState(saved.name);
  const [email, setEmail] = useState(saved.email);
  const dirty = name !== saved.name || email !== saved.email;
  const [saving, setSaving] = useState(false);

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-1 p-5">
          <h3 className="type-heading">Profile</h3>
          <p className="text-gray-10 text-[13px]">How you appear across the product.</p>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 px-5 pb-5 sm:grid-cols-2">
          <Field>
            <Label htmlFor="st-name">Full name</Label>
            <Input id="st-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
          </Field>
          <Field>
            <Label htmlFor="st-email">Email</Label>
            <Input id="st-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
          </Field>
        </div>
        <div className="bg-gray-2 flex items-center justify-between gap-3 border-t border-border px-5 py-3">
          <span className="text-gray-10 text-[12.5px]">{dirty ? "You have unsaved changes" : "Up to date"}</span>
          <Button
            size="sm"
            disabled={!dirty}
            loading={saving}
            onClick={() => {
              setSaving(true);
              window.setTimeout(() => {
                setSaving(false);
                setSaved({ name, email });
                toast({ title: "Profile saved" });
              }, 600);
            }}
          >
            Save
          </Button>
        </div>
      </Card>
      <Group title="Appearance">
        <Row label="Theme" hint="Light, dark, or follow your system.">
          <ThemeToggle />
        </Row>
      </Group>
    </>
  );
}

function IntegrationsSection() {
  const { toast } = useToast();
  const [connected, setConnected] = useState({ github: true, calendar: false, jobs: true });
  const items = [
    { key: "github", label: "GitHub", icon: GithubLogo, detail: "Read access to repositories you choose" },
    { key: "calendar", label: "Google Calendar", icon: CalendarBlank, detail: "Adds lessons and interview practice to your calendar" },
    { key: "jobs", label: "Job feeds", icon: Plugs, detail: "Greenhouse and Lever postings for market analysis" },
  ] as const;

  return (
    <Group title="Connected services" description="Disconnecting revokes access. Evidence already captured stays, with its original date.">
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-3.5 px-5 py-4">
          <span className="bg-gray-3 text-foreground grid size-9 shrink-0 place-items-center rounded-[9px]"><item.icon size={18} /></span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="flex items-center gap-2 text-[13.5px] font-medium text-foreground">
              {item.label}
              {connected[item.key] && <Badge variant="success">Connected</Badge>}
            </span>
            <span className="text-gray-10 text-[12.5px]">{item.detail}</span>
          </span>
          <Button
            size="sm"
            variant={connected[item.key] ? "ghost" : "secondary"}
            onClick={() => {
              setConnected((prev) => ({ ...prev, [item.key]: !prev[item.key] }));
              toast({ title: item.label + (connected[item.key] ? " disconnected" : " connected"), tone: connected[item.key] ? "info" : "success" });
            }}
          >
            {connected[item.key] ? "Disconnect" : "Connect"}
          </Button>
        </div>
      ))}
    </Group>
  );
}

function DataSection() {
  const { toast } = useToast();
  const [confirm, setConfirm] = useState("");
  const phrase = "delete my account";

  return (
    <>
      <Group title="Export" description="A complete copy of your skills, assessments, recordings and plans as JSON and PDF.">
        <div className="px-5 py-4">
          <Button variant="secondary" size="sm" onClick={() => toast({ title: "Export started", description: "We will email a download link when it is ready.", tone: "info" })}>
            <DownloadSimple /> Export my data
          </Button>
        </div>
      </Group>
      <Card className="border-danger/30 overflow-hidden">
        <div className="flex flex-col gap-1 p-5">
          <h3 className="type-heading text-danger">Delete account</h3>
          <p className="text-gray-11 text-[13px] leading-relaxed">Permanently removes your profile, evidence, recordings and plans. This cannot be undone.</p>
        </div>
        <div className="bg-danger-soft/50 flex justify-end border-t border-danger/20 px-5 py-3">
          <Dialog onOpenChange={(open) => !open && setConfirm("")}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm"><Trash /> Delete account</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delete your account?</DialogTitle>
                <DialogDescription>
                  Everything tied to {learner.email} is permanently removed: profile, skill evidence, recordings and plans.
                </DialogDescription>
              </DialogHeader>
              <Field>
                <Label htmlFor="confirm-delete">
                  Type <span className="font-mono text-foreground">{phrase}</span> to confirm
                </Label>
                <Input id="confirm-delete" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="off" />
                <FieldHint>This protects against deleting by accident.</FieldHint>
              </Field>
              <div className="mt-5 flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="ghost">Keep my account</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="destructive" disabled={confirm.trim().toLowerCase() !== phrase} onClick={() => toast({ title: "Deletion scheduled", description: "You have 7 days to cancel from your email.", tone: "error" })}>
                    Delete account
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </>
  );
}

function Group({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-1 border-b border-border p-5">
        <h3 className="type-heading">{title}</h3>
        {description && <p className="text-gray-10 text-[13px]">{description}</p>}
      </div>
      <div className="divide-y divide-border">{children}</div>
    </Card>
  );
}

function Row({ label, hint, children, htmlFor }: { label: string; hint?: string; children: React.ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4">
      <label htmlFor={htmlFor} className="flex min-w-0 flex-1 flex-col">
        <span className="text-[13.5px] text-foreground">{label}</span>
        {hint && <span className="text-gray-10 text-[12.5px]">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Toggle({ label, hint, defaultChecked }: { label: string; hint?: string; defaultChecked?: boolean }) {
  const id = "tg-" + label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <Row label={label} hint={hint} htmlFor={id}>
      <Switch id={id} defaultChecked={defaultChecked} />
    </Row>
  );
}

function SelectBox({ id, label, options }: { id: string; label: string; options: string[] }) {
  return (
    <Select defaultValue={options[0]}>
      <SelectTrigger id={id} aria-label={label} className="w-full sm:w-[260px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>{options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
    </Select>
  );
}

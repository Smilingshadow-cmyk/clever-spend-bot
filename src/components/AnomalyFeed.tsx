import { useState, useEffect, useCallback } from "react";
import { useSpend } from "@/context/SpendContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  ChevronDown,
  ChevronUp,
  Mail,
  Copy,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  UserCircle,
  CalendarClock,
  MessageSquare,
  XCircle,
  Sparkles,
  Send,
  RotateCcw,
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────────────
type Severity = "critical" | "warning" | "info";
type ItemStatus = "open" | "in_progress" | "resolved";
type Impact = "High" | "Medium" | "Low";
type Effort = "Easy" | "Medium" | "Hard";

interface AnomalyItem {
  id: string;
  severity: Severity;
  title: string;
  amount: string;
  vendor?: string;
  what: string;
  whyItMatters: string;
  howToFix: string[];
  impact: Impact;
  effort: Effort;
  savingsAmount: number;
}

interface TeamMember {
  name: string;
  role: string;
  initials: string;
  color: string;
}

interface ActivityEntry {
  timestamp: Date;
  action: string;
  actor: string;
}

const TEAM: TeamMember[] = [
  { name: "Priya", role: "Finance", initials: "PK", color: "bg-violet-500" },
  { name: "Rahul", role: "Admin", initials: "RS", color: "bg-blue-500" },
  { name: "Sneha", role: "Operations", initials: "SN", color: "bg-emerald-500" },
  { name: "Arjun", role: "Engineering", initials: "AJ", color: "bg-orange-500" },
  { name: "Meera", role: "Compliance", initials: "MR", color: "bg-pink-500" },
];

const ANOMALIES: AnomalyItem[] = [
  {
    id: "a1",
    severity: "critical",
    title: "AWS spend 3x above 90-day average",
    amount: "₹42,000",
    vendor: "AWS",
    what: "Your January AWS bill of ₹42,000 is 3x the 90-day rolling average of ₹14,000.",
    whyItMatters: "If left unchecked, this overrun costs an additional ₹3,36,000/yr — roughly 18% of your total cloud budget.",
    howToFix: [
      "Log into AWS Cost Explorer → filter by service → identify the spike (likely EC2 or RDS).",
      "Right-size or terminate idle instances via AWS Compute Optimizer recommendations.",
      "Set a CloudWatch billing alarm at ₹20,000 to catch future spikes early.",
    ],
    impact: "High",
    effort: "Medium",
    savingsAmount: 28000,
  },
  {
    id: "a2",
    severity: "warning",
    title: "Petty cash withdrawal — no invoice attached",
    amount: "₹22,000",
    what: "A petty cash withdrawal of ₹22,000 on 15 Jan has no supporting invoice or receipt in the system.",
    whyItMatters: "Missing documentation means this ₹22,000 cannot be claimed as a business expense and may trigger audit flags from the CA.",
    howToFix: [
      "Contact the finance team to locate or recreate the receipt.",
      "If the receipt is lost, file a Lost Receipt Declaration form with the CFO's signature.",
      "Update the petty cash register with the corrected entry before month-end close.",
    ],
    impact: "Medium",
    effort: "Easy",
    savingsAmount: 0,
  },
  {
    id: "a3",
    severity: "warning",
    title: "Duplicate subscription: Zoom + Google Meet",
    amount: "₹15,600/month",
    vendor: "Zoom",
    what: "Both Zoom Pro (₹9,600/mo) and Google Meet (included in Google Workspace at ₹6,000/mo) are active simultaneously.",
    whyItMatters: "You are paying ₹1,15,200/yr for redundant video conferencing when Google Meet is already part of your Workspace subscription.",
    howToFix: [
      "Go to zoom.us/billing → click Cancel Plan.",
      "Confirm Google Meet is active under your Google Workspace admin — no replacement needed.",
      "Notify the team via Slack/email about the switch before next billing cycle.",
    ],
    impact: "High",
    effort: "Easy",
    savingsAmount: 115200,
  },
  {
    id: "a4",
    severity: "critical",
    title: "Unknown international wire transfer",
    amount: "₹48,000",
    what: "An international wire of ₹48,000 was sent to an unrecognized beneficiary (ID: BEN-918273) on 22 Jan.",
    whyItMatters: "Unverified international transfers carry compliance risk under FEMA regulations and could result in RBI penalties.",
    howToFix: [
      "Cross-reference BEN-918273 with the approved vendor list in the finance portal.",
      "If unrecognized, immediately flag to the CFO and initiate a chargeback request with HDFC Bank.",
      "File a Suspicious Activity Report (SAR) if the beneficiary cannot be verified within 48 hours.",
    ],
    impact: "High",
    effort: "Hard",
    savingsAmount: 48000,
  },
  {
    id: "a5",
    severity: "info",
    title: "Adobe Creative Cloud — 4 unused seats",
    amount: "₹1,680/month",
    vendor: "Adobe",
    what: "You have 5 Adobe CC seats but only 1 user logged in during the last 60 days.",
    whyItMatters: "4 idle seats cost ₹1,344/month (₹16,128/yr) with zero utilization.",
    howToFix: [
      "Go to Adobe Admin Console → Users → deactivate the 4 idle accounts.",
      "Downgrade to a single-user plan or negotiate a volume discount with Adobe sales.",
    ],
    impact: "Medium",
    effort: "Easy",
    savingsAmount: 16128,
  },
];

// ── Severity dot styling ────────────────────────────────────────────
const severityConfig: Record<Severity, { dot: string; bg: string; label: string }> = {
  critical: { dot: "bg-rose-500", bg: "bg-rose-500/10", label: "Critical" },
  warning: { dot: "bg-amber-400", bg: "bg-amber-500/10", label: "Warning" },
  info: { dot: "bg-blue-400", bg: "bg-blue-500/10", label: "Info" },
};

const impactColor: Record<Impact, string> = {
  High: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  Medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Low: "bg-blue-500/15 text-blue-400 border-blue-500/20",
};
const effortColor: Record<Effort, string> = {
  Easy: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Hard: "bg-rose-500/15 text-rose-400 border-rose-500/20",
};

const statusConfig: Record<ItemStatus, { label: string; icon: React.ElementType; className: string }> = {
  open: { label: "Open", icon: AlertCircle, className: "text-amber-400" },
  in_progress: { label: "In progress", icon: Clock, className: "text-blue-400" },
  resolved: { label: "Resolved", icon: CheckCircle2, className: "text-emerald-400" },
};

// ── Due-date presets ────────────────────────────────────────────────
const DUE_PRESETS = [
  { label: "Today", days: 0 },
  { label: "Tomorrow", days: 1 },
  { label: "In 3 days", days: 3 },
  { label: "In 1 week", days: 7 },
  { label: "In 2 weeks", days: 14 },
];

function formatDueDate(d: Date): string {
  const now = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `Overdue by ${Math.abs(diff)}d`;
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  return `Due in ${diff}d`;
}

function formatTimestamp(d: Date): string {
  return d.toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" });
}

// ── Gemini Email Generation ─────────────────────────────────────────
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function generateEmailWithGemini(item: AnomalyItem): Promise<{ email: string; source: "gemini" | "fallback" }> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
    return { email: generateFallbackEmail(item), source: "fallback" };
  }

  const prompt = `You are a professional Indian finance team assistant. Write a formal but friendly email to ${item.vendor || "the vendor"} regarding this issue:

Issue: ${item.title}
Details: ${item.what}
Financial Impact: ${item.whyItMatters}

Requirements:
- Request cancellation, refund, or clarification as appropriate
- Keep it under 150 words
- Use a polite Indian business tone
- Include a clear subject line at the top (format: "Subject: ...")
- Sign off as "SpendGuard AI — Finance Team"
- Do NOT use any markdown formatting, just plain text`;

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Gemini email error:", res.status, errorText);
      return { email: generateFallbackEmail(item), source: "fallback" };
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      return { email: text, source: "gemini" };
    }
    return { email: generateFallbackEmail(item), source: "fallback" };
  } catch (err) {
    console.error("Email generation failed:", err);
    return { email: generateFallbackEmail(item), source: "fallback" };
  }
}

function generateFallbackEmail(item: AnomalyItem): string {
  return `Subject: Request for clarification — ${item.title}

Dear ${item.vendor || "Vendor"} Team,

I hope this email finds you well.

We are conducting a routine financial audit and noticed the following on our account:

${item.what}

${item.whyItMatters}

Could you kindly look into this and share a resolution or clarification at the earliest? If this charge is in error, we would appreciate a credit note or reversal.

Please feel free to reach out if you need any additional account details from our side.

Best regards,
SpendGuard AI — Finance Team
contact@spendguard.ai`;
}

// ── Draft Email Modal ───────────────────────────────────────────────
function EmailModal({ item, onClose, onAddActivity }: {
  item: AnomalyItem;
  onClose: () => void;
  onAddActivity: (action: string) => void;
}) {
  const [email, setEmail] = useState<string | null>(null);
  const [source, setSource] = useState<"gemini" | "fallback">("fallback");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const generate = useCallback(() => {
    setLoading(true);
    setError(false);
    setEmail(null);
    generateEmailWithGemini(item)
      .then((result) => {
        setEmail(result.email);
        setSource(result.source);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [item]);

  useEffect(() => {
    let cancelled = false;
    generateEmailWithGemini(item)
      .then((result) => {
        if (!cancelled) {
          setEmail(result.email);
          setSource(result.source);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [item]);

  const handleCopy = () => {
    if (email) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      onAddActivity(`Copied draft email for ${item.vendor || "vendor"}`);
      toast({ title: "Email copied", description: "Draft email copied to clipboard. Paste it in your mail client." });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenMailClient = () => {
    if (!email) return;
    const subjectMatch = email.match(/Subject:\s*(.+)/i);
    const subject = subjectMatch ? subjectMatch[1].trim() : `Regarding ${item.title}`;
    const body = email.replace(/Subject:\s*.+\n?\n?/i, "").trim();
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, "_blank");
    onAddActivity(`Opened mail client for ${item.vendor || "vendor"}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass-card rounded-xl border border-border w-full max-w-lg mx-4 p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            Draft email to {item.vendor}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm">Generating with Gemini AI...</span>
            <span className="text-[10px] text-muted-foreground/50">This takes 2-3 seconds</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <AlertCircle className="h-6 w-6 text-rose-400" />
            <span className="text-sm">Failed to generate email</span>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs mt-2" onClick={generate}>
              <RotateCcw className="h-3 w-3" />
              Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Source indicator badge */}
            <div className="flex items-center gap-2 mb-3">
              {source === "gemini" ? (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
                  <Sparkles className="h-3 w-3" />
                  Generated by Gemini AI
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  <AlertCircle className="h-3 w-3" />
                  Template — add Gemini API key in .env for AI drafts
                </span>
              )}
            </div>

            <pre className="text-xs leading-relaxed whitespace-pre-wrap bg-muted/50 rounded-lg p-4 border border-border/50 max-h-[300px] overflow-y-auto font-sans">
              {email}
            </pre>
            <div className="flex justify-end mt-4 gap-2">
              {source === "fallback" && (
                <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={generate}>
                  <RotateCcw className="h-3 w-3" />
                  Regenerate
                </Button>
              )}
              {source === "gemini" && (
                <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={generate}>
                  <RotateCcw className="h-3 w-3" />
                  Regenerate
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs text-blue-400 border-blue-400/30 hover:bg-blue-500/5"
                onClick={handleOpenMailClient}
              >
                <Send className="h-3 w-3" />
                Open in mail client
              </Button>
              <Button size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground" onClick={handleCopy}>
                <Copy className="h-3.5 w-3.5" />
                {copied ? "Copied!" : "Copy to clipboard"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Team Avatar ─────────────────────────────────────────────────────
function TeamAvatar({ member, size = "sm" }: { member: TeamMember; size?: "sm" | "xs" }) {
  const avatarSize = size === "xs" ? "h-4 w-4 text-[7px]" : "h-5 w-5 text-[9px]";
  const textSize = size === "xs" ? "text-[9px]" : "text-[10px]";
  const roleSize = size === "xs" ? "text-[8px]" : "text-[9px]";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/80 border border-border/50 pl-0.5 pr-2 py-0.5">
      <span className={`${avatarSize} rounded-full ${member.color} flex items-center justify-center font-bold text-white`}>
        {member.initials}
      </span>
      <span className={`${textSize} font-medium text-foreground/80`}>{member.name}</span>
      <span className={`${roleSize} text-muted-foreground`}>· {member.role}</span>
    </span>
  );
}

// ── Activity Log ────────────────────────────────────────────────────
function ActivityLog({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <div>
      <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-2 flex items-center gap-1">
        <MessageSquare className="h-3 w-3" />
        Activity
      </h4>
      <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
        {entries.map((entry, i) => (
          <div key={i} className="flex items-start gap-2 text-[10px] text-muted-foreground/80">
            <span className="text-muted-foreground/40 shrink-0 font-mono">{formatTimestamp(entry.timestamp)}</span>
            <span>
              <span className="font-medium text-foreground/70">{entry.actor}</span>{" "}
              {entry.action}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Single anomaly card ─────────────────────────────────────────────
function AnomalyCard({ item, onResolve }: { item: AnomalyItem; onResolve: (savings: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<ItemStatus>("open");
  const [assignee, setAssignee] = useState<TeamMember | null>(null);
  const [showEmail, setShowEmail] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDuePicker, setShowDuePicker] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const [note, setNote] = useState("");

  const sev = severityConfig[item.severity];
  const stCfg = statusConfig[status];
  const isResolved = status === "resolved";

  const addActivity = useCallback((action: string, actor = "You") => {
    setActivityLog((prev) => [{ timestamp: new Date(), action, actor }, ...prev]);
  }, []);

  const cycleStatus = () => {
    if (status === "open") {
      setStatus("in_progress");
      addActivity("moved this to In Progress");
      toast({ title: "Status updated", description: `"${item.title}" is now in progress.` });
    } else if (status === "in_progress") {
      setStatus("resolved");
      onResolve(item.savingsAmount);
      addActivity("resolved this issue");
      toast({
        title: "Issue resolved ✓",
        description: item.savingsAmount > 0
          ? `Saved ₹${item.savingsAmount.toLocaleString("en-IN")} by resolving "${item.title}".`
          : `"${item.title}" has been resolved.`,
      });
    } else {
      setStatus("open");
      addActivity("re-opened this issue");
    }
  };

  const handleAssign = (name: string) => {
    if (name === "__unassign") {
      const prev = assignee;
      setAssignee(null);
      if (prev) addActivity(`unassigned ${prev.name}`);
      toast({ title: "Unassigned", description: `Removed assignee from "${item.title}".` });
      return;
    }
    const member = TEAM.find((t) => t.name === name) || null;
    setAssignee(member);
    if (member) {
      addActivity(`assigned this to ${member.name} (${member.role})`);
      toast({
        title: `Assigned to ${member.name}`,
        description: `${member.name} (${member.role}) will handle "${item.title}".`,
      });
    }
    // Auto-move to "in progress" when someone is assigned
    if (member && status === "open") {
      setStatus("in_progress");
      addActivity("auto-moved to In Progress");
    }
  };

  const handleSetDue = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(23, 59, 59, 0);
    setDueDate(d);
    setShowDuePicker(false);
    const preset = DUE_PRESETS.find((p) => p.days === days);
    addActivity(`set due date to ${preset?.label || `${days} days`}`);
    toast({ title: "Due date set", description: `"${item.title}" is ${formatDueDate(d).toLowerCase()}.` });
  };

  const handleClearDue = () => {
    setDueDate(null);
    setShowDuePicker(false);
    addActivity("removed due date");
  };

  const handleAddNote = () => {
    if (!note.trim()) return;
    addActivity(`added note: "${note.trim()}"`);
    setNote("");
  };

  // Determine if due date is urgent
  const isDueUrgent = dueDate && (dueDate.getTime() - Date.now()) < 1000 * 60 * 60 * 24; // less than 24h
  const isDueOverdue = dueDate && dueDate.getTime() < Date.now();

  return (
    <>
      <div className={`glass-card rounded-lg border transition-all duration-300 ${isResolved ? "opacity-40 order-last" : ""}`}>
        {/* Header row */}
        <button
          className="w-full flex items-center gap-3 p-4 text-left"
          onClick={() => setExpanded(!expanded)}
        >
          <div className={`h-2.5 w-2.5 rounded-full ${sev.dot} shrink-0`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{item.title}</span>
              <span className="text-xs text-muted-foreground">· {item.amount}</span>
            </div>
            {/* Inline meta when collapsed */}
            {!expanded && (assignee || dueDate) && (
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                {assignee && <TeamAvatar member={assignee} size="xs" />}
                {dueDate && (
                  <span className={`text-[9px] flex items-center gap-1 ${isDueOverdue ? "text-rose-400" : isDueUrgent ? "text-amber-400" : "text-muted-foreground/70"}`}>
                    <CalendarClock className="h-3 w-3" />
                    {formatDueDate(dueDate)}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Status badge on header */}
            <span className={`flex items-center gap-1 text-[10px] font-medium ${stCfg.className}`}>
              <stCfg.icon className="h-3 w-3" />
              {stCfg.label}
            </span>
            <Badge variant="outline" className={`text-[10px] ${impactColor[item.impact]}`}>{item.impact} impact</Badge>
            <Badge variant="outline" className={`text-[10px] ${effortColor[item.effort]}`}>{item.effort}</Badge>
            {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </button>

        {/* Expanded Resolution Panel */}
        {expanded && (
          <div className="px-4 pb-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="h-px bg-border/50" />

            {/* What */}
            <div>
              <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-1">What</h4>
              <p className="text-xs text-foreground/80 leading-relaxed">{item.what}</p>
            </div>

            {/* Why it matters */}
            <div>
              <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-1">Why it matters</h4>
              <p className="text-xs text-foreground/80 leading-relaxed">{item.whyItMatters}</p>
            </div>

            {/* How to fix */}
            <div>
              <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-1">How to fix</h4>
              <ol className="space-y-1.5">
                {item.howToFix.map((step, i) => (
                  <li key={i} className="text-xs text-foreground/80 leading-relaxed flex gap-2">
                    <span className="text-primary font-mono font-semibold shrink-0">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Assignment + Due date section */}
            {(assignee || dueDate) && (
              <div className="flex items-center gap-4 flex-wrap">
                {assignee && (
                  <div>
                    <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-1">Assigned to</h4>
                    <div className="flex items-center gap-1.5">
                      <TeamAvatar member={assignee} />
                      <button
                        className="text-muted-foreground/40 hover:text-rose-400 transition-colors p-0.5"
                        onClick={() => handleAssign("__unassign")}
                        title="Unassign"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                {dueDate && (
                  <div>
                    <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-1">Due date</h4>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs flex items-center gap-1 font-medium ${isDueOverdue ? "text-rose-400" : isDueUrgent ? "text-amber-400" : "text-foreground/70"}`}>
                        <CalendarClock className="h-3.5 w-3.5" />
                        {formatDueDate(dueDate)}
                      </span>
                      <button
                        className="text-muted-foreground/40 hover:text-rose-400 transition-colors p-0.5"
                        onClick={handleClearDue}
                        title="Clear due date"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Activity Log */}
            <ActivityLog entries={activityLog} />

            {/* Quick note input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                placeholder="Add a note…"
                className="flex-1 text-xs px-3 py-1.5 rounded-md bg-muted/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/40"
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleAddNote}
                disabled={!note.trim()}
              >
                <MessageSquare className="h-3 w-3" />
              </Button>
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {/* Status toggle */}
              <Button
                size="sm"
                variant="outline"
                className={`h-7 text-xs gap-1.5 ${stCfg.className}`}
                onClick={(e) => { e.stopPropagation(); cycleStatus(); }}
              >
                <stCfg.icon className="h-3 w-3" />
                {status === "open" ? "Mark in progress" : status === "in_progress" ? "Mark resolved" : "Re-open"}
              </Button>

              {/* Assign dropdown */}
              <Select value={assignee?.name || ""} onValueChange={handleAssign}>
                <SelectTrigger className="h-7 text-xs w-[150px]">
                  <SelectValue placeholder="Assign to…" />
                </SelectTrigger>
                <SelectContent>
                  {TEAM.map((t) => (
                    <SelectItem key={t.name} value={t.name} className="text-xs">
                      <span className="flex items-center gap-2">
                        <span className={`h-4 w-4 rounded-full ${t.color} flex items-center justify-center text-[8px] font-bold text-white`}>
                          {t.initials}
                        </span>
                        {t.name} · {t.role}
                      </span>
                    </SelectItem>
                  ))}
                  {assignee && (
                    <SelectItem value="__unassign" className="text-xs text-rose-400">
                      <span className="flex items-center gap-2">
                        <XCircle className="h-3.5 w-3.5" />
                        Unassign
                      </span>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              {/* Due date picker */}
              <div className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  className={`h-7 text-xs gap-1.5 ${dueDate ? (isDueOverdue ? "text-rose-400 border-rose-400/30" : isDueUrgent ? "text-amber-400 border-amber-400/30" : "text-foreground/70") : "text-muted-foreground"}`}
                  onClick={(e) => { e.stopPropagation(); setShowDuePicker(!showDuePicker); }}
                >
                  <CalendarClock className="h-3 w-3" />
                  {dueDate ? formatDueDate(dueDate) : "Set due date"}
                </Button>
                {showDuePicker && (
                  <div className="absolute top-full left-0 mt-1 z-20 glass-card rounded-lg border border-border shadow-xl p-2 min-w-[140px] animate-in zoom-in-95 duration-100">
                    {DUE_PRESETS.map((p) => (
                      <button
                        key={p.days}
                        className="w-full text-left text-xs px-3 py-1.5 rounded-md hover:bg-muted/80 transition-colors"
                        onClick={() => handleSetDue(p.days)}
                      >
                        {p.label}
                      </button>
                    ))}
                    {dueDate && (
                      <>
                        <div className="h-px bg-border/50 my-1" />
                        <button
                          className="w-full text-left text-xs px-3 py-1.5 rounded-md hover:bg-muted/80 text-rose-400 transition-colors"
                          onClick={handleClearDue}
                        >
                          Clear due date
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Draft email */}
              {item.vendor && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/5"
                  onClick={(e) => { e.stopPropagation(); setShowEmail(true); }}
                >
                  <Mail className="h-3 w-3" />
                  Draft email
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {showEmail && (
        <EmailModal
          item={item}
          onClose={() => setShowEmail(false)}
          onAddActivity={addActivity}
        />
      )}
    </>
  );
}

// ── Main export ─────────────────────────────────────────────────────
export function AnomalyFeed() {
  const [resolvedSavings, setResolvedSavings] = useState(0);
  const resolvedCount = useState(0);

  const handleResolve = (savings: number) => {
    setResolvedSavings((prev) => prev + savings);
  };

  return (
    <div className="glass-card rounded-lg p-5 animate-slide-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">AI anomaly feed</h3>
          <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
            {ANOMALIES.length} issues
          </Badge>
        </div>
        {resolvedSavings > 0 && (
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            ₹{resolvedSavings.toLocaleString("en-IN")} recovered
          </span>
        )}
      </div>
      <div className="space-y-3 flex flex-col">
        {ANOMALIES.map((item) => (
          <AnomalyCard key={item.id} item={item} onResolve={handleResolve} />
        ))}
      </div>
    </div>
  );
}

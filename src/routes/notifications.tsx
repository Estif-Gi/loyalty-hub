import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Megaphone, Tag, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications · Ember & Oak" }] }),
  component: NotificationsPage,
});

const templates = [
  { icon: Tag, label: "Discount", title: "20% off this weekend!", message: "Stop by Saturday or Sunday for 20% off your entire bill." },
  { icon: Megaphone, label: "Announcement", title: "New chef, new menu", message: "We've welcomed Chef Mariana — try her tasting menu this week." },
  { icon: Sparkles, label: "Promotion", title: "Double stamps tonight", message: "Earn 2 loyalty stamps on every order tonight only." },
];

function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<string | null>(null);

  const send = () => {
    if (!title.trim() || !message.trim()) return;
    setSent(`Sent to 1,284 customers · ${new Date().toLocaleTimeString()}`);
    setTitle(""); setMessage("");
    setTimeout(() => setSent(null), 4000);
  };

  return (
    <DashboardLayout title="Push Notifications" subtitle="Reach customers directly in their pocket.">
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="rounded-2xl bg-card border border-border p-6 shadow-soft">
          <h2 className="font-display text-xl mb-1">Compose message</h2>
          <p className="text-sm text-muted-foreground mb-5">Sent to all opted-in customers.</p>

          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Tonight only — double stamps"
            maxLength={60}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm mb-4"
          />

          <label className="block text-sm font-medium mb-2">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell customers what's happening…"
            rows={5}
            maxLength={240}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm resize-none"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{message.length}/240</span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {templates.map((t) => (
              <button
                key={t.label}
                onClick={() => { setTitle(t.title); setMessage(t.message); }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary text-sm hover:bg-warm transition-colors"
              >
                <t.icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={send}
            disabled={!title || !message}
            className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-warm text-primary-foreground px-6 py-3 font-medium shadow-warm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            <Send className="h-4 w-4" /> Send notification
          </button>
          {sent && <p className="mt-4 text-sm text-success">{sent}</p>}
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground">Live preview</p>
          <div className="rounded-3xl bg-sidebar p-5 shadow-warm">
            <div className="rounded-xl bg-card text-card-foreground p-4 shadow-soft">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <div className="h-5 w-5 rounded bg-gradient-warm" />
                <span>Ember & Oak</span>
                <span className="ml-auto">now</span>
              </div>
              <p className="font-semibold text-sm">{title || "Your title appears here"}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {message || "Your message preview will show here as you type."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Send, Megaphone, Tag, Sparkles, Loader2, Users, Clock } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store";
import axios from "axios";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import {
  CircularInput,
  CircularTrack,
  CircularProgress,
  CircularThumb,
} from "react-circular-input";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications · Ember & Oak" }] }),
  component: NotificationsPage,
});

const templates = [
  {
    icon: Tag,
    label: "Discount",
    title: "20% off this weekend!",
    message: "Stop by Saturday or Sunday for 20% off your entire bill.",
  },
  {
    icon: Megaphone,
    label: "Announcement",
    title: "New chef, new menu",
    message: "We've welcomed Chef Mariana — try her tasting menu this week.",
  },
  {
    icon: Sparkles,
    label: "Promotion",
    title: "Double stamps tonight",
    message: "Earn 2 loyalty stamps on every order tonight only.",
  },
];

const AnimatedItem = ({ children, delay = 0, index, onMouseEnter, onClick }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.2, triggerOnce: false });
  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.1, delay }}
      className="mb-4 cursor-pointer"
    >
      {children}
    </motion.div>
  );
};

function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const storeRestaurantId = useAuthStore((s) => s.restaurantId);
  const [restaurantId, setRestaurantId] = useState<string | null>(
    () =>
      storeRestaurantId ??
      (typeof window !== "undefined"
        ? localStorage.getItem("restaurantId")
        : null),
  );

  useEffect(() => {
    if (storeRestaurantId) {
      setRestaurantId(storeRestaurantId);
    } else if (typeof window !== "undefined") {
      const lsId = localStorage.getItem("restaurantId");
      if (lsId) setRestaurantId(lsId);
    }
  }, [storeRestaurantId]);

  const token = useAuthStore((s) => s.token);
  const billingStatus = useAuthStore((s) => s.billingStatus);
  const isFaithful = billingStatus === "faithful";

  const [isTargeted, setIsTargeted] = useState(false);
  const [minStamps, setMinStamps] = useState(5);
  const [rawDialValue, setRawDialValue] = useState((5 - 1) / 199);

  const BASE = import.meta.env.VITE_API_BASE_URL as string;

  const notificationHistoryQuery = useQuery({
    queryKey: ["notificationHistory", restaurantId],
    queryFn: async () => {
      if (!restaurantId) throw new Error("Restaurant ID not found");
      const res = await axios.get(
        `${BASE}/notifications?restaurantId=${encodeURIComponent(restaurantId)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return res.data;
    },
    enabled: Boolean(restaurantId),
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async () => {
      if (!restaurantId) throw new Error("Restaurant ID is required");

      const endpoint =
        isFaithful && isTargeted
          ? `${BASE}/notifications/targeted`
          : `${BASE}/notifications`;
      const payload =
        isFaithful && isTargeted
          ? {
              restaurantId,
              title,
              description: message,
              minStamps,
              stampAction: { type: "inc", value: 1 },
            }
          : { restaurantId, title, description: message, url: "/rewards" };

      const { data } = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const notification = data?.notification ?? data;

      if (db) {
        addDoc(collection(db, "notifications"), {
          restaurantId: notification.restaurantId,
          title: notification.title,
          description: notification.description,
          url: notification.url,
          sentCount: notification.sentCount,
          failedCount: notification.failedCount,
          status: notification.status,
          createdAt: serverTimestamp(),
        }).catch((err) =>
          console.error("[Firestore] notification save failed:", err),
        );
      }

      queryClient.invalidateQueries({
        queryKey: ["notificationHistory", restaurantId],
      });
      return notification;
    },
    onSuccess: () => {
      setSent(`Sent to your customers · ${new Date().toLocaleTimeString()}`);
      setTitle("");
      setMessage("");
      toast.success("Notification sent successfully!");
      setTimeout(() => setSent(null), 4000);
    },
    onError: (error: Error) => {
      const msg =
        (error as any).response?.data?.message ??
        error.message ??
        "Failed to send notification";
      toast.error(msg);
    },
  });

  const send = () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    if (!restaurantId) {
      toast.error("Restaurant ID not found. Please log in again.");
      return;
    }
    sendNotificationMutation.mutate();
  };

  const charPercentage = (message.length / 240) * 100;

  return (
    <DashboardLayout
      title="Push Notifications"
      subtitle="Reach customers directly in their pocket."
    >
      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* ── Compose panel ── */}
        <div className="rounded-2xl bg-card border border-border p-6 shadow-soft space-y-5">
          <div>
            <h2 className="font-display text-xl font-semibold">Compose</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Sent to all opted-in customers.
            </p>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Tonight only — double stamps"
              maxLength={60}
              disabled={sendNotificationMutation.isPending}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors disabled:opacity-50"
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell customers what's happening…"
              rows={4}
              maxLength={240}
              disabled={sendNotificationMutation.isPending}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors disabled:opacity-50"
            />
            {/* Character bar */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${charPercentage}%`,
                    backgroundColor:
                      charPercentage > 90
                        ? "hsl(var(--destructive))"
                        : charPercentage > 70
                          ? "hsl(var(--warning, 38 92% 50%))"
                          : "hsl(var(--primary))",
                  }}
                />
              </div>
              <span
                className={`text-xs tabular-nums ${charPercentage > 90 ? "text-destructive" : "text-muted-foreground"}`}
              >
                {message.length}/240
              </span>
            </div>
          </div>

          {/* Targeted notification (Faithful only) */}
          {isFaithful && (
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <label
                      htmlFor="targeted-switch"
                      className="text-sm font-medium cursor-pointer block"
                    >
                      Targeted send
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Loyal customers only
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isTargeted}
                  onCheckedChange={setIsTargeted}
                  disabled={sendNotificationMutation.isPending}
                  id="targeted-switch"
                />
              </div>

              {isTargeted && (
                <div className="pt-4 border-t border-border/50 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                  <p className="text-sm font-medium text-foreground">
                    Minimum stamps required
                  </p>

                  <div className="flex items-center gap-6 justify-center">
                    {/* Circular dial */}
                    <div className="relative flex-shrink-0 flex items-center justify-center">
                      <CircularInput
                        radius={80}
                        value={rawDialValue}
                        onChange={(value) => {
                          setRawDialValue(value);
                          setMinStamps(Math.round(value * 199) + 1);
                        }}
                        fill="#DD8955"
                      >
                        <CircularTrack stroke="#ffffff" strokeWidth={6} />
                        <CircularProgress stroke="#EBB899" strokeWidth={6} />
                        <CircularThumb r={8} fill="#94a3b8" />
                      </CircularInput>
                      <div className="absolute flex flex-col items-center pointer-events-none">
                        <span className="text-2xl font-bold leading-none tabular-nums">
                          {minStamps}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">
                          stamps
                        </span>
                      </div>
                    </div>

                    {/* Manual input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                        Or type a value
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={minStamps}
                        onChange={(e) => {
                          const v = Math.min(200, Math.max(1, parseInt(e.target.value) || 1));
                          setMinStamps(v);
                          setRawDialValue((v - 1) / 199);
                        }}
                        disabled={sendNotificationMutation.isPending}
                        className="w-20 rounded-lg border border-input bg-background px-3 py-2 text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Info callout */}
                  <div className="flex items-center gap-2 rounded-lg bg-primary/8 border border-primary/15 px-3 py-2.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Each recipient also earns{" "}
                      <strong className="text-foreground font-medium">
                        1 bonus stamp
                      </strong>{" "}
                      for this notification.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Templates */}
          <div>
            <p className="text-xs text-muted-foreground mb-2.5 font-medium uppercase tracking-wide">
              Quick templates
            </p>
            <div className="flex flex-wrap gap-2">
              {templates.map((t) => (
                <button
                  key={t.label}
                  onClick={() => {
                    setTitle(t.title);
                    setMessage(t.message);
                  }}
                  disabled={sendNotificationMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-background text-sm hover:bg-muted transition-colors disabled:opacity-40 text-foreground"
                >
                  <t.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Send button + feedback */}
          <div className="flex items-center gap-4 pt-1">
            <button
              onClick={send}
              disabled={
                !title.trim() ||
                !message.trim() ||
                sendNotificationMutation.isPending ||
                !restaurantId
              }
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-warm text-primary-foreground px-5 py-2.5 text-sm font-medium shadow-warm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              {sendNotificationMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send notification
            </button>

            {sent && (
              <p className="text-sm text-success flex items-center gap-1.5 animate-in fade-in duration-300">
                <span className="h-1.5 w-1.5 rounded-full bg-success inline-block" />
                {sent}
              </p>
            )}
          </div>

          {!restaurantId && (
            <p className="text-sm text-destructive">
              Restaurant ID not found — please log in again.
            </p>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">
          {/* Live preview */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Preview
            </p>
            <div className="rounded-2xl bg-sidebar border border-border/50 p-4">
              <div className="rounded-xl bg-card border border-border text-card-foreground p-4 shadow-soft">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2.5">
                  <div className="h-5 w-5 rounded-md bg-gradient-warm flex-shrink-0" />
                  <span className="font-medium">Ember & Oak</span>
                  <span className="ml-auto">now</span>
                </div>
                <p className="font-semibold text-sm leading-snug">
                  {title || (
                    <span className="text-muted-foreground/60">
                      Your title appears here
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {message || (
                    <span className="text-muted-foreground/50">
                      Your message preview will show here as you type.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="rounded-2xl bg-card border border-border p-5 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-semibold">History</h3>
              <span className="text-xs text-muted-foreground tabular-nums">
                {notificationHistoryQuery.data?.length ?? 0} sent
              </span>
            </div>

            {notificationHistoryQuery.isLoading && (
              <div className="flex items-center gap-2 py-6 justify-center text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading…</span>
              </div>
            )}

            {notificationHistoryQuery.isError && (
              <p className="text-sm text-destructive py-2">
                Could not load history.
              </p>
            )}

            {!notificationHistoryQuery.isLoading &&
              notificationHistoryQuery.data?.length === 0 && (
                <div className="py-8 text-center">
                  <Megaphone className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No notifications sent yet.
                  </p>
                </div>
              )}

            {notificationHistoryQuery.data?.length > 0 && (
              <div className="max-h-[340px] overflow-y-auto -mx-1 px-1 space-y-3 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-muted scrollbar-track-transparent">
                {notificationHistoryQuery.data.map((item: any, index: number) => (
                  <AnimatedItem key={item._id || item.id} delay={index * 0.05} index={index}>
                    <div className="rounded-xl border border-border bg-background p-3.5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm leading-snug">
                          {item.title}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                            item.status === "sent"
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                      <div className="mt-2.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {item.sentCount} delivered
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(item.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </AnimatedItem>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
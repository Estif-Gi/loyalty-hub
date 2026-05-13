import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Send, Megaphone, Tag, Sparkles, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store";
import axios from "axios";

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

function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Prefer restaurantId from the Zustand store; fall back to localStorage
  const storeRestaurantId = useAuthStore((s) => s.restaurantId);
  const [restaurantId, setRestaurantId] = useState<string | null>(
    () => storeRestaurantId ?? localStorage.getItem("restaurantId"),
  );

  // Keep in sync if the store value arrives later (e.g. after fetchProfile)
  useEffect(() => {
    if (storeRestaurantId) {
      setRestaurantId(storeRestaurantId);
    } else {
      const lsId = localStorage.getItem("restaurantId");
      if (lsId) setRestaurantId(lsId);
    }
  }, [storeRestaurantId]);

  const token = useAuthStore((s) => s.token);
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

      // Call backend directly — no interceptor chain, no indirection
      const { data } = await axios.post(
        `${BASE}/notifications`,
        { restaurantId, title, description: message, url: "/rewards" },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
      );

      const notification = data?.notification ?? data;

      // Fire-and-forget: save to Firestore in background, don't block mutation
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
        }).catch((err) => console.error("[Firestore] notification save failed:", err));
      }

      queryClient.invalidateQueries({ queryKey: ["notificationHistory", restaurantId] });
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
        (error as any).response?.data?.message ?? error.message ?? "Failed to send notification";
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

  return (
    <DashboardLayout
      title="Push Notifications"
      subtitle="Reach customers directly in their pocket."
    >
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
            disabled={sendNotificationMutation.isPending}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm mb-4"
          />

          <label className="block text-sm font-medium mb-2">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell customers what's happening…"
            rows={5}
            maxLength={240}
            disabled={sendNotificationMutation.isPending}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm resize-none"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{message.length}/240</span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {templates.map((t) => (
              <button
                key={t.label}
                onClick={() => {
                  setTitle(t.title);
                  setMessage(t.message);
                }}
                disabled={sendNotificationMutation.isPending}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary text-sm hover:bg-warm transition-colors disabled:opacity-50"
              >
                <t.icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={send}
            disabled={
              !title.trim() ||
              !message.trim() ||
              sendNotificationMutation.isPending ||
              !restaurantId
            }
            className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-warm text-primary-foreground px-6 py-3 font-medium shadow-warm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {sendNotificationMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send notification
          </button>

          {sent && <p className="mt-4 text-sm text-success">{sent}</p>}
          {!restaurantId && (
            <p className="mt-3 text-sm text-destructive">Restaurant ID not found in localStorage</p>
          )}
        </div>

        {/* Live preview + History (unchanged) */}
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

          {/* History section remains the same */}
          <div className="rounded-2xl bg-card border border-border p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg">Notification history</h3>
              <span className="text-xs text-muted-foreground">
                {notificationHistoryQuery.data?.length ?? 0} sent
              </span>
            </div>

            {notificationHistoryQuery.isLoading && (
              <p className="text-sm text-muted-foreground">Loading history…</p>
            )}

            {notificationHistoryQuery.isError && (
              <p className="text-sm text-destructive">Could not load history.</p>
            )}

            {notificationHistoryQuery.data?.length === 0 && (
              <p className="text-sm text-muted-foreground">No notifications have been sent yet.</p>
            )}

            {notificationHistoryQuery.data?.length > 0 && (
              <div
                className="max-h-[320px] overflow-y-auto pr-3 space-y-4 
                    scrollbar-thin scrollbar-thumb-rounded-full 
                    scrollbar-track-rounded-full 
                    scrollbar-thumb-muted scrollbar-track-transparent"
              >
                {notificationHistoryQuery.data.map((item: any) => (
                  <div
                    key={item._id || item.id}
                    className="rounded-2xl border border-border bg-background p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm">{item.title}</p>
                      <span className="text-xs text-muted-foreground">{item.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{item.sentCount} sent</span>
                      <span>{item.failedCount} failed</span>
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

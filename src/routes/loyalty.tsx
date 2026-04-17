import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Gift } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { rewardTiers as initial, type RewardTier } from "@/lib/dashboard-data";

export const Route = createFileRoute("/loyalty")({
  head: () => ({ meta: [{ title: "Loyalty Program · Ember & Oak" }] }),
  component: LoyaltyPage,
});

function LoyaltyPage() {
  const [tiers, setTiers] = useState<RewardTier[]>(initial);
  const [scans, setScans] = useState("");
  const [reward, setReward] = useState("");

  const add = () => {
    const n = parseInt(scans);
    if (!n || !reward.trim()) return;
    setTiers([...tiers, { id: crypto.randomUUID(), scans: n, reward }].sort((a, b) => a.scans - b.scans));
    setScans(""); setReward("");
  };

  const update = (id: string, patch: Partial<RewardTier>) =>
    setTiers(tiers.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const remove = (id: string) => setTiers(tiers.filter((t) => t.id !== id));

  return (
    <DashboardLayout title="Loyalty Program" subtitle="Define rewards your customers unlock as they return.">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="font-display text-xl">Reward tiers</h2>
            <p className="text-sm text-muted-foreground">Edit the scan thresholds and rewards.</p>
          </div>
          <ul className="divide-y divide-border">
            {tiers.map((t) => (
              <li key={t.id} className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-warm flex items-center justify-center text-primary-foreground shrink-0">
                  <Gift className="h-4 w-4" />
                </div>
                <input
                  type="number"
                  value={t.scans}
                  onChange={(e) => update(t.id, { scans: parseInt(e.target.value) || 0 })}
                  className="w-20 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
                <span className="text-xs text-muted-foreground hidden sm:inline">scans →</span>
                <input
                  value={t.reward}
                  onChange={(e) => update(t.id, { reward: e.target.value })}
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
                <button
                  onClick={() => remove(t.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <div className="p-4 bg-cream/50 border-t border-border flex flex-col sm:flex-row gap-2">
            <input
              type="number"
              placeholder="Scans"
              value={scans}
              onChange={(e) => setScans(e.target.value)}
              className="sm:w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              placeholder="Reward description"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
            <button
              onClick={add}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary-glow"
            >
              <Plus className="h-4 w-4" /> Add tier
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-warm text-primary-foreground p-6 shadow-warm">
          <p className="text-primary-foreground/80 text-sm">Pro tip</p>
          <h3 className="font-display text-2xl mt-1 leading-snug">Keep first reward within reach.</h3>
          <p className="text-sm text-primary-foreground/85 mt-3">
            Customers are 3× more likely to return when they earn a small reward in their first 5 visits.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

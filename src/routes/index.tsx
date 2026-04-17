import { createFileRoute } from "@tanstack/react-router";
import { Users, QrCode, TrendingUp, Gift, Activity as ActivityIcon } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { StampCard } from "@/components/dashboard/stamp-card";
import { stats, activity } from "@/lib/dashboard-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Ember & Oak Loyalty" },
      { name: "description", content: "Restaurant loyalty dashboard overview." },
    ],
  }),
  component: Overview,
});

function Overview() {
  return (
    <DashboardLayout
      title="Good evening, Chef ✦"
      subtitle="Here's how your loyalty program is doing today."
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total customers" value={stats.totalCustomers.toLocaleString()} delta="+24 this week" icon={Users} />
        <StatCard label="Scans today" value={stats.scansToday} delta="+12% vs yesterday" icon={QrCode} tone="warm" />
        <StatCard label="Scans this week" value={stats.scansThisWeek} delta="+8% vs last week" icon={TrendingUp} />
        <StatCard label="Rewards redeemed" value={stats.rewardsRedeemed} delta="+18 this week" icon={Gift} tone="cream" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-6 shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-xl">Recent activity</h2>
              <p className="text-sm text-muted-foreground">Live customer interactions</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-success/10 text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Live
            </span>
          </div>
          <ul className="divide-y divide-border">
            {activity.map((a) => (
              <li key={a.id} className="py-3.5 flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <ActivityIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{a.customer}</p>
                  <p className="text-sm text-muted-foreground">{a.action}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{a.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <StampCard current={7} total={10} label="Average customer progress" />
          <div className="rounded-2xl bg-card border border-border p-5 shadow-soft">
            <h3 className="font-display text-lg mb-1">Loyalty completion</h3>
            <p className="text-sm text-muted-foreground mb-4">Customers who reached a reward</p>
            <div className="flex items-end gap-3">
              <span className="font-display text-4xl text-primary">{stats.loyaltyProgress}%</span>
              <span className="text-sm text-success mb-1.5">+5% this month</span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-gradient-warm" style={{ width: `${stats.loyaltyProgress}%` }} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

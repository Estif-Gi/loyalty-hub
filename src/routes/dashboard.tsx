import { createFileRoute } from "@tanstack/react-router";
import { Users, QrCode, TrendingUp, Gift } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { StampCard } from "@/components/dashboard/stamp-card";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Ember & Oak Loyalty" },
      { name: "description", content: "Restaurant loyalty dashboard overview." },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { restaurantId, user } = useAuth();

  const { data: users } = useQuery({
    queryKey: ["customers", restaurantId],
    queryFn: async () => {
      const res = await api.get("/users");
      return res.data;
    },
    enabled: !!restaurantId,
  });

  // Calculate real stats based on fetched users
  let totalCustomers = 0;
  let totalScans = 0;

  if (users && restaurantId) {
    users.forEach((u: any) => {
      const loyalty = u.loyalTo?.find((l: any) => l.resID === restaurantId);
      if (loyalty) {
        totalCustomers++;
        totalScans += loyalty.stamps || 0;
      }
    });
  }

  // Get top 5 customers by stamps
  const topCustomers =
    users
      ?.filter((u: any) => u.loyalTo?.find((l: any) => l.resID === restaurantId))
      ?.map((u: any) => {
        const loyalty = u.loyalTo.find((l: any) => l.resID === restaurantId);
        return { name: u.name, stamps: loyalty?.stamps || 0 };
      })
      ?.sort((a: any, b: any) => b.stamps - a.stamps)
      ?.slice(0, 5) || [];

  // Fallback to 0 for missing backend features
  const rewardsRedeemed = 0;
  const loyaltyProgress =
    totalCustomers > 0 ? Math.min(100, Math.round((totalScans / (totalCustomers * 10)) * 100)) : 0;

  return (
    <DashboardLayout
      title={`Good evening, ${user?.name || "Chef"} ✦`}
      subtitle="Here's how your loyalty program is doing today."
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total customers"
          value={totalCustomers.toLocaleString()}
          delta="Active"
          icon={Users}
        />
        <StatCard
          label="Total scans"
          value={totalScans.toLocaleString()}
          delta="All time"
          icon={QrCode}
          tone="warm"
        />
        <StatCard label="Scans this week" value={"--"} delta="Coming soon" icon={TrendingUp} />
        <StatCard
          label="Rewards redeemed"
          value={rewardsRedeemed}
          delta="All time"
          icon={Gift}
          tone="cream"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-6 shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-xl">Restaurant Leaderboard</h2>
              <p className="text-sm text-muted-foreground">Most loyal customers by stamps</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Leaderboard
            </span>
          </div>
          <ul className="divide-y divide-border">
            {topCustomers.map((customer: any, index: number) => (
              <li key={customer.name} className="py-3.5 flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">#{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {customer.stamps} stamps collected
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">Top {index + 1}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <StampCard
            current={totalCustomers > 0 ? Math.round(totalScans / totalCustomers) : 0}
            total={10}
            label="Average customer progress"
          />
          <div className="rounded-2xl bg-card border border-border p-5 shadow-soft">
            <h3 className="font-display text-lg mb-1">Loyalty completion</h3>
            <p className="text-sm text-muted-foreground mb-4">Customers who reached a reward</p>
            <div className="flex items-end gap-3">
              <span className="font-display text-4xl text-primary">{loyaltyProgress}%</span>
              <span className="text-sm text-success mb-1.5">Average</span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-gradient-warm" style={{ width: `${loyaltyProgress}%` }} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "Customers · Ember & Oak" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "vip" | "new">("all");
  const { restaurantId } = useAuth();
  const queryClient = useQueryClient();

  const { data: allUsers, isLoading } = useQuery({
    queryKey: ["customers", restaurantId],
    queryFn: async () => {
      const res = await api.get("/users");
      return res.data;
    },
    enabled: !!restaurantId,
  });

  const addStampMutation = useMutation({
    mutationFn: async (customerId: string) => {
      await api.post("/users/stamps", { customerId, restaurantId, stampsToAdd: 1 });
    },
    onSuccess: () => {
      toast.success("Stamp added!");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: () => toast.error("Failed to add stamp"),
  });

  const customers = (allUsers || [])
    .map((user: any) => {
      const loyalty = user.loyalTo?.find((l: any) => l.resID === restaurantId);
      return {
        id: user._id,
        name: user.name || "Unknown",
        scans: loyalty?.stamps || 0,
        rewardsEarned: 0,
        lastVisit: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Never",
      };
    })
    .filter((c: any) => c.scans > 0);

  const filtered = customers.filter((c: any) => {
    if (
      q &&
      !c.name.toLowerCase().includes(q.toLowerCase()) &&
      !c.id.toLowerCase().includes(q.toLowerCase())
    )
      return false;
    if (filter === "vip" && c.scans < 15) return false;
    if (filter === "new" && c.scans > 5) return false;
    return true;
  });

  return (
    <DashboardLayout title="Customers" subtitle="Everyone who's scanned your QR code.">
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or ID…"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-input bg-card text-sm shadow-soft"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "vip", "new"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-foreground hover:bg-secondary"
              }`}
            >
              {f === "all" ? "All" : f === "vip" ? "VIP (15+)" : "New"}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_120px_140px_140px_120px_100px] gap-4 px-5 py-3 bg-cream/60 text-xs uppercase tracking-wide text-muted-foreground">
          <span>Customer</span>
          <span>ID</span>
          <span>Total scans</span>
          <span>Rewards earned</span>
          <span className="text-right">Last visit</span>
          <span>Action</span>
        </div>
        <ul className="divide-y divide-border">
          {isLoading && (
            <li className="p-10 text-center text-sm text-muted-foreground">Loading customers...</li>
          )}
          {!isLoading &&
            filtered.map((c: any) => (
              <li
                key={c.id}
                className="p-4 md:px-5 md:grid md:grid-cols-[1fr_120px_140px_140px_120px_100px] md:gap-4 md:items-center flex flex-col gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-warm text-primary-foreground flex items-center justify-center text-sm font-display shrink-0">
                    {c.name === "Anonymous"
                      ? "?"
                      : c.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                  </div>
                  <span className="font-medium truncate">{c.name}</span>
                </div>
                <span className="text-sm text-muted-foreground truncate" title={c.id}>
                  {c.id.substring(0, 8)}...
                </span>
                <span className="text-sm">{c.scans} scans</span>
                <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                  {c.rewardsEarned} earned
                </span>
                <span className="text-sm text-muted-foreground md:text-right">{c.lastVisit}</span>
                <button
                  onClick={() => addStampMutation.mutate(c.id)}
                  disabled={addStampMutation.isPending}
                  className="ml-auto md:ml-0 inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md text-sm font-medium transition-colors"
                >
                  <Plus className="w-3 h-3" /> Stamp
                </button>
              </li>
            ))}
          {!isLoading && filtered.length === 0 && (
            <li className="p-10 text-center text-sm text-muted-foreground">
              No customers match your search.
            </li>
          )}
        </ul>
      </div>
    </DashboardLayout>
  );
}

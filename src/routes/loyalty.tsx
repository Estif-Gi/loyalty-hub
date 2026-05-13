import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Gift, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/loyalty")({
  head: () => ({ meta: [{ title: "Loyalty Program · Ember & Oak" }] }),
  component: LoyaltyPage,
});

function LoyaltyPage() {
  const [scans, setScans] = useState("");
  const [reward, setReward] = useState("");
  const { restaurantId } = useAuth();
  const queryClient = useQueryClient();
  // console.log(restaurantId)

  const { data: program, isLoading } = useQuery({
    queryKey: ["loyaltyProgram", restaurantId],
    queryFn: async () => {
      try {
        const res = await api.get(`/loyalty/restaurant/${restaurantId}`);
        // The API returns an object with a programs array
        return res.data && res.data.programs && res.data.programs.length > 0
          ? res.data.programs[0]
          : null;
      } catch (e: any) {
        if (e.response?.status === 404) return null;
        throw e;
      }
    },
    enabled: !!restaurantId,
  });

  const createProgramMutation = useMutation({
    mutationFn: async (initialReward: any) => {
      const res = await api.post("/loyalty", {
        restaurantId,
        rewards: [initialReward],
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Loyalty program initialized!");
      queryClient.invalidateQueries({ queryKey: ["loyaltyProgram"] });
      setScans("");
      setReward("");
    },
    onError: () => toast.error("Failed to create program"),
  });

  const addRewardMutation = useMutation({
    mutationFn: async (newReward: any) => {
      await api.post(`/loyalty/${program._id}/rewards`, newReward);
    },
    onSuccess: () => {
      toast.success("Reward added!");
      queryClient.invalidateQueries({ queryKey: ["loyaltyProgram"] });
      setScans("");
      setReward("");
    },
    onError: () => toast.error("Failed to add reward"),
  });
  const removeRewardMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      await api.delete(`/loyalty/${program._id}/rewards/${rewardId}`);
    },
    onSuccess: () => {
      toast.success("Reward removed!");
      queryClient.invalidateQueries({ queryKey: ["loyaltyProgram"] });
    },
    onError: () => toast.error("Failed to remove reward"),
  });

  const add = () => {
    const n = parseInt(scans);
    if (!n || !reward.trim()) return;

    const newReward = { stampsRequired: n, rewardDescription: reward };

    if (!program) {
      createProgramMutation.mutate(newReward);
    } else {
      addRewardMutation.mutate(newReward);
    }
  };

  const remove = (id: string) => {
    removeRewardMutation.mutate(id);
  };

  const tiers =
    program?.rewards?.sort((a: any, b: any) => a.stampsRequired - b.stampsRequired) || [];

  return (
    <DashboardLayout
      title="Loyalty Program"
      subtitle="Define rewards your customers unlock as they return."
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-soft overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border">
            <h2 className="font-display text-xl">Reward tiers</h2>
            <p className="text-sm text-muted-foreground">Edit the scan thresholds and rewards.</p>
          </div>

          <ul className="divide-y divide-border flex-1 overflow-y-auto">
            {isLoading && (
              <li className="p-10 flex justify-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
              </li>
            )}
            {!isLoading &&
              tiers.map((t: any) => (
                <li key={t._id} className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-warm flex items-center justify-center text-primary-foreground shrink-0">
                    <Gift className="h-4 w-4" />
                  </div>
                  <div className="w-20 rounded-lg border border-input bg-muted px-3 py-2 text-sm text-center">
                    {t.stampsRequired}
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:inline">scans →</span>
                  <div className="flex-1 rounded-lg border border-input bg-muted px-3 py-2 text-sm">
                    {t.rewardDescription}
                  </div>
                  <button
                    onClick={() => remove(t._id)}
                    disabled={removeRewardMutation.isPending}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            {!isLoading && tiers.length === 0 && (
              <li className="p-10 text-center text-sm text-muted-foreground">
                No rewards configured yet. Add one below to start your loyalty program!
              </li>
            )}
          </ul>

          <div className="p-4 bg-cream/50 border-t border-border flex flex-col sm:flex-row gap-2">
            <input
              type="number"
              placeholder="Scans"
              value={scans}
              onChange={(e) => setScans(e.target.value)}
              className="sm:w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm"
              disabled={createProgramMutation.isPending || addRewardMutation.isPending}
            />
            <input
              placeholder="Reward description"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
              disabled={createProgramMutation.isPending || addRewardMutation.isPending}
            />
            <button
              onClick={add}
              disabled={
                createProgramMutation.isPending || addRewardMutation.isPending || !scans || !reward
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary-glow disabled:opacity-50"
            >
              {createProgramMutation.isPending || addRewardMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add tier
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-warm text-primary-foreground p-6 shadow-warm h-fit">
          <p className="text-primary-foreground/80 text-sm">Pro tip</p>
          <h3 className="font-display text-2xl mt-1 leading-snug">
            Keep first reward within reach.
          </h3>
          <p className="text-sm text-primary-foreground/85 mt-3">
            Customers are 3× more likely to return when they earn a small reward in their first 5
            visits.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

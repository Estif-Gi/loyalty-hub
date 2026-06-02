import { createFileRoute } from "@tanstack/react-router";
import { Check, CreditCard, Loader2, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useAuth } from "@/lib/auth";
import { BILLING_PLANS, formatETB } from "@/lib/plans";
import { useAuthStore } from "@/store/auth.store";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/billing")({
  head: () => ({ meta: [{ title: "Billing · Ember & Oak" }] }),
  component: BillingPage,
});

function BillingPage() {
  const { billingStatus, restaurantId } = useAuth();
  const updateBillingStatus = useAuthStore((s) => s.updateBillingStatus);
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);

  const currentPlanId = billingStatus || "free";
  const currentPlan = BILLING_PLANS.find((p) => p.id === currentPlanId) || BILLING_PLANS[0];

  const handlePlanChange = async (planId: string) => {
    if (!restaurantId) {
      toast.error("Restaurant ID not found. Please log in again.");
      return;
    }

    try {
      setUpdatingPlan(planId);
      await updateBillingStatus(restaurantId, planId);
      toast.success(`Plan updated to ${planId.charAt(0).toUpperCase() + planId.slice(1)} successfully!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update plan. Please try again.");
    } finally {
      setUpdatingPlan(null);
    }
  };

  return (
    <DashboardLayout title="Subscription & Billing" subtitle="Manage your plan and payment method.">
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 rounded-2xl bg-gradient-warm text-primary-foreground p-6 shadow-warm relative overflow-hidden">
          {/* Decorative background circle */}
          <div className="absolute right-[-10%] top-[-30%] w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <p className="text-primary-foreground/80 text-sm">Current plan</p>
          <h2 className="font-display text-3xl mt-1 flex items-center gap-2">
            {currentPlan.name}
            {currentPlan.id !== "free" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" /> Premium
              </span>
            )}
          </h2>
          <p className="text-primary-foreground/85 mt-2">
            {formatETB(currentPlan.price)}/month · renews on the 1st of next month
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Active
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs">
              Auto-renew on
            </span>
          </div>
        </div>
        
        <div className="rounded-2xl bg-card border border-border p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Visa •••• 4821</p>
              <p className="text-xs text-muted-foreground">Expires 09/27</p>
            </div>
          </div>
          <button 
            onClick={() => toast.info("Payment updates are automatically handled based on selected plan. Contact support for customized integrations.")}
            className="mt-5 w-full rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary transition-colors"
          >
            Update payment method
          </button>
        </div>
      </div>

      <h2 className="font-display text-xl mb-4">Change plan</h2>
      <div className="grid md:grid-cols-4 gap-4">
        {BILLING_PLANS.map((p) => {
          const isCurrent = p.id === currentPlanId;
          const isPending = updatingPlan === p.id;
          
          return (
            <div
              key={p.id}
              className={`rounded-2xl border p-6 shadow-soft transition-all flex flex-col justify-between ${
                isCurrent
                  ? "border-primary bg-primary/[0.02]"
                  : "bg-card border-border hover:shadow-warm hover:-translate-y-0.5"
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="font-display text-xl">{p.name}</h3>
                  {isCurrent && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                      Current
                    </span>
                  )}
                  {p.badge && !isCurrent && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500">
                      {p.badge}
                    </span>
                  )}
                </div>
                <p className="font-display text-2xl mt-3 font-bold text-foreground">
                  {formatETB(p.price)}
                  <span className="text-xs text-muted-foreground font-sans font-normal">/mo</span>
                </p>
                <ul className="mt-4 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-foreground/80">
                      <Check className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                disabled={isCurrent || !!updatingPlan}
                onClick={() => handlePlanChange(p.id)}
                className={`mt-6 w-full rounded-lg px-3 py-2 text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                  isCurrent
                    ? "bg-secondary text-muted-foreground cursor-default"
                    : "bg-primary text-primary-foreground hover:bg-primary-glow active:scale-[0.98] disabled:opacity-50"
                }`}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                  </>
                ) : isCurrent ? (
                  "Current plan"
                ) : p.price > currentPlan.price ? (
                  "Upgrade"
                ) : (
                  "Downgrade"
                )}
              </button>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

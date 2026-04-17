import { createFileRoute } from "@tanstack/react-router";
import { Check, CreditCard } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout";

export const Route = createFileRoute("/billing")({
  head: () => ({ meta: [{ title: "Billing · Ember & Oak" }] }),
  component: BillingPage,
});

const plans = [
  { name: "Café", price: 19, features: ["Up to 200 customers", "Loyalty QR", "Basic analytics"] },
  { name: "Bistro Pro", price: 49, features: ["Unlimited customers", "Loyalty + Menu QR", "Push notifications", "Advanced analytics"], current: true },
  { name: "Restaurant Group", price: 119, features: ["Multiple locations", "Custom branding", "Dedicated support", "API access"] },
];

function BillingPage() {
  return (
    <DashboardLayout title="Subscription & Billing" subtitle="Manage your plan and payment method.">
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 rounded-2xl bg-gradient-warm text-primary-foreground p-6 shadow-warm">
          <p className="text-primary-foreground/80 text-sm">Current plan</p>
          <h2 className="font-display text-3xl mt-1">Bistro Pro</h2>
          <p className="text-primary-foreground/85 mt-2">$49/month · renews Jan 28, 2026</p>
          <div className="flex flex-wrap gap-2 mt-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Active
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
          <button className="mt-5 w-full rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary">
            Update payment method
          </button>
        </div>
      </div>

      <h2 className="font-display text-xl mb-4">Change plan</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`rounded-2xl border p-6 shadow-soft transition-all ${
              p.current ? "border-primary bg-cream" : "bg-card border-border hover:shadow-warm hover:-translate-y-0.5"
            }`}
          >
            <div className="flex items-start justify-between">
              <h3 className="font-display text-xl">{p.name}</h3>
              {p.current && <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">Current</span>}
            </div>
            <p className="font-display text-3xl mt-3">${p.price}<span className="text-sm text-muted-foreground font-sans">/mo</span></p>
            <ul className="mt-4 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-success mt-0.5 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button
              disabled={p.current}
              className={`mt-5 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                p.current
                  ? "bg-secondary text-muted-foreground cursor-default"
                  : "bg-primary text-primary-foreground hover:bg-primary-glow"
              }`}
            >
              {p.current ? "Current plan" : p.price > 49 ? "Upgrade" : "Downgrade"}
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

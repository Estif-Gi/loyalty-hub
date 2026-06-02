import { Outlet, Link, createRootRoute, HeadContent, Scripts, useNavigate } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../lib/auth";
import { useAuthStore } from "../store/auth.store";
import { Toaster } from "../components/ui/sonner";
import { useState, useEffect } from "react";
import { X, Sparkles, Check, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";

import appCss from "../styles.css?url";

const queryClient = new QueryClient();

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Loyal Hub" },
      { name: "description", content: "Smart restaurant loyalty and marketing platform." },
      { name: "author", content: "Ember & Oak" },
      { property: "og:title", content: "Loyal Hub" },
      { property: "og:description", content: "Smart restaurant loyalty and marketing platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "theme-color", content: "#a97c4a" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Loyal Hub" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "manifest",
        href: "/manifest.json",
      },
      {
        rel: "apple-touch-icon",
        href: "/icon-192.png",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}

function SubscriptionLimitModal() {
  const {
    isLimitModalOpen,
    limitModalMessage,
    setLimitModalOpen,
    restaurantId,
    updateBillingStatus,
  } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<string>("loyal");
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  if (!isLimitModalOpen) return null;

  const handleUpgrade = async () => {
    if (!restaurantId) {
      toast.error("Restaurant ID not found. Please log in again.");
      return;
    }
    try {
      setIsUpdating(true);
      await updateBillingStatus(restaurantId, selectedPlan);
      toast.success(`Successfully upgraded to the ${selectedPlan} plan!`);
      setLimitModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Failed to upgrade subscription. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const plans = [
    { id: "loyal", name: "Loyal", price: "990", desc: "4 staff, 1,000 customers, 100 menu items" },
    { id: "trustworthy", name: "Trustworthy", price: "2,490", desc: "6 staff, 5,000 customers, 300 menu items" },
    { id: "faithful", name: "Faithful", price: "4,990", desc: "10 staff, Unlimited customers, Unlimited menu items" }
  ];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-md transition-opacity" 
        onClick={() => setLimitModalOpen(false)}
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-card border border-border shadow-2xl transition-all z-10">
        <div className="h-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700" />
        
        <button 
          onClick={() => setLimitModalOpen(false)} 
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-2xl">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-foreground">Upgrade Plan</h3>
              <p className="text-sm text-muted-foreground">You've hit a limit on your current plan</p>
            </div>
          </div>

          <div className="bg-secondary/40 border border-border/50 rounded-2xl p-4 mb-6 text-sm text-foreground/95">
            {limitModalMessage || "You have reached the limits of your current subscription. Please update your billing status to continue using all features."}
          </div>

          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Choose upgrade</h4>
          <div className="space-y-3 mb-6">
            {plans.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlan(p.id)}
                className={`w-full text-left flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  selectedPlan === p.id 
                    ? "border-primary bg-primary/5 shadow-sm" 
                    : "border-border hover:border-muted-foreground/30 hover:bg-secondary/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    selectedPlan === p.id ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                  }`}>
                    {selectedPlan === p.id && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      {p.name}
                      {p.id === "loyal" && (
                        <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.desc}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-foreground">ETB {p.price}</div>
                  <div className="text-[10px] text-muted-foreground">/ month</div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setLimitModalOpen(false);
                navigate({ to: "/billing" });
              }}
              className="flex-1 py-3 px-4 border border-border rounded-xl font-semibold hover:bg-secondary transition-all text-center flex items-center justify-center gap-2"
            >
              <CreditCard className="h-4 w-4" /> Manage Billing
            </button>
            <button
              onClick={handleUpgrade}
              disabled={isUpdating}
              className="flex-[1.5] bg-primary text-primary-foreground py-3 px-4 rounded-xl font-bold hover:bg-primary/95 transition-all flex items-center justify-center gap-2 shadow-warm active:scale-[0.98] disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Upgrading...
                </>
              ) : (
                <>Upgrade Now</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RootComponent() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (reg) => console.log("ServiceWorker registration successful with scope: ", reg.scope),
          (err) => console.error("ServiceWorker registration failed: ", err)
        );
      });
    }
  }, []);

  return (
    <>
      <Outlet />
      <SubscriptionLimitModal />
      <Toaster />
    </>
  );
}

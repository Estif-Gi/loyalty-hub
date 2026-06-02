import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { Store, Loader2, User, Building2, Palette, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type RegisterSearch = {
  plan?: string;
};

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>): RegisterSearch => {
    return {
      plan: typeof search.plan === "string" ? search.plan : undefined,
    };
  },
  component: Register,
});

const THEME_PRESETS = [
  { name: "Paprika", color: "oklch(0.7 0.15 45)" },
  { name: "Cocoa", color: "oklch(0.45 0.09 45)" },
  { name: "Amber", color: "oklch(0.75 0.18 80)" },
  { name: "Mint", color: "oklch(0.7 0.12 160)" },
  { name: "Ocean", color: "oklch(0.65 0.15 250)" },
  { name: "Slate", color: "oklch(0.32 0.045 40)" },
];

function Register() {
  const { plan } = Route.useSearch();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [location, setLocation] = useState("");
  const [themeColor, setThemeColor] = useState(THEME_PRESETS[0].color);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!name || !phone || !password) {
        toast.error("Please fill in all profile details");
        return;
      }
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      // 1. Register Owner
      const regRes = await api.post("/users/register", {
        name,
        phone,
        password,
        role: "owner",
      });

      const { token, user } = regRes.data;

      // 2. Login to update store (so subsequent calls are authenticated)
      // This is crucial because the restaurant creation needs the owner's token
      login(token, user);

      // 3. Create Restaurant
      const resRes = await api.post("/restaurants", {
        name: restaurantName,
        phone,
        location,
        themeColor,
      });

      const restaurantId = resRes.data._id;

      // 4. Update billing status if a premium plan was chosen
      if (plan && plan !== "free") {
        try {
          await api.patch(`/restaurants/${restaurantId}`, {
            billingStatus: plan,
          });
        } catch (billingErr) {
          console.error("Failed to automatically set billing status:", billingErr);
          toast.error("Your restaurant was created, but we couldn't set your plan. You can update it in the Billing tab.");
        }
      }

      // Update local user object with the new restaurant ID for state consistency
      const updatedUser = { ...user, restaurantId };
      login(token, updatedUser);

      toast.success(plan && plan !== "free" ? `Welcome! Your restaurant is ready on the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan.` : "Welcome! Your restaurant is ready.");
      navigate({ to: "/dashboard" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
      console.error("Registration error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-lg z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 text-primary rounded-2xl mb-4 shadow-soft">
            <Store className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-foreground">
            Join Loyalty Hub
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Grow your business with smart loyalty programs
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
            step === 1 ? "bg-primary border-primary text-primary-foreground shadow-warm" : "bg-card border-border text-muted-foreground"
          )}>
            <User className="h-5 w-5" />
          </div>
          <div className="h-0.5 w-12 bg-border relative">
            <div 
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: step === 1 ? '0%' : '100%' }}
            />
          </div>
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
            step === 2 ? "bg-primary border-primary text-primary-foreground shadow-warm" : "bg-card border-border text-muted-foreground"
          )}>
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card/80 backdrop-blur-xl p-8 rounded-3xl shadow-warm border border-border/50 relative overflow-hidden group">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />
          
          <form className="relative space-y-6" onSubmit={step === 1 ? handleNextStep : handleSubmit}>
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Owner Profile
                  </h2>
                  <p className="text-sm text-muted-foreground">Tell us about yourself first</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium px-1" htmlFor="name">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium px-1" htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      placeholder="e.g. +1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium px-1" htmlFor="password">Password</label>
                    <input
                      id="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-warm active:scale-[0.98] mt-4"
                >
                  Next: Restaurant Setup <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Restaurant Setup
                  </h2>
                  <p className="text-sm text-muted-foreground">Setup your restaurant's digital presence</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium px-1" htmlFor="restaurantName">Restaurant Name</label>
                    <input
                      id="restaurantName"
                      type="text"
                      required
                      placeholder="e.g. Gourmet Garden"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium px-1" htmlFor="location">Address / Location</label>
                    <input
                      id="location"
                      type="text"
                      required
                      placeholder="e.g. 123 Main St, New York"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="text-sm font-medium px-1 flex items-center gap-2">
                      <Palette className="h-4 w-4 text-primary" />
                      Brand Theme Color
                    </label>
                    <div className="grid grid-cols-6 gap-3">
                      {THEME_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setThemeColor(preset.color)}
                          className={cn(
                            "group relative h-10 w-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2",
                            themeColor === preset.color ? "border-foreground shadow-md ring-2 ring-foreground/20" : "border-transparent"
                          )}
                          style={{ backgroundColor: preset.color }}
                          title={preset.name}
                        >
                          {themeColor === preset.color && (
                            <Check className="h-5 w-5 text-white drop-shadow-md" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 px-4 py-4 border border-border rounded-xl font-medium hover:bg-secondary transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="h-5 w-5" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !restaurantName || !location}
                    className="flex-[2] bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-warm active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>Create Account <Check className="h-5 w-5" /></>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Already a partner?{" "}
          <Link to="/login" className="text-primary hover:underline font-semibold decoration-primary/30 underline-offset-4">
            Sign in to your dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}


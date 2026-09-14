import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  MapPin,
  UtensilsCrossed,
  BadgeCheck,
  Table,
  Gift,
  QrCode,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Smartphone,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/onboarding.store";
import { useAuth } from "@/lib/auth";

export interface OnboardingStep {
  step: number;
  title: string;
  badge: string;
  subtitle: string;
  description: string;
  details: string[];
  to?: string;
  actionText?: string;
  icon: any;
  color: string;
  bgLight: string;
  borderColor: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    step: 1,
    title: "First: Add Your Menu",
    badge: "Step 1 of 6",
    subtitle: "Create food and drink categories, dishes & pricing",
    description:
      "Start by building your restaurant's digital catalog. Add your categories (Appetizers, Mains, Drinks, Desserts) with appetizing photos, descriptions, prices, and dietary tags.",
    details: [
      "Add categories to organize your food & beverage items",
      "Set item prices, upload dish images, and add descriptions",
      "Easily toggle item availability whenever dishes sell out",
    ],
    to: "/menu",
    actionText: "Open Menu Manager",
    icon: UtensilsCrossed,
    color: "text-amber-500",
    bgLight: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  {
    step: 2,
    title: "Then: Create Employees",
    badge: "Step 2 of 6",
    subtitle: "Register waiter and staff accounts with credentials",
    description:
      "Add your restaurant's waitstaff and kitchen team. Each staff member receives their own login credentials to access the Waiter Mobile App for taking orders and scanning customer loyalty cards.",
    details: [
      "Add waiter accounts with custom names and secure PINs/passwords",
      "Assign roles for floor staff, bartenders, and managers",
      "Staff can instantly log into the mobile Waiter Application",
    ],
    to: "/employees",
    actionText: "Manage Employees",
    icon: BadgeCheck,
    color: "text-blue-500",
    bgLight: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    step: 3,
    title: "Then: Create Tables & Assign Tables",
    badge: "Step 3 of 6",
    subtitle: "Map your floor layout, generate QRs & assign waiters",
    description:
      "Set up your dining tables with capacities and locations. Each table gets a unique QR code for customer ordering. Then assign your registered waiters to specific tables for fast service.",
    details: [
      "Create tables individually or bulk-generate your dining sections",
      "Generate and print high-resolution Table QR codes",
      "Assign designated waiters to tables to route orders and service",
    ],
    to: "/tables",
    actionText: "Configure Tables",
    icon: Table,
    color: "text-emerald-500",
    bgLight: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  {
    step: 4,
    title: "Then: Fix Settings (Location & Order Receiving)",
    badge: "Step 4 of 6",
    subtitle: "Set restaurant GPS coordinates and turn on order receiving",
    description:
      "Before guests can order, you must set your restaurant's physical GPS location and activate the order receiving button in Orders > Ordering Setup. This ensures orders only come from diners present at your restaurant.",
    details: [
      "Navigate to Orders > Ordering Setup > Location & Geofencing",
      "Enter Latitude and Longitude (or click 'Use My Current Location')",
      "Turn ON the 'Enable Customer Ordering' switch button",
      "Click 'Save Changes' to activate geofenced table ordering",
    ],
    to: "/orders",
    actionText: "Configure Ordering & Location",
    icon: MapPin,
    color: "text-cyan-500",
    bgLight: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
  },
  {
    step: 5,
    title: "Then: Create Loyalty Program",
    badge: "Step 5 of 6",
    subtitle: "Define stamp counts, rules & reward perks",
    description:
      "Create your digital stamp loyalty program. Decide how many stamps are needed to earn rewards (e.g. 10 stamps for a free dessert) to turn first-time diners into loyal regulars.",
    details: [
      "Specify required stamps threshold (e.g., 5 or 10 stamps per card)",
      "Define enticing rewards like free meals, drinks, or discounts",
      "Monitor customer loyalty progress and redeem reward metrics live",
    ],
    to: "/loyalty",
    actionText: "Setup Loyalty Program",
    icon: Gift,
    color: "text-purple-500",
    bgLight: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  {
    step: 6,
    title: "Finally: Scan Customer QR via Waiter App",
    badge: "Step 6 of 6",
    subtitle: "Waiters scan customer QR codes to award stamps & perks",
    description:
      "Your waiters open the mobile Waiter Application on their smartphones. At order time or checkout, the waiter uses the app camera to scan the customer's loyalty QR code to issue stamps and redeem earned rewards.",
    details: [
      "Waiters log into the mobile Waiter Application using their staff PIN",
      "Tap 'Scan QR' to read the customer's personal loyalty card QR",
      "Automatically stamps the customer's digital card and triggers earned rewards",
    ],
    to: "/qr-codes",
    actionText: "Explore QR Codes & App Flow",
    icon: Smartphone,
    color: "text-rose-500",
    bgLight: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
  },
];

export function OnboardingModal() {
  const { isOpen, currentStep, closeModal, setStep, nextStep, prevStep, markOnboardingCompleted } =
    useOnboardingStore();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"step" | "list">("step");

  const current = ONBOARDING_STEPS[currentStep] || ONBOARDING_STEPS[0];
  const StepIcon = current.icon;

  const handleFinish = () => {
    markOnboardingCompleted(user?.id);
    closeModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] p-0 overflow-hidden border-border bg-card rounded-3xl shadow-2xl">
        {/* Top Gradient Header */}
        <div className="bg-gradient-to-r from-amber-500/20 via-primary/20 to-purple-500/20 p-6 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <DialogTitle className="font-display text-xl sm:text-2xl font-bold text-foreground">
                  System Setup Guide
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Follow this sequence to configure menu, staff, tables, location, and loyalty
                </DialogDescription>
              </div>
            </div>

            {/* View Toggle */}
            <div className="hidden sm:flex items-center bg-secondary/80 rounded-lg p-1 text-xs font-semibold">
              <button
                onClick={() => setViewMode("step")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewMode === "step"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Guided Tour
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Full Checklist
              </button>
            </div>
          </div>

          {/* Step Sequence Pills (clickable) */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 mt-4">
            {ONBOARDING_STEPS.map((s, idx) => {
              const isCurrent = currentStep === idx;
              const isDone = currentStep > idx;
              return (
                <button
                  key={s.step}
                  onClick={() => {
                    setViewMode("step");
                    setStep(idx);
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-primary text-primary-foreground font-bold shadow-sm ring-2 ring-primary/40"
                      : isDone
                        ? "bg-primary/15 text-primary hover:bg-primary/25"
                        : "bg-secondary/70 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider font-semibold">
                    Step {s.step}
                  </span>
                  <span className="hidden sm:inline text-xs truncate max-w-full">
                    {s.title.replace(/^(First|Then|Finally):\s*/i, "")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        {viewMode === "step" ? (
          <div className="p-6 sm:p-7 space-y-6">
            {/* Step Header */}
            <div className="flex items-start gap-4">
              <div
                className={`p-3.5 rounded-2xl ${current.bgLight} ${current.color} shrink-0 border ${current.borderColor}`}
              >
                <StepIcon className="h-7 w-7" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-secondary text-secondary-foreground">
                    {current.badge}
                  </span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mt-1">
                  {current.title}
                </h3>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-0.5">
                  {current.subtitle}
                </p>
              </div>
            </div>

            {/* Description Card */}
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 text-sm text-foreground/90 leading-relaxed">
              {current.description}
            </div>

            {/* Key Action Checkpoints */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Key Action Points:
              </p>
              <div className="space-y-2">
                {current.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground/85">{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Link Action */}
            {current.to && (
              <div className="pt-2">
                <Link
                  to={current.to}
                  onClick={() => {
                    handleFinish();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/25 transition-all"
                >
                  <span>{current.actionText}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Full Checklist View */
          <div className="p-6 space-y-3 max-h-[50vh] overflow-y-auto">
            {ONBOARDING_STEPS.map((stepItem, idx) => {
              const Icon = stepItem.icon;
              return (
                <div
                  key={stepItem.step}
                  className="p-4 rounded-2xl border border-border/70 hover:border-primary/40 bg-secondary/20 hover:bg-secondary/30 transition-all flex items-start gap-3.5 cursor-pointer"
                  onClick={() => {
                    setStep(idx);
                    setViewMode("step");
                  }}
                >
                  <div
                    className={`p-2.5 rounded-xl ${stepItem.bgLight} ${stepItem.color} shrink-0`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">
                        Step {stepItem.step}
                      </span>
                      <h4 className="text-sm font-bold text-foreground truncate">
                        {stepItem.title.replace(/^(First|Then|Finally):\s*/i, "")}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {stepItem.subtitle}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-2" />
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Navigation Controls */}
        <div className="p-4 sm:p-5 bg-secondary/40 border-t border-border/60 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={closeModal}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Close Guide
          </Button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && viewMode === "step" && (
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                className="text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
            )}

            {currentStep < ONBOARDING_STEPS.length - 1 && viewMode === "step" ? (
              <Button
                size="sm"
                onClick={nextStep}
                className="text-xs font-semibold flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Next Step <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleFinish}
                className="text-xs font-semibold flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <CheckCircle2 className="h-4 w-4" /> Got It, Start Setup
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

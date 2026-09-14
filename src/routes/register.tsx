import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import {
  Store,
  Loader2,
  User,
  Building2,
  Palette,
  Check,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
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
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="w-full max-w-lg z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 text-primary rounded-2xl mb-4 shadow-soft">
            <Store className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-foreground">
            Partner Onboarding
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Loyalty Hub Restaurant Owner Platform
          </p>
        </div>

        <div className="bg-card/85 backdrop-blur-xl p-8 rounded-3xl shadow-warm border border-border/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />

          <div className="relative space-y-6 text-center">
            <div className="p-4 bg-amber-500/10 text-amber-600 rounded-2xl inline-block">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Account Provisioning Required</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To guarantee billing compliance, data security, and geofencing integrity,
                self-registration for restaurant owner accounts is not permitted.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Please contact the system administrator to request your restaurant profile and
                credentials.
              </p>
            </div>

            <div className="bg-secondary/40 border border-border/50 rounded-2xl p-4 text-xs text-left text-foreground/80 space-y-1.5">
              <span className="font-semibold text-foreground uppercase tracking-wider block mb-1">
                Administrative Contact:
              </span>
              <p>
                Phone:{" "}
                <a href="tel:+251919444499" className="text-primary hover:underline font-medium">
                  +251-91-944-4499
                </a>
              </p>
              <p>
                Email:{" "}
                <a
                  href="mailto:info@gebetatech.com"
                  className="text-primary hover:underline font-medium"
                >
                  info@gebetatech.com
                </a>
              </p>
            </div>

            <div className="h-px bg-border/50" />

            <Link
              to="/login"
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:bg-primary/95 transition-all flex items-center justify-center gap-2 shadow-warm active:scale-[0.98]"
            >
              Sign In to Existing Account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Are you an employee? Talk to your restaurant manager to scan your onboarding QR code.
        </p>
      </div>
    </div>
  );
}

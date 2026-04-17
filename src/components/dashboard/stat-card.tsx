import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  delta?: string;
  icon: LucideIcon;
  tone?: "default" | "warm" | "cream";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-5 border border-border shadow-soft transition-all hover:shadow-warm hover:-translate-y-0.5",
        tone === "warm" && "bg-gradient-warm text-primary-foreground border-transparent",
        tone === "cream" && "bg-cream",
        tone === "default" && "bg-card"
      )}
    >
      <div className="flex items-start justify-between">
        <p
          className={cn(
            "text-sm",
            tone === "warm" ? "text-primary-foreground/80" : "text-muted-foreground"
          )}
        >
          {label}
        </p>
        <div
          className={cn(
            "h-9 w-9 rounded-xl flex items-center justify-center",
            tone === "warm" ? "bg-white/15" : "bg-secondary"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="font-display text-3xl mt-3">{value}</p>
      {delta && (
        <p
          className={cn(
            "text-xs mt-2",
            tone === "warm" ? "text-primary-foreground/80" : "text-success"
          )}
        >
          {delta}
        </p>
      )}
    </div>
  );
}

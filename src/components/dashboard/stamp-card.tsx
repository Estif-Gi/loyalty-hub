import { cn } from "@/lib/utils";

export function StampCard({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label?: string;
}) {
  return (
    <div className="rounded-2xl bg-gradient-cream border border-border p-5 shadow-soft">
      {label && <p className="text-sm text-muted-foreground mb-3">{label}</p>}
      <div className="grid grid-cols-5 gap-2.5">
        {Array.from({ length: total }).map((_, i) => {
          const filled = i < current;
          return (
            <div
              key={i}
              className={cn(
                "aspect-square rounded-full border-2 border-dashed flex items-center justify-center text-sm font-display transition-all",
                filled
                  ? "bg-gradient-warm border-transparent text-primary-foreground shadow-warm scale-105"
                  : "border-border text-muted-foreground/40"
              )}
            >
              {filled ? "★" : i + 1}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{current}/{total} stamps</span>
        <span className="font-medium text-primary">{total - current} to next reward</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full bg-gradient-warm transition-all duration-500"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

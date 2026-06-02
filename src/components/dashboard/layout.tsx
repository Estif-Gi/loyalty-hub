import type { ReactNode } from "react";
import { DashboardSidebar } from "./sidebar";
import { MobileTopbar } from "./mobile-topbar";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export function DashboardLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { isAuthenticated, _hasHydrated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [_hasHydrated, isAuthenticated, navigate]);

  if (!_hasHydrated || !isAuthenticated) return null;

  return (
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileTopbar />
        <main className="flex-1 p-5 sm:p-8 max-w-[1400px] w-full mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl text-foreground">{title}</h1>
              {subtitle && <p className="text-muted-foreground mt-1.5">{subtitle}</p>}
            </div>
            {actions && <div className="flex gap-2">{actions}</div>}
          </div>
          <div className="animate-in fade-in duration-300">{children}</div>
        </main>
      </div>
    </div>
  );
}

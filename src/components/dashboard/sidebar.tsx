import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  QrCode,
  Gift,
  Users,
  Bell,
  UtensilsCrossed,
  CreditCard,
  Flame,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/qr-codes", label: "QR Codes", icon: QrCode },
  { to: "/loyalty", label: "Loyalty Program", icon: Gift },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/employees", label: "Employees", icon: BadgeCheck },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/billing", label: "Billing", icon: CreditCard },
] as const;

export function DashboardSidebar() {
  const location = useLocation();

  const logOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("restaurantId");
    localStorage.removeItem("user");
    localStorage.removeItem("auth-storage");
    window.location.href = "/";
  };
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-6 py-7 flex items-center gap-3 border-b border-sidebar-border">
        <div className="h-10 w-10 rounded-xl bg-gradient-warm flex items-center justify-center shadow-warm">
          <Flame className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-display text-lg leading-none">Loyal</p>
          <p className="text-xs text-sidebar-foreground/60 mt-1">Loyalty Dashboard</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => {
          const active = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <div className="rounded-xl bg-sidebar-accent p-4 flex flex-col gap-2">
          <p className="text-[12px] text-sidebar-foreground/60">Current plan</p>
          <div className="flex items-center justify-between">
            <span className="font-display text-base font-semibold">Bistro Pro</span>
            <Link
              to="/billing"
              className="text-xs text-sidebar-primary hover:underline transition-colors duration-100"
              style={{ marginLeft: 8 }}
            >
              Manage
            </Link>
          </div>
          <Button
            onClick={logOut}
            className="mt-3 w-full text-sm font-medium bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-accent transition-all"
            variant="default"
          >
            Log out
          </Button>
        </div>
      </div>
 
        <div>
        </div>
      {/* </div> */}
    </aside>
  );
}

import { Link, useLocation } from "@tanstack/react-router";
import { Menu, Flame, Bell } from "lucide-react";
import { useState } from "react";
import {
  LayoutDashboard,
  QrCode,
  Gift,
  Users,
  Bell as BellIcon,
  UtensilsCrossed,
  CreditCard,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/qr-codes", label: "QR Codes", icon: QrCode },
  { to: "/loyalty", label: "Loyalty", icon: Gift },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/employees", label: "Employees", icon: BadgeCheck },
  { to: "/notifications", label: "Notifications", icon: BellIcon },
  { to: "/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/billing", label: "Billing", icon: CreditCard },
] as const;

export function MobileTopbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  return (
    <div className="lg:hidden">
      <header className="flex items-center justify-between px-4 py-3 bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-warm flex items-center justify-center">
            <Flame className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-base">Ember & Oak</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-sidebar-accent">
            <Bell className="h-5 w-5" />
          </button>
          <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-sidebar-accent">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>
      {open && (
        <nav className="bg-sidebar text-sidebar-foreground px-3 pb-4 space-y-1">
          {nav.map((item) => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:bg-sidebar-accent",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}

import { Link, useLocation, useNavigate } from "@tanstack/react-router";
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
  Table,
  Sliders,
  LogOut,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useAuth } from "@/lib/auth";

export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, billingStatus } = useAuth();

  const logOut = () => {
    logout();
    navigate({ to: "/login" });
  };

  const sections = [
    {
      label: "",
      items: [{ to: "/dashboard", label: "Overview", icon: LayoutDashboard }],
    },
    {
      label: "Restaurant",
      items: [
        { to: "/menu", label: "Menu", icon: UtensilsCrossed },
        { to: "/tables", label: "Tables", icon: Table },
        { to: "/employees", label: "Employees", icon: BadgeCheck },
        { to: "/qr-codes", label: "QR Codes", icon: QrCode },
      ],
    },
    {
      label: "Ordering",
      items: [{ to: "/orders", label: "Orders", icon: ClipboardList }],
    },
    {
      label: "Loyalty",
      items: [
        { to: "/loyalty", label: "Loyalty Program", icon: Gift },
        { to: "/customers", label: "Customers", icon: Users },
        { to: "/notifications", label: "Notifications", icon: Bell },
      ],
    },
    {
      label: "Account",
      items: [{ to: "/billing", label: "Billing", icon: CreditCard }],
    },
  ] as const;

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar  text-sidebar-foreground border-r border-sidebar-border shadow-sm">
      {/* Brand Header */}
      <div className="px-2 pl-3 py-4 flex items-center gap-6 border-b  border-sidebar-border">
        <img src="/L(1).webp" alt="Loyalty Hub Logo" className="h-15 w-15 " />

        <div className="">
          <p className="font-display text-lg leading-none">Loyal</p>
          <p className="text-[10px] text-sidebar-foreground/60 mt-1 uppercase font-semibold tracking-wider">
            Restaurant hub
          </p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.label && (
              <span className="px-3 text-[10px] font-bold text-sidebar-foreground/45 uppercase tracking-wider block mb-1">
                {section.label}
              </span>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = location.pathname === item.to;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all font-medium",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft font-semibold"
                        : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / Account Actions */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/30">
        <div className="rounded-xl bg-sidebar-accent p-4 flex flex-col gap-2 shadow-soft border border-sidebar-border/50">
          <p className="text-[11px] text-sidebar-foreground/60 uppercase font-bold tracking-wider">
            Current tier
          </p>
          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-bold capitalize">
              {billingStatus ? `${billingStatus} plan` : "Free plan"}
            </span>
            <Link
              to="/billing"
              className="text-xs text-sidebar-primary hover:underline font-semibold"
            >
              Details
            </Link>
          </div>
          <Button
            onClick={logOut}
            className="mt-3 w-full text-xs font-semibold bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-accent transition-all flex items-center justify-center gap-1.5"
            variant="default"
          >
            <LogOut className="h-3.5 w-3.5" /> Log out
          </Button>
        </div>
      </div>
    </aside>
  );
}

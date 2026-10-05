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
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useAuth } from "@/lib/auth";
import { useOnboardingStore } from "@/store/onboarding.store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, billingStatus } = useAuth();
  const { openModal } = useOnboardingStore();

  const logOut = () => {
    logout();
    navigate({ to: "/login" });
  };

  const sections = [
    {
      label: "",
      items: [
        {
          to: "/dashboard",
          label: "Overview",
          icon: LayoutDashboard,
          description: "Live restaurant performance, metrics, and customer leaderboard.",
        },
      ],
    },
    {
      label: "Restaurant",
      items: [
        {
          to: "/menu",
          label: "Menu",
          icon: UtensilsCrossed,
          description: "Add your food & drink menu categories, items, and pricing.",
        },
        {
          to: "/employees",
          label: "Employees",
          icon: BadgeCheck,
          description: "Register waiter and staff accounts for mobile app access.",
        },
        {
          to: "/tables",
          label: "Tables",
          icon: Table,
          description: "Create dining tables, generate QR codes, and assign waiters.",
        },
        // {
        //   to: "/qr-codes",
        //   label: "QR Codes",
        //   icon: QrCode,
        //   description: "View table QR codes & waiter app customer scanning workflow.",
        // },
      ],
    },
    {
      label: "Ordering",
      items: [
        {
          to: "/orders",
          label: "Orders",
          icon: ClipboardList,
          description: "Set restaurant GPS location & turn on order receiving.",
        },
      ],
    },
    {
      label: "Loyalty",
      items: [
        {
          to: "/loyalty",
          label: "Loyalty Program",
          icon: Gift,
          description: "Configure stamps, rewards, and customer perks.",
        },
        {
          to: "/customers",
          label: "Customers",
          icon: Users,
          description: "Browse registered customers and stamp collection history.",
        },
        {
          to: "/notifications",
          label: "Notifications",
          icon: Bell,
          description: "Send promotions and broadcast updates to your diners.",
        },
      ],
    },
    {
      label: "Resources",
      items: [
        {
          to: "/help",
          label: "Help Center",
          icon: HelpCircle,
          description: "Self-service setup sequence, guides & operational FAQs.",
        },
      ],
    },
    {
      label: "Account",
      items: [
        {
          to: "/billing",
          label: "Billing",
          icon: CreditCard,
          description: "Manage subscription plans and capacity limits.",
        },
      ],
    },
  ] as const;

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-sm sticky top-0 overflow-y-auto no-scrollbar select-none">
      {/* Brand Header */}
      <div className="px-4 py-4 flex items-center gap-3.5 border-b border-sidebar-border shrink-0">
        <img
          src="/premium.png"
          alt="Loyal Logo"
          className="h-10 w-10 rounded-xl shadow-sm object-cover"
        />

        <div>
          <p className="font-display font-bold text-lg leading-tight">Loyal</p>
          <p className="text-[10px] text-sidebar-foreground/60 uppercase font-semibold tracking-wider">
            Restaurant Hub
          </p>
        </div>
      </div>

      {/* Nav Menu with Tooltip Descriptions */}
      <TooltipProvider delayDuration={150}>
        <nav className="flex-1 px-3 py-4 space-y-5">
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
                    <Tooltip key={item.to}>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.to}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all font-medium",
                            active
                              ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft font-semibold"
                              : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        sideOffset={12}
                        className="bg-popover text-popover-foreground border border-border/80 p-3 shadow-xl rounded-xl max-w-xs z-50 animate-in fade-in zoom-in-95"
                      >
                        <div className="space-y-1">
                          <span className="font-semibold text-xs text-foreground block">
                            {item.label}
                          </span>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </TooltipProvider>

      {/* Footer / Setup Guide & Account Actions */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/30 space-y-3 shrink-0 mt-auto">
        {/* Setup Guide Launcher */}
        <button
          onClick={() => openModal(0)}
          className="w-full p-2.5 rounded-xl bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 transition-all flex items-center justify-between text-xs font-semibold cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span>Setup Guide</span>
          </div>
          <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold">
            5 Steps
          </span>
        </button>

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

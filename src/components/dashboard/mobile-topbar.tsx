import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  Bell,
  LogOut,
  LayoutDashboard,
  QrCode,
  Gift,
  Users,
  UtensilsCrossed,
  CreditCard,
  BadgeCheck,
  Table,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

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

export function MobileTopbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, billingStatus } = useAuth();

  // Prevent background scroll when mobile navigation drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="lg:hidden sticky top-0 z-40">
      {/* Mobile Top Header */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-sidebar/95 backdrop-blur-md text-sidebar-foreground border-b border-sidebar-border shadow-xs">
        <Link to="/dashboard" className="flex items-center gap-2.5 active:scale-95 transition-transform">
          <img
            src="/premium.png"
            alt="Loyal Logo"
            className="h-8 w-8 rounded-lg shadow-sm object-cover"
          />
          <div className="flex flex-col">
            <span className="font-display font-bold text-base leading-none text-sidebar-foreground">
              Loyal
            </span>
            <span className="text-[9px] text-sidebar-foreground/60 uppercase font-bold tracking-widest mt-0.5">
              Restaurant Hub
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1.5">
          <Link
            to="/notifications"
            className="p-2 rounded-xl text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-xl text-sidebar-foreground/90 hover:text-sidebar-foreground hover:bg-sidebar-accent active:scale-95 transition-all cursor-pointer"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Animated Left Slide-in Navigation Drawer */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop with Fade Animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              aria-hidden="true"
            />

            {/* Left Drawer Panel with Spring Animation */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-[300px] max-w-[85vw] h-full bg-sidebar text-sidebar-foreground z-10 flex flex-col shadow-2xl border-r border-sidebar-border overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-sidebar-border flex items-center justify-between bg-sidebar">
                <div className="flex items-center gap-3">
                  <img
                    src="/premium.png"
                    alt="Loyal Logo"
                    className="h-10 w-10 rounded-xl shadow-md object-cover"
                  />
                  <div>
                    <p className="font-display font-bold text-lg leading-tight text-sidebar-foreground">
                      Loyal
                    </p>
                    <p className="text-[10px] text-sidebar-foreground/60 uppercase font-semibold tracking-wider">
                      Restaurant Hub
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer active:scale-95"
                  aria-label="Close Navigation Drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links (Scrollable) */}
              <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto overscroll-contain">
                {sections.map((section, idx) => (
                  <div key={idx} className="space-y-1">
                    {section.label && (
                      <span className="px-3 text-[10px] font-bold text-sidebar-foreground/45 uppercase tracking-wider block mb-1">
                        {section.label}
                      </span>
                    )}
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const active = location.pathname === item.to;
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px]",
                              active
                                ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-soft"
                                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:scale-[0.98]",
                            )}
                          >
                            <Icon className="h-4.5 w-4.5 shrink-0" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Drawer Footer / Account */}
              <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/30 space-y-3">
                <div className="rounded-xl bg-sidebar-accent p-3 border border-sidebar-border/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] text-sidebar-foreground/60 uppercase font-bold tracking-wider">
                      Plan Tier
                    </span>
                    <Link
                      to="/billing"
                      onClick={() => setOpen(false)}
                      className="text-[11px] text-sidebar-primary font-bold hover:underline"
                    >
                      Manage
                    </Link>
                  </div>
                  <p className="font-display text-sm font-bold capitalize mt-0.5">
                    {billingStatus ? `${billingStatus} plan` : "Free plan"}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-sidebar-accent hover:bg-destructive/15 text-sidebar-foreground hover:text-destructive border border-sidebar-border transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

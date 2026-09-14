import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  MapPin,
  UtensilsCrossed,
  BadgeCheck,
  Table,
  Gift,
  QrCode,
  Smartphone,
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  PlayCircle,
  Layers,
  BookOpen,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { requireOwner } from "@/lib/auth";
import { useOnboardingStore } from "@/store/onboarding.store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/help")({
  beforeLoad: requireOwner,
  head: () => ({
    meta: [
      { title: "Help Center · Loyal Hub" },
      { name: "description", content: "Restaurant owner system setup sequence and guides." },
    ],
  }),
  component: HelpPage,
});

const HELP_STEPS = [
  {
    step: 1,
    title: "Add Menu",
    subtitle: "Build your food & beverage categories and dishes",
    badge: "Step 1",
    icon: UtensilsCrossed,
    color: "text-amber-500",
    bgLight: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    to: "/menu",
    actionLabel: "Go to Menu Management",
    description:
      "Your digital menu is the heart of your restaurant. Customers scan table QR codes to view dishes, prices, and descriptions.",
    instructions: [
      "Open Menu from the sidebar navigation.",
      "Add categories like Appetizers, Main Courses, Desserts, and Beverages.",
      "Add individual dishes with precise titles, descriptions, pricing in ETB, and photos.",
      "Use the availability toggle if any ingredient or dish runs out during service.",
    ],
    proTip:
      "High-quality dish descriptions and clear categorization help guests decide faster and reduce order friction.",
  },
  {
    step: 2,
    title: "Create Employees",
    subtitle: "Register staff, waiter accounts & security PINs",
    badge: "Step 2",
    icon: BadgeCheck,
    color: "text-blue-500",
    bgLight: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    to: "/employees",
    actionLabel: "Go to Employees Management",
    description:
      "Employees manage live customer orders and scan loyalty QR codes using the Waiter Mobile App.",
    instructions: [
      "Navigate to Employees from the sidebar.",
      "Click 'Add Employee' to register each staff member.",
      "Assign their role (e.g. Waiter, Floor Staff, or Shift Manager).",
      "Provide each employee with their login credentials or PIN to access the Waiter Application on their smartphones.",
    ],
    proTip:
      "Create unique employee accounts for each waiter so table assignments and order handling remain clearly attributed.",
  },
  {
    step: 3,
    title: "Create Tables & Assign Tables",
    subtitle: "Set up your floor layout, generate QRs & designate waiters",
    badge: "Step 3",
    icon: Table,
    color: "text-emerald-500",
    bgLight: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    to: "/tables",
    actionLabel: "Go to Tables Management",
    description:
      "Tables connect physical dining spots with digital QR ordering and dedicated staff assignments.",
    instructions: [
      "Navigate to Tables in the sidebar.",
      "Create tables individually or use 'Bulk Add' to generate all tables at once (e.g., Tables 1 to 20).",
      "Assign specific waiters to each table so orders are instantly routed to the responsible server.",
      "Download or print the unique QR code for each table to place on dining tabletops.",
    ],
    proTip:
      "When diners scan the table QR code, their orders automatically associate with the assigned waiter for that specific table.",
  },
  {
    step: 4,
    title: "Fix Settings: Add Location & Turn On Order Receiving",
    subtitle: "Set restaurant GPS coordinates and enable the order receiving toggle button",
    badge: "Step 4",
    icon: MapPin,
    color: "text-cyan-500",
    bgLight: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    to: "/orders",
    actionLabel: "Go to Ordering & Location Setup",
    description:
      "Before customers can check into tables and place orders, you must configure your restaurant's physical GPS coordinates and turn ON order receiving under Orders > Ordering Setup.",
    instructions: [
      "Navigate to Orders from the sidebar and click the 'Ordering Setup' tab.",
      "Select the 'Location & Geofencing' sub-tab.",
      "Enter your Latitude and Longitude coordinates, or click 'Use My Current Location' to capture device GPS.",
      "Turn ON the 'Enable Customer Ordering' toggle switch button.",
      "Click 'Save Changes' to activate geofenced customer ordering at your tables.",
    ],
    proTip:
      "The server geofence strictly verifies that diners are physically inside your dining radius before allowing orders. Setting accurate coordinates is essential.",
  },
  {
    step: 5,
    title: "Create Loyalty Program",
    subtitle: "Configure stamps, reward rules & perks for repeat diners",
    badge: "Step 5",
    icon: Gift,
    color: "text-purple-500",
    bgLight: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    to: "/loyalty",
    actionLabel: "Go to Loyalty Program",
    description:
      "Reward repeat visits by setting up digital stamp cards that incentivize guests to return frequently.",
    instructions: [
      "Navigate to Loyalty Program from the sidebar.",
      "Specify your stamp requirement (e.g., 5 stamps or 10 stamps per completed card).",
      "Define the reward offered (e.g., Free Specialty Coffee, 20% off meal, or complimentary dessert).",
      "Activate the program so customer visits immediately earn stamps.",
    ],
    proTip:
      "Simple, achievable milestones (like 5 or 8 stamps for a reward) motivate customers to visit more frequently.",
  },
  {
    step: 6,
    title: "Scan Customer QR Using Waiter Application",
    subtitle: "Waiters scan customer QR codes to award stamps & redeem perks",
    badge: "Step 6",
    icon: Smartphone,
    color: "text-rose-500",
    bgLight: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    to: "/qr-codes",
    actionLabel: "View QR Codes & App Workflow",
    description:
      "The complete loop comes together when waiters use the mobile app to scan customer loyalty cards directly at the dining table.",
    instructions: [
      "The waiter logs into the mobile Waiter Application using their staff account.",
      "When a customer pays or places an order, the customer shows their personal loyalty QR code from their phone.",
      "The waiter taps 'Scan QR' in the Waiter Application and points the phone camera at the customer's QR code.",
      "The system instantly awards the customer a loyalty stamp.",
      "If the customer has collected enough stamps for a reward, the waiter app displays a reward redemption prompt to apply the perk!",
    ],
    proTip:
      "Make sure waiters remind customers to scan their QR code during each visit to build habit and customer happiness.",
  },
];

const FAQS = [
  {
    question: "What is the recommended sequence to set up my restaurant?",
    answer:
      "Follow the sequence: 1) Add Menu items & categories, 2) Create Employee accounts, 3) Create Tables and assign them to waiters, 4) Fix Settings by adding your restaurant GPS location and turning ON 'Enable Customer Ordering', 5) Configure your Loyalty Program rewards, and 6) Have waiters use the Waiter Application to scan customer QR codes.",
  },
  {
    question: "Why can't customers check into tables or place orders?",
    answer:
      "Ensure you have set your restaurant's GPS coordinates and turned ON the 'Enable Customer Ordering' toggle switch. Go to Orders > Ordering Setup > Location & Geofencing, enter your coordinates (or click 'Use My Current Location'), switch ON the toggle, and click Save Changes.",
  },
  {
    question: "How do table QR codes differ from customer loyalty QR codes?",
    answer:
      "Table QR codes are placed on restaurant tabletops for guests to scan and view your digital menu or place orders. Customer loyalty QR codes are shown by individual customers on their phones to collect stamps and redeem rewards via the Waiter Application.",
  },
  {
    question: "Can I reassign a table to a different waiter during a shift?",
    answer:
      "Yes! Go to the Tables page, click on any table card or use the bulk assignment tool to change the designated waiter immediately. Updates sync in real-time.",
  },
  {
    question: "How do customers know when they have earned a reward?",
    answer:
      "When a waiter scans the customer's QR code on their milestone visit (e.g. 10th stamp), both the customer's app and the waiter's scanner will trigger a reward notification indicating the customer is eligible for their free item or discount.",
  },
  {
    question: "Can I edit menu prices or categories after publishing?",
    answer:
      "Yes. Navigate to Menu, select the item you wish to edit, update the price, category, or photo, and click Save. The changes are immediately updated across all digital menus.",
  },
  {
    question: "How can I launch the interactive setup walkthrough again?",
    answer:
      "You can launch the walkthrough anytime by clicking the 'Launch Interactive Setup Tour' button at the top of this Help Center or from the 'Setup Guide' button in the dashboard sidebar.",
  },
];

function HelpPage() {
  const { openModal } = useOnboardingStore();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <DashboardLayout
      title="Help Center"
      subtitle="Step-by-step system setup sequence, guides & self-service documentation."
      actions={
        <Button
          onClick={() => openModal(0)}
          className="font-semibold text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 shadow-soft"
        >
          <PlayCircle className="h-4 w-4" /> Launch Interactive Setup Tour
        </Button>
      }
    >
      <div className="space-y-8 max-w-5xl">
        {/* Welcome / Hero Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-amber-500/15 via-primary/10 to-purple-500/10 border border-border/80 p-6 sm:p-8 relative overflow-hidden shadow-soft">
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="h-3.5 w-3.5" /> Getting Started Blueprint
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Restaurant Owner System Sequence
            </h2>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base leading-relaxed">
              To achieve smooth day-to-day operations and active customer loyalty, configure your
              restaurant in this exact sequence: first add your menu, register your staff, map your
              tables, set your restaurant location & turn on order receiving, create your loyalty
              rewards, and have your waiters scan customer QR codes.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                onClick={() => openModal(0)}
                className="bg-primary text-primary-foreground font-semibold text-xs sm:text-sm flex items-center gap-2"
              >
                <PlayCircle className="h-4 w-4" /> Start Step 1 Tour
              </Button>
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-secondary/80 text-secondary-foreground hover:bg-secondary border border-border transition-all"
              >
                <UtensilsCrossed className="h-4 w-4" /> Jump to Menu
              </Link>
            </div>
          </div>
        </div>

        {/* 6-Step Detailed Walkthrough */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                Step-by-Step Sequence to Run Your System
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Complete these stages in order to establish an automated dining & loyalty loop.
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            {HELP_STEPS.map((item) => {
              const StepIcon = item.icon;
              return (
                <div
                  key={item.step}
                  className="rounded-2xl bg-card border border-border/70 p-5 sm:p-6 shadow-soft hover:shadow-md transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-2xl ${item.bgLight} ${item.color} shrink-0 border ${item.borderColor}`}
                      >
                        <StepIcon className="h-6 w-6" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-secondary text-secondary-foreground">
                            {item.badge}
                          </span>
                          <h4 className="font-display text-lg sm:text-xl font-bold text-foreground">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={item.to}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all shrink-0 self-start md:self-auto"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <p className="text-sm text-foreground/85 mt-4 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Step Instructions */}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                      Instructions & Checklist:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {item.instructions.map((inst, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-foreground/80">{inst}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pro Tip */}
                  <div className="mt-4 p-3 rounded-xl bg-secondary/40 border border-border/60 text-xs text-muted-foreground flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-foreground">Pro-Tip:</strong> {item.proTip}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workflow Diagram / Architecture */}
        <div className="rounded-2xl bg-card border border-border/80 p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
              How the Ecosystem Connects
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6">
            A quick visual flow from your owner dashboard to the dining floor.
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                1. Owner Setup
              </span>
              <h4 className="font-bold text-sm text-foreground">Dashboard Configuration</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You configure your digital menu, register staff members, generate tabletop QR codes,
                and specify loyalty reward rules.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                2. Dining & Service
              </span>
              <h4 className="font-bold text-sm text-foreground">Guest Table Experience</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Guests sit at tables, scan table QRs to explore menu items, and place orders
                directly associated with their assigned waiter.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                3. Waiter QR Scan
              </span>
              <h4 className="font-bold text-sm text-foreground">Loyalty & Reward Loop</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Waiters scan the customer’s personal loyalty card via the Waiter Mobile App. Stamps
                are credited and rewards are redeemed on the spot.
              </p>
            </div>
          </div>
        </div>

        {/* Self-Service FAQs (Without contact) */}
        <div className="rounded-2xl bg-card border border-border/80 p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
                Frequently Asked Questions
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Self-service guidance for standard restaurant operations.
              </p>
            </div>
          </div>

          <div className="divide-y divide-border/60">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-3.5">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left gap-4 group cursor-pointer"
                  >
                    <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed pr-6">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

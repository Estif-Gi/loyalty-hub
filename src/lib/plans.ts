/**
 * Shared billing plan definitions used across registration, billing, landing, and payment pages.
 * All prices in ETB (Ethiopian Birr).
 */

export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  badge: string | null;
  cta: string;
  featured: boolean;
  features: string[];
}

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    badge: null,
    cta: "Start free — no card needed",
    featured: false,
    features: [
      "2 staff accounts",
      "200 customer profiles",
      "30 menu items",
      "1 loyalty program",
      "7-day analytics",
    ],
  },
  {
    id: "loyal",
    name: "Loyal",
    price: 990,
    badge: "Most popular",
    cta: "Start growing",
    featured: true,
    features: [
      "4 staff accounts",
      "1,000 customers",
      "100 menu items",
      "1 loyalty program",
      "4 push notifications/mo",
      "30-day analytics",
    ],
  },
  {
    id: "trustworthy",
    name: "Trustworthy",
    price: 2490,
    badge: null,
    cta: "Level up",
    featured: false,
    features: [
      "6 staff accounts",
      "5,000 customers",
      "300 menu items",
      "1 loyalty program",
      "8 targeted campaigns/mo",
      "90-day analytics",
    ],
  },
  {
    id: "faithful",
    name: "Faithful",
    price: 4990,
    badge: "Best value",
    cta: "Go all-in",
    featured: false,
    features: [
      "10 staff accounts",
      "Unlimited customers",
      "Unlimited menu items",
      "12 bulk/targeted blasts",
      "1-year analytics + export",
    ],
  },
];

/** Format a number as ETB currency */
export function formatETB(amount: number): string {
  return `ETB ${amount.toLocaleString("en-US")}`;
}

/** Get a plan by its id */
export function getPlanById(id: string): BillingPlan | undefined {
  return BILLING_PLANS.find((p) => p.id === id);
}

/** Get the display name for a billing status */
export function getPlanDisplayName(billingStatus: string | null | undefined): string {
  if (!billingStatus) return "Free";
  const plan = getPlanById(billingStatus);
  return plan?.name ?? billingStatus.charAt(0).toUpperCase() + billingStatus.slice(1);
}

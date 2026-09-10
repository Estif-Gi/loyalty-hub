export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  notes?: string;
}

export interface OrderPricing {
  subtotal: number;
  tax: number;
  total: number;
  currency?: string;
  discount?: number;
  serviceCharge?: number;
}

export interface OrderCustomer {
  _id: string;
  name: string;
  phone?: string;
}

export interface OrderTable {
  _id: string;
  name: string;
  code?: string;
}

export interface OrderWaiter {
  _id: string;
  name: string;
  role: string;
}

export interface OrderKitchenTracking {
  startedBy?: string;
  startedAt?: string;
  readyBy?: string;
  readyAt?: string;
  lastHandledBy?: string;
}

export interface OrderServiceTracking {
  waiter?: OrderWaiter | null;
  servedAt?: string;
  assignmentSource?: string;
}

export interface OrderPaymentTracking {
  status: string;
  method?: string;
}

export interface OrderTimelineEntry {
  stepKey: string;
  systemState: string;
  actorType: "customer" | "employee" | "system";
  actorId?: string;
  actorRole?: string;
  action: string;
  note?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: OrderCustomer | null;
  table: OrderTable | null;
  items: OrderItem[];
  pricing: OrderPricing;
  currentStepKey: string;
  systemState: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  kitchen: OrderKitchenTracking;
  service: OrderServiceTracking;
  payment: OrderPaymentTracking;
  timeline: OrderTimelineEntry[];
  customerNotes?: string;
  cancellation?: {
    cancelledAt: string;
    reason?: string;
    cancelledBy?: string;
    cancelledByRole?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

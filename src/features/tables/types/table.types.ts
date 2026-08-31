export interface AssignedWaiter {
  id: string;
  name: string;
  role: "waiter";
}

export interface RestaurantTable {
  id: string; // Maps to serializeTable's id field
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  assignedWaiter: AssignedWaiter | null;
  waiterAssignedAt?: string | null;
  hasActiveQr?: boolean;
  createdAt: string;
  updatedAt: string;
}

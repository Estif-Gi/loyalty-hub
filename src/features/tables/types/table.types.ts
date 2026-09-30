export interface AssignedWaiter {
  id: string;
  name: string;
  role: "waiter";
}

export interface TableActiveSession {
  id: string;
  customer?: {
    id: string;
    name: string;
  } | null;
  startedAt: string;
  expiresAt: string;
  minutesAgo?: number;
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
  hasActiveSession?: boolean;
  activeSession?: TableActiveSession | null;
  createdAt: string;
  updatedAt: string;
}

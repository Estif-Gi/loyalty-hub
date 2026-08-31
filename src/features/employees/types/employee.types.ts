export type EmployeeRole = "chef" | "waiter" | "cashier";

export interface Employee {
  _id: string;
  name: string;
  role: EmployeeRole;
  isActive: boolean;
  restaurant: string;
  createdAt: string;
  updatedAt: string;
  assignedTableCount?: number; // Calculated client-side from tables list
}

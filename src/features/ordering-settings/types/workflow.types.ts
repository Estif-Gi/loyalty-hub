export type WorkflowRole = "chef" | "waiter" | "cashier";

export type WorkflowSystemState = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface WorkflowStep {
  key: string;
  label: string;
  systemState: WorkflowSystemState;
  responsibleRole: WorkflowRole | null;
  visibleToRoles: WorkflowRole[];
  actionRoles: WorkflowRole[];
  actionLabel: string | null;
  order: number;
  enabled: boolean;
  required: boolean;
}

export interface RestaurantWorkflowResponse {
  orderWorkflow: WorkflowStep[];
  orderWorkflowVersion?: number;
}

export interface UpdateWorkflowPayload {
  orderWorkflow: WorkflowStep[];
}

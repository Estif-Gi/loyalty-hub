import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  GitCommit,
  CheckCircle2,
  Clock,
  ClipboardList,
  AlertCircle,
  Save,
  RotateCcw,
  Loader2,
  ArrowRight,
  Shield,
  Eye,
  PlayCircle,
  Lock,
  Utensils,
  UserCheck,
  Receipt,
  Info,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  WorkflowStep,
  WorkflowRole,
} from "../types/workflow.types";
import {
  useRestaurantWorkflow,
  useUpdateRestaurantWorkflow,
} from "../hooks/ordering-settings.queries";

const ALL_ROLES: { id: WorkflowRole; label: string; icon: typeof Utensils }[] = [
  { id: "waiter", label: "Waiter", icon: UserCheck },
  { id: "chef", label: "Chef / Kitchen", icon: Utensils },
  { id: "cashier", label: "Cashier", icon: Receipt },
];

const DEFAULT_WORKFLOW: WorkflowStep[] = [
  {
    key: "placed",
    label: "Order Placed",
    systemState: "OPEN",
    responsibleRole: "waiter",
    visibleToRoles: ["chef", "waiter", "cashier"],
    actionRoles: ["waiter"],
    actionLabel: "Mark Served",
    order: 1,
    enabled: true,
    required: true,
  },
  {
    key: "served",
    label: "Served",
    systemState: "IN_PROGRESS",
    responsibleRole: "waiter",
    visibleToRoles: ["chef", "waiter", "cashier"],
    actionRoles: ["waiter"],
    actionLabel: "Complete Order",
    order: 2,
    enabled: true,
    required: false,
  },
  {
    key: "completed",
    label: "Completed",
    systemState: "COMPLETED",
    responsibleRole: null,
    visibleToRoles: ["chef", "waiter", "cashier"],
    actionRoles: [],
    actionLabel: null,
    order: 3,
    enabled: true,
    required: true,
  },
];

interface OrderWorkflowEditorProps {
  restaurantId: string | null;
}

export function OrderWorkflowEditor({ restaurantId }: OrderWorkflowEditorProps) {
  const { data: workflowData, isLoading, error } = useRestaurantWorkflow(restaurantId);
  const updateMutation = useUpdateRestaurantWorkflow(restaurantId);

  const [steps, setSteps] = useState<WorkflowStep[]>(DEFAULT_WORKFLOW);
  const [initialJson, setInitialJson] = useState<string>("");

  // Sync state when data is loaded
  useEffect(() => {
    if (workflowData?.orderWorkflow && workflowData.orderWorkflow.length > 0) {
      // Sort by order ascending
      const sorted = [...workflowData.orderWorkflow].sort((a, b) => a.order - b.order);
      setSteps(sorted);
      setInitialJson(JSON.stringify(sorted));
    }
  }, [workflowData]);

  const hasUnsavedChanges = useMemo(() => {
    if (!initialJson) return false;
    return JSON.stringify(steps) !== initialJson;
  }, [steps, initialJson]);

  const enabledSteps = useMemo(() => {
    return steps.filter((s) => s.enabled).sort((a, b) => a.order - b.order);
  }, [steps]);

  // Update a single step
  const updateStep = (key: string, updates: Partial<WorkflowStep>) => {
    setSteps((prev) =>
      prev.map((step) => {
        if (step.key !== key) return step;
        const updated = { ...step, ...updates };

        // If toggling served enabled/disabled, auto-adjust placed actionLabel appropriately
        if (key === "served" && updates.enabled !== undefined) {
          if (!updates.enabled && step.enabled) {
            // Turning served OFF: if placed action label was 'Mark Served', default it to 'Complete Order'
            setTimeout(() => {
              setSteps((curr) =>
                curr.map((s) =>
                  s.key === "placed" && s.actionLabel === "Mark Served"
                    ? { ...s, actionLabel: "Complete Order" }
                    : s
                )
              );
            }, 0);
          } else if (updates.enabled && !step.enabled) {
            // Turning served ON: restore 'Mark Served' on placed
            setTimeout(() => {
              setSteps((curr) =>
                curr.map((s) =>
                  s.key === "placed" && s.actionLabel === "Complete Order"
                    ? { ...s, actionLabel: "Mark Served" }
                    : s
                )
              );
            }, 0);
          }
        }

        return updated;
      })
    );
  };

  // Toggle role in an array (visibleToRoles or actionRoles)
  const toggleRoleInArray = (
    stepKey: string,
    field: "visibleToRoles" | "actionRoles",
    role: WorkflowRole
  ) => {
    const step = steps.find((s) => s.key === stepKey);
    if (!step) return;

    const currentArray = step[field] || [];
    const exists = currentArray.includes(role);
    const newArray = exists
      ? currentArray.filter((r) => r !== role)
      : [...currentArray, role];

    // For visibleToRoles, at least one role is strongly recommended
    if (field === "visibleToRoles" && newArray.length === 0) {
      toast.warning("Every step should be visible to at least one staff role.");
    }

    updateStep(stepKey, { [field]: newArray });
  };

  const handleResetToDefaults = () => {
    setSteps(DEFAULT_WORKFLOW);
    toast.info("Reset to standard restaurant workflow configuration.");
  };

  const handleSave = async () => {
    if (!restaurantId) return;

    // Validation
    const placedStep = steps.find((s) => s.key === "placed");
    const completedStep = steps.find((s) => s.key === "completed");

    if (!placedStep || !placedStep.enabled) {
      toast.error("The 'placed' step is required and must remain enabled.");
      return;
    }

    if (!completedStep || !completedStep.enabled) {
      toast.error("The 'completed' step is required and must remain enabled.");
      return;
    }

    for (const step of steps) {
      if (step.enabled && !step.label?.trim()) {
        toast.error(`Step '${step.key}' must have a valid display label.`);
        return;
      }
      if (step.enabled && step.key !== "completed" && !step.actionLabel?.trim()) {
        toast.error(`Step '${step.label}' must have an action button label.`);
        return;
      }
    }

    // Ensure order property is positive integer sequence
    const sanitizedSteps = steps.map((s, idx) => ({
      ...s,
      order: idx + 1,
      // completed step cannot have actionLabel or actionRoles
      actionLabel: s.key === "completed" ? null : s.actionLabel,
      actionRoles: s.key === "completed" ? [] : s.actionRoles,
    }));

    try {
      const res = await updateMutation.mutateAsync({
        orderWorkflow: sanitizedSteps,
      });
      setInitialJson(JSON.stringify(res.orderWorkflow));
      setSteps(res.orderWorkflow);
      toast.success("Order workflow updated successfully!");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        "Failed to update workflow.";
      toast.error(errorMsg);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl p-6 text-center space-y-3">
        <Loader2 className="w-9 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Loading restaurant workflow configuration...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-card border border-border rounded-2xl p-6 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-destructive" />
        <h4 className="font-semibold text-sm text-foreground">Unable to Load Workflow</h4>
        <p className="text-xs text-muted-foreground max-w-md">
          {(error as Error).message || "An error occurred while fetching your order workflow."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-2xl shadow-soft p-5 sm:p-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <GitCommit className="h-4.5 w-4.5" />
            </div>
            <h3 className="font-display font-bold text-base sm:text-lg text-foreground">
              Order Lifecycle Workflow
            </h3>
            {workflowData?.orderWorkflowVersion && (
              <Badge variant="outline" className="text-[10px] font-mono px-2 py-0.5">
                v{workflowData.orderWorkflowVersion}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground max-w-xl">
            Configure how orders progress from placement to fulfillment, which staff roles are assigned,
            and who can trigger milestone status transitions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold hover:bg-secondary active:scale-[0.98] transition-all text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Restore</span> Defaults
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending || !hasUnsavedChanges}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4.5 py-2.5 text-xs font-bold hover:bg-primary/95 transition-all shadow-warm active:scale-[0.98] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save Workflow
              </>
            )}
          </button>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="flex items-center justify-between p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-900 dark:text-amber-200 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>You have unsaved workflow changes. Click <strong>Save Workflow</strong> to apply them.</span>
          </div>
          <Badge variant="outline" className="bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40 text-[10px]">
            Unsaved
          </Badge>
        </div>
      )}

      {/* Live Visual Pipeline Flow Diagram */}
      <Card className="border border-border/80 shadow-soft bg-gradient-to-br from-card to-secondary/15 overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-border/40 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4 text-primary" />
              <h4 className="font-display font-semibold text-xs sm:text-sm uppercase tracking-wider text-muted-foreground">
                Live Pipeline Preview
              </h4>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {enabledSteps.length} Active Steps
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-4 overflow-x-auto py-2">
            {enabledSteps.map((step, idx) => {
              const isLast = idx === enabledSteps.length - 1;
              const isFirst = idx === 0;

              return (
                <div key={step.key} className="flex flex-col md:flex-row items-center gap-3 sm:gap-4 w-full md:w-auto">
                  {/* Step Card in Diagram */}
                  <div
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all w-full md:w-56 shadow-xs ${
                      isFirst
                        ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40"
                        : isLast
                        ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                        : "bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/40"
                    }`}
                  >
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isFirst
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                          : isLast
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                      }`}
                    >
                      {idx + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-foreground truncate">
                        {step.label || step.key}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">
                          {step.systemState}
                        </span>
                        {step.responsibleRole && (
                          <span className="text-[10px] text-primary capitalize font-medium">
                            • {step.responsibleRole}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Transition Arrow and Action Button Tag */}
                  {!isLast && (
                    <div className="flex flex-col items-center justify-center py-1 md:py-0 px-2 shrink-0">
                      <div className="flex items-center gap-1 text-primary font-medium text-[11px] bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full whitespace-nowrap shadow-2xs">
                        <span>{step.actionLabel || "Next Step"}</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                      <span className="text-[9px] text-muted-foreground mt-0.5 capitalize">
                        {step.actionRoles && step.actionRoles.length > 0
                          ? `By ${step.actionRoles.join(", ")}`
                          : "Anyone"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Note if Served is skipped */}
          {!steps.find((s) => s.key === "served")?.enabled && (
            <p className="text-[11px] text-muted-foreground text-center mt-3 pt-3 border-t border-border/30 italic">
              ⚡ Intermediate "Served" step is currently disabled. Orders move directly from Placed to Completed upon action.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Step Configuration Cards */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isPlaced = step.key === "placed";
          const isServed = step.key === "served";
          const isCompleted = step.key === "completed";

          return (
            <Card
              key={step.key}
              className={`border transition-all shadow-soft overflow-hidden ${
                !step.enabled
                  ? "opacity-60 bg-secondary/10 border-dashed border-border"
                  : "bg-card border-border"
              }`}
            >
              <CardHeader className="p-4 sm:p-5 border-b border-border/40 bg-secondary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isPlaced
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                        : isServed
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-display font-bold text-sm text-foreground">
                        {step.label || step.key}
                      </h4>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 ${
                          isPlaced
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                            : isServed
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                        }`}
                      >
                        {step.systemState}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        key: {step.key}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Toggle / Required Badge */}
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {step.required ? (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-lg border border-border/40 font-medium">
                      <Lock className="h-3 w-3 text-muted-foreground" />
                      <span>Required Step</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-xl border border-border/40">
                      <span className="text-xs font-semibold text-foreground">
                        {step.enabled ? "Active Step" : "Disabled"}
                      </span>
                      <Switch
                        checked={step.enabled}
                        onCheckedChange={(val) => updateStep(step.key, { enabled: val })}
                      />
                    </div>
                  )}
                </div>
              </CardHeader>

              {/* Disabled Banner */}
              {!step.enabled && (
                <div className="p-4 bg-secondary/20 text-xs text-muted-foreground flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>
                    This step is currently disabled. Active orders will skip this milestone and move directly
                    to the next enabled state.
                  </span>
                </div>
              )}

              {/* Step Customization Body */}
              {step.enabled && (
                <CardContent className="p-4 sm:p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Display Label */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-foreground">
                        Step Display Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="text"
                        value={step.label}
                        onChange={(e) => updateStep(step.key, { label: e.target.value })}
                        placeholder="e.g. Order Placed"
                        className="h-10 text-xs rounded-xl bg-background"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        The label shown to staff and guests representing this milestone.
                      </p>
                    </div>

                    {/* Responsible Role */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-foreground">
                        Primary Responsible Role
                      </label>
                      <Select
                        value={step.responsibleRole || "unassigned"}
                        onValueChange={(val) =>
                          updateStep(step.key, {
                            responsibleRole: val === "unassigned" ? null : (val as WorkflowRole),
                          })
                        }
                      >
                        <SelectTrigger className="h-10 text-xs rounded-xl bg-background">
                          <SelectValue placeholder="Select responsible role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">None / Unassigned</SelectItem>
                          <SelectItem value="waiter">Waiter (Floor Staff)</SelectItem>
                          <SelectItem value="chef">Chef (Kitchen Staff)</SelectItem>
                          <SelectItem value="cashier">Cashier (Billing Staff)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-muted-foreground">
                        Which employee role is primarily accountable for this phase of the order.
                      </p>
                    </div>
                  </div>

                  {/* Permissions & Actions Group */}
                  <div className="pt-2 border-t border-border/40 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Visible To Roles */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5 text-primary" />
                        <label className="text-xs font-semibold text-foreground">
                          Visible In Order Queue For:
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ALL_ROLES.map((role) => {
                          const isChecked = (step.visibleToRoles || []).includes(role.id);
                          const RoleIcon = role.icon;
                          return (
                            <button
                              key={role.id}
                              type="button"
                              onClick={() => toggleRoleInArray(step.key, "visibleToRoles", role.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                                isChecked
                                  ? "bg-primary/10 text-primary border-primary/30 font-semibold"
                                  : "bg-background text-muted-foreground border-border hover:bg-secondary"
                              }`}
                            >
                              <RoleIcon className="h-3 w-3" />
                              <span>{role.label}</span>
                              {isChecked && <CheckCircle2 className="h-3 w-3 text-primary ml-0.5" />}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Roles that can view this order ticket on their device when in this state.
                      </p>
                    </div>

                    {/* Action Permissions and Label (only for non-terminal steps) */}
                    {!isCompleted ? (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-foreground">
                            Next Transition Action Button Text <span className="text-destructive">*</span>
                          </label>
                          <Input
                            type="text"
                            value={step.actionLabel || ""}
                            onChange={(e) => updateStep(step.key, { actionLabel: e.target.value })}
                            placeholder={isPlaced ? "Mark Served" : "Complete Order"}
                            className="h-10 text-xs rounded-xl bg-background font-medium"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-foreground">
                            Allowed Action Roles (Who Can Advance):
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {ALL_ROLES.map((role) => {
                              const isChecked = (step.actionRoles || []).includes(role.id);
                              const RoleIcon = role.icon;
                              return (
                                <button
                                  key={role.id}
                                  type="button"
                                  onClick={() => toggleRoleInArray(step.key, "actionRoles", role.id)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                                    isChecked
                                      ? "bg-primary/10 text-primary border-primary/30 font-semibold"
                                      : "bg-background text-muted-foreground border-border hover:bg-secondary"
                                  }`}
                                >
                                  <RoleIcon className="h-3 w-3" />
                                  <span>{role.label}</span>
                                  {isChecked && <CheckCircle2 className="h-3 w-3 text-primary ml-0.5" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Button Preview */}
                        <div className="pt-1 flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                            Staff Button Preview:
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-primary text-primary-foreground px-3 py-1 rounded-lg shadow-xs">
                            {step.actionLabel || "Action"}
                            <ArrowRight className="h-3 w-3 ml-0.5" />
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-secondary/30 rounded-xl border border-border/40 text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Terminal Fulfillment State</span>
                        </div>
                        <p className="text-[11px]">
                          Completed is the final milestone in the workflow. Orders reaching this state are closed,
                          marked fulfilled, and archived into restaurant order history.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

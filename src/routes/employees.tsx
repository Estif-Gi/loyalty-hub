import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useAuth, requireOwner } from "@/lib/auth";
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
} from "@/features/employees/hooks/employees.queries";
import { useTables } from "@/features/tables/hooks/tables.queries";
import { Employee, EmployeeRole } from "@/features/employees/types/employee.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  X,
  Download,
  Chrome,
  Plus,
  ToggleLeft,
  ToggleRight,
  BadgeCheck,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/employees")({
  beforeLoad: requireOwner,
  component: Employees,
});

function Employees() {
  const { restaurantId } = useAuth();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<EmployeeRole>("waiter");
  const [showPassword, setShowPassword] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [showQrName, setShowQrName] = useState("");

  // Queries & Mutations
  const { data: rawEmployees = [], isLoading: isEmployeesLoading } = useEmployees(restaurantId);
  const { data: tables = [] } = useTables(restaurantId);

  const createMutation = useCreateEmployee(restaurantId);
  const updateMutation = useUpdateEmployee(restaurantId);
  const deleteMutation = useDeleteEmployee(restaurantId);

  // States for actions
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [selectedEmpQr, setSelectedEmpQr] = useState("");

  // Deletion confirmation modal states
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  // Compute table count client-side by matching assignedWaiter.id
  const employees: Employee[] = rawEmployees.map((emp) => {
    if (emp.role !== "waiter") {
      return { ...emp, assignedTableCount: 0 };
    }
    const count = tables.filter((t) => t.assignedWaiter?.id === emp._id).length;
    return { ...emp, assignedTableCount: count };
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) {
      toast.error("Please enter both name and access password.");
      return;
    }

    try {
      const data = await createMutation.mutateAsync({
        name: name.trim(),
        password: password.trim(),
        role,
      });

      toast.success(`Employee ${data.name} created successfully!`);
      const newEmployeeId = data._id;
      const url = `${import.meta.env.VITE_EMPLOYEE_URL}/login?emp=${btoa(newEmployeeId)}`;
      setQrValue(url);
      setShowQrName(data.name);

      // Clear form
      setName("");
      setPassword("");
      setRole("waiter");
      setShowPassword(false);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        "Failed to create employee.";
      toast.error(errorMsg);
    }
  };

  const handleRoleChange = async (emp: Employee, newRole: EmployeeRole) => {
    try {
      await updateMutation.mutateAsync({
        employeeId: emp._id,
        payload: { role: newRole },
      });
      toast.success(`Updated role for ${emp.name} to ${newRole}.`);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        "Failed to update role.";
      toast.error(errorMsg);
    }
  };

  const handleDeleteClick = (emp: Employee) => {
    setDeleteTarget(emp);
  };

  const executeDelete = async (emp: Employee) => {
    try {
      await deleteMutation.mutateAsync(emp._id);
      toast.success(`Employee ${emp.name} deleted successfully.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        "Failed to delete employee.";
      toast.error(errorMsg);
    }
  };

  const buildEmpQrUrl = (empId: string) => {
    return `${import.meta.env.VITE_EMPLOYEE_URL}/login?emp=${btoa(empId)}`;
  };

  const handleEmpClick = (emp: Employee) => {
    setSelectedEmp(emp);
    setSelectedEmpQr(buildEmpQrUrl(emp._id));
  };

  return (
    <DashboardLayout
      title="Employees"
      subtitle="Manage your staff, update roles, and view login credentials."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add New Employee */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-soft">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Add New Employee</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">
                  Employee Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setQrValue("");
                  }}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  placeholder="e.g. Sarah"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as EmployeeRole)}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                >
                  <option value="waiter">Waiter</option>
                  <option value="chef">Chef</option>
                  <option value="cashier">Cashier</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">
                  Access Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all pr-11 text-sm"
                    placeholder="e.g. password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908l3.42 3.42M3 3l3.59 3.59m0 0L12 12m4.406-1.406L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5 16.477 5 20.268 7.943 21.542 12 20.268 16.057 16.477 19 12 19 7.523 19 3.732 16.057 2.458 12z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!name.trim() || !password.trim() || createMutation.isPending}
                className="w-full mt-6 bg-primary text-primary-foreground py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center text-sm"
              >
                {createMutation.isPending ? "Creating..." : "Create Employee"}
              </button>
            </form>

            {qrValue && (
              <div className="mt-8 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <div className="relative">
                  <div className="p-4 bg-white rounded-2xl shadow-sm border border-border/50">
                    <QRCodeSVG value={qrValue} size={180} />
                  </div>
                  <div
                    className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1.5 shadow-md"
                    title="Works best in Chrome"
                  >
                    <Chrome className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-center mt-4 text-xs text-muted-foreground bg-secondary/50 px-4 py-2 rounded-lg">
                  Have <strong>{showQrName}</strong> scan this QR code with their phone to complete
                  setup.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Current Staff List */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-soft h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Current Staff</h3>

            {isEmployeesLoading ? (
              <div className="flex items-center justify-center flex-1 py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : employees.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-12 text-muted-foreground">
                <p>No employee accounts set up.</p>
                <p className="text-sm mt-1">
                  Onboard chefs, waiters, and cashiers to manage orders.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs uppercase font-semibold">
                      <th className="pb-3 pt-1">Employee</th>
                      <th className="pb-3 pt-1">Role</th>
                      <th className="pb-3 pt-1 text-center">Tables Assigned</th>
                      <th className="pb-3 pt-1 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {employees.map((emp) => (
                      <tr key={emp._id} className="hover:bg-secondary/10 transition-colors">
                        <td className="py-4">
                          <button
                            onClick={() => handleEmpClick(emp)}
                            className="flex items-center gap-3 text-left font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                          >
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                              {emp.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold">{emp.name}</p>
                              <span className="text-xs text-muted-foreground hover:underline">
                                View login QR →
                              </span>
                            </div>
                          </button>
                        </td>
                        <td className="py-4">
                          <select
                            value={emp.role}
                            onChange={(e) => handleRoleChange(emp, e.target.value as EmployeeRole)}
                            className="bg-transparent border-none text-foreground hover:bg-secondary/50 rounded p-1 text-sm focus:ring-1 focus:ring-primary/20 focus:outline-none capitalize font-medium"
                          >
                            <option value="waiter">Waiter</option>
                            <option value="chef">Chef</option>
                            <option value="cashier">Cashier</option>
                          </select>
                        </td>
                        <td className="py-4 text-center font-semibold text-foreground">
                          {emp.role === "waiter" ? (
                            emp.assignedTableCount ? (
                              <span className="text-primary">{emp.assignedTableCount} tables</span>
                            ) : (
                              <span className="text-muted-foreground/60">0 tables</span>
                            )
                          ) : (
                            <span className="text-muted-foreground/30">—</span>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleDeleteClick(emp)}
                            className="text-xs font-semibold text-destructive hover:text-destructive/80 transition-colors cursor-pointer px-2 py-1 border border-destructive/20 hover:bg-destructive/10 rounded-lg"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View QR Code Dialog */}
      <Dialog
        open={!!selectedEmp}
        onOpenChange={(open) => {
          if (!open) setSelectedEmp(null);
        }}
      >
        <DialogContent className="max-w-xs rounded-3xl text-center p-6 bg-card border border-border shadow-warm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-center">
              {selectedEmp?.name}
            </DialogTitle>
            <DialogDescription className="text-center text-xs">
              Onboard using the credentials below or have them scan the QR code to login.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative">
              <div className="p-4 bg-white rounded-2xl border border-border/50 shadow-sm">
                {selectedEmpQr && <QRCodeSVG value={selectedEmpQr} size={180} />}
              </div>
              <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1.5 shadow-md">
                <Chrome className="w-4 h-4" />
              </div>
            </div>

            <div className="w-full bg-secondary/50 p-3 rounded-xl text-left border border-border/30 text-xs">
              <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                Employee ID (Login Credential)
              </p>
              <p className="font-mono text-sm font-semibold text-foreground mt-0.5 select-all break-all">
                {selectedEmp?._id}
              </p>
            </div>

            {/* Download button */}
            <button
              onClick={() => {
                const svg = document.querySelector("dialog svg") as SVGElement | null;
                if (!svg) return;
                const data = new XMLSerializer().serializeToString(svg);
                const blob = new Blob([data], { type: "image/svg+xml" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `${selectedEmp?.name ?? "employee"}-qr.svg`;
                a.click();
                URL.revokeObjectURL(a.href);
              }}
              className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mt-2"
            >
              <Download className="w-4 h-4" /> Download SVG QR
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="max-w-md rounded-2xl p-6 bg-card border border-border shadow-warm">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertTriangle className="h-6 w-6" />
              <DialogTitle className="font-display text-lg text-left">
                Delete Employee Account
              </DialogTitle>
            </div>
            <DialogDescription className="text-left text-sm text-foreground/90 leading-relaxed">
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
            </DialogDescription>
            {deleteTarget?.role === "waiter" && deleteTarget?.assignedTableCount && deleteTarget?.assignedTableCount > 0 ? (
              <p className="text-left text-sm text-muted-foreground mt-2 leading-relaxed">
                <strong>{deleteTarget?.name}</strong> is currently assigned to{" "}
                <strong>{deleteTarget?.assignedTableCount} tables</strong>. Deleting this waiter will automatically clear their table assignments. Customers sitting at those tables will not be able to place orders until a new waiter is assigned.
              </p>
            ) : (
              <p className="text-left text-sm text-muted-foreground mt-2 leading-relaxed">
                This will permanently delete this employee account. They will no longer be able to log in or access the order queue. This action cannot be undone.
              </p>
            )}
          </DialogHeader>

          <DialogFooter className="mt-6 flex gap-3 justify-end">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 border border-border rounded-xl text-sm font-semibold hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteTarget && executeDelete(deleteTarget)}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-xl text-sm font-semibold hover:bg-destructive/90 transition-colors"
            >
              Delete Account
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

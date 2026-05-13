import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X, Download } from "lucide-react";

export const Route = createFileRoute("/employees")({
  component: Employees,
});

type Employee = {
  _id: string;
  name: string;
  createdAt: string;
};

function Employees() {
  const { restaurantId } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [empID, setEmpID] = useState<string | null>(null);

  // For the "view QR" modal when clicking an existing employee
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [selectedEmpQr, setSelectedEmpQr] = useState("");

  useEffect(() => {
    const employeeData = localStorage.getItem("loyalty-auth");
    if (employeeData) {
      try {
        const parsed = JSON.parse(employeeData);
        setEmpID(parsed.state?.employeeId || null);
      } catch (e) {
        console.error("Failed to parse loyalty-auth", e);
      }
    }
  }, []);

  const { data: employeesData, isLoading } = useQuery({
    queryKey: ["employees", restaurantId],
    queryFn: async () => {
      const res = await api.get(`/restaurants/${restaurantId}/employees`);
      return res.data;
    },
    enabled: !!restaurantId,
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (employeeName: string) => {
      const res = await api.post(`/restaurants/${restaurantId}/employees`, {
        name: employeeName,
        password: password,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employees", restaurantId] });
      const newEmployeeId = data.employee?._id ?? data._id ?? data.employeeId;
      const url = `${import.meta.env.VITE_EMPLOYEE_URL}/login?emp=${btoa(newEmployeeId)}`;
      setQrValue(url);
    },
  });

  const handleGenerate = () => {
    if (!name.trim()) return;
    createEmployeeMutation.mutate(name);
  };

  // Build the QR URL for any employee by their _id
  function buildEmpQrUrl(empId: string) {
    return `${import.meta.env.VITE_EMPLOYEE_URL}/login?emp=${btoa(empId)}`;
  }

  function handleEmpClick(emp: Employee) {
    setSelectedEmp(emp);
    setSelectedEmpQr(buildEmpQrUrl(emp._id));
  }

  const employees: Employee[] = employeesData?.employees || [];

  return (
    <DashboardLayout title="Employees" subtitle="Manage your staff and onboard new employees.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add New Employee */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-soft">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Add New Employee</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">
                  Employee Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setQrValue("");
                  }}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="e.g. Sarah"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all pr-11"
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
            </div>

            <button
              onClick={handleGenerate}
              disabled={!name.trim() || createEmployeeMutation.isPending}
              className="w-full mt-6 bg-primary text-primary-foreground py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {createEmployeeMutation.isPending ? "Creating..." : "Create & Generate QR"}
            </button>

            {qrValue && (
              <div className="mt-8 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-border/50">
                  <QRCodeSVG value={qrValue} size={180} />
                </div>
                <p className="text-center mt-4 text-sm text-muted-foreground bg-secondary/50 px-4 py-2 rounded-lg">
                  Have <strong>{name}</strong> scan this QR code with their phone to complete setup.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Current Staff */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-soft h-full">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Current Staff</h3>

            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : employees.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <p>No employees found.</p>
                <p className="text-sm mt-1">Add your first employee to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {employees.map((emp) => (
                  <button
                    key={emp._id}
                    onClick={() => handleEmpClick(emp)}
                    className="w-full text-left flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Added on {new Date(emp.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {/* Hint on hover */}
                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity pr-1">
                      View QR →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Modal */}
      <Dialog
        open={!!selectedEmp}
        onOpenChange={(open) => {
          if (!open) setSelectedEmp(null);
        }}
      >
        <DialogContent className="max-w-xs rounded-2xl text-center">
          <DialogHeader>
            <DialogTitle>{selectedEmp?.name}</DialogTitle>
            <DialogDescription>Have this employee scan the QR code to sign in.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-2">
            <div className="p-4 bg-white rounded-2xl border border-border/50 shadow-sm">
              {selectedEmpQr && <QRCodeSVG value={selectedEmpQr} size={200} />}
            </div>

            {/* Download button */}
            <button
              onClick={() => {
                const svg = document.querySelector("[data-qr-modal] svg") as SVGElement | null;
                if (!svg) return;
                const blob = new Blob([svg.outerHTML], {
                  type: "image/svg+xml",
                });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `${selectedEmp?.name ?? "employee"}-qr.svg`;
                a.click();
              }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Download className="w-4 h-4" />
              Download QR
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

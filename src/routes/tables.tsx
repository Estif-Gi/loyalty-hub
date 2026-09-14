import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { resolveQrState } from "@/features/qr-codes/utils/qrStateResolver";
import { QRCodeSVG } from "qrcode.react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useAuth, requireOwner } from "@/lib/auth";
import { useEmployees } from "@/features/employees/hooks/employees.queries";
import {
  useTables,
  useCreateTable,
  useUpdateTable,
  useDeactivateTable,
  useActivateTable,
  useAssignWaiter,
  useBulkAssignTables,
  useBulkCreateTables,
} from "@/features/tables/hooks/tables.queries";
import { useTableQrMetadata, useGenerateTableQr } from "@/features/qr-codes/hooks/qr-codes.queries";
import { RestaurantTable } from "@/features/tables/types/table.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit2,
  Check,
  X,
  Users,
  CheckSquare,
  Square,
  AlertCircle,
  Loader2,
  QrCode,
  Download,
  Printer,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/tables")({
  beforeLoad: requireOwner,
  component: Tables,
});

function Tables() {
  const { restaurantId } = useAuth();

  // Queries & Mutations
  const { data: tables = [], isLoading: isTablesLoading } = useTables(restaurantId);
  const { data: employees = [] } = useEmployees(restaurantId);

  const createMutation = useCreateTable(restaurantId);
  const bulkCreateMutation = useBulkCreateTables(restaurantId);
  const updateMutation = useUpdateTable(restaurantId);
  const deactivateMutation = useDeactivateTable(restaurantId);
  const activateMutation = useActivateTable(restaurantId);
  const assignWaiterMutation = useAssignWaiter(restaurantId);
  const bulkAssignMutation = useBulkAssignTables(restaurantId);

  // QR mutations
  const generateMutation = useGenerateTableQr(restaurantId);

  // Active waiters for assignments dropdown
  const activeWaiters = employees.filter((emp) => emp.role === "waiter" && emp.isActive);

  // Form modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isBulkCreateOpen, setIsBulkCreateOpen] = useState(false);

  // Selected table for QR code management modal
  const [selectedTableQr, setSelectedTableQr] = useState<RestaurantTable | null>(null);

  // Local state to store the raw URL containing the token temporarily during generation/rotation
  const [oneTimeQrUrl, setOneTimeQrUrl] = useState<string | null>(null);
  const [justRevoked, setJustRevoked] = useState(false);

  // Fetch restaurant details dynamically
  const { data: restaurant } = useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: async () => {
      const res = await api.get(`/restaurants/${restaurantId}`);
      return res.data;
    },
    enabled: !!restaurantId,
  });
  const restaurantName = restaurant?.name || "Loyalty Hub";

  // Form inputs
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);

  // Bulk creation inputs
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkPrefix, setBulkPrefix] = useState("Table ");
  const [bulkStartNumber, setBulkStartNumber] = useState(1);
  const [bulkDescription, setBulkDescription] = useState("");

  // Bulk assignment inputs
  const [bulkWaiterId, setBulkWaiterId] = useState<string>("");
  const [bulkSelectedTableIds, setBulkSelectedTableIds] = useState<Set<string>>(new Set());

  // Fetch metadata for the selected table QR
  const {
    data: qrs = [],
    isLoading: isQrMetadataLoading,
    error: qrError,
    isError: isQrError,
  } = useTableQrMetadata(restaurantId, selectedTableQr?.id || null);

  const activeQr = qrs.find((q) => q.isActive);
  const isLegacyError =
    isQrError && (qrError as any)?.response?.data?.error === "QR_CREDENTIAL_NOT_RECOVERABLE";

  // Sync oneTimeQrUrl from sessionStorage if available
  useEffect(() => {
    if (selectedTableQr) {
      const cachedUrl = sessionStorage.getItem(`qr_url_${selectedTableQr.id}`);
      if (cachedUrl) {
        setOneTimeQrUrl(cachedUrl);
      } else {
        setOneTimeQrUrl(null);
      }
    } else {
      setOneTimeQrUrl(null);
    }
  }, [selectedTableQr]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error("Please fill in Table Name and Table Code.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        code: code.trim(),
        description: description.trim(),
      });
      toast.success("Table created successfully!");
      setIsCreateOpen(false);
      setName("");
      setCode("");
      setDescription("");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        "Failed to create table.";
      toast.error(errorMsg);
    }
  };

  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkCount <= 0) {
      toast.error("Please enter a valid count greater than 0.");
      return;
    }
    if (bulkStartNumber < 0) {
      toast.error("Please enter a valid starting number.");
      return;
    }

    try {
      await bulkCreateMutation.mutateAsync({
        count: Number(bulkCount),
        prefix: bulkPrefix,
        startNumber: Number(bulkStartNumber),
        description: bulkDescription.trim(),
      });
      toast.success("Tables generated successfully!");
      setIsBulkCreateOpen(false);
      // Reset form
      setBulkCount(10);
      setBulkPrefix("Table ");
      setBulkStartNumber(1);
      setBulkDescription("");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        "Failed to bulk create tables.";
      toast.error(errorMsg);
    }
  };

  const handleEditOpen = (table: RestaurantTable) => {
    setSelectedTable(table);
    setName(table.name);
    setCode(table.code);
    setDescription(table.description || "");
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;
    if (!name.trim() || !code.trim()) {
      toast.error("Please fill in Table Name and Table Code.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        tableId: selectedTable.id,
        payload: {
          name: name.trim(),
          code: code.trim(),
          description: description.trim(),
        },
      });
      toast.success("Table updated successfully!");
      setIsEditOpen(false);
      setSelectedTable(null);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        "Failed to update table.";
      toast.error(errorMsg);
    }
  };

  const handleToggleActive = async (table: RestaurantTable) => {
    try {
      if (table.isActive) {
        await deactivateMutation.mutateAsync(table.id);
        toast.success(`Table ${table.code} deactivated.`);
      } else {
        await activateMutation.mutateAsync(table.id);
        toast.success(`Table ${table.code} activated.`);
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        "Failed to change table status.";
      toast.error(errorMsg);
    }
  };

  const handleWaiterChange = async (table: RestaurantTable, waiterId: string) => {
    const finalWaiterId = waiterId === "" ? null : waiterId;
    try {
      await assignWaiterMutation.mutateAsync({
        tableId: table.id,
        waiterId: finalWaiterId,
      });
      toast.success(
        finalWaiterId
          ? `Waiter assigned to Table ${table.code}.`
          : `Waiter unassigned from Table ${table.code}.`,
      );
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        "Failed to assign waiter.";
      toast.error(errorMsg);
    }
  };

  // Bulk assignment methods
  const toggleBulkTable = (id: string) => {
    const updated = new Set(bulkSelectedTableIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setBulkSelectedTableIds(updated);
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkSelectedTableIds.size === 0) {
      toast.error("Please select at least one table.");
      return;
    }

    const finalWaiterId = bulkWaiterId === "" ? null : bulkWaiterId;

    try {
      await bulkAssignMutation.mutateAsync({
        waiterId: finalWaiterId,
        tableIds: Array.from(bulkSelectedTableIds),
      });

      const waiterName = finalWaiterId
        ? activeWaiters.find((w) => w._id === finalWaiterId)?.name
        : "unassigned";
      toast.success(`Successfully assigned ${bulkSelectedTableIds.size} tables to ${waiterName}.`);
      setIsBulkOpen(false);
      setBulkWaiterId("");
      setBulkSelectedTableIds(new Set());
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        "Bulk assignment failed.";
      toast.error(errorMsg);
    }
  };

  // QR Code operations
  const handleGenerateQr = async () => {
    if (!selectedTableQr) return;
    try {
      const res = await generateMutation.mutateAsync(selectedTableQr.id);
      setOneTimeQrUrl(res.url);
      sessionStorage.setItem(`qr_url_${selectedTableQr.id}`, res.url);
      setJustRevoked(false);
      toast.success("Table ordering QR code generated successfully!");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        "Failed to generate QR code.";
      toast.error(errorMsg);
    }
  };

  const printTableQR = (tableName: string) => {
    if (!selectedTableQr) {
      toast.error("Table information is missing.");
      return;
    }
    const svgElement = document.getElementById("table-ordering-qr-preview") as SVGElement | null;
    if (!svgElement) {
      toast.error("A printable QR code is not currently generated.");
      return;
    }

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(svgBlob);

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR - ${tableName}</title>
          <style>
            body {
              font-family: 'DM Sans', sans-serif;
              text-align: center;
              padding: 40px;
              color: #2c1f0e;
              background-color: #ffffff;
            }
            .container {
              border: 3px double #a97c4a;
              border-radius: 24px;
              padding: 30px;
              display: inline-block;
              background: #faf7f2;
              width: 320px;
            }
            .brand-name {
              font-size: 26px;
              font-weight: 800;
              margin: 10px 0 2px 0;
              color: #2c1f0e;
            }
            .table-label {
              font-size: 20px;
              color: #a97c4a;
              font-weight: 700;
              margin-bottom: 20px;
            }
            .qr-wrapper {
              background: white;
              padding: 20px;
              border-radius: 16px;
              display: inline-block;
              border: 1px solid #e8d5be;
              box-shadow: 0 4px 12px rgba(44, 31, 14, 0.05);
            }
            .action-label {
              margin-top: 20px;
              font-size: 15px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #a97c4a;
            }
            .branding {
              margin-top: 15px;
              font-size: 11px;
              color: #8a6035;
              opacity: 0.7;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="brand-name">${restaurantName}</div>
            <div class="table-label">${tableName}</div>
            <div class="qr-wrapper">
              <img src="${blobUrl}" width="200" height="200" />
            </div>
            <div class="action-label">Scan to Order</div>
            <div class="branding">Powered by Loyalty Platform</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    URL.revokeObjectURL(blobUrl);
  };

  const downloadTableQr = (tableName: string) => {
    if (!selectedTableQr) {
      toast.error("Table information is missing.");
      return;
    }
    const svg = document.getElementById("table-ordering-qr-preview");
    if (!svg) {
      toast.error("A printable QR code is not currently generated.");
      return;
    }
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tableName.toLowerCase().replace(/\s+/g, "-")}-ordering-qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout
      title="Tables"
      subtitle="Manage your physical tables, assign waiters, and monitor status."
      actions={
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsBulkOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold hover:bg-secondary transition-colors cursor-pointer"
          >
            <Users className="h-4 w-4" /> Bulk Assignment
          </button>
          <button
            onClick={() => setIsBulkCreateOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold hover:bg-secondary transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Bulk Create
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold hover:bg-primary/95 shadow-warm active:scale-[0.98] transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Table
          </button>
        </div>
      }
    >
      {isTablesLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border rounded-3xl p-6 sm:p-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-foreground">No tables created yet</h3>
          <p className="text-muted-foreground mt-1.5 max-w-sm text-xs sm:text-sm">
            Create physical restaurant tables so customers can scan codes and place geofenced
            orders.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-bold hover:bg-primary/95 transition-colors shadow-warm cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Create Your First Table
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl shadow-soft p-4 sm:p-6">
          {/* Mobile Card View (< md) */}
          <div className="md:hidden space-y-3.5">
            {tables.map((table) => {
              const hasWaiter = !!table.assignedWaiter;

              return (
                <div
                  key={table.id}
                  className="p-4 rounded-xl border border-border bg-background/50 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-lg">
                        {table.code}
                      </span>
                      <span className="font-semibold text-sm text-foreground">{table.name}</span>
                    </div>

                    <button
                      onClick={() => handleToggleActive(table)}
                      className="inline-flex items-center cursor-pointer"
                    >
                      {table.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/15 text-success">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">
                          Inactive
                        </span>
                      )}
                    </button>
                  </div>

                  {table.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {table.description}
                    </p>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Assigned Waiter
                    </label>
                    <select
                      value={table.assignedWaiter?.id || ""}
                      onChange={(e) => handleWaiterChange(table, e.target.value)}
                      className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:ring-1 focus:ring-primary/20 focus:outline-none capitalize font-medium"
                    >
                      <option value="">Unassigned</option>
                      {activeWaiters.map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                    {!hasWaiter && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        Customer ordering blocked until waiter assigned.
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <button
                      onClick={() => {
                        setOneTimeQrUrl(null);
                        setSelectedTableQr(table);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2.5 border border-border hover:bg-secondary rounded-lg text-xs font-semibold text-foreground transition-colors cursor-pointer"
                    >
                      <QrCode className="h-3.5 w-3.5 text-primary" /> QR Code
                    </button>
                    <button
                      onClick={() => handleEditOpen(table)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2.5 border border-border hover:bg-secondary rounded-lg text-xs font-semibold text-foreground transition-colors cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(table)}
                      className="py-2 px-3 border border-border hover:bg-secondary rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {table.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs uppercase font-semibold">
                  <th className="pb-3">Code</th>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Assigned Waiter</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {tables.map((table) => {
                  const hasWaiter = !!table.assignedWaiter;

                  return (
                    <tr key={table.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="py-4 font-mono font-bold text-foreground">{table.code}</td>
                      <td className="py-4 font-medium text-foreground">{table.name}</td>
                      <td className="py-4 text-muted-foreground max-w-xs truncate">
                        {table.description || <span className="text-muted-foreground/30">—</span>}
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col gap-1.5">
                          <select
                            value={table.assignedWaiter?.id || ""}
                            onChange={(e) => handleWaiterChange(table, e.target.value)}
                            className="max-w-[180px] bg-background border border-border rounded-lg p-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary/20 focus:outline-none capitalize font-medium"
                          >
                            <option value="">Unassigned</option>
                            {activeWaiters.map((w) => (
                              <option key={w._id} value={w._id}>
                                {w.name}
                              </option>
                            ))}
                          </select>

                          {!hasWaiter && (
                            <span className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold mt-0.5">
                              <AlertCircle className="h-3 w-3 shrink-0" />
                              Customer ordering blocked until waiter assigned.
                            </span>
                          )}
                          {hasWaiter && table.waiterAssignedAt && (
                            <span className="text-[10px] text-muted-foreground">
                              Assigned: {new Date(table.waiterAssignedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <button
                          onClick={() => handleToggleActive(table)}
                          className="inline-flex items-center justify-center cursor-pointer"
                        >
                          {table.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                              Inactive
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setOneTimeQrUrl(null);
                              setSelectedTableQr(table);
                            }}
                            className="p-2 border border-border text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors cursor-pointer"
                            title="Manage Table QR Code"
                          >
                            <QrCode className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleEditOpen(table)}
                            className="p-2 border border-border text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors cursor-pointer"
                            title="Edit Table Details"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(table)}
                            className="px-2.5 py-1.5 border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors cursor-pointer"
                          >
                            {table.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Table Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6 bg-card border border-border shadow-warm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-left">
              Add Restaurant Table
            </DialogTitle>
            <DialogDescription className="text-left text-xs">
              Create a new physical restaurant table code. Waiters can be assigned afterwards.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-foreground">Table Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Table 1"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-foreground">Table Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. T1"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-foreground">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Near main hall window"
                className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm h-20 resize-none"
              />
            </div>

            <DialogFooter className="pt-4 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 border border-border rounded-xl text-sm font-semibold hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/95 transition-colors shadow-warm"
              >
                {createMutation.isPending ? "Creating..." : "Create Table"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Table Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(o) => !o && setIsEditOpen(false)}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6 bg-card border border-border shadow-warm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-left">Edit Table Details</DialogTitle>
            <DialogDescription className="text-left text-xs">
              Update the name, code, or description of Table {selectedTable?.code}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-foreground">Table Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-foreground">Table Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-foreground">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm h-20 resize-none"
              />
            </div>

            <DialogFooter className="pt-4 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 border border-border rounded-xl text-sm font-semibold hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/95 transition-colors shadow-warm"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Waiter Assignment Dialog */}
      <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6 bg-card border border-border shadow-warm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-left">
              Bulk Waiter Assignment
            </DialogTitle>
            <DialogDescription className="text-left text-xs">
              Assign a waiter to multiple tables at once.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBulkSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-foreground">
                Select Waiter
              </label>
              <select
                required
                value={bulkWaiterId}
                onChange={(e) => setBulkWaiterId(e.target.value)}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm capitalize"
              >
                <option value="">Unassign / Leave Empty</option>
                {activeWaiters.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name} (Active Waiter)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-2 text-foreground">
                Select Tables ({bulkSelectedTableIds.size} selected)
              </label>
              <div className="max-h-48 overflow-y-auto border border-border rounded-xl p-3 space-y-2.5 bg-secondary/10">
                {tables.map((table) => {
                  const isChecked = bulkSelectedTableIds.has(table.id);
                  return (
                    <button
                      key={table.id}
                      type="button"
                      onClick={() => toggleBulkTable(table.id)}
                      className="w-full flex items-center gap-3 text-left hover:bg-secondary/40 p-1.5 rounded transition-colors text-xs font-semibold"
                    >
                      {isChecked ? (
                        <CheckSquare className="h-4.5 w-4.5 text-primary shrink-0" />
                      ) : (
                        <Square className="h-4.5 w-4.5 text-muted-foreground/45 shrink-0" />
                      )}
                      <div>
                        <span className="font-mono bg-border/40 px-1.5 py-0.5 rounded mr-2">
                          {table.code}
                        </span>
                        <span>{table.name}</span>
                        {table.assignedWaiter && (
                          <span className="text-[10px] text-muted-foreground ml-2 font-normal font-sans italic">
                            (Currently: {table.assignedWaiter.name})
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="pt-4 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setIsBulkOpen(false)}
                className="px-4 py-2 border border-border rounded-xl text-sm font-semibold hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={bulkAssignMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/95 transition-colors shadow-warm flex items-center gap-1.5"
              >
                {bulkAssignMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Apply Assignment"
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Table QR Manager Dialog */}
      <Dialog
        open={!!selectedTableQr}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTableQr(null);
            setOneTimeQrUrl(null);
            setJustRevoked(false);
          }
        }}
      >
        <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6 bg-card border border-border shadow-warm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-left">
              QR Code Manager — {selectedTableQr?.name} ({selectedTableQr?.code})
            </DialogTitle>
            <DialogDescription className="text-left text-xs leading-relaxed">
              Generate, rotate, or revoke geofenced customer ordering credentials for this table.
            </DialogDescription>
          </DialogHeader>

          {isQrMetadataLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isLegacyError ? (
            <div className="p-6 text-center border border-dashed border-destructive/20 rounded-2xl bg-destructive/5 space-y-2.5 mt-4">
              <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <h4 className="font-semibold text-sm text-destructive">
                Legacy QR Code Unrecoverable
              </h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                This QR was created using the previous QR storage format and cannot be reprinted.
              </p>
              <p className="text-xs text-muted-foreground/80 max-w-xs mx-auto leading-relaxed font-semibold italic">
                Contact your platform administrator to rotate or replace this QR code.
              </p>
            </div>
          ) : (
            (() => {
              const qrUiState = resolveQrState(activeQr, oneTimeQrUrl, justRevoked);
              return (
                <div className="space-y-6 mt-4">
                  {/* QR Code preview block */}
                  {(qrUiState === "printable" || qrUiState === "metadata-only") && (
                    <div className="flex flex-col items-center text-center p-4 bg-secondary/10 rounded-2xl border border-border/50">
                      <div className="p-4 bg-white rounded-xl border border-border shadow-sm">
                        <QRCodeSVG
                          id="table-ordering-qr-preview"
                          value={
                            oneTimeQrUrl ||
                            activeQr?.url ||
                            (selectedTableQr
                              ? sessionStorage.getItem(`qr_url_${selectedTableQr.id}`)
                              : null) ||
                            ""
                          }
                          size={180}
                          bgColor="#ffffff"
                          fgColor="#2c1f0e"
                          level="H"
                        />
                      </div>

                      {(oneTimeQrUrl ||
                        activeQr?.url ||
                        (selectedTableQr &&
                          sessionStorage.getItem(`qr_url_${selectedTableQr.id}`))) && (
                        <>
                          <div className="mt-3 flex items-center gap-1.5 text-xs text-success font-semibold">
                            <CheckCircle className="h-4 w-4" /> Secure Token Loaded Successfully
                          </div>
                          <div className="mt-3.5 text-center w-full px-2 max-w-xs">
                            <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                              Ordering Link
                            </p>
                            <a
                              href={
                                oneTimeQrUrl ||
                                activeQr?.url ||
                                (selectedTableQr
                                  ? sessionStorage.getItem(`qr_url_${selectedTableQr.id}`)
                                  : undefined) ||
                                undefined
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline font-mono break-all inline-block mt-1 select-all cursor-pointer"
                              title="Click to open link"
                            >
                              {oneTimeQrUrl ||
                                activeQr?.url ||
                                (selectedTableQr
                                  ? sessionStorage.getItem(`qr_url_${selectedTableQr.id}`)
                                  : null)}
                            </a>
                          </div>
                        </>
                      )}

                      <div className="flex gap-2 mt-4 w-full">
                        <button
                          onClick={() => selectedTableQr && downloadTableQr(selectedTableQr.name)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-secondary transition-colors cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" /> Download SVG
                        </button>
                        <button
                          onClick={() => selectedTableQr && printTableQR(selectedTableQr.name)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-bold hover:bg-primary/95 transition-colors shadow-warm cursor-pointer"
                        >
                          <Printer className="h-3.5 w-3.5" /> Print QR Label
                        </button>
                      </div>
                    </div>
                  )}

                  {qrUiState === "revoked" && (
                    <div className="p-6 text-center border border-dashed border-border rounded-2xl bg-destructive/10 space-y-2.5">
                      <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                      <h4 className="font-semibold text-sm text-destructive">QR Code Revoked</h4>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                        The table QR code has been successfully revoked. Guests can no longer check
                        in using any previously printed QR codes for this table.
                      </p>
                      <button
                        onClick={handleGenerateQr}
                        disabled={generateMutation.isPending}
                        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/95 transition-colors cursor-pointer"
                      >
                        {generateMutation.isPending ? "Generating..." : "Generate QR Code"}
                      </button>
                    </div>
                  )}

                  {qrUiState === "no-qr" && (
                    <div className="p-6 text-center border border-dashed border-border rounded-2xl bg-secondary/15">
                      <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                      <h4 className="font-semibold text-sm">No Active Ordering QR Code</h4>
                      <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
                        This table has no active ordering QR code. Customers cannot check in or
                        place orders at this table.
                      </p>
                      <button
                        onClick={handleGenerateQr}
                        disabled={generateMutation.isPending}
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/95 transition-colors cursor-pointer"
                      >
                        {generateMutation.isPending ? "Generating..." : "Generate QR Code"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })()
          )}

          <DialogFooter className="mt-6">
            <button
              onClick={() => {
                setSelectedTableQr(null);
                setOneTimeQrUrl(null);
                setJustRevoked(false);
              }}
              className="w-full py-2.5 bg-secondary hover:bg-secondary/70 text-foreground border border-border rounded-xl text-xs font-semibold transition-colors"
            >
              Done
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Create Tables Generator Dialog */}
      <Dialog open={isBulkCreateOpen} onOpenChange={setIsBulkCreateOpen}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6 bg-card border border-border shadow-warm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-left">Bulk Create Tables</DialogTitle>
            <DialogDescription className="text-left text-xs">
              Generate multiple physical tables at once using a count, prefix, and starting number.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBulkCreate} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-foreground">
                Number of Tables
              </label>
              <input
                type="number"
                required
                min="1"
                max="50"
                value={bulkCount}
                onChange={(e) => setBulkCount(Number(e.target.value))}
                placeholder="e.g. 10"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-foreground">
                Table Name Prefix
              </label>
              <input
                type="text"
                required
                value={bulkPrefix}
                onChange={(e) => setBulkPrefix(e.target.value)}
                placeholder="e.g. Table "
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-foreground">
                Start Number
              </label>
              <input
                type="number"
                required
                min="1"
                value={bulkStartNumber}
                onChange={(e) => setBulkStartNumber(Number(e.target.value))}
                placeholder="e.g. 1"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-foreground">
                Description (Optional)
              </label>
              <textarea
                value={bulkDescription}
                onChange={(e) => setBulkDescription(e.target.value)}
                placeholder="e.g. Main Dining Hall"
                className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm h-20 resize-none"
              />
            </div>

            <DialogFooter className="pt-4 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setIsBulkCreateOpen(false)}
                className="px-4 py-2 border border-border rounded-xl text-sm font-semibold hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={bulkCreateMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/95 transition-colors shadow-warm flex items-center gap-1.5"
              >
                {bulkCreateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                  </>
                ) : (
                  "Generate Tables"
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

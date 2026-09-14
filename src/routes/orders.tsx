import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useAuth, requireOwner } from "@/lib/auth";
import {
  useOrderingConfig,
  useUpdateOrderingConfig,
} from "@/features/ordering-settings/hooks/ordering-settings.queries";
import {
  useEmployeeOrders,
  useRestaurantOrderHistory,
} from "@/features/orders/hooks/orders.queries";
import { useOrdersRealtime } from "@/features/orders/hooks/useOrdersRealtime";
import { Order } from "@/features/orders/types/orders.types";
import { formatCurrency } from "@/lib/formatCurrency";
import { OrderWorkflowEditor } from "@/features/ordering-settings/components/order-workflow-editor";
import {
  MapPin,
  Navigation,
  Save,
  Loader2,
  Info,
  CheckCircle2,
  ClipboardList,
  Clock,
  User,
  Utensils,
  AlertCircle,
  RefreshCw,
  Sliders,
  GitCommit,
  History,
  Search,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  XCircle,
  Receipt,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/orders")({
  beforeLoad: requireOwner,
  component: OrdersPage,
});

function formatTimeElapsed(createdAt: string) {
  const diff = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins === 1) return "1 min ago";
  return `${mins} mins ago`;
}

function formatOrderDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

function OrdersPage() {
  const { restaurantId } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("active");

  // Activate Realtime Socket.io Listener
  useOrdersRealtime();

  // Hook for active orders queue
  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    refetch: refetchOrders,
    isRefetching: isOrdersRefetching,
  } = useEmployeeOrders(restaurantId, "active");

  return (
    <DashboardLayout
      title="Orders Management"
      subtitle="Monitor your active restaurant order queue, review historical records, and configure physical geofencing setup."
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3 h-auto p-1">
          <TabsTrigger
            value="active"
            className="flex items-center justify-center gap-1.5 py-2 px-1 text-xs"
          >
            <ClipboardList className="h-3.5 w-3.5 shrink-0" />
            <span>
              Active <span className="hidden sm:inline">Orders</span> ({orders.length})
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="flex items-center justify-center gap-1.5 py-2 px-1 text-xs"
          >
            <History className="h-3.5 w-3.5 shrink-0" />
            <span>
              <span className="hidden sm:inline">Order </span>History
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="setup"
            className="flex items-center justify-center gap-1.5 py-2 px-1 text-xs"
          >
            <Sliders className="h-3.5 w-3.5 shrink-0" />
            <span>
              <span className="hidden sm:inline">Ordering </span>Setup
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Active Orders Tab */}
        <TabsContent value="active" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
              Live Order Queue
              {orders.length > 0 && (
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
              )}
            </h2>
            <button
              onClick={() => refetchOrders()}
              disabled={isOrdersLoading || isOrdersRefetching}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-secondary active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isOrdersRefetching ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {isOrdersLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-2xl bg-card p-6 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-muted-foreground">
                <ClipboardList className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">No Active Orders</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                There are currently no active orders being prepared or served. New orders placed by
                guests will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {orders.map((order) => {
                const step = order.currentStepKey;
                let stepLabel = step.toUpperCase();
                let stepClass = "bg-secondary text-secondary-foreground";

                if (step === "placed") {
                  stepLabel = "Placed";
                  stepClass =
                    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/30";
                } else if (step === "preparing") {
                  stepLabel = "Cooking";
                  stepClass =
                    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/30";
                } else if (step === "ready") {
                  stepLabel = "Ready";
                  stepClass =
                    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/30";
                } else if (step === "serving") {
                  stepLabel = "Serving";
                  stepClass =
                    "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/30";
                } else if (step === "completed") {
                  stepLabel = "Completed";
                  stepClass =
                    "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-700/30";
                }

                const isPaid = order.payment.status === "paid";
                const paymentLabel = isPaid ? "Paid" : "Unpaid";
                const paymentClass = isPaid
                  ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300";

                return (
                  <Card
                    key={order.id}
                    className="shadow-soft hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <CardHeader className="bg-secondary/10 p-4 border-b border-border/40 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-sm tracking-wide text-primary">
                          {order.orderNumber}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className={`font-semibold text-[10px] px-2 py-0.5 rounded-full ${paymentClass}`}
                          >
                            {paymentLabel}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`font-semibold text-[10px] px-2 py-0.5 rounded-full ${stepClass}`}
                          >
                            {stepLabel}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {order.table?.name || `Table ${order.table?._id}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeElapsed(order.createdAt)}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 flex-1 flex flex-col justify-between">
                      {/* Customer and Waiter details */}
                      <div className="mb-4 space-y-1 text-xs border-b border-border/30 pb-3">
                        {order.customer?.name && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <User className="h-3.5 w-3.5 text-primary/70" />
                            <span>
                              Guest:{" "}
                              <strong className="text-foreground">{order.customer.name}</strong>
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Utensils className="h-3.5 w-3.5 text-primary/70" />
                          <span>
                            Waiter:{" "}
                            <strong className="text-foreground">
                              {order.service?.waiter?.name || "Unassigned"}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {/* Items list */}
                      <div className="space-y-2 mb-4">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60 px-0.5">
                          Items ordered
                        </p>
                        <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-start text-xs border-b border-border/30 last:border-0 pb-1.5 last:pb-0"
                            >
                              <div className="space-y-0.5 pr-2">
                                <span className="font-semibold text-primary mr-1.5">
                                  {item.quantity}x
                                </span>
                                <span className="text-foreground/90 font-medium">{item.name}</span>
                                {item.notes && (
                                  <p className="text-[11px] text-muted-foreground italic leading-tight pl-5">
                                    "{item.notes}"
                                  </p>
                                )}
                              </div>
                              <span className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                                {formatCurrency(
                                  item.lineTotal || item.unitPrice * item.quantity,
                                  order.pricing.currency,
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer notes */}
                      {order.customerNotes && (
                        <div className="mb-4 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl text-xs text-amber-800 dark:text-amber-400 flex gap-1.5 items-start">
                          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold">Notes:</span> "{order.customerNotes}"
                          </div>
                        </div>
                      )}

                      {/* Summary */}
                      <div className="border-t border-border/40 pt-3 space-y-1.5 font-semibold text-xs">
                        {order.pricing.subtotal !== undefined &&
                          order.pricing.subtotal !== order.pricing.total && (
                            <div className="flex justify-between text-muted-foreground">
                              <span>Subtotal</span>
                              <span>
                                {formatCurrency(order.pricing.subtotal, order.pricing.currency)}
                              </span>
                            </div>
                          )}
                        {!!order.pricing.discount && (
                          <div className="flex justify-between text-success">
                            <span>Discount</span>
                            <span>
                              -{formatCurrency(order.pricing.discount, order.pricing.currency)}
                            </span>
                          </div>
                        )}
                        {!!order.pricing.tax && (
                          <div className="flex justify-between text-muted-foreground">
                            <span>Tax</span>
                            <span>{formatCurrency(order.pricing.tax, order.pricing.currency)}</span>
                          </div>
                        )}
                        {!!order.pricing.serviceCharge && (
                          <div className="flex justify-between text-muted-foreground">
                            <span>Service Charge</span>
                            <span>
                              {formatCurrency(order.pricing.serviceCharge, order.pricing.currency)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm pt-1 border-t border-border/20">
                          <span className="text-muted-foreground">Total</span>
                          <span className="font-bold font-mono text-foreground">
                            {formatCurrency(order.pricing.total, order.pricing.currency)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Order History Tab */}
        <TabsContent value="history" className="space-y-6">
          <OrderHistoryTab restaurantId={restaurantId} />
        </TabsContent>

        {/* Ordering Setup Tab */}
        <TabsContent value="setup" className="space-y-6">
          <OrderingSetupSection restaurantId={restaurantId} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

function OrderingSetupSection({ restaurantId }: { restaurantId: string | null }) {
  const [setupSubTab, setSetupSubTab] = useState<"workflow" | "location">("workflow");

  return (
    <div className="space-y-6">
      {/* Sub tabs navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setSetupSubTab("workflow")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            setupSubTab === "workflow"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <GitCommit className="h-4 w-4" />
          <span>Order Workflow Lifecycle</span>
        </button>

        <button
          type="button"
          onClick={() => setSetupSubTab("location")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            setupSubTab === "location"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span>Location & Geofencing</span>
        </button>
      </div>

      {setupSubTab === "workflow" ? (
        <OrderWorkflowEditor restaurantId={restaurantId} />
      ) : (
        <OrderingSettingsForm />
      )}
    </div>
  );
}

function OrderHistoryTab({ restaurantId }: { restaurantId: string | null }) {
  const [status, setStatus] = useState<"history" | "completed" | "cancelled" | "all">("history");
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Debounce search input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Query order history
  const {
    data: historyData,
    isLoading,
    refetch,
    isRefetching,
  } = useRestaurantOrderHistory(restaurantId, {
    status,
    search: debouncedSearch.trim() || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    limit,
    sort: "desc",
  });

  const orders = historyData?.orders || [];
  const pagination = historyData?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const totalOrders = pagination?.total || 0;

  const hasActiveFilters = Boolean(
    status !== "history" || search.trim() !== "" || startDate || endDate,
  );

  const handleClearFilters = () => {
    setStatus("history");
    setSearch("");
    setDebouncedSearch("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const startRecord = totalOrders === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalOrders);

  return (
    <div className="space-y-6">
      {/* Header with Title and Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Order History Records
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Search, filter, and inspect past orders served or cancelled at your restaurant.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-secondary active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer w-fit"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
          Refresh History
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-2xl shadow-soft p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by order #, guest, table..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-background text-xs rounded-xl"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status Selector */}
          <div>
            <Select
              value={status}
              onValueChange={(val: "history" | "completed" | "cancelled" | "all") => {
                setStatus(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 bg-background text-xs rounded-xl">
                <SelectValue placeholder="Status Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="history">All Completed & Cancelled</SelectItem>
                <SelectItem value="completed">Completed Only</SelectItem>
                <SelectItem value="cancelled">Cancelled Only</SelectItem>
                <SelectItem value="all">All Records (incl. Active)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="flex items-center gap-1.5 bg-background border border-input rounded-xl px-2.5 h-10 min-w-0">
            <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap shrink-0">
              From:
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full bg-transparent text-xs text-foreground focus:outline-none min-w-0"
            />
            {startDate && (
              <button
                onClick={() => {
                  setStartDate("");
                  setPage(1);
                }}
                className="text-muted-foreground hover:text-foreground shrink-0 p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* End Date */}
          <div className="flex items-center gap-1.5 bg-background border border-input rounded-xl px-2.5 h-10 min-w-0">
            <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap shrink-0">
              To:
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full bg-transparent text-xs text-foreground focus:outline-none min-w-0"
            />
            {endDate && (
              <button
                onClick={() => {
                  setEndDate("");
                  setPage(1);
                }}
                className="text-muted-foreground hover:text-foreground shrink-0 p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
            <span className="text-muted-foreground">Active filters applied</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-7 text-xs text-primary hover:text-primary/80 cursor-pointer"
            >
              Reset all filters
            </Button>
          </div>
        )}
      </div>

      {/* Orders Table / Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24 bg-card rounded-2xl border border-border">
          <Loader2 className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl bg-card p-6 text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-muted-foreground">
            <History className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">No Orders Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            {hasActiveFilters
              ? "No orders match your selected search or date criteria. Try adjusting or clearing your filters."
              : "No historical orders recorded yet for this restaurant."}
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="mt-2 text-xs"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl shadow-soft overflow-hidden">
          {/* Mobile Orders Card View (< md) */}
          <div className="md:hidden divide-y divide-border/40">
            {orders.map((order) => {
              const isPaid = order.payment?.status === "paid";
              const isCancelled = order.systemState === "CANCELLED";
              const isCompleted = order.systemState === "COMPLETED";

              let statusBadgeClass =
                "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/40 dark:text-gray-300";
              let statusLabel: string = order.systemState;

              if (isCancelled) {
                statusBadgeClass =
                  "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300";
                statusLabel = "Cancelled";
              } else if (isCompleted) {
                statusBadgeClass =
                  "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300";
                statusLabel = "Completed";
              } else {
                statusBadgeClass =
                  "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300";
                statusLabel = "Active (" + order.currentStepKey + ")";
              }

              const paymentBadgeClass = isPaid
                ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300"
                : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300";

              const totalItemsCount = order.items.reduce((acc, item) => acc + item.quantity, 0);

              return (
                <div
                  key={order.id}
                  className="p-4 space-y-3 hover:bg-secondary/10 transition-colors"
                >
                  {/* Card Top: Order #, Date, Status & Payment Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-primary">
                          #{order.orderNumber}
                        </span>
                        <span className="font-semibold text-xs text-foreground">
                          {order.table?.name || "Table Order"}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {formatOrderDate(order.createdAt)}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge
                        variant="outline"
                        className={`font-semibold text-[10px] px-2 py-0.5 rounded-full ${statusBadgeClass}`}
                      >
                        {statusLabel}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`font-semibold text-[10px] px-2 py-0.5 rounded-full ${paymentBadgeClass}`}
                      >
                        {isPaid ? "Paid" : "Unpaid"}
                      </Badge>
                    </div>
                  </div>

                  {/* Customer / Waiter if present */}
                  {(order.customer?.name || order.service?.waiter?.name) && (
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1 border-t border-border/20">
                      {order.customer?.name && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-primary/70" />
                          <span>
                            Guest:{" "}
                            <strong className="text-foreground">{order.customer.name}</strong>
                          </span>
                        </div>
                      )}
                      {order.service?.waiter?.name && (
                        <div className="flex items-center gap-1">
                          <Utensils className="h-3 w-3 text-primary/70" />
                          <span>
                            Waiter:{" "}
                            <strong className="text-foreground">{order.service.waiter.name}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Items summary */}
                  <div className="p-2.5 rounded-xl bg-secondary/30 border border-border/40 space-y-1">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70 flex justify-between">
                      <span>Items ({totalItemsCount})</span>
                      <span className="font-mono font-semibold text-foreground">
                        {formatCurrency(order.pricing?.total || 0, order.pricing?.currency)}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/90 line-clamp-2 leading-relaxed">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                    </p>
                  </div>

                  {/* Footer with Total and View Details Button */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs">
                      <span className="text-muted-foreground">Total: </span>
                      <span className="font-mono font-bold text-sm text-foreground">
                        {formatCurrency(order.pricing?.total || 0, order.pricing?.currency)}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                      className="h-8 px-3 text-xs text-primary border-primary/30 hover:bg-primary/10 gap-1.5 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-xs">Order #</TableHead>
                  <TableHead className="font-bold text-xs">Date & Time</TableHead>
                  <TableHead className="font-bold text-xs">Table / Guest</TableHead>
                  <TableHead className="font-bold text-xs">Items</TableHead>
                  <TableHead className="font-bold text-xs">Total</TableHead>
                  <TableHead className="font-bold text-xs">Payment</TableHead>
                  <TableHead className="font-bold text-xs">Status</TableHead>
                  <TableHead className="font-bold text-xs text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const isPaid = order.payment?.status === "paid";
                  const isCancelled = order.systemState === "CANCELLED";
                  const isCompleted = order.systemState === "COMPLETED";

                  let statusBadgeClass =
                    "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/40 dark:text-gray-300";
                  let statusLabel: string = order.systemState;

                  if (isCancelled) {
                    statusBadgeClass =
                      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300";
                    statusLabel = "Cancelled";
                  } else if (isCompleted) {
                    statusBadgeClass =
                      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300";
                    statusLabel = "Completed";
                  } else {
                    statusBadgeClass =
                      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300";
                    statusLabel = "Active (" + order.currentStepKey + ")";
                  }

                  const paymentBadgeClass = isPaid
                    ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300";

                  const totalItemsCount = order.items.reduce((acc, item) => acc + item.quantity, 0);

                  return (
                    <TableRow key={order.id} className="hover:bg-secondary/15 transition-colors">
                      <TableCell className="font-mono font-bold text-primary text-xs">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatOrderDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="font-medium text-foreground">
                          {order.table?.name || "Table Order"}
                        </div>
                        {order.customer?.name && (
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {order.customer.name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                        <span className="font-medium text-foreground">
                          {totalItemsCount} item{totalItemsCount !== 1 ? "s" : ""}
                        </span>
                        <p className="text-[11px] truncate text-muted-foreground/80">
                          {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                        </p>
                      </TableCell>
                      <TableCell className="text-xs font-mono font-bold text-foreground whitespace-nowrap">
                        {formatCurrency(order.pricing?.total || 0, order.pricing?.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`font-semibold text-[10px] px-2 py-0.5 rounded-full ${paymentBadgeClass}`}
                        >
                          {isPaid ? "Paid" : "Unpaid"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`font-semibold text-[10px] px-2 py-0.5 rounded-full ${statusBadgeClass}`}
                        >
                          {statusLabel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="h-8 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 border-t border-border/60 bg-secondary/10">
            <div className="text-xs text-muted-foreground text-center sm:text-left">
              Showing <span className="font-medium text-foreground">{startRecord}</span> to{" "}
              <span className="font-medium text-foreground">{endRecord}</span> of{" "}
              <span className="font-medium text-foreground">{totalOrders}</span> orders
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 px-3 text-xs gap-1 cursor-pointer flex-1 sm:flex-initial"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>

              <div className="text-xs font-semibold px-2 shrink-0">
                Page {page} of {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 px-3 text-xs gap-1 cursor-pointer flex-1 sm:flex-initial"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal Dialog */}
      {selectedOrder && (
        <OrderDetailsDialog
          order={selectedOrder}
          open={!!selectedOrder}
          onOpenChange={(open) => {
            if (!open) setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}

function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
}: {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isPaid = order.payment?.status === "paid";
  const isCancelled = order.systemState === "CANCELLED";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-base font-bold font-display flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              Order #{order.orderNumber}
            </DialogTitle>
            <Badge
              variant="outline"
              className={
                isCancelled
                  ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300"
                  : "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300"
              }
            >
              {order.systemState}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Placed on {formatOrderDate(order.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs pt-2">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-secondary/30 rounded-xl border border-border/40">
            <div>
              <span className="text-muted-foreground block text-[11px]">Table</span>
              <span className="font-semibold text-foreground">
                {order.table?.name || "Table Order"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Customer</span>
              <span className="font-semibold text-foreground">
                {order.customer?.name || "Guest"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Payment</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                {isPaid ? "Paid" : "Unpaid"}
                {order.payment?.method && ` (${order.payment.method})`}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Waiter</span>
              <span className="font-semibold text-foreground">
                {order.service?.waiter?.name || "Unassigned"}
              </span>
            </div>
          </div>

          {/* Cancellation Alert if applicable */}
          {isCancelled && order.cancellation && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-red-800 dark:text-red-400 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <XCircle className="h-4 w-4" />
                Cancelled Order
              </div>
              {order.cancellation.reason && (
                <p className="text-[11px]">
                  <strong>Reason:</strong> {order.cancellation.reason}
                </p>
              )}
              <p className="text-[11px] opacity-80">
                Cancelled on {formatOrderDate(order.cancellation.cancelledAt)}
                {order.cancellation.cancelledByRole && ` by ${order.cancellation.cancelledByRole}`}
              </p>
            </div>
          )}

          {/* Ordered Items */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
              Order Items ({order.items.length})
            </h4>
            <div className="border border-border/50 rounded-xl overflow-hidden divide-y divide-border/30">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">
                      <span className="font-bold text-primary mr-1">{item.quantity}x</span>
                      {item.name}
                    </div>
                    {item.notes && (
                      <p className="text-[11px] text-muted-foreground italic pl-4">
                        "{item.notes}"
                      </p>
                    )}
                  </div>
                  <span className="font-mono font-semibold text-foreground whitespace-nowrap">
                    {formatCurrency(
                      item.lineTotal || item.unitPrice * item.quantity,
                      order.pricing?.currency,
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="p-3 bg-secondary/20 rounded-xl border border-border/40 space-y-1.5 font-medium">
            {order.pricing?.subtotal !== undefined && (
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(order.pricing.subtotal, order.pricing.currency)}</span>
              </div>
            )}
            {!!order.pricing?.discount && (
              <div className="flex justify-between text-success">
                <span>Discount</span>
                <span>-{formatCurrency(order.pricing.discount, order.pricing.currency)}</span>
              </div>
            )}
            {!!order.pricing?.tax && (
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>{formatCurrency(order.pricing.tax, order.pricing.currency)}</span>
              </div>
            )}
            {!!order.pricing?.serviceCharge && (
              <div className="flex justify-between text-muted-foreground">
                <span>Service Charge</span>
                <span>{formatCurrency(order.pricing.serviceCharge, order.pricing.currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-foreground pt-1.5 border-t border-border/40">
              <span>Total</span>
              <span className="font-mono">
                {formatCurrency(order.pricing?.total || 0, order.pricing?.currency)}
              </span>
            </div>
          </div>

          {/* Timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/40">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Order Activity Timeline
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {order.timeline.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-[11px] text-muted-foreground"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <span className="font-medium text-foreground">{entry.action}</span>
                      {entry.note && <span className="text-muted-foreground"> - {entry.note}</span>}
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function OrderingSettingsForm() {
  const { restaurantId } = useAuth();

  // Queries & Mutations
  const { data: config, isLoading } = useOrderingConfig(restaurantId);
  const updateMutation = useUpdateOrderingConfig(restaurantId);

  // Form states
  const [enabled, setEnabled] = useState(false);
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [radius, setRadius] = useState<number>(100);

  // Geolocation capture states
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Sync form states with query data
  useEffect(() => {
    if (config) {
      setEnabled(config.orderingEnabled);
      setRadius(config.orderingRadiusMeters || 100);

      const coords = config.orderingLocation?.coordinates;
      if (coords && coords.length === 2) {
        // GeoJSON has [longitude, latitude]
        setLng(String(coords[0]));
        setLat(String(coords[1]));
      } else {
        setLng("");
        setLat("");
      }
    }
  }, [config]);

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsCapturing(true);
    setGpsAccuracy(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLat(latitude.toFixed(6));
        setLng(longitude.toFixed(6));
        setGpsAccuracy(accuracy);
        setIsCapturing(false);
        toast.success("Location captured successfully!");
      },
      (error) => {
        setIsCapturing(false);
        let errorMsg = "Unable to retrieve location.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg =
            "Location permission denied. Please enable location services in your browser settings.";
        }
        toast.error(errorMsg);
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const isCoordsEmpty = lat.trim() === "" || lng.trim() === "";

    // Guard: Prevent turning orderingEnabled ON if no location coordinates are set
    if (enabled && isCoordsEmpty) {
      toast.error("Set the restaurant ordering location before enabling ordering.");
      return;
    }

    const latitudeNum = lat.trim() !== "" ? Number(lat) : undefined;
    const longitudeNum = lng.trim() !== "" ? Number(lng) : undefined;

    if (
      latitudeNum !== undefined &&
      (isNaN(latitudeNum) || latitudeNum < -90 || latitudeNum > 90)
    ) {
      toast.error("Latitude must be a valid number between -90 and 90.");
      return;
    }

    if (
      longitudeNum !== undefined &&
      (isNaN(longitudeNum) || longitudeNum < -180 || longitudeNum > 180)
    ) {
      toast.error("Longitude must be a valid number between -180 and 180.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        latitude: latitudeNum,
        longitude: longitudeNum,
        orderingRadiusMeters: radius,
        orderingEnabled: enabled,
      });
      toast.success("Ordering settings saved successfully!");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        "Failed to update ordering settings.";
      toast.error(errorMsg);
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          className="max-w-2xl bg-card border border-border rounded-2xl shadow-soft p-6 sm:p-8 space-y-8"
        >
          {/* Geofenced ordering toggle switch */}
          <div className="flex items-start justify-between gap-4 p-4 bg-secondary/20 rounded-2xl border border-border/50">
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-base text-foreground flex items-center gap-2">
                Enable Customer Ordering
                {enabled && (
                  <span className="inline-flex h-2 w-2 rounded-full bg-success animate-pulse" />
                )}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                Turn on to let guests check into tables using QR codes and place orders. Customers
                must be physically located within the restaurant geofence radius.
              </p>
            </div>
            <div className="pt-1">
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>
          </div>

          {/* Location details */}
          <div className="space-y-5">
            <div>
              <h3 className="font-display font-semibold text-base text-foreground flex items-center gap-2 mb-1.5">
                <MapPin className="h-4.5 w-4.5 text-primary" />
                Restaurant Location Coordinates
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Provide the exact physical center coordinates of your dining area. Accurate
                coordinates ensure customer presence verification.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-0.5">
                  Latitude
                </label>
                <input
                  type="text"
                  required={enabled}
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-mono"
                  placeholder="e.g. 9.020000"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-0.5">
                  Longitude
                </label>
                <input
                  type="text"
                  required={enabled}
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-mono"
                  placeholder="e.g. 38.750000"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
              <button
                type="button"
                onClick={handleCaptureLocation}
                disabled={isCapturing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold hover:bg-secondary active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isCapturing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    Capturing GPS...
                  </>
                ) : (
                  <>
                    <Navigation className="h-3.5 w-3.5 text-primary" />
                    Use My Current Location
                  </>
                )}
              </button>

              {gpsAccuracy !== null && (
                <div className="text-xs text-muted-foreground flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/30">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                  Captured location accuracy:{" "}
                  <span className="font-semibold text-foreground font-mono">
                    ±{gpsAccuracy.toFixed(1)} m
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Ordering Radius Slider */}
          <div className="space-y-4 pt-2">
            <div>
              <h3 className="font-display font-semibold text-base text-foreground mb-1">
                Ordering Radius Limit
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The maximum distance (in meters) customers can be from the restaurant center point
                to place orders.
              </p>
            </div>

            <div className="bg-secondary/10 border border-border/50 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between font-mono">
                <span className="text-xs font-semibold text-muted-foreground">30 meters</span>
                <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-xl">
                  {radius} meters
                </span>
                <span className="text-xs font-semibold text-muted-foreground">200 meters</span>
              </div>
              <input
                type="range"
                min="30"
                max="200"
                step="5"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
              />
              <p className="text-[11px] text-muted-foreground text-center italic">
                Customers must check in within this physical radius. Values strictly enforced by
                server geofencing checks.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="h-px bg-border/50 pt-2" />
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 text-primary" />
              <span>Location changes immediately affect QR session verification checks.</span>
            </div>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-3 text-sm font-bold hover:bg-primary/95 transition-all shadow-warm active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Configuration...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </>
  );
}

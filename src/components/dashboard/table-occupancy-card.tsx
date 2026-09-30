import { useState, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Utensils,
  ArrowUpRight,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Loader2,
  Receipt,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTables } from "@/features/tables/hooks/tables.queries";
import { useEmployeeOrders } from "@/features/orders/hooks/orders.queries";
import { RestaurantTable } from "@/features/tables/types/table.types";
import { Order } from "@/features/orders/types/orders.types";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";

interface TableOccupancyCardProps {
  restaurantId: string | null;
}

export function TableOccupancyCard({ restaurantId }: TableOccupancyCardProps) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "taken" | "free">("all");
  const [selectedTable, setSelectedTable] = useState<{
    table: RestaurantTable;
    order: Order | null;
  } | null>(null);

  // Queries
  const { data: tables = [], isLoading: isTablesLoading } = useTables(restaurantId);
  const { data: activeOrders = [], isLoading: isOrdersLoading } = useEmployeeOrders(
    restaurantId,
    "active"
  );

  // Map active orders by table ID or table name/code
  const tableOrdersMap = useMemo(() => {
    const map = new Map<string, Order>();
    (activeOrders || []).forEach((order) => {
      if (order.table?._id) {
        map.set(order.table._id, order);
      } else if (order.table?.name || order.table?.code) {
        const matched = tables.find(
          (t) => t.name === order.table?.name || t.code === order.table?.code
        );
        if (matched) {
          map.set(matched.id, order);
        }
      }
    });
    return map;
  }, [activeOrders, tables]);

  // Table calculations
  const totalTables = tables.length;
  const activeTablesList = tables.filter((t) => t.isActive);
  const inactiveCount = tables.filter((t) => !t.isActive).length;

  const tablesWithStatus = useMemo(() => {
    return tables.map((table) => {
      const activeOrder = tableOrdersMap.get(table.id) || null;
      const activeSession = table.activeSession || null;
      // Taken if: has active order OR has fresh active session (< 15 mins)
      const hasFreshSession = Boolean(table.hasActiveSession && activeSession);
      const isTaken = Boolean(activeOrder) || hasFreshSession;

      return {
        table,
        activeOrder,
        activeSession,
        hasFreshSession,
        isTaken,
      };
    });
  }, [tables, tableOrdersMap]);

  const takenCount = tablesWithStatus.filter((t) => t.isTaken).length;
  const freeCount = activeTablesList.length - takenCount;
  const occupancyRate =
    activeTablesList.length > 0 ? Math.round((takenCount / activeTablesList.length) * 100) : 0;

  // Filtered tables for the grid
  const displayedTables = useMemo(() => {
    if (filter === "taken") {
      return tablesWithStatus.filter((t) => t.isTaken);
    }
    if (filter === "free") {
      return tablesWithStatus.filter((t) => !t.isTaken && t.table.isActive);
    }
    return tablesWithStatus;
  }, [tablesWithStatus, filter]);

  const isLoading = isTablesLoading || isOrdersLoading;

  return (
    <>
      <div className="rounded-2xl bg-card border border-border p-4 shadow-soft space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Utensils className="h-3.5 w-3.5" />
              </div>
              <h3 className="font-display font-bold text-sm text-foreground">
                Dining Room & Tables
              </h3>
            </div>
            <p className="text-[11px] text-muted-foreground">Live table occupancy</p>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
            <Link
              to="/tables"
              className="text-xs font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-0.5 transition-colors"
            >
              Floor <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Occupancy Rate Bar & Stat */}
        <div className="space-y-1.5 bg-secondary/20 rounded-xl p-2.5 border border-border/50">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-foreground font-mono text-xs">{occupancyRate}%</span>
              <span className="text-muted-foreground text-[11px]">Occupied</span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              <strong className="text-foreground font-semibold">{takenCount}</strong> of{" "}
              {activeTablesList.length} taken
            </div>
          </div>

          {/* Segmented Progress Bar */}
          <div className="h-1.5 w-full rounded-full bg-secondary/80 overflow-hidden flex">
            <div
              className="h-full bg-amber-500 transition-all duration-500 rounded-l-full"
              style={{
                width: `${activeTablesList.length > 0 ? (takenCount / activeTablesList.length) * 100 : 0}%`,
              }}
              title={`Taken: ${takenCount}`}
            />
            <div
              className="h-full bg-emerald-500 transition-all duration-500 rounded-r-full"
              style={{
                width: `${activeTablesList.length > 0 ? (freeCount / activeTablesList.length) * 100 : 0}%`,
              }}
              title={`Free: ${freeCount}`}
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-secondary/30 p-0.5 rounded-lg border border-border/40 text-[11px]">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "flex-1 py-0.5 px-1.5 rounded-md font-medium transition-all text-center cursor-pointer",
              filter === "all"
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All ({totalTables})
          </button>
          <button
            type="button"
            onClick={() => setFilter("taken")}
            className={cn(
              "flex-1 py-0.5 px-1.5 rounded-md font-medium transition-all flex items-center justify-center gap-1 text-center cursor-pointer",
              filter === "taken"
                ? "bg-background text-amber-700 dark:text-amber-300 shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
            Taken ({takenCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("free")}
            className={cn(
              "flex-1 py-0.5 px-1.5 rounded-md font-medium transition-all flex items-center justify-center gap-1 text-center cursor-pointer",
              filter === "free"
                ? "bg-background text-emerald-700 dark:text-emerald-300 shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
            Free ({freeCount})
          </button>
        </div>

        {/* Tables Mini Floor Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2 text-muted-foreground text-xs">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-[11px]">Loading tables...</span>
          </div>
        ) : totalTables === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 bg-secondary/20 rounded-xl border border-dashed border-border p-3">
            <Utensils className="h-5 w-5 text-muted-foreground/60" />
            <div>
              <p className="text-xs font-semibold text-foreground">No tables configured</p>
              <p className="text-[10px] text-muted-foreground max-w-xs">
                Add tables to track live floor status.
              </p>
            </div>
            <Link to="/tables">
              <Button size="sm" variant="outline" className="text-xs h-7 px-2.5">
                Setup Tables
              </Button>
            </Link>
          </div>
        ) : displayedTables.length === 0 ? (
          <div className="py-4 text-center text-xs text-muted-foreground">
            No tables match "{filter}".
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5 max-h-[220px] overflow-y-auto pr-0.5">
            {displayedTables.map(({ table, activeOrder, activeSession, hasFreshSession, isTaken }) => {
              const isInactive = !table.isActive;

              return (
                <div
                  key={table.id}
                  onClick={() => setSelectedTable({ table, order: activeOrder })}
                  title={`${table.name} (${table.code}) • ${
                    activeOrder
                      ? `Active Order • ${formatCurrency(activeOrder?.pricing.total, activeOrder?.pricing.currency)}`
                      : hasFreshSession
                      ? `Guest Seated (${activeSession?.minutesAgo || 0}m ago)`
                      : isInactive
                      ? "Closed"
                      : "Available"
                  }`}
                  className={cn(
                    "p-2 rounded-lg border transition-all text-left flex flex-col justify-between cursor-pointer",
                    isInactive
                      ? "bg-secondary/20 border-border/50 opacity-60 hover:opacity-100"
                      : activeOrder
                      ? "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60 shadow-2xs"
                      : hasFreshSession
                      ? "bg-sky-500/10 border-sky-500/30 hover:border-sky-500/60 shadow-2xs"
                      : "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/10"
                  )}
                >
                  {/* Top: Code & Status Dot */}
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono font-bold text-xs text-foreground truncate">
                      {table.code}
                    </span>

                    {isInactive ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                    ) : activeOrder ? (
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                    ) : hasFreshSession ? (
                      <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse shrink-0" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    )}
                  </div>

                  {/* Bottom: Compact status / amount */}
                  <div className="text-[10px] mt-1 truncate">
                    {activeOrder ? (
                      <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                        {formatCurrency(activeOrder.pricing.total, activeOrder.pricing.currency)}
                      </span>
                    ) : hasFreshSession ? (
                      <span className="font-semibold text-sky-700 dark:text-sky-300">Seated</span>
                    ) : isInactive ? (
                      <span className="text-muted-foreground/60">Closed</span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Free</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Summary / Quick Link */}
        <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>{takenCount} Taken</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>{freeCount} Free</span>
            </span>
            {inactiveCount > 0 && (
              <>
                <span>•</span>
                <span>{inactiveCount} Closed</span>
              </>
            )}
          </div>

          <Link
            to="/tables"
            className="font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
          >
            Floor Plan ➔
          </Link>
        </div>
      </div>

      {/* Selected Table Quick Detail Dialog */}
      {selectedTable && (
        <Dialog open={!!selectedTable} onOpenChange={(open) => !open && setSelectedTable(null)}>
          <DialogContent className="max-w-md w-[95vw] sm:w-full rounded-2xl p-5 space-y-4">
            <DialogHeader className="space-y-1 pb-2 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-lg border border-primary/20">
                    {selectedTable.table.code}
                  </span>
                  <DialogTitle className="text-base font-bold font-display text-foreground">
                    {selectedTable.table.name}
                  </DialogTitle>
                </div>
                {selectedTable.order ? (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs font-bold">
                    ● Order Active
                  </Badge>
                ) : selectedTable.table.hasActiveSession ? (
                  <Badge variant="outline" className="bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30 text-xs font-bold">
                    ● Guest Seated
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs font-semibold">
                    ● Available
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                {selectedTable.table.description || "Dining area table details"}
              </DialogDescription>
            </DialogHeader>

            {/* Table Details */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-secondary/30 border border-border/40">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Assigned Waiter</span>
                  <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                    <User className="h-3 w-3 text-primary" />
                    {selectedTable.table.assignedWaiter?.name || "Unassigned"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Status</span>
                  <span className="font-semibold text-foreground mt-0.5 block">
                    {selectedTable.table.isActive ? "Active on Floor" : "Inactive / Closed"}
                  </span>
                </div>
              </div>

              {/* If Order is active on this table */}
              {selectedTable.order ? (
                <div className="space-y-2.5 p-3.5 bg-amber-500/10 rounded-xl border border-amber-500/30">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-foreground text-xs">
                      Order #{selectedTable.order.orderNumber}
                    </span>
                    <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                      {selectedTable.order.currentStepKey}
                    </Badge>
                  </div>

                  {selectedTable.order.customer?.name && (
                    <p className="text-[11px] text-muted-foreground">
                      Guest: <strong className="text-foreground">{selectedTable.order.customer.name}</strong>
                    </p>
                  )}

                  {/* Items list preview */}
                  <div className="border-t border-amber-500/20 pt-2 space-y-1 max-h-28 overflow-y-auto pr-1">
                    {selectedTable.order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[11px]">
                        <span className="truncate">
                          <strong className="text-foreground mr-1">{item.quantity}x</strong>
                          {item.name}
                        </span>
                        <span className="font-mono text-muted-foreground shrink-0 ml-2">
                          {formatCurrency(item.lineTotal || item.unitPrice * item.quantity, selectedTable.order?.pricing.currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-amber-500/20 font-bold">
                    <span>Total Amount</span>
                    <span className="font-mono text-sm text-foreground">
                      {formatCurrency(selectedTable.order.pricing.total, selectedTable.order.pricing.currency)}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    className="w-full text-xs font-bold gap-1 mt-2"
                    onClick={() => {
                      setSelectedTable(null);
                      navigate({ to: "/orders" });
                    }}
                  >
                    <span>View in Live Order Queue</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : selectedTable.table.hasActiveSession && selectedTable.table.activeSession ? (
                <div className="p-3.5 bg-sky-500/10 rounded-xl border border-sky-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-sky-500" />
                      Guest Seated (Browsing Menu)
                    </span>
                    <Badge variant="secondary" className="text-[10px] text-sky-700 dark:text-sky-300">
                      {selectedTable.table.activeSession.minutesAgo || 0}m active
                    </Badge>
                  </div>
                  {selectedTable.table.activeSession.customer?.name && (
                    <p className="text-[11px] text-muted-foreground">
                      Customer: <strong className="text-foreground">{selectedTable.table.activeSession.customer.name}</strong>
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Guest scanned table QR code and has an active ordering session. If no order is placed within 15 minutes, this session automatically expires and the table is released.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs h-8"
                    onClick={() => {
                      setSelectedTable(null);
                      navigate({ to: "/tables" });
                    }}
                  >
                    View Table Settings
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 text-center space-y-2">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
                  <p className="font-semibold text-xs text-foreground">Table is currently free</p>
                  <p className="text-[11px] text-muted-foreground">
                    Guests can scan this table's QR code to check in and place their order.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8"
                    onClick={() => {
                      setSelectedTable(null);
                      navigate({ to: "/tables" });
                    }}
                  >
                    Manage Table Settings
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

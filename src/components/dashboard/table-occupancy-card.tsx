import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronLeft, ChevronRight, Utensils, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTables } from "@/features/tables/hooks/tables.queries";
import { useEmployeeOrders } from "@/features/orders/hooks/orders.queries";
import type { RestaurantTable } from "@/features/tables/types/table.types";
import type { Order } from "@/features/orders/types/orders.types";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";

type Status = "available" | "seated" | "ordering" | "closed";
type Filter = "all" | Status;
const statuses: Record<Status, { label: string; tone: string; surface: string; dot: string }> = {
  available: { label: "Available", tone: "text-emerald-700 dark:text-emerald-300", surface: "border-emerald-500/30 bg-emerald-500/10", dot: "bg-emerald-500" },
  seated: { label: "Seated", tone: "text-sky-700 dark:text-sky-300", surface: "border-sky-500/30 bg-sky-500/10", dot: "bg-sky-500" },
  ordering: { label: "Ordering", tone: "text-amber-700 dark:text-amber-300", surface: "border-amber-500/30 bg-amber-500/10", dot: "bg-amber-500" },
  closed: { label: "Closed", tone: "text-muted-foreground", surface: "border-border bg-muted/50", dot: "bg-muted-foreground" },
};
const filters: Filter[] = ["all", "available", "seated", "ordering", "closed"];

/** ID is authoritative. Legacy name/code fallbacks must match one table only. */
function matchTable(order: Order, tables: RestaurantTable[]) {
  if (order.table?._id) return tables.find((table) => table.id === order.table?._id);
  const code = order.table?.code;
  if (code) {
    const matches = tables.filter((table) => table.code === code);
    if (matches.length) return matches.length === 1 ? matches[0] : undefined;
  }
  const name = order.table?.name;
  if (!name) return undefined;
  const matches = tables.filter((table) => table.name === name);
  return matches.length === 1 ? matches[0] : undefined;
}

function TableSymbol({ name, status }: { name: string; status: Status }) {
  const style = statuses[status];
  // Decorative chairs indicate a table, not the real seating capacity.
  return (
    <span aria-hidden="true" className={cn("relative mx-auto block h-16 w-20 max-w-full shrink-0", style.tone)}>
      <span className="absolute left-3 top-0 h-2 w-5 rounded-t-lg border border-current opacity-30" />
      <span className="absolute right-3 top-0 h-2 w-5 rounded-t-lg border border-current opacity-30" />
      <span className="absolute bottom-0 left-3 h-2 w-5 rounded-b-lg border border-current opacity-30" />
      <span className="absolute bottom-0 right-3 h-2 w-5 rounded-b-lg border border-current opacity-30" />
      <span className={cn("absolute inset-x-0 inset-y-2.5 flex items-center justify-center rounded-xl border-2 px-1 text-xs font-semibold shadow-sm", style.surface)}>
        <span className="line-clamp-2 w-full break-words text-center leading-tight">{name}</span>
      </span>
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const style = statuses[status];
  return <Badge variant="outline" className={cn("gap-1.5 px-2.5 py-1 text-xs", style.surface, style.tone)}>
    <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />{style.label}
  </Badge>;
}

export function TableOccupancyCard({ restaurantId }: { restaurantId: string | null }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");
  // Store identity rather than a stale table/order snapshot.
  const [selection, setSelection] = useState<{ restaurantId: string | null; tableId: string } | null>(null);
  const tablesQuery = useTables(restaurantId);
  const ordersQuery = useEmployeeOrders(restaurantId, "active");
  const tables = tablesQuery.data;
  const orders = ordersQuery.data;
  const loading = tablesQuery.isLoading || ordersQuery.isLoading;
  const failed = tablesQuery.isError || ordersQuery.isError;
  const refreshing = tablesQuery.isFetching || ordersQuery.isFetching;
  const ready = Boolean(restaurantId) && !loading && !failed && tables !== undefined && orders !== undefined;

  const rows = useMemo(() => {
    const grouped = new Map<string, Order[]>();
    for (const order of orders ?? []) {
      const table = matchTable(order, tables ?? []);
      if (!table) continue;
      const group = grouped.get(table.id) ?? [];
      group.push(order);
      grouped.set(table.id, group);
    }
    return (tables ?? []).map((table) => {
      const tableOrders = grouped.get(table.id) ?? [];
      // Session expiry remains server-owned; minutesAgo is display-only.
      const session = table.hasActiveSession ? table.activeSession : null;
      const status: Status = !table.isActive ? "closed" : tableOrders.length ? "ordering" : session ? "seated" : "available";
      return { table, orders: tableOrders, session, status };
    }).sort((a, b) => a.table.code.localeCompare(b.table.code, undefined, { numeric: true }));
  }, [tables, orders]);

  const counts = { all: rows.length, available: 0, seated: 0, ordering: 0, closed: 0 };
  for (const row of rows) counts[row.status]++;
  const displayed = rows.filter(({ status }) => filter === "all" || status === filter);
  const pages = Array.from({ length: Math.ceil(displayed.length / 12) }, (_, index) => displayed.slice(index * 12, (index + 1) * 12));
  const pageCount = pages.length;
  useEffect(() => {
    // Restart on filters, restaurant changes, or a changed page count.
    trackRef.current?.scrollTo({ left: 0, behavior: "auto" });
    setPageIndex(0);
  }, [filter, restaurantId, pageCount, ready]);
  const currentPage = Math.min(pageIndex, Math.max(0, pageCount - 1));
  const goToPage = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const target = Math.max(0, Math.min(index, pageCount - 1));
    track.scrollTo({ left: target * track.clientWidth, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  const selected = selection && selection.restaurantId === restaurantId ? rows.find((row) => row.table.id === selection.tableId) : undefined;
  const retry = () => { void tablesQuery.refetch(); void ordersQuery.refetch(); };

  return (
    <section aria-label="Dining room table availability" className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
      

      <div className="min-w-0 space-y-4 p-3 sm:p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {([ ["Available", counts.available], ["Seated", counts.seated], ["Ordering", counts.ordering], ["Closed", counts.closed] ] as const).map(([label, count]) => (
            <div key={label} className="rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{ready ? count : "—"}</p>
            </div>
          ))}
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div role="group" aria-label="Filter tables by status" className="flex flex-wrap gap-1 rounded-xl bg-muted/40 p-1">
            {filters.map((value) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={cn("min-h-11 rounded-lg px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", filter === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/50 hover:text-foreground")}>
              {value !== "all" && <span aria-hidden="true" className={cn("mr-1.5 inline-block h-2 w-2 rounded-full", statuses[value].dot)} />}{value === "all" ? "All" : statuses[value].label}<span className="ml-1.5 tabular-nums opacity-70">{ready ? counts[value] : "—"}</span>
            </button>)}
          </div>
          
        </div>

        {!restaurantId ? <p className="py-8 text-center text-sm text-muted-foreground">Select a restaurant to view its tables.</p> : failed ? (
          <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-5"><p className="flex items-center gap-2 text-sm font-medium"><AlertCircle className="h-4 w-4" />Table status could not be loaded.</p><p className="mt-1 text-sm text-muted-foreground">Availability cannot be confirmed until both tables and orders load.</p><Button variant="outline" onClick={retry} disabled={refreshing} className="mt-3">Try again</Button></div>
        ) : !ready ? (
          <div role="status" aria-label="Loading tables" className="grid grid-cols-3 grid-rows-4 gap-2 sm:grid-cols-4 sm:grid-rows-3">{Array.from({ length: 12 }, (_, index) => <div aria-hidden="true" key={index} className="h-20 min-w-0 rounded-xl bg-muted motion-safe:animate-pulse" />)}<span className="sr-only">Loading tables…</span></div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center"><Utensils aria-hidden="true" className="mx-auto mb-3 h-7 w-7 text-muted-foreground" /><p className="font-medium">Your dining room starts here</p><p className="mt-1 text-sm text-muted-foreground">Add tables and assign waiters to see their activity.</p><Link to="/tables" className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">Set up tables</Link></div>
        ) : displayed.length === 0 ? (
          <div className="py-8 text-center"><p className="text-sm font-medium">No matching tables</p><p className="mt-1 text-sm text-muted-foreground">Try another status filter.</p><Button variant="ghost" onClick={() => setFilter("all")} className="mt-2">Clear filters</Button></div>
        ) : (
          <div className="min-w-0 space-y-2">
            <div
              ref={trackRef}
              role="region"
              aria-label="Restaurant tables, 12 per page. Swipe left for the next page."
              tabIndex={0}
              onScroll={(event) => {
                const track = event.currentTarget;
                if (track.clientWidth) setPageIndex(Math.round(track.scrollLeft / track.clientWidth));
              }}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return;
                if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                  event.preventDefault();
                  goToPage(currentPage + (event.key === "ArrowRight" ? 1 : -1));
                }
              }}
              className="flex min-w-0 w-full overflow-x-auto overscroll-x-contain snap-x snap-mandatory rounded-xl pb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {pages.map((page, index) => (
                <div key={index} role="group" aria-label={`Page ${index + 1} of ${pageCount}`} className="grid w-full min-w-0 shrink-0 basis-full snap-start snap-always grid-cols-3 grid-rows-4 gap-2 p-1 sm:grid-cols-4 sm:grid-rows-3">
                  {page.map(({ table, status }) => (
                    <button type="button" key={table.id} onFocus={(event) => {
                      // Keyboard focus should reveal the table's whole page.
                      if (event.currentTarget.matches(":focus-visible")) goToPage(index);
                    }} onClick={() => setSelection({ restaurantId, tableId: table.id })} aria-label={`${table.name}, ${statuses[status].label}. View details.`} title={table.name} className="flex h-20 min-w-0 items-center justify-center rounded-xl px-1 py-2 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
                      <TableSymbol name={table.name} status={status} />
                    </button>
                  ))}
                </div>
              ))}
            </div>
            {pageCount > 1 && <div className="flex items-center justify-between gap-2">
              <Button variant="ghost" size="sm" className="h-11 w-11 p-0" aria-label="Previous table page" disabled={currentPage === 0} onClick={() => goToPage(currentPage - 1)}><ChevronLeft aria-hidden="true" className="h-4 w-4" /></Button>
              <span role="status" className="text-xs tabular-nums text-muted-foreground">Page {currentPage + 1} of {pageCount}</span>
              <Button variant="ghost" size="sm" className="h-11 w-11 p-0" aria-label="Next table page" disabled={currentPage === pageCount - 1} onClick={() => goToPage(currentPage + 1)}><ChevronRight aria-hidden="true" className="h-4 w-4" /></Button>
            </div>}
          </div>
        )}
        <p className="border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">{ready && `${displayed.length ? currentPage * 12 + 1 : 0}–${Math.min((currentPage + 1) * 12, displayed.length)} of ${displayed.length} tables`}</p>
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelection(null); }}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto rounded-2xl">
          {selected && <>
            <DialogHeader className="pr-6"><DialogTitle className="text-xl">{selected.table.name} <span className="ml-1 font-mono text-sm text-muted-foreground">{selected.table.code}</span></DialogTitle><DialogDescription>{selected.table.description || "Table activity and assigned waiter"}</DialogDescription></DialogHeader>
            {!ready ? <p role="status" className="text-sm text-muted-foreground">{failed ? "Current status could not be confirmed. Refresh to try again." : "Loading current table status…"}</p> : <>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/40 p-4"><div><p className="text-xs text-muted-foreground">Assigned waiter</p><p className="mt-1 text-sm font-semibold">{selected.table.assignedWaiter?.name || "Unassigned"}</p></div><StatusBadge status={selected.status} /></div>
              {selected.status === "closed" && <p className="text-sm text-muted-foreground">This table is closed for seating. Any existing order activity is shown below.</p>}
              {selected.orders.map((order, index) => <article key={`${order.orderNumber}-${index}`} className="space-y-3 rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="text-sm font-semibold">Order #{order.orderNumber}</h4><Badge variant="secondary">{order.currentStepKey?.replace(/_/g, " ")}</Badge></div>
                {order.customer?.name && <p className="text-xs text-muted-foreground">Guest: {order.customer.name}</p>}
                <ul className="space-y-2 border-t border-border pt-3">{order.items.map((item, itemIndex) => <li key={itemIndex} className="flex justify-between gap-3 text-sm"><span className="min-w-0 break-words"><span className="mr-2 font-semibold">{item.quantity}×</span>{item.name}</span><span className="shrink-0 tabular-nums text-muted-foreground">{formatCurrency(item.lineTotal ?? item.unitPrice * item.quantity, order.pricing.currency)}</span></li>)}</ul>
                <p className="flex justify-between gap-3 border-t border-border pt-3 text-sm font-semibold"><span>Order total</span><span className="tabular-nums">{formatCurrency(order.pricing.total, order.pricing.currency)}</span></p>
              </article>)}
              {!selected.orders.length && selected.session && <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4"><p className="text-sm font-medium">Guest session active</p>{selected.session.customer?.name && <p className="mt-1 text-sm text-muted-foreground">{selected.session.customer.name}</p>}<p className="mt-2 text-xs text-muted-foreground">No active order is linked to this table. Session expiry is managed by the server.</p></div>}
              {!selected.orders.length && !selected.session && selected.status === "available" && <p className="rounded-xl bg-emerald-500/5 p-4 text-sm">No active orders or guest sessions. This table is available.</p>}
            </>}
            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              {ready && selected.orders.length > 0 && <Link to="/orders" onClick={() => setSelection(null)} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring">Open order queue<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>}
              <Link to="/tables" onClick={() => setSelection(null)} className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring">Table settings</Link>
            </div>
          </>}
        </DialogContent>
      </Dialog>
    </section>
  );
}

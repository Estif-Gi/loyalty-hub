import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useAuth, requireOwner } from "@/lib/auth";
import {
  useOrderingConfig,
  useUpdateOrderingConfig,
} from "@/features/ordering-settings/hooks/ordering-settings.queries";
import { useEmployeeOrders } from "@/features/orders/hooks/orders.queries";
import { formatCurrency } from "@/lib/formatCurrency";
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
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

function OrdersPage() {
  const { restaurantId } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("active");

  // Hook for orders queue
  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    refetch: refetchOrders,
    isRefetching: isOrdersRefetching,
  } = useEmployeeOrders(restaurantId, "active");

  return (
    <DashboardLayout
      title="Orders Management"
      subtitle="Monitor your active restaurant order queue and configure physical geofencing setup."
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Active Orders ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Sliders className="h-4 w-4" />
            Ordering Setup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {/* Header Actions */}
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
                There are currently no active orders being prepared or served. New orders placed by guests will appear here.
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
                  stepClass = "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/30";
                } else if (step === "preparing") {
                  stepLabel = "Cooking";
                  stepClass = "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/30";
                } else if (step === "ready") {
                  stepLabel = "Ready";
                  stepClass = "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/30";
                } else if (step === "serving") {
                  stepLabel = "Serving";
                  stepClass = "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/30";
                } else if (step === "completed") {
                  stepLabel = "Completed";
                  stepClass = "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-700/30";
                }

                const isPaid = order.payment.status === "paid";
                const paymentLabel = isPaid ? "Paid" : "Unpaid";
                const paymentClass = isPaid
                  ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300";

                return (
                  <Card key={order.id} className="shadow-soft hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                    <CardHeader className="bg-secondary/10 p-4 border-b border-border/40 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-sm tracking-wide text-primary">
                          {order.orderNumber}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className={`font-semibold text-[10px] px-2 py-0.5 rounded-full ${paymentClass}`}>
                            {paymentLabel}
                          </Badge>
                          <Badge variant="outline" className={`font-semibold text-[10px] px-2 py-0.5 rounded-full ${stepClass}`}>
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
                              Guest: <strong className="text-foreground">{order.customer.name}</strong>
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
                            <div key={idx} className="flex justify-between items-start text-xs border-b border-border/30 last:border-0 pb-1.5 last:pb-0">
                              <div className="space-y-0.5 pr-2">
                                <span className="font-semibold text-primary mr-1.5">
                                  {item.quantity}x
                                </span>
                                <span className="text-foreground/90 font-medium">
                                  {item.name}
                                </span>
                                {item.notes && (
                                  <p className="text-[11px] text-muted-foreground italic leading-tight pl-5">
                                    "{item.notes}"
                                  </p>
                                )}
                              </div>
                              <span className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                                {formatCurrency(item.lineTotal || item.unitPrice * item.quantity, order.pricing.currency)}
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
                        {order.pricing.subtotal !== undefined && order.pricing.subtotal !== order.pricing.total && (
                          <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span>{formatCurrency(order.pricing.subtotal, order.pricing.currency)}</span>
                          </div>
                        )}
                        {!!order.pricing.discount && (
                          <div className="flex justify-between text-success">
                            <span>Discount</span>
                            <span>-{formatCurrency(order.pricing.discount, order.pricing.currency)}</span>
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
                            <span>{formatCurrency(order.pricing.serviceCharge, order.pricing.currency)}</span>
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

        <TabsContent value="setup" className="space-y-6">
          <OrderingSettingsForm />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
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
                The maximum distance (in meters) customers can be from the restaurant center point to place orders.
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
                Customers must check in within this physical radius. Values strictly enforced by server geofencing checks.
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

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

let socket: Socket | null = null;

export function useOrdersRealtime() {
  const { token, restaurantId } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token || !restaurantId) return;

    const socketUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5001")
      .replace(/\/api\/?$/, "")
      .replace(/\/$/, "");

    socket = io(socketUrl, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
    });

    socket.on("connect", () => {
      // Backend automatically joins restaurant:<restaurantId> and orders:<restaurantId>
      // when authenticated as owner, but we can also emit joinRestaurant explicitly:
      socket?.emit("joinRestaurant", { restaurantId });
    });

    // When a customer places a new order
    socket.on("order:created", (order: any) => {
      queryClient.invalidateQueries({ queryKey: ["employee-orders", restaurantId] });
      toast.info(`🔔 New Order #${order.orderNumber} received!`, {
        description: `Table ${order.table?.name || "Order"} • Total: $${order.pricing?.total || 0}`,
      });
    });

    // When order status/step advances (e.g. cooking, served, completed)
    socket.on("order:updated", (_order: any) => {
      queryClient.invalidateQueries({ queryKey: ["employee-orders", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["restaurant-order-history", restaurantId] });
    });

    // When an order is cancelled
    socket.on("order:cancelled", (order: any) => {
      queryClient.invalidateQueries({ queryKey: ["employee-orders", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["restaurant-order-history", restaurantId] });
      toast.warning(`Order #${order.orderNumber} was cancelled.`);
    });

    // Bulk invalidation signal
    socket.on("orders:invalidate", () => {
      queryClient.invalidateQueries({ queryKey: ["employee-orders", restaurantId] });
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [token, restaurantId, queryClient]);
}

import { useQuery } from "@tanstack/react-query";
import {
  getEmployeeOrders,
  getRestaurantOrderHistory,
  GetOrderHistoryParams,
} from "../api/orders.api";

export function useEmployeeOrders(restaurantId: string | null, status: "active" | "history" = "active") {
  return useQuery({
    queryKey: ["employee-orders", restaurantId, status],
    queryFn: () => getEmployeeOrders(restaurantId!, status),
    enabled: !!restaurantId,
    refetchInterval: false, // Updated via WebSocket in real-time
  });
}

export function useRestaurantOrderHistory(
  restaurantId: string | null,
  params: GetOrderHistoryParams = {}
) {
  return useQuery({
    queryKey: ["restaurant-order-history", restaurantId, params],
    queryFn: () => getRestaurantOrderHistory(restaurantId!, params),
    enabled: !!restaurantId,
  });
}

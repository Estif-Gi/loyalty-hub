import { useQuery } from "@tanstack/react-query";
import { getEmployeeOrders } from "../api/orders.api";

export function useEmployeeOrders(restaurantId: string | null, status: "active" | "history" = "active") {
  return useQuery({
    queryKey: ["employee-orders", restaurantId, status],
    queryFn: () => getEmployeeOrders(restaurantId!, status),
    enabled: !!restaurantId,
    refetchInterval: status === "active" ? 10000 : undefined, // Poll active orders queue every 10s
  });
}

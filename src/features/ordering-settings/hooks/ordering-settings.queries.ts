import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrderingConfig,
  updateOrderingConfig,
  UpdateOrderingConfigPayload,
} from "../api/ordering-settings.api";

export function useOrderingConfig(restaurantId: string | null) {
  return useQuery({
    queryKey: ["ordering-settings", restaurantId],
    queryFn: () => getOrderingConfig(restaurantId!),
    enabled: !!restaurantId,
  });
}

export function useUpdateOrderingConfig(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateOrderingConfigPayload) =>
      updateOrderingConfig(restaurantId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordering-settings", restaurantId] });
    },
  });
}

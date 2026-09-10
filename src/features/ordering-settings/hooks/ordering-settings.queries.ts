import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrderingConfig,
  updateOrderingConfig,
  UpdateOrderingConfigPayload,
  getRestaurantWorkflow,
  updateRestaurantWorkflow,
} from "../api/ordering-settings.api";
import { UpdateWorkflowPayload } from "../types/workflow.types";

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

export function useRestaurantWorkflow(restaurantId: string | null) {
  return useQuery({
    queryKey: ["restaurant-workflow", restaurantId],
    queryFn: () => getRestaurantWorkflow(restaurantId!),
    enabled: !!restaurantId,
  });
}

export function useUpdateRestaurantWorkflow(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateWorkflowPayload) =>
      updateRestaurantWorkflow(restaurantId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-workflow", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["employee-orders"] });
      queryClient.invalidateQueries({ queryKey: ["restaurant-order-history"] });
    },
  });
}

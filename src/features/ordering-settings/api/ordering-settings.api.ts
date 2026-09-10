import api from "@/lib/api";
import { OrderingConfiguration } from "../types/ordering-settings.types";
import {
  RestaurantWorkflowResponse,
  UpdateWorkflowPayload,
} from "../types/workflow.types";

export interface UpdateOrderingConfigPayload {
  latitude?: number;
  longitude?: number;
  orderingRadiusMeters?: number;
  orderingEnabled?: boolean;
}

export async function getOrderingConfig(restaurantId: string): Promise<OrderingConfiguration> {
  const response = await api.get(`/restaurants/${restaurantId}/ordering-config`);
  return response.data;
}

export async function updateOrderingConfig(
  restaurantId: string,
  payload: UpdateOrderingConfigPayload,
): Promise<OrderingConfiguration> {
  const response = await api.patch(`/restaurants/${restaurantId}/ordering-config`, payload);
  return response.data;
}

export async function getRestaurantWorkflow(
  restaurantId: string,
): Promise<RestaurantWorkflowResponse> {
  const response = await api.get(`/restaurants/${restaurantId}/workflow`);
  return response.data;
}

export async function updateRestaurantWorkflow(
  restaurantId: string,
  payload: UpdateWorkflowPayload,
): Promise<RestaurantWorkflowResponse> {
  const response = await api.patch(`/restaurants/${restaurantId}/workflow`, payload);
  return response.data;
}

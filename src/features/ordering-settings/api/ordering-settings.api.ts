import api from "@/lib/api";
import { OrderingConfiguration } from "../types/ordering-settings.types";

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

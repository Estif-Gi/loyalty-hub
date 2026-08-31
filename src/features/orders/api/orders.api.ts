import api from "@/lib/api";
import { Order } from "../types/orders.types";

export interface GetOrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
  };
}

export async function getEmployeeOrders(
  restaurantId: string,
  status: "active" | "history" = "active"
): Promise<Order[]> {
  const response = await api.get<GetOrdersResponse>(
    `/employee/orders?status=${status}&restaurantId=${restaurantId}`
  );
  return response.data.data.orders;
}

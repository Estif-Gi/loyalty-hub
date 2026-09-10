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

export interface GetOrderHistoryParams {
  status?: "history" | "completed" | "cancelled" | "active" | "all";
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  tableId?: string;
  waiterId?: string;
  sort?: "desc" | "asc";
}

export interface GetOrderHistoryResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    filters: Record<string, any>;
  };
}

export async function getRestaurantOrderHistory(
  restaurantId: string,
  params: GetOrderHistoryParams = {}
): Promise<GetOrderHistoryResponse["data"]> {
  const response = await api.get<GetOrderHistoryResponse>(
    `/restaurants/${restaurantId}/orders/history`,
    { params }
  );
  return response.data.data;
}

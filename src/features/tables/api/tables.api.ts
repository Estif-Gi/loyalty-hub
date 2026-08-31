import api from "@/lib/api";
import { RestaurantTable } from "../types/table.types";

export interface CreateTablePayload {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateTablePayload {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface BulkAssignPayload {
  waiterId: string | null;
  tableIds: string[];
}

export async function getTables(restaurantId: string): Promise<RestaurantTable[]> {
  const response = await api.get(`/restaurants/${restaurantId}/tables`);
  // Normalize: Backend returns { success: true, data: [...] }
  return response.data?.data || [];
}

export async function createTable(
  restaurantId: string,
  payload: CreateTablePayload,
): Promise<RestaurantTable> {
  const response = await api.post(`/restaurants/${restaurantId}/tables`, payload);
  return response.data?.data;
}

export async function updateTable(
  restaurantId: string,
  tableId: string,
  payload: UpdateTablePayload,
): Promise<RestaurantTable> {
  const response = await api.patch(`/restaurants/${restaurantId}/tables/${tableId}`, payload);
  return response.data?.data;
}

export async function deactivateTable(
  restaurantId: string,
  tableId: string,
): Promise<RestaurantTable> {
  const response = await api.patch(`/restaurants/${restaurantId}/tables/${tableId}/deactivate`);
  return response.data?.data;
}

export async function activateTable(
  restaurantId: string,
  tableId: string,
): Promise<RestaurantTable> {
  const response = await api.patch(`/restaurants/${restaurantId}/tables/${tableId}/activate`);
  return response.data?.data;
}

export async function assignWaiterToTable(
  restaurantId: string,
  tableId: string,
  waiterId: string | null,
): Promise<RestaurantTable> {
  const response = await api.patch(`/restaurants/${restaurantId}/tables/${tableId}/waiter`, {
    waiterId,
  });
  return response.data?.data;
}

export async function bulkAssignTables(
  restaurantId: string,
  payload: BulkAssignPayload,
): Promise<{ success: boolean; message: string }> {
  const response = await api.patch(`/restaurants/${restaurantId}/table-assignments`, payload);
  return response.data;
}

export interface BulkCreateTablePayload {
  count: number;
  prefix: string;
  startNumber: number;
  description?: string;
}

export async function bulkCreateTables(
  restaurantId: string,
  payload: BulkCreateTablePayload,
): Promise<RestaurantTable[]> {
  const response = await api.post(`/restaurants/${restaurantId}/tables/bulk`, payload);
  return response.data?.data;
}

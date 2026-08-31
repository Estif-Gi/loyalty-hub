import api from "@/lib/api";
import { QrCodeMetadata, GeneratedQrResponse } from "../types/qr-code.types";

export async function generateTableQr(
  restaurantId: string,
  tableId: string,
): Promise<GeneratedQrResponse> {
  const response = await api.post(`/restaurants/${restaurantId}/tables/${tableId}/qr`);
  return response.data?.data;
}

export async function getTableQrMetadata(
  restaurantId: string,
  tableId: string,
): Promise<QrCodeMetadata[]> {
  const response = await api.get(`/restaurants/${restaurantId}/tables/${tableId}/qr`);
  return response.data?.data || [];
}

export async function rotateTableQr(
  restaurantId: string,
  tableId: string,
): Promise<GeneratedQrResponse> {
  const response = await api.patch(`/restaurants/${restaurantId}/tables/${tableId}/qr/rotate`);
  return response.data?.data;
}

export async function revokeTableQr(
  restaurantId: string,
  tableId: string,
  qrCodeId: string,
): Promise<{ success: boolean; message: string }> {
  const response = await api.patch(
    `/restaurants/${restaurantId}/tables/${tableId}/qr/${qrCodeId}/revoke`,
  );
  return response.data;
}

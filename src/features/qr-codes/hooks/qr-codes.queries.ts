import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTableQrMetadata,
  generateTableQr,
  rotateTableQr,
  revokeTableQr,
} from "../api/qr-codes.api";

export function useTableQrMetadata(restaurantId: string | null, tableId: string | null) {
  return useQuery({
    queryKey: ["table-qrs", restaurantId, tableId],
    queryFn: () => getTableQrMetadata(restaurantId!, tableId!),
    enabled: !!restaurantId && !!tableId,
  });
}

export function useGenerateTableQr(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tableId: string) => generateTableQr(restaurantId!, tableId),
    onSuccess: (_, tableId) => {
      queryClient.invalidateQueries({ queryKey: ["table-qrs", restaurantId, tableId] });
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
    },
  });
}

export function useRotateTableQr(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tableId: string) => rotateTableQr(restaurantId!, tableId),
    onSuccess: (_, tableId) => {
      queryClient.invalidateQueries({ queryKey: ["table-qrs", restaurantId, tableId] });
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
    },
  });
}

export function useRevokeTableQr(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tableId, qrCodeId }: { tableId: string; qrCodeId: string }) =>
      revokeTableQr(restaurantId!, tableId, qrCodeId),
    onSuccess: (_, { tableId }) => {
      queryClient.invalidateQueries({ queryKey: ["table-qrs", restaurantId, tableId] });
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
    },
  });
}

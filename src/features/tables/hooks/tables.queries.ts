import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTables,
  createTable,
  updateTable,
  deactivateTable,
  activateTable,
  assignWaiterToTable,
  bulkAssignTables,
  bulkCreateTables,
  CreateTablePayload,
  UpdateTablePayload,
  BulkAssignPayload,
  BulkCreateTablePayload,
} from "../api/tables.api";

export function useTables(restaurantId: string | null) {
  return useQuery({
    queryKey: ["tables", restaurantId],
    queryFn: () => getTables(restaurantId!),
    enabled: !!restaurantId,
  });
}

export function useCreateTable(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTablePayload) => createTable(restaurantId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
    },
  });
}

export function useUpdateTable(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tableId, payload }: { tableId: string; payload: UpdateTablePayload }) =>
      updateTable(restaurantId!, tableId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
    },
  });
}

export function useDeactivateTable(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tableId: string) => deactivateTable(restaurantId!, tableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["employees", restaurantId] });
    },
  });
}

export function useActivateTable(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tableId: string) => activateTable(restaurantId!, tableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
    },
  });
}

export function useAssignWaiter(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tableId, waiterId }: { tableId: string; waiterId: string | null }) =>
      assignWaiterToTable(restaurantId!, tableId, waiterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["employees", restaurantId] });
    },
  });
}

export function useBulkAssignTables(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkAssignPayload) => bulkAssignTables(restaurantId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["employees", restaurantId] });
    },
  });
}

export function useBulkCreateTables(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkCreateTablePayload) => bulkCreateTables(restaurantId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
    },
  });
}

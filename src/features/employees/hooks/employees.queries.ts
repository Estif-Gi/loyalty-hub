import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  CreateEmployeePayload,
  UpdateEmployeePayload,
} from "../api/employees.api";

export function useEmployees(restaurantId: string | null) {
  return useQuery({
    queryKey: ["employees", restaurantId],
    queryFn: () => getEmployees(restaurantId!),
    enabled: !!restaurantId,
  });
}

export function useCreateEmployee(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEmployeePayload) => createEmployee(restaurantId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", restaurantId] });
    },
  });
}

export function useUpdateEmployee(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, payload }: { employeeId: string; payload: UpdateEmployeePayload }) =>
      updateEmployee(restaurantId!, employeeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
    },
  });
}

export function useDeleteEmployee(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeId: string) => deleteEmployee(restaurantId!, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
    },
  });
}

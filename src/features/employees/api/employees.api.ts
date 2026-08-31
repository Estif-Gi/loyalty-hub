import api from "@/lib/api";
import { Employee, EmployeeRole } from "../types/employee.types";

export interface CreateEmployeePayload {
  name: string;
  password?: string;
  role: EmployeeRole;
}

export interface UpdateEmployeePayload {
  role?: EmployeeRole;
  isActive?: boolean;
}

export async function getEmployees(restaurantId: string): Promise<Employee[]> {
  const response = await api.get(`/restaurants/${restaurantId}/employees`);
  // The API returns { restaurantId, employees: [...] }
  return response.data?.employees || [];
}

export async function createEmployee(
  restaurantId: string,
  payload: CreateEmployeePayload,
): Promise<Employee> {
  const response = await api.post(`/restaurants/${restaurantId}/employees`, payload);
  return response.data;
}

export async function updateEmployee(
  restaurantId: string,
  employeeId: string,
  payload: UpdateEmployeePayload,
): Promise<Employee> {
  const response = await api.patch(`/restaurants/${restaurantId}/employees/${employeeId}`, payload);
  return response.data;
}

export async function deleteEmployee(
  restaurantId: string,
  employeeId: string,
): Promise<{ message: string }> {
  const response = await api.delete(`/restaurants/${restaurantId}/employees/${employeeId}`);
  return response.data;
}

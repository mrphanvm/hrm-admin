import api from './api';
import { Employee, CreateEmployeeDto, UpdateEmployeeDto, Position, CreatePositionDto } from '@/types/employee.types';
import { PaginatedResponse, PaginationParams } from '@/types/common.types';

export const employeeService = {
  getEmployees: async (params?: PaginationParams): Promise<PaginatedResponse<Employee>> => {
    const response = await api.get<PaginatedResponse<Employee>>('/employees', { params });
    return response.data;
  },

  getEmployee: async (id: string): Promise<Employee> => {
    const response = await api.get<Employee>(`/employees/${id}`);
    return response.data;
  },

  createEmployee: async (data: CreateEmployeeDto): Promise<Employee> => {
    const response = await api.post<Employee>('/employees', data);
    return response.data;
  },

  updateEmployee: async (id: string, data: UpdateEmployeeDto): Promise<Employee> => {
    const response = await api.put<Employee>(`/employees/${id}`, data);
    return response.data;
  },

  deleteEmployee: async (id: string): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },

  deleteEmployees: async (ids: string[]): Promise<void> => {
    await api.post('/employees/bulk-delete', { ids });
  },

  importEmployees: async (file: File): Promise<{ imported: number; failed: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/employees/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  exportEmployees: async (): Promise<Blob> => {
    const response = await api.get('/employees/export', { responseType: 'blob' });
    return response.data;
  },

  getPositions: async (): Promise<Position[]> => {
    const response = await api.get<Position[]>('/positions');
    return response.data;
  },

  createPosition: async (data: CreatePositionDto): Promise<Position> => {
    const response = await api.post<Position>('/positions', data);
    return response.data;
  },

  updatePosition: async (id: string, data: Partial<CreatePositionDto>): Promise<Position> => {
    const response = await api.put<Position>(`/positions/${id}`, data);
    return response.data;
  },

  deletePosition: async (id: string): Promise<void> => {
    await api.delete(`/positions/${id}`);
  },
};

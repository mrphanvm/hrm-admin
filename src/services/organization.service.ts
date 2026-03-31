import api from './api';
import { Organization, CreateOrganizationDto, UpdateOrganizationDto } from '@/types/organization.types';

export const organizationService = {
  getOrganizations: async (): Promise<Organization[]> => {
    const response = await api.get<Organization[]>('/organizations');
    return response.data;
  },

  getOrganizationTree: async (): Promise<Organization[]> => {
    const response = await api.get<Organization[]>('/organizations/tree');
    return response.data;
  },

  getOrganization: async (id: string): Promise<Organization> => {
    const response = await api.get<Organization>(`/organizations/${id}`);
    return response.data;
  },

  createOrganization: async (data: CreateOrganizationDto): Promise<Organization> => {
    const response = await api.post<Organization>('/organizations', data);
    return response.data;
  },

  updateOrganization: async (id: string, data: UpdateOrganizationDto): Promise<Organization> => {
    const response = await api.put<Organization>(`/organizations/${id}`, data);
    return response.data;
  },

  deleteOrganization: async (id: string): Promise<void> => {
    await api.delete(`/organizations/${id}`);
  },
};

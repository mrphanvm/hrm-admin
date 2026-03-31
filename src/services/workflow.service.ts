import api from './api';
import { Workflow, CreateWorkflowDto, UpdateWorkflowDto, RequestType } from '@/types/workflow.types';

export const workflowService = {
  getWorkflows: async (): Promise<Workflow[]> => {
    const response = await api.get<Workflow[]>('/workflows');
    return response.data;
  },

  getWorkflow: async (id: string): Promise<Workflow> => {
    const response = await api.get<Workflow>(`/workflows/${id}`);
    return response.data;
  },

  createWorkflow: async (data: CreateWorkflowDto): Promise<Workflow> => {
    const response = await api.post<Workflow>('/workflows', data);
    return response.data;
  },

  updateWorkflow: async (id: string, data: UpdateWorkflowDto): Promise<Workflow> => {
    const response = await api.put<Workflow>(`/workflows/${id}`, data);
    return response.data;
  },

  deleteWorkflow: async (id: string): Promise<void> => {
    await api.delete(`/workflows/${id}`);
  },

  activateWorkflow: async (id: string): Promise<Workflow> => {
    const response = await api.post<Workflow>(`/workflows/${id}/activate`);
    return response.data;
  },

  deactivateWorkflow: async (id: string): Promise<Workflow> => {
    const response = await api.post<Workflow>(`/workflows/${id}/deactivate`);
    return response.data;
  },

  cloneWorkflow: async (id: string): Promise<Workflow> => {
    const response = await api.post<Workflow>(`/workflows/${id}/clone`);
    return response.data;
  },

  getRequestTypes: async (): Promise<RequestType[]> => {
    const response = await api.get<RequestType[]>('/request-types');
    return response.data;
  },
};

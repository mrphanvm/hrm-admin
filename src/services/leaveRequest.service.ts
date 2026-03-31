import api from './api';
import { LeaveRequest, CreateLeaveRequestDto, LeaveType, ApproveLeaveRequestDto, RejectLeaveRequestDto } from '@/types/leaveRequest.types';
import { PaginatedResponse, PaginationParams } from '@/types/common.types';

export const leaveRequestService = {
  getLeaveRequests: async (params?: PaginationParams & { status?: string }): Promise<PaginatedResponse<LeaveRequest>> => {
    const response = await api.get<PaginatedResponse<LeaveRequest>>('/leave-requests', { params });
    return response.data;
  },

  getLeaveRequest: async (id: string): Promise<LeaveRequest> => {
    const response = await api.get<LeaveRequest>(`/leave-requests/${id}`);
    return response.data;
  },

  createLeaveRequest: async (data: CreateLeaveRequestDto): Promise<LeaveRequest> => {
    const response = await api.post<LeaveRequest>('/leave-requests', data);
    return response.data;
  },

  withdrawLeaveRequest: async (id: string): Promise<LeaveRequest> => {
    const response = await api.post<LeaveRequest>(`/leave-requests/${id}/withdraw`);
    return response.data;
  },

  getLeaveTypes: async (): Promise<LeaveType[]> => {
    const response = await api.get<LeaveType[]>('/leave-types');
    return response.data;
  },

  getPendingApprovals: async (): Promise<LeaveRequest[]> => {
    const response = await api.get<LeaveRequest[]>('/approvals/pending');
    return response.data;
  },

  approveRequest: async (id: string, data: ApproveLeaveRequestDto): Promise<void> => {
    await api.post(`/approvals/${id}/approve`, data);
  },

  rejectRequest: async (id: string, data: RejectLeaveRequestDto): Promise<void> => {
    await api.post(`/approvals/${id}/reject`, data);
  },

  getApprovalHistory: async (requestId: string) => {
    const response = await api.get(`/approvals/${requestId}/history`);
    return response.data;
  },
};

export type LeaveRequestStatus = 'DRAFT' | 'SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'WITHDRAWN';

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  allowanceDays: number;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName?: string;
  leaveTypeId: string;
  leaveTypeName?: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: LeaveRequestStatus;
  currentStep?: number;
  totalSteps?: number;
  approvals?: ApprovalRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalRecord {
  id: string;
  step: number;
  approverId: string;
  approverName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comment?: string;
  actionAt?: string;
}

export interface CreateLeaveRequestDto {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface ApproveLeaveRequestDto {
  comment?: string;
}

export interface RejectLeaveRequestDto {
  comment: string;
}

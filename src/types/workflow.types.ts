export type ApproverType = 'DIRECT_MANAGER' | 'DEPARTMENT_DIRECTOR' | 'HR' | 'FIXED_USER';

export interface WorkflowStep {
  id: string;
  order: number;
  name: string;
  approverType: ApproverType;
  approverUserId?: string;
  approverUserName?: string;
  isParallel: boolean;
  timeoutDays?: number;
}

export interface WorkflowCondition {
  id: string;
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'GREATER_THAN_OR_EQUAL' | 'LESS_THAN_OR_EQUAL' | 'CONTAINS';
  value: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  requestTypeId: string;
  requestTypeName?: string;
  steps: WorkflowStep[];
  conditions: WorkflowCondition[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowDto {
  name: string;
  description?: string;
  requestTypeId: string;
  steps: Omit<WorkflowStep, 'id'>[];
  conditions: Omit<WorkflowCondition, 'id'>[];
}

export interface UpdateWorkflowDto extends Partial<CreateWorkflowDto> {}

export interface RequestType {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

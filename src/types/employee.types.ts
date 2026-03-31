export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  organizationId: string;
  organizationName?: string;
  positionId: string;
  positionName?: string;
  managerId?: string;
  managerName?: string;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeDto {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  organizationId: string;
  positionId: string;
  managerId?: string;
  startDate: string;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {}

export interface Position {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CreatePositionDto {
  name: string;
  code: string;
  description?: string;
}

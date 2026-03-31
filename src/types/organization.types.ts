export interface Organization {
  id: string;
  name: string;
  code: string;
  type: OrgType;
  parentId?: string;
  parent?: Organization;
  children?: Organization[];
  managerId?: string;
  managerName?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export type OrgType = 'COMPANY' | 'CENTER' | 'DEPARTMENT' | 'TEAM';

export interface CreateOrganizationDto {
  name: string;
  code: string;
  type: OrgType;
  parentId?: string;
  managerId?: string;
  description?: string;
}

export interface UpdateOrganizationDto extends Partial<CreateOrganizationDto> {}

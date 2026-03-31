import { create } from 'zustand';
import { Organization } from '@/types/organization.types';
import { Position } from '@/types/employee.types';
import { LeaveType } from '@/types/leaveRequest.types';
import { RequestType } from '@/types/workflow.types';

interface AppState {
  organizations: Organization[];
  positions: Position[];
  leaveTypes: LeaveType[];
  requestTypes: RequestType[];
  sidebarCollapsed: boolean;
  setOrganizations: (orgs: Organization[]) => void;
  setPositions: (positions: Position[]) => void;
  setLeaveTypes: (types: LeaveType[]) => void;
  setRequestTypes: (types: RequestType[]) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  organizations: [],
  positions: [],
  leaveTypes: [],
  requestTypes: [],
  sidebarCollapsed: false,

  setOrganizations: (organizations) => set({ organizations }),
  setPositions: (positions) => set({ positions }),
  setLeaveTypes: (leaveTypes) => set({ leaveTypes }),
  setRequestTypes: (requestTypes) => set({ requestTypes }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));

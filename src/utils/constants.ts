export const APP_NAME = 'HRM Admin';

export const APPROVER_TYPE_LABELS: Record<string, string> = {
  DIRECT_MANAGER: 'Trưởng phòng trực tiếp',
  DEPARTMENT_DIRECTOR: 'Giám đốc phòng ban',
  HR: 'Nhân sự',
  FIXED_USER: 'Người cố định',
};

export const ORG_TYPE_LABELS: Record<string, string> = {
  COMPANY: 'Công ty',
  CENTER: 'Trung tâm',
  DEPARTMENT: 'Phòng ban',
  TEAM: 'Nhóm',
};

export const LEAVE_REQUEST_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Nháp',
  SUBMITTED: 'Đã nộp',
  PENDING: 'Đang chờ',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  CANCELLED: 'Đã hủy',
  WITHDRAWN: 'Đã rút',
};

export const LEAVE_REQUEST_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'default',
  SUBMITTED: 'processing',
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default',
  WITHDRAWN: 'default',
};

export const GENDER_LABELS: Record<string, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};

export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Không hoạt động',
  ON_LEAVE: 'Đang nghỉ phép',
};

export const PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];

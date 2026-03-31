import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import MainLayout from '@/components/Layout/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const EmployeePage = lazy(() => import('@/pages/employee/EmployeePage'));
const EmployeeDetailPage = lazy(() => import('@/pages/employee/EmployeeDetailPage'));
const OrganizationPage = lazy(() => import('@/pages/organization/OrganizationPage'));
const PositionPage = lazy(() => import('@/pages/position/PositionPage'));
const LeaveTypePage = lazy(() => import('@/pages/leaveType/LeaveTypePage'));
const LeaveRequestPage = lazy(() => import('@/pages/leaveRequest/LeaveRequestPage'));
const LeaveRequestDetailPage = lazy(() => import('@/pages/leaveRequest/LeaveRequestDetailPage'));
const ApprovalPage = lazy(() => import('@/pages/approval/ApprovalPage'));
const WorkflowPage = lazy(() => import('@/pages/workflow/WorkflowPage'));
const WorkflowBuilderPage = lazy(() => import('@/pages/workflow/WorkflowBuilderPage'));
const RequestTypePage = lazy(() => import('@/pages/requestType/RequestTypePage'));
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <Spin size="large" tip="Đang tải..." />
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="employees" element={<EmployeePage />} />
            <Route path="employees/:id" element={<EmployeeDetailPage />} />
            <Route path="organizations" element={<OrganizationPage />} />
            <Route path="positions" element={<PositionPage />} />
            <Route path="leave-types" element={<LeaveTypePage />} />
            <Route path="leave-requests" element={<LeaveRequestPage />} />
            <Route path="leave-requests/:id" element={<LeaveRequestDetailPage />} />
            <Route path="approvals" element={<ApprovalPage />} />
            <Route path="workflows" element={<WorkflowPage />} />
            <Route path="workflows/new" element={<WorkflowBuilderPage />} />
            <Route path="workflows/:id/edit" element={<WorkflowBuilderPage />} />
            <Route path="request-types" element={<RequestTypePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;

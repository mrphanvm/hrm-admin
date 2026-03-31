import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  ApartmentOutlined,
  ProfileOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  BarChartOutlined,
  SettingOutlined,
  NodeIndexOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/store/appStore';

const { Sider } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/employees', icon: <TeamOutlined />, label: 'Nhân viên' },
  { key: '/organizations', icon: <ApartmentOutlined />, label: 'Tổ chức' },
  { key: '/positions', icon: <ProfileOutlined />, label: 'Chức vụ' },
  {
    key: 'leave-management',
    icon: <CalendarOutlined />,
    label: 'Quản lý nghỉ phép',
    children: [
      { key: '/leave-types', icon: <UnorderedListOutlined />, label: 'Loại nghỉ phép' },
      { key: '/leave-requests', icon: <CalendarOutlined />, label: 'Đơn xin nghỉ' },
    ],
  },
  { key: '/approvals', icon: <CheckSquareOutlined />, label: 'Phê duyệt' },
  { key: '/workflows', icon: <NodeIndexOutlined />, label: 'Workflow' },
  { key: '/request-types', icon: <UnorderedListOutlined />, label: 'Loại yêu cầu' },
  { key: '/reports', icon: <BarChartOutlined />, label: 'Báo cáo' },
  { key: '/settings', icon: <SettingOutlined />, label: 'Cài đặt' },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  const getSelectedKey = () => {
    const path = location.pathname;
    for (const item of menuItems) {
      if ('children' in item && item.children) {
        const child = item.children.find((c) => path.startsWith(c.key));
        if (child) return [child.key];
      }
      if (path.startsWith(item.key)) return [item.key];
    }
    return ['/dashboard'];
  };

  const getOpenKeys = () => {
    const path = location.pathname;
    for (const item of menuItems) {
      if ('children' in item && item.children) {
        const child = item.children.find((c) => path.startsWith(c.key));
        if (child) return [item.key];
      }
    }
    return [];
  };

  return (
    <Sider
      collapsible
      collapsed={sidebarCollapsed}
      onCollapse={toggleSidebar}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 10,
      }}
      width={250}
    >
      <div className="flex items-center justify-center h-16 px-4">
        <span className="text-white font-bold text-lg">
          {sidebarCollapsed ? 'HRM' : '🏢 HRM Admin'}
        </span>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKey()}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
};

export default Sidebar;

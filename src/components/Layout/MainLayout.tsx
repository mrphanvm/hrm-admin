import React from 'react';
import { Layout, theme } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import { useAppStore } from '@/store/appStore';

const { Content } = Layout;

const MainLayout: React.FC = () => {
  const { sidebarCollapsed } = useAppStore();
  const { token } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout style={{ marginLeft: sidebarCollapsed ? 80 : 250, transition: 'all 0.2s' }}>
        <AppHeader />
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
        <AppFooter />
      </Layout>
    </Layout>
  );
};

export default MainLayout;

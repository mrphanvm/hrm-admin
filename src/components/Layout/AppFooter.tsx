import React from 'react';
import { Layout, Typography } from 'antd';

const { Footer } = Layout;
const { Text } = Typography;

const AppFooter: React.FC = () => {
  return (
    <Footer style={{ textAlign: 'center', background: '#f5f5f5' }}>
      <Text type="secondary">HRM Admin ©{new Date().getFullYear()} - Quản lý nhân sự</Text>
    </Footer>
  );
};

export default AppFooter;

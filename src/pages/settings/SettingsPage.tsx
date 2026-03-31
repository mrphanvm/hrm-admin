import React, { useState } from 'react';
import { Card, Form, Input, Button, Avatar, Typography, Tabs, message, Row, Col, Divider } from 'antd';
import { UserOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';

const { Title, Text } = Typography;

const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async () => {
    try {
      const values = await profileForm.validateFields();
      setSavingProfile(true);
      // Update profile via API
      await new Promise((resolve) => setTimeout(resolve, 800)); // simulated
      updateUser({ name: values.name });
      message.success('Cập nhật thông tin thành công');
    } catch {
      // validation errors handled by form
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error('Mật khẩu mới không khớp');
        return;
      }
      setSavingPassword(true);
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success('Đổi mật khẩu thành công');
      passwordForm.resetFields();
    } catch (error: any) {
      if (error?.response?.data?.message) message.error(error.response.data.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const tabItems = [
    {
      key: 'profile',
      label: <span><UserOutlined /> Hồ sơ cá nhân</span>,
      children: (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <Avatar size={80} icon={<UserOutlined />} src={user?.avatar} />
            <div>
              <Title level={5} style={{ margin: 0 }}>{user?.name}</Title>
              <Text type="secondary">{user?.email}</Text>
              <br />
              <Text type="secondary" className="text-xs">{user?.role}</Text>
            </div>
          </div>
          <Divider />
          <Form form={profileForm} layout="vertical" initialValues={{ name: user?.name, email: user?.email }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="name" label="Họ và tên" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="email" label="Email">
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveProfile} loading={savingProfile}>
              Lưu thông tin
            </Button>
          </Form>
        </div>
      ),
    },
    {
      key: 'password',
      label: <span><LockOutlined /> Đổi mật khẩu</span>,
      children: (
        <Form form={passwordForm} layout="vertical" style={{ maxWidth: 400 }}>
          <Form.Item name="currentPassword" label="Mật khẩu hiện tại" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="newPassword" label="Mật khẩu mới" rules={[
            { required: true, message: 'Bắt buộc' },
            { min: 6, message: 'Mật khẩu ít nhất 6 ký tự' },
          ]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="confirmPassword" label="Xác nhận mật khẩu mới" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleChangePassword} loading={savingPassword}>
            Đổi mật khẩu
          </Button>
        </Form>
      ),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>Cài đặt</Title>
      <Card>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default SettingsPage;

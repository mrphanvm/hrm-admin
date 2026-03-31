import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Space, Spin, Typography, Avatar, Tabs } from 'antd';
import { ArrowLeftOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import { employeeService } from '@/services/employee.service';
import { Employee } from '@/types/employee.types';
import { STATUS_LABELS, GENDER_LABELS } from '@/utils/constants';
import { formatDate } from '@/utils/formatters';

const { Title } = Typography;

const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      employeeService.getEmployee(id)
        .then(setEmployee)
        .catch(() => navigate('/employees'))
        .finally(() => setLoading(false));
    }
  }, [id, navigate]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;
  }

  if (!employee) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/employees')}>
          Quay lại
        </Button>
        <Title level={3} style={{ margin: 0 }}>Chi tiết nhân viên</Title>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-6">
          <Avatar size={80} icon={<UserOutlined />} src={employee.avatar} />
          <div>
            <Title level={4} style={{ margin: 0 }}>{employee.fullName || `${employee.firstName} ${employee.lastName}`}</Title>
            <Tag color={employee.status === 'ACTIVE' ? 'success' : 'default'}>
              {STATUS_LABELS[employee.status]}
            </Tag>
          </div>
          <div className="ml-auto">
            <Button type="primary" icon={<EditOutlined />}>Sửa</Button>
          </div>
        </div>

        <Tabs
          items={[
            {
              key: 'info',
              label: 'Thông tin cơ bản',
              children: (
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Mã nhân viên">{employee.employeeCode}</Descriptions.Item>
                  <Descriptions.Item label="Email">{employee.email}</Descriptions.Item>
                  <Descriptions.Item label="Họ tên">{employee.fullName || `${employee.firstName} ${employee.lastName}`}</Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">{employee.phone || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Giới tính">{employee.gender ? GENDER_LABELS[employee.gender] : '-'}</Descriptions.Item>
                  <Descriptions.Item label="Ngày sinh">{employee.dateOfBirth ? formatDate(employee.dateOfBirth) : '-'}</Descriptions.Item>
                  <Descriptions.Item label="Phòng ban">{employee.organizationName || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Chức vụ">{employee.positionName || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Quản lý trực tiếp">{employee.managerName || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Ngày vào làm">{formatDate(employee.startDate)}</Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ" span={2}>{employee.address || '-'}</Descriptions.Item>
                </Descriptions>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default EmployeeDetailPage;

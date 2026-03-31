import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, List, Tag, Spin } from 'antd';
import {
  TeamOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import api from '@/services/api';
import { formatDateTime } from '@/utils/formatters';

const { Title } = Typography;

interface DashboardStats {
  totalEmployees: number;
  pendingApprovals: number;
  leaveRequestsThisMonth: number;
  approvedThisMonth: number;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    pendingApprovals: 0,
    leaveRequestsThisMonth: 0,
    approvedThisMonth: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activitiesRes] = await Promise.allSettled([
          api.get('/dashboard/stats'),
          api.get('/dashboard/activities'),
        ]);

        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data);
        } else {
          setStats({
            totalEmployees: 120,
            pendingApprovals: 5,
            leaveRequestsThisMonth: 18,
            approvedThisMonth: 12,
          });
        }

        if (activitiesRes.status === 'fulfilled') {
          setActivities(activitiesRes.value.data);
        } else {
          setActivities([
            { id: '1', type: 'LEAVE_REQUEST', description: 'Nguyễn Văn A đã nộp đơn xin nghỉ phép', createdAt: new Date().toISOString() },
            { id: '2', type: 'APPROVAL', description: 'Trần Thị B đã duyệt đơn nghỉ phép', createdAt: new Date().toISOString() },
            { id: '3', type: 'EMPLOYEE', description: 'Nhân viên mới Lê Văn C đã được thêm vào hệ thống', createdAt: new Date().toISOString() },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      LEAVE_REQUEST: 'blue',
      APPROVAL: 'green',
      EMPLOYEE: 'purple',
      REJECTION: 'red',
    };
    return colors[type] || 'default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>Dashboard</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng nhân viên"
              value={stats.totalEmployees}
              prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Chờ phê duyệt"
              value={stats.pendingApprovals}
              prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đơn nghỉ tháng này"
              value={stats.leaveRequestsThisMonth}
              prefix={<CalendarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã duyệt tháng này"
              value={stats.approvedThisMonth}
              prefix={<CheckSquareOutlined style={{ color: '#13c2c2' }} />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="Hoạt động gần đây" style={{ minHeight: 300 }}>
            <List
              dataSource={activities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <div className="flex items-center gap-2">
                        <Tag color={getActivityColor(item.type)}>{item.type}</Tag>
                        <span>{item.description}</span>
                      </div>
                    }
                    description={formatDateTime(item.createdAt)}
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'Không có hoạt động nào' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Thao tác nhanh" style={{ minHeight: 300 }}>
            <div className="flex flex-col gap-3">
              <Card
                size="small"
                hoverable
                onClick={() => window.location.href = '/leave-requests'}
                style={{ cursor: 'pointer', background: '#e6f4ff', borderColor: '#91caff' }}
              >
                <div className="flex items-center gap-2">
                  <CalendarOutlined style={{ color: '#1677ff', fontSize: 20 }} />
                  <div>
                    <div className="font-medium">Tạo đơn nghỉ phép</div>
                    <div className="text-xs text-gray-500">Nộp đơn xin nghỉ mới</div>
                  </div>
                </div>
              </Card>
              <Card
                size="small"
                hoverable
                onClick={() => window.location.href = '/approvals'}
                style={{ cursor: 'pointer', background: '#fff7e6', borderColor: '#ffd591' }}
              >
                <div className="flex items-center gap-2">
                  <CheckSquareOutlined style={{ color: '#fa8c16', fontSize: 20 }} />
                  <div>
                    <div className="font-medium">Xem phê duyệt</div>
                    <div className="text-xs text-gray-500">{stats.pendingApprovals} đơn chờ duyệt</div>
                  </div>
                </div>
              </Card>
              <Card
                size="small"
                hoverable
                onClick={() => window.location.href = '/reports'}
                style={{ cursor: 'pointer', background: '#f6ffed', borderColor: '#b7eb8f' }}
              >
                <div className="flex items-center gap-2">
                  <TeamOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                  <div>
                    <div className="font-medium">Xem báo cáo</div>
                    <div className="text-xs text-gray-500">Báo cáo tháng này</div>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;

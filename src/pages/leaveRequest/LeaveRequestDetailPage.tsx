import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Space, Spin, Typography, Steps, Timeline, message } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { leaveRequestService } from '@/services/leaveRequest.service';
import { LeaveRequest, ApprovalRecord } from '@/types/leaveRequest.types';
import { LEAVE_REQUEST_STATUS_LABELS, LEAVE_REQUEST_STATUS_COLORS } from '@/utils/constants';
import { formatDate, formatDateTime } from '@/utils/formatters';

const { Title } = Typography;

const LeaveRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      leaveRequestService.getLeaveRequest(id)
        .then(setRequest)
        .catch(() => { message.error('Không tìm thấy đơn'); navigate('/leave-requests'); })
        .finally(() => setLoading(false));
    }
  }, [id, navigate]);

  if (loading) return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;
  if (!request) return null;

  const getStepStatus = (approval: ApprovalRecord) => {
    if (approval.status === 'APPROVED') return 'finish';
    if (approval.status === 'REJECTED') return 'error';
    return 'process';
  };

  const getStepIcon = (approval: ApprovalRecord) => {
    if (approval.status === 'APPROVED') return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    if (approval.status === 'REJECTED') return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    return <ClockCircleOutlined style={{ color: '#1677ff' }} />;
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/leave-requests')}>Quay lại</Button>
        <Title level={3} style={{ margin: 0 }}>Chi tiết đơn nghỉ phép</Title>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card title="Thông tin đơn">
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Nhân viên">{request.employeeName || '-'}</Descriptions.Item>
            <Descriptions.Item label="Loại nghỉ">{request.leaveTypeName || '-'}</Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu">{formatDate(request.startDate)}</Descriptions.Item>
            <Descriptions.Item label="Ngày kết thúc">{formatDate(request.endDate)}</Descriptions.Item>
            <Descriptions.Item label="Số ngày">{request.numberOfDays} ngày</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={LEAVE_REQUEST_STATUS_COLORS[request.status]}>
                {LEAVE_REQUEST_STATUS_LABELS[request.status]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Lý do" span={2}>{request.reason}</Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">{formatDateTime(request.createdAt)}</Descriptions.Item>
            <Descriptions.Item label="Cập nhật">{formatDateTime(request.updatedAt)}</Descriptions.Item>
          </Descriptions>
        </Card>

        {request.approvals && request.approvals.length > 0 && (
          <Card title="Chuỗi phê duyệt">
            <Steps
              direction="vertical"
              current={request.currentStep ? request.currentStep - 1 : 0}
              items={request.approvals.map((approval) => ({
                title: approval.approverName,
                description: (
                  <div>
                    <div>{approval.comment && <span className="text-gray-500">"{approval.comment}"</span>}</div>
                    {approval.actionAt && <div className="text-xs text-gray-400">{formatDateTime(approval.actionAt)}</div>}
                  </div>
                ),
                status: getStepStatus(approval),
                icon: getStepIcon(approval),
              }))}
            />
          </Card>
        )}
      </Space>
    </div>
  );
};

export default LeaveRequestDetailPage;

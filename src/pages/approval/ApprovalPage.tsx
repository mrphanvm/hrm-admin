import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Button, Space, Typography, Tag, message, Modal, Form, Input,
  Row, Col, Avatar, Divider, Empty, Spin, Badge
} from 'antd';
import {
  CheckOutlined, CloseOutlined, UserOutlined, CalendarOutlined,
  ClockCircleOutlined, ReloadOutlined
} from '@ant-design/icons';
import { leaveRequestService } from '@/services/leaveRequest.service';
import { LeaveRequest } from '@/types/leaveRequest.types';
import { formatDate } from '@/utils/formatters';

const { Title, Text } = Typography;

const ApprovalPage: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionModal, setActionModal] = useState<{ visible: boolean; request: LeaveRequest | null; action: 'approve' | 'reject' } | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const data = await leaveRequestService.getPendingApprovals();
      setPendingRequests(data);
    } catch {
      message.error('Lỗi khi tải danh sách phê duyệt');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleAction = async () => {
    if (!actionModal?.request) return;
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (actionModal.action === 'approve') {
        await leaveRequestService.approveRequest(actionModal.request.id, { comment: values.comment });
        message.success('Đã duyệt đơn thành công');
      } else {
        if (!values.comment) {
          message.warning('Vui lòng nhập lý do từ chối');
          return;
        }
        await leaveRequestService.rejectRequest(actionModal.request.id, { comment: values.comment });
        message.success('Đã từ chối đơn');
      }

      setActionModal(null);
      form.resetFields();
      fetchPending();
    } catch (error: any) {
      if (error?.response?.data?.message) message.error(error.response.data.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openActionModal = (request: LeaveRequest, action: 'approve' | 'reject') => {
    setActionModal({ visible: true, request, action });
    form.resetFields();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Title level={3} style={{ margin: 0 }}>Phê duyệt</Title>
          <Badge count={pendingRequests.length} style={{ backgroundColor: '#fa8c16' }} />
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchPending}>Làm mới</Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Spin size="large" /></div>
      ) : pendingRequests.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có đơn nào chờ phê duyệt"
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {pendingRequests.map((request) => (
            <Col xs={24} md={12} xl={8} key={request.id}>
              <Card
                style={{ borderLeft: '4px solid #1677ff', height: '100%' }}
                actions={[
                  <Button
                    key="approve"
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => openActionModal(request, 'approve')}
                    style={{ background: '#52c41a', borderColor: '#52c41a' }}
                  >
                    Duyệt
                  </Button>,
                  <Button
                    key="reject"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => openActionModal(request, 'reject')}
                  >
                    Từ chối
                  </Button>,
                ]}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar icon={<UserOutlined />} size="small" />
                    <Text strong>{request.employeeName || 'Nhân viên'}</Text>
                  </div>

                  <div className="flex items-center gap-1 text-sm">
                    <Tag color="blue">{request.leaveTypeName || 'Nghỉ phép'}</Tag>
                    <Text type="secondary">{request.numberOfDays} ngày</Text>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <CalendarOutlined />
                    <span>{formatDate(request.startDate)} → {formatDate(request.endDate)}</span>
                  </div>

                  {request.reason && (
                    <div className="text-sm bg-gray-50 p-2 rounded">
                      <Text type="secondary">Lý do: </Text>
                      <Text>{request.reason}</Text>
                    </div>
                  )}

                  {request.currentStep && request.totalSteps && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <ClockCircleOutlined />
                      <span>Bước {request.currentStep}/{request.totalSteps}</span>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={
          actionModal?.action === 'approve'
            ? '✅ Xác nhận phê duyệt'
            : '❌ Xác nhận từ chối'
        }
        open={actionModal?.visible}
        onCancel={() => { setActionModal(null); form.resetFields(); }}
        onOk={handleAction}
        confirmLoading={submitting}
        okText={actionModal?.action === 'approve' ? 'Phê duyệt' : 'Từ chối'}
        okType={actionModal?.action === 'reject' ? 'danger' : 'primary'}
        cancelText="Hủy"
      >
        {actionModal?.request && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <div><Text strong>Nhân viên: </Text><Text>{actionModal.request.employeeName}</Text></div>
            <div><Text strong>Loại nghỉ: </Text><Text>{actionModal.request.leaveTypeName}</Text></div>
            <div><Text strong>Ngày: </Text><Text>{formatDate(actionModal.request.startDate)} → {formatDate(actionModal.request.endDate)} ({actionModal.request.numberOfDays} ngày)</Text></div>
            <div><Text strong>Lý do: </Text><Text>{actionModal.request.reason}</Text></div>
          </div>
        )}
        <Form form={form} layout="vertical">
          <Form.Item
            name="comment"
            label={actionModal?.action === 'reject' ? 'Lý do từ chối *' : 'Nhận xét (không bắt buộc)'}
            rules={actionModal?.action === 'reject' ? [{ required: true, message: 'Vui lòng nhập lý do từ chối' }] : []}
          >
            <Input.TextArea rows={3} placeholder={actionModal?.action === 'reject' ? 'Nhập lý do từ chối...' : 'Nhập nhận xét...'} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ApprovalPage;

import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Space, Typography, Card, Tag, message, Select, DatePicker,
  Modal, Form, Input, Row, Col, Popconfirm, Tooltip
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EyeOutlined, StopOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { leaveRequestService } from '@/services/leaveRequest.service';
import { LeaveRequest, CreateLeaveRequestDto, LeaveType } from '@/types/leaveRequest.types';
import { LEAVE_REQUEST_STATUS_LABELS, LEAVE_REQUEST_STATUS_COLORS, PAGE_SIZE } from '@/utils/constants';
import { formatDate, calculateDays } from '@/utils/formatters';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const LeaveRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [dayCount, setDayCount] = useState(0);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await leaveRequestService.getLeaveRequests({
        page,
        limit: PAGE_SIZE,
        status: statusFilter,
      });
      setRequests(res.items);
      setTotal(res.total);
    } catch {
      message.error('Lỗi khi tải danh sách đơn nghỉ');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  useEffect(() => {
    leaveRequestService.getLeaveTypes()
      .then(setLeaveTypes)
      .catch(() => {
        setLeaveTypes([
          { id: '1', name: 'Nghỉ phép năm', code: 'ANNUAL', allowanceDays: 12, status: 'ACTIVE' },
          { id: '2', name: 'Nghỉ ốm', code: 'SICK', allowanceDays: 30, status: 'ACTIVE' },
          { id: '3', name: 'Nghỉ không lương', code: 'UNPAID', allowanceDays: 0, status: 'ACTIVE' },
        ]);
      });
  }, []);

  const handleWithdraw = async (id: string) => {
    try {
      await leaveRequestService.withdrawLeaveRequest(id);
      message.success('Rút đơn thành công');
      fetchRequests();
    } catch {
      message.error('Lỗi khi rút đơn');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const [startDate, endDate] = values.dateRange;
      const dto: CreateLeaveRequestDto = {
        leaveTypeId: values.leaveTypeId,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        reason: values.reason,
      };
      await leaveRequestService.createLeaveRequest(dto);
      message.success('Nộp đơn nghỉ phép thành công');
      setModalVisible(false);
      form.resetFields();
      setDayCount(0);
      fetchRequests();
    } catch (error: any) {
      if (error?.response?.data?.message) message.error(error.response.data.message);
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<LeaveRequest> = [
    {
      title: 'Nhân viên',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (name) => name || 'Tôi',
    },
    {
      title: 'Loại nghỉ',
      dataIndex: 'leaveTypeName',
      key: 'leaveTypeName',
      render: (v) => <Tag>{v || '-'}</Tag>,
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (d) => formatDate(d),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (d) => formatDate(d),
    },
    {
      title: 'Số ngày',
      dataIndex: 'numberOfDays',
      key: 'numberOfDays',
      render: (v) => `${v} ngày`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={LEAVE_REQUEST_STATUS_COLORS[status]}>
          {LEAVE_REQUEST_STATUS_LABELS[status] || status}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} size="small" onClick={() => navigate(`/leave-requests/${record.id}`)} />
          </Tooltip>
          {['DRAFT', 'SUBMITTED', 'PENDING'].includes(record.status) && (
            <Popconfirm
              title="Rút đơn?"
              description="Bạn có chắc muốn rút đơn này?"
              onConfirm={() => handleWithdraw(record.id)}
              okText="Rút"
              cancelText="Hủy"
              okType="danger"
            >
              <Tooltip title="Rút đơn">
                <Button icon={<StopOutlined />} size="small" danger />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Title level={3} style={{ margin: 0 }}>Đơn xin nghỉ phép</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchRequests}>Làm mới</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            Tạo đơn nghỉ
          </Button>
        </Space>
      </div>

      <Card>
        <div className="mb-4">
          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
            style={{ width: 200 }}
          >
            {Object.entries(LEAVE_REQUEST_STATUS_LABELS).map(([k, v]) => (
              <Option key={k} value={k}>{v}</Option>
            ))}
          </Select>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={requests}
          loading={loading}
          pagination={{
            total,
            current: page,
            pageSize: PAGE_SIZE,
            onChange: (p) => setPage(p),
            showTotal: (t) => `Tổng ${t} đơn`,
          }}
        />
      </Card>

      <Modal
        title="Tạo đơn xin nghỉ phép"
        open={modalVisible}
        onCancel={() => { setModalVisible(false); form.resetFields(); setDayCount(0); }}
        onOk={handleSubmit}
        confirmLoading={saving}
        okText="Nộp đơn"
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="leaveTypeId" label="Loại nghỉ phép" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Select placeholder="Chọn loại nghỉ phép">
              {leaveTypes.map((lt) => (
                <Option key={lt.id} value={lt.id}>
                  {lt.name} ({lt.allowanceDays > 0 ? `${lt.allowanceDays} ngày/năm` : 'Không giới hạn'})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="dateRange" label="Ngày nghỉ" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  const days = calculateDays(dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD'));
                  setDayCount(days);
                } else {
                  setDayCount(0);
                }
              }}
            />
          </Form.Item>

          {dayCount > 0 && (
            <div className="mb-4 p-2 bg-blue-50 rounded text-blue-700">
              Tổng số ngày nghỉ: <strong>{dayCount} ngày</strong>
            </div>
          )}

          <Form.Item name="reason" label="Lý do" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input.TextArea rows={4} placeholder="Nhập lý do xin nghỉ..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LeaveRequestPage;

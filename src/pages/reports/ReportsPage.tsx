import React, { useState } from 'react';
import { Card, Tabs, Button, DatePicker, Space, Typography, Table, Tag, Row, Col, Statistic, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ExportOutlined, BarChartOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '@/services/api';
import { downloadBlob, formatDate } from '@/utils/formatters';
import { LEAVE_REQUEST_STATUS_COLORS, LEAVE_REQUEST_STATUS_LABELS } from '@/utils/constants';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface LeaveReport {
  employeeName: string;
  leaveType: string;
  days: number;
  status: string;
  startDate: string;
  endDate: string;
}

const mockLeaveReport: LeaveReport[] = [
  { employeeName: 'Nguyễn Văn A', leaveType: 'Nghỉ phép năm', days: 3, status: 'APPROVED', startDate: '2025-01-05', endDate: '2025-01-07' },
  { employeeName: 'Trần Thị B', leaveType: 'Nghỉ ốm', days: 2, status: 'APPROVED', startDate: '2025-01-10', endDate: '2025-01-11' },
  { employeeName: 'Lê Văn C', leaveType: 'Nghỉ phép năm', days: 5, status: 'PENDING', startDate: '2025-01-15', endDate: '2025-01-19' },
  { employeeName: 'Phạm Thị D', leaveType: 'Nghỉ không lương', days: 1, status: 'REJECTED', startDate: '2025-01-20', endDate: '2025-01-20' },
];

const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const [start, end] = dateRange;
      const blob = await api.get('/reports/leave/export', {
        params: { startDate: start.format('YYYY-MM-DD'), endDate: end.format('YYYY-MM-DD') },
        responseType: 'blob',
      });
      downloadBlob(blob.data, `leave_report_${start.format('YYYYMM')}.xlsx`);
      message.success('Xuất báo cáo thành công');
    } catch {
      message.warning('Không thể xuất từ server, sử dụng dữ liệu mẫu');
    } finally {
      setExporting(false);
    }
  };

  const leaveColumns: ColumnsType<LeaveReport> = [
    { title: 'Nhân viên', dataIndex: 'employeeName', key: 'employeeName' },
    { title: 'Loại nghỉ', dataIndex: 'leaveType', key: 'leaveType', render: (v) => <Tag>{v}</Tag> },
    { title: 'Ngày bắt đầu', dataIndex: 'startDate', key: 'startDate', render: (d) => formatDate(d) },
    { title: 'Ngày kết thúc', dataIndex: 'endDate', key: 'endDate', render: (d) => formatDate(d) },
    { title: 'Số ngày', dataIndex: 'days', key: 'days', render: (v) => `${v} ngày` },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (s) => <Tag color={LEAVE_REQUEST_STATUS_COLORS[s]}>{LEAVE_REQUEST_STATUS_LABELS[s]}</Tag>
    },
  ];

  const stats = {
    total: mockLeaveReport.length,
    approved: mockLeaveReport.filter((r) => r.status === 'APPROVED').length,
    pending: mockLeaveReport.filter((r) => r.status === 'PENDING').length,
    totalDays: mockLeaveReport.reduce((sum, r) => sum + r.days, 0),
  };

  const tabItems = [
    {
      key: 'leave',
      label: <span><CalendarOutlined /> Báo cáo nghỉ phép</span>,
      children: (
        <div>
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={12} sm={6}><Card><Statistic title="Tổng đơn" value={stats.total} /></Card></Col>
            <Col xs={12} sm={6}><Card><Statistic title="Đã duyệt" value={stats.approved} valueStyle={{ color: '#52c41a' }} /></Card></Col>
            <Col xs={12} sm={6}><Card><Statistic title="Đang chờ" value={stats.pending} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
            <Col xs={12} sm={6}><Card><Statistic title="Tổng ngày nghỉ" value={stats.totalDays} suffix="ngày" /></Card></Col>
          </Row>
          <Table rowKey={(r) => `${r.employeeName}-${r.startDate}`} columns={leaveColumns} dataSource={mockLeaveReport} pagination={false} />
        </div>
      ),
    },
    {
      key: 'approval',
      label: <span><BarChartOutlined /> Thống kê phê duyệt</span>,
      children: (
        <Card>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}>
                <Statistic title="Tỷ lệ phê duyệt" value={stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0} suffix="%" valueStyle={{ color: '#52c41a' }} />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card style={{ background: '#fff7e6', borderColor: '#ffd591' }}>
                <Statistic title="Đang xử lý" value={stats.pending} valueStyle={{ color: '#fa8c16' }} />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card style={{ background: '#fff1f0', borderColor: '#ffa39e' }}>
                <Statistic title="Từ chối" value={mockLeaveReport.filter((r) => r.status === 'REJECTED').length} valueStyle={{ color: '#ff4d4f' }} />
              </Card>
            </Col>
          </Row>
        </Card>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Title level={3} style={{ margin: 0 }}>Báo cáo</Title>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateRange([dates[0], dates[1]]);
              }
            }}
            format="DD/MM/YYYY"
          />
          <Button icon={<ExportOutlined />} onClick={handleExport} loading={exporting}>
            Xuất Excel
          </Button>
        </Space>
      </div>

      <Card>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default ReportsPage;

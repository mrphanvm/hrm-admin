import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Space, Input, Select, Tag, Typography, Row, Col, Card,
  Modal, Form, DatePicker, message, Upload, Tooltip, Popconfirm
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  ImportOutlined, ExportOutlined, EyeOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { employeeService } from '@/services/employee.service';
import { organizationService } from '@/services/organization.service';
import { Employee, CreateEmployeeDto } from '@/types/employee.types';
import { Organization } from '@/types/organization.types';
import { Position } from '@/types/employee.types';
import { GENDER_LABELS, STATUS_LABELS, PAGE_SIZE } from '@/utils/constants';
import { formatDate, downloadBlob } from '@/utils/formatters';

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

const EmployeePage: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employeeService.getEmployees({ page, limit: PAGE_SIZE, search });
      setEmployees(res.items);
      setTotal(res.total);
    } catch {
      message.error('Lỗi khi tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    Promise.all([
      organizationService.getOrganizations(),
      employeeService.getPositions(),
    ]).then(([orgs, pos]) => {
      setOrganizations(orgs);
      setPositions(pos);
    }).catch(() => {});
  }, []);

  const handleOpenModal = (employee?: Employee) => {
    setEditingEmployee(employee || null);
    if (employee) {
      form.setFieldsValue({
        ...employee,
        dateOfBirth: employee.dateOfBirth ? dayjs(employee.dateOfBirth) : null,
        startDate: employee.startDate ? dayjs(employee.startDate) : null,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const data: CreateEmployeeDto = {
        ...values,
        dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD'),
        startDate: values.startDate?.format('YYYY-MM-DD'),
      };

      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee.id, data);
        message.success('Cập nhật nhân viên thành công');
      } else {
        await employeeService.createEmployee(data);
        message.success('Thêm nhân viên thành công');
      }
      setModalVisible(false);
      fetchEmployees();
    } catch (error: any) {
      if (error?.response?.data?.message) {
        message.error(error.response.data.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await employeeService.deleteEmployee(id);
      message.success('Xóa nhân viên thành công');
      fetchEmployees();
    } catch {
      message.error('Lỗi khi xóa nhân viên');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await employeeService.deleteEmployees(selectedRowKeys);
      message.success(`Đã xóa ${selectedRowKeys.length} nhân viên`);
      setSelectedRowKeys([]);
      fetchEmployees();
    } catch {
      message.error('Lỗi khi xóa nhân viên');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await employeeService.exportEmployees();
      downloadBlob(blob, 'employees.xlsx');
      message.success('Xuất file thành công');
    } catch {
      message.error('Lỗi khi xuất file');
    }
  };

  const columns: ColumnsType<Employee> = [
    {
      title: 'Mã NV',
      dataIndex: 'employeeCode',
      key: 'employeeCode',
      width: 100,
    },
    {
      title: 'Họ và tên',
      key: 'fullName',
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/employees/${record.id}`)} style={{ padding: 0 }}>
          {record.fullName || `${record.firstName} ${record.lastName}`}
        </Button>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phòng ban',
      dataIndex: 'organizationName',
      key: 'organizationName',
    },
    {
      title: 'Chức vụ',
      dataIndex: 'positionName',
      key: 'positionName',
    },
    {
      title: 'Ngày vào làm',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => formatDate(date),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap: Record<string, string> = {
          ACTIVE: 'success',
          INACTIVE: 'default',
          ON_LEAVE: 'warning',
        };
        return <Tag color={colorMap[status]}>{STATUS_LABELS[status] || status}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} size="small" onClick={() => navigate(`/employees/${record.id}`)} />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button icon={<EditOutlined />} size="small" onClick={() => handleOpenModal(record)} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa nhân viên?"
              description="Bạn có chắc muốn xóa nhân viên này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okType="danger"
            >
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Title level={3} style={{ margin: 0 }}>Quản lý nhân viên</Title>
        <Space>
          <Upload
            accept=".xlsx,.xls"
            showUploadList={false}
            beforeUpload={async (file) => {
              try {
                const result = await employeeService.importEmployees(file);
                message.success(`Nhập thành công ${result.imported} nhân viên`);
                fetchEmployees();
              } catch {
                message.error('Lỗi khi nhập file');
              }
              return false;
            }}
          >
            <Button icon={<ImportOutlined />}>Nhập Excel</Button>
          </Upload>
          <Button icon={<ExportOutlined />} onClick={handleExport}>Xuất Excel</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            Thêm nhân viên
          </Button>
        </Space>
      </div>

      <Card>
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} lg={8}>
            <Search
              placeholder="Tìm kiếm theo tên, mã NV, email..."
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSearch={() => { setPage(1); fetchEmployees(); }}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={fetchEmployees}>Làm mới</Button>
          </Col>
        </Row>

        {selectedRowKeys.length > 0 && (
          <div className="mb-4">
            <Space>
              <span>Đã chọn {selectedRowKeys.length} nhân viên</span>
              <Popconfirm
                title="Xóa nhân viên?"
                description={`Bạn có chắc muốn xóa ${selectedRowKeys.length} nhân viên?`}
                onConfirm={handleBulkDelete}
                okText="Xóa"
                cancelText="Hủy"
                okType="danger"
              >
                <Button danger>Xóa đã chọn</Button>
              </Popconfirm>
            </Space>
          </div>
        )}

        <Table
          rowKey="id"
          columns={columns}
          dataSource={employees}
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as string[]),
          }}
          pagination={{
            total,
            current: page,
            pageSize: PAGE_SIZE,
            onChange: (p) => setPage(p),
            showTotal: (t) => `Tổng ${t} nhân viên`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Modal
        title={editingEmployee ? 'Sửa nhân viên' : 'Thêm nhân viên'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
        confirmLoading={saving}
        width={700}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="employeeCode" label="Mã nhân viên" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Input placeholder="NV001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
                <Input placeholder="email@company.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="firstName" label="Họ" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastName" label="Tên" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="Giới tính">
                <Select placeholder="Chọn giới tính">
                  {Object.entries(GENDER_LABELS).map(([k, v]) => (
                    <Option key={k} value={k}>{v}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dateOfBirth" label="Ngày sinh">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="startDate" label="Ngày vào làm" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="organizationId" label="Phòng ban" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Select placeholder="Chọn phòng ban" showSearch optionFilterProp="children">
                  {organizations.map((org) => (
                    <Option key={org.id} value={org.id}>{org.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="positionId" label="Chức vụ" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Select placeholder="Chọn chức vụ" showSearch optionFilterProp="children">
                  {positions.map((pos) => (
                    <Option key={pos.id} value={pos.id}>{pos.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="address" label="Địa chỉ">
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeePage;

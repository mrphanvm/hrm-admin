import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Input, Typography, Card, Modal, Form, message, Tag, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { employeeService } from '@/services/employee.service';
import { Position, CreatePositionDto } from '@/types/employee.types';

const { Title } = Typography;
const { Search } = Input;

const PositionPage: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await employeeService.getPositions();
      setPositions(data);
      setFilteredPositions(data);
    } catch {
      message.error('Lỗi khi tải danh sách chức vụ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPositions(); }, [fetchPositions]);

  useEffect(() => {
    if (search) {
      setFilteredPositions(positions.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase())
      ));
    } else {
      setFilteredPositions(positions);
    }
  }, [search, positions]);

  const handleOpenModal = (position?: Position) => {
    setEditingPosition(position || null);
    if (position) form.setFieldsValue(position);
    else form.resetFields();
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields() as CreatePositionDto;
      setSaving(true);
      if (editingPosition) {
        await employeeService.updatePosition(editingPosition.id, values);
        message.success('Cập nhật thành công');
      } else {
        await employeeService.createPosition(values);
        message.success('Thêm thành công');
      }
      setModalVisible(false);
      fetchPositions();
    } catch (error: any) {
      if (error?.response?.data?.message) message.error(error.response.data.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await employeeService.deletePosition(id);
      message.success('Xóa thành công');
      fetchPositions();
    } catch {
      message.error('Lỗi khi xóa. Chức vụ có thể đang được sử dụng.');
    }
  };

  const columns: ColumnsType<Position> = [
    { title: 'Mã chức vụ', dataIndex: 'code', key: 'code', width: 150 },
    { title: 'Tên chức vụ', dataIndex: 'name', key: 'name' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description', render: (v) => v || '-' },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (status) => <Tag color={status === 'ACTIVE' ? 'success' : 'default'}>{status === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động'}</Tag>
    },
    {
      title: 'Thao tác', key: 'actions', width: 120,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleOpenModal(record)} />
          <Popconfirm
            title="Xóa chức vụ?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Title level={3} style={{ margin: 0 }}>Quản lý chức vụ</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>Thêm chức vụ</Button>
      </div>
      <Card>
        <div className="mb-4">
          <Search
            placeholder="Tìm kiếm chức vụ..."
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
          />
        </div>
        <Table rowKey="id" columns={columns} dataSource={filteredPositions} loading={loading} />
      </Card>

      <Modal
        title={editingPosition ? 'Sửa chức vụ' : 'Thêm chức vụ'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Mã chức vụ" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="name" label="Tên chức vụ" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PositionPage;

import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Typography, Card, Modal, Form, Input, InputNumber, message, Tag, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@/services/api';
import { LeaveType } from '@/types/leaveRequest.types';

const { Title } = Typography;

const LeaveTypePage: React.FC = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchLeaveTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<LeaveType[]>('/leave-types');
      setLeaveTypes(res.data);
    } catch {
      setLeaveTypes([
        { id: '1', name: 'Nghỉ phép năm', code: 'ANNUAL', allowanceDays: 12, status: 'ACTIVE' },
        { id: '2', name: 'Nghỉ ốm', code: 'SICK', allowanceDays: 30, status: 'ACTIVE' },
        { id: '3', name: 'Nghỉ không lương', code: 'UNPAID', allowanceDays: 0, status: 'ACTIVE' },
        { id: '4', name: 'Nghỉ lễ', code: 'HOLIDAY', allowanceDays: 11, status: 'ACTIVE' },
        { id: '5', name: 'Nghỉ tang', code: 'FUNERAL', allowanceDays: 3, status: 'ACTIVE' },
        { id: '6', name: 'Nghỉ thai sản', code: 'MATERNITY', allowanceDays: 180, status: 'ACTIVE' },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaveTypes(); }, [fetchLeaveTypes]);

  const handleOpenModal = (type?: LeaveType) => {
    setEditingType(type || null);
    if (type) form.setFieldsValue(type);
    else form.resetFields();
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingType) {
        await api.put(`/leave-types/${editingType.id}`, values);
        message.success('Cập nhật thành công');
      } else {
        await api.post('/leave-types', values);
        message.success('Thêm thành công');
      }
      setModalVisible(false);
      fetchLeaveTypes();
    } catch (error: any) {
      if (error?.response?.data?.message) message.error(error.response.data.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/leave-types/${id}`);
      message.success('Xóa thành công');
      fetchLeaveTypes();
    } catch {
      message.error('Lỗi khi xóa');
    }
  };

  const columns: ColumnsType<LeaveType> = [
    { title: 'Mã', dataIndex: 'code', key: 'code', width: 120 },
    { title: 'Loại nghỉ phép', dataIndex: 'name', key: 'name' },
    { title: 'Số ngày phép', dataIndex: 'allowanceDays', key: 'allowanceDays', render: (v) => `${v} ngày` },
    { title: 'Mô tả', dataIndex: 'description', key: 'description', render: (v) => v || '-' },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (s) => <Tag color={s === 'ACTIVE' ? 'success' : 'default'}>{s === 'ACTIVE' ? 'Đang dùng' : 'Không dùng'}</Tag>
    },
    {
      title: 'Thao tác', key: 'actions', width: 100,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleOpenModal(record)} />
          <Popconfirm title="Xóa loại nghỉ phép?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okType="danger">
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Title level={3} style={{ margin: 0 }}>Loại nghỉ phép</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>Thêm loại</Button>
      </div>
      <Card>
        <Table rowKey="id" columns={columns} dataSource={leaveTypes} loading={loading} />
      </Card>

      <Modal
        title={editingType ? 'Sửa loại nghỉ phép' : 'Thêm loại nghỉ phép'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Mã" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="name" label="Tên loại nghỉ phép" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="allowanceDays" label="Số ngày phép" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LeaveTypePage;

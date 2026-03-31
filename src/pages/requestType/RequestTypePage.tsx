import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Typography, Card, Modal, Form, Input, message, Tag, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { workflowService } from '@/services/workflow.service';
import { RequestType } from '@/types/workflow.types';
import api from '@/services/api';

const { Title } = Typography;

const RequestTypePage: React.FC = () => {
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingType, setEditingType] = useState<RequestType | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchRequestTypes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await workflowService.getRequestTypes();
      setRequestTypes(data);
    } catch {
      setRequestTypes([
        { id: '1', name: 'Nghỉ phép', code: 'LEAVE', status: 'ACTIVE' },
        { id: '2', name: 'Tăng ca (OT)', code: 'OT', status: 'ACTIVE' },
        { id: '3', name: 'Công tác', code: 'BUSINESS_TRIP', status: 'ACTIVE' },
        { id: '4', name: 'Làm việc từ xa', code: 'WFH', status: 'ACTIVE' },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequestTypes(); }, [fetchRequestTypes]);

  const handleOpenModal = (type?: RequestType) => {
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
        await api.put(`/request-types/${editingType.id}`, values);
        message.success('Cập nhật thành công');
      } else {
        await api.post('/request-types', values);
        message.success('Thêm thành công');
      }
      setModalVisible(false);
      fetchRequestTypes();
    } catch (error: any) {
      if (error?.response?.data?.message) message.error(error.response.data.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/request-types/${id}`);
      message.success('Xóa thành công');
      fetchRequestTypes();
    } catch {
      message.error('Lỗi khi xóa');
    }
  };

  const columns: ColumnsType<RequestType> = [
    { title: 'Mã', dataIndex: 'code', key: 'code', width: 120 },
    { title: 'Tên loại yêu cầu', dataIndex: 'name', key: 'name' },
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
          <Popconfirm title="Xóa loại yêu cầu?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okType="danger">
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Title level={3} style={{ margin: 0 }}>Loại yêu cầu</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>Thêm loại</Button>
      </div>
      <Card>
        <Table rowKey="id" columns={columns} dataSource={requestTypes} loading={loading} />
      </Card>

      <Modal
        title={editingType ? 'Sửa loại yêu cầu' : 'Thêm loại yêu cầu'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Mã" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="name" label="Tên loại yêu cầu" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RequestTypePage;

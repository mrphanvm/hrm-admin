import React, { useState, useEffect, useCallback } from 'react';
import {
  Tree, Card, Button, Modal, Form, Input, Select, Typography, Space,
  Row, Col, Tag, message, Tooltip, Popconfirm, Spin
} from 'antd';
import type { DataNode } from 'antd/es/tree';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ApartmentOutlined, ReloadOutlined
} from '@ant-design/icons';
import { organizationService } from '@/services/organization.service';
import { Organization, CreateOrganizationDto, OrgType } from '@/types/organization.types';
import { ORG_TYPE_LABELS } from '@/utils/constants';

const { Title } = Typography;
const { Option } = Select;

const orgTypeColors: Record<OrgType, string> = {
  COMPANY: 'blue',
  CENTER: 'green',
  DEPARTMENT: 'orange',
  TEAM: 'purple',
};

const convertToTreeData = (orgs: Organization[], parentId?: string): DataNode[] => {
  return orgs
    .filter((org) => org.parentId === parentId || (!org.parentId && !parentId))
    .map((org) => ({
      key: org.id,
      title: (
        <span>
          <Tag color={orgTypeColors[org.type]}>{ORG_TYPE_LABELS[org.type]}</Tag>
          <span>{org.name}</span>
          {org.managerName && <span className="text-gray-400 text-sm ml-2">({org.managerName})</span>}
        </span>
      ),
      children: convertToTreeData(orgs, org.id),
    }));
};

const OrganizationPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await organizationService.getOrganizations();
      setOrganizations(data);
    } catch {
      message.error('Lỗi khi tải danh sách tổ chức');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const selectedOrg = selectedOrgId ? organizations.find((o) => o.id === selectedOrgId) : null;

  const handleOpenModal = (org?: Organization) => {
    setEditingOrg(org || null);
    if (org) {
      form.setFieldsValue(org);
    } else {
      form.resetFields();
      if (selectedOrgId) {
        form.setFieldValue('parentId', selectedOrgId);
      }
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields() as CreateOrganizationDto;
      setSaving(true);
      if (editingOrg) {
        await organizationService.updateOrganization(editingOrg.id, values);
        message.success('Cập nhật thành công');
      } else {
        await organizationService.createOrganization(values);
        message.success('Thêm mới thành công');
      }
      setModalVisible(false);
      fetchOrganizations();
    } catch (error: any) {
      if (error?.response?.data?.message) message.error(error.response.data.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await organizationService.deleteOrganization(id);
      message.success('Xóa thành công');
      setSelectedOrgId(null);
      fetchOrganizations();
    } catch {
      message.error('Lỗi khi xóa. Có thể tổ chức còn dữ liệu liên quan.');
    }
  };

  const treeData = convertToTreeData(organizations);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Title level={3} style={{ margin: 0 }}>Quản lý tổ chức</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchOrganizations}>Làm mới</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            Thêm tổ chức
          </Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title={<span><ApartmentOutlined /> Cây tổ chức</span>}>
            {loading ? (
              <div className="flex justify-center p-8"><Spin /></div>
            ) : (
              <Tree
                treeData={treeData}
                defaultExpandAll
                onSelect={(keys) => setSelectedOrgId(keys[0] as string || null)}
                selectedKeys={selectedOrgId ? [selectedOrgId] : []}
                style={{ minHeight: 300 }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          {selectedOrg ? (
            <Card
              title={selectedOrg.name}
              extra={
                <Space>
                  <Button icon={<PlusOutlined />} size="small" onClick={() => handleOpenModal()}>
                    Thêm con
                  </Button>
                  <Button icon={<EditOutlined />} size="small" onClick={() => handleOpenModal(selectedOrg)}>
                    Sửa
                  </Button>
                  <Popconfirm
                    title="Xóa tổ chức?"
                    description="Bạn có chắc muốn xóa?"
                    onConfirm={() => handleDelete(selectedOrg.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okType="danger"
                  >
                    <Button icon={<DeleteOutlined />} size="small" danger>Xóa</Button>
                  </Popconfirm>
                </Space>
              }
            >
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500">Mã:</span> <strong>{selectedOrg.code}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Loại:</span>{' '}
                  <Tag color={orgTypeColors[selectedOrg.type]}>{ORG_TYPE_LABELS[selectedOrg.type]}</Tag>
                </div>
                <div>
                  <span className="text-gray-500">Quản lý:</span> {selectedOrg.managerName || '-'}
                </div>
                <div>
                  <span className="text-gray-500">Mô tả:</span> {selectedOrg.description || '-'}
                </div>
                <div>
                  <span className="text-gray-500">Trạng thái:</span>{' '}
                  <Tag color={selectedOrg.status === 'ACTIVE' ? 'success' : 'default'}>
                    {selectedOrg.status === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động'}
                  </Tag>
                </div>
              </div>
            </Card>
          ) : (
            <Card style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="text-center text-gray-400">
                <ApartmentOutlined style={{ fontSize: 48 }} />
                <p className="mt-2">Chọn một tổ chức để xem chi tiết</p>
              </div>
            </Card>
          )}
        </Col>
      </Row>

      <Modal
        title={editingOrg ? 'Sửa tổ chức' : 'Thêm tổ chức'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên tổ chức" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="Mã" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Loại" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Select placeholder="Chọn loại">
              {Object.entries(ORG_TYPE_LABELS).map(([k, v]) => (
                <Option key={k} value={k}>{v}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="parentId" label="Tổ chức cha">
            <Select placeholder="Chọn tổ chức cha" allowClear>
              {organizations.map((org) => (
                <Option key={org.id} value={org.id}>{org.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrganizationPage;

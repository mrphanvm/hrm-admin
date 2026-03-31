import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Space, Typography, Card, Tag, message, Popconfirm,
  Switch, Tooltip, Input, Badge
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined,
  SearchOutlined, NodeIndexOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { workflowService } from '@/services/workflow.service';
import { Workflow } from '@/types/workflow.types';
import { formatDateTime } from '@/utils/formatters';

const { Title } = Typography;
const { Search } = Input;

const WorkflowPage: React.FC = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const data = await workflowService.getWorkflows();
      setWorkflows(data);
      setFilteredWorkflows(data);
    } catch {
      message.error('Lỗi khi tải danh sách workflow');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWorkflows(); }, [fetchWorkflows]);

  useEffect(() => {
    if (search) {
      setFilteredWorkflows(workflows.filter((w) =>
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        (w.requestTypeName || '').toLowerCase().includes(search.toLowerCase())
      ));
    } else {
      setFilteredWorkflows(workflows);
    }
  }, [search, workflows]);

  const handleToggleActive = async (workflow: Workflow) => {
    try {
      if (workflow.isActive) {
        await workflowService.deactivateWorkflow(workflow.id);
      } else {
        await workflowService.activateWorkflow(workflow.id);
      }
      message.success('Cập nhật trạng thái thành công');
      fetchWorkflows();
    } catch {
      message.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleClone = async (id: string) => {
    try {
      await workflowService.cloneWorkflow(id);
      message.success('Sao chép workflow thành công');
      fetchWorkflows();
    } catch {
      message.error('Lỗi khi sao chép workflow');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await workflowService.deleteWorkflow(id);
      message.success('Xóa workflow thành công');
      fetchWorkflows();
    } catch {
      message.error('Lỗi khi xóa workflow');
    }
  };

  const columns: ColumnsType<Workflow> = [
    {
      title: 'Tên Workflow',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Button type="link" onClick={() => navigate(`/workflows/${record.id}/edit`)} style={{ padding: 0 }}>
          <strong>{name}</strong>
        </Button>
      ),
    },
    {
      title: 'Loại yêu cầu',
      dataIndex: 'requestTypeName',
      key: 'requestTypeName',
      render: (v) => <Tag>{v || '-'}</Tag>,
    },
    {
      title: 'Số bước duyệt',
      key: 'steps',
      render: (_, record) => (
        <Badge count={record.steps?.length || 0} showZero color="#1677ff" />
      ),
    },
    {
      title: 'Trạng thái',
      key: 'isActive',
      render: (_, record) => (
        <Switch
          checked={record.isActive}
          onChange={() => handleToggleActive(record)}
          checkedChildren="Đang dùng"
          unCheckedChildren="Tắt"
        />
      ),
    },
    {
      title: 'Cập nhật lúc',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => formatDateTime(date),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa">
            <Button icon={<EditOutlined />} size="small" onClick={() => navigate(`/workflows/${record.id}/edit`)} />
          </Tooltip>
          <Tooltip title="Sao chép">
            <Button icon={<CopyOutlined />} size="small" onClick={() => handleClone(record.id)} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa workflow?"
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
        <div className="flex items-center gap-2">
          <NodeIndexOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          <Title level={3} style={{ margin: 0 }}>Quản lý Workflow</Title>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/workflows/new')}>
          Tạo Workflow mới
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Search
            placeholder="Tìm kiếm workflow..."
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ width: 350 }}
          />
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredWorkflows}
          loading={loading}
          locale={{ emptyText: 'Chưa có workflow nào. Hãy tạo workflow đầu tiên!' }}
        />
      </Card>
    </div>
  );
};

export default WorkflowPage;

import React, { useState, useEffect } from 'react';
import {
  Card, Button, Form, Input, Select, Typography, Space, Steps,
  Switch, InputNumber, Divider, message, Modal, Tag, Row, Col, Empty,
  Tooltip, Alert
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined,
  SaveOutlined, EyeOutlined, ArrowLeftOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { workflowService } from '@/services/workflow.service';
import { WorkflowStep, WorkflowCondition, CreateWorkflowDto, RequestType } from '@/types/workflow.types';
import { APPROVER_TYPE_LABELS } from '@/utils/constants';

const { Title, Text } = Typography;
const { Option } = Select;

const generateId = () => `step_${Date.now()}_${Math.random().toString(36).slice(2)}`;

const defaultStep = (): WorkflowStep => ({
  id: generateId(),
  order: 1,
  name: 'Bước phê duyệt',
  approverType: 'DIRECT_MANAGER',
  isParallel: false,
});

const conditionFields = [
  { value: 'numberOfDays', label: 'Số ngày nghỉ' },
  { value: 'leaveType', label: 'Loại nghỉ phép' },
  { value: 'employeePosition', label: 'Chức vụ nhân viên' },
  { value: 'reason', label: 'Lý do' },
];

const conditionOperators = [
  { value: 'EQUALS', label: 'Bằng' },
  { value: 'NOT_EQUALS', label: 'Khác' },
  { value: 'GREATER_THAN', label: 'Lớn hơn' },
  { value: 'LESS_THAN', label: 'Nhỏ hơn' },
  { value: 'GREATER_THAN_OR_EQUAL', label: 'Lớn hơn hoặc bằng' },
  { value: 'LESS_THAN_OR_EQUAL', label: 'Nhỏ hơn hoặc bằng' },
  { value: 'CONTAINS', label: 'Chứa' },
];

const WorkflowBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [form] = Form.useForm();
  const [steps, setSteps] = useState<WorkflowStep[]>([defaultStep()]);
  const [conditions, setConditions] = useState<WorkflowCondition[]>([]);
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [saving, setSaving] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    workflowService.getRequestTypes()
      .then(setRequestTypes)
      .catch(() => {
        setRequestTypes([
          { id: '1', name: 'Nghỉ phép', code: 'LEAVE', status: 'ACTIVE' },
          { id: '2', name: 'Tăng ca', code: 'OT', status: 'ACTIVE' },
          { id: '3', name: 'Công tác', code: 'BUSINESS_TRIP', status: 'ACTIVE' },
          { id: '4', name: 'Làm việc từ xa', code: 'WFH', status: 'ACTIVE' },
        ]);
      });
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      workflowService.getWorkflow(id)
        .then((workflow) => {
          form.setFieldsValue({
            name: workflow.name,
            description: workflow.description,
            requestTypeId: workflow.requestTypeId,
            isActive: workflow.isActive,
          });
          setSteps(workflow.steps?.length ? workflow.steps : [defaultStep()]);
          setConditions(workflow.conditions || []);
        })
        .catch(() => message.error('Không thể tải workflow'));
    }
  }, [id, isEditing, form]);

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: generateId(),
      order: steps.length + 1,
      name: `Bước ${steps.length + 1}`,
      approverType: 'DIRECT_MANAGER',
      isParallel: false,
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (stepId: string) => {
    if (steps.length === 1) {
      message.warning('Workflow phải có ít nhất 1 bước');
      return;
    }
    setSteps(steps.filter((s) => s.id !== stepId).map((s, i) => ({ ...s, order: i + 1 })));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...steps];
    if (direction === 'up' && index > 0) {
      [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
    } else if (direction === 'down' && index < newSteps.length - 1) {
      [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
    }
    setSteps(newSteps.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setSteps(steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)));
  };

  const addCondition = () => {
    setConditions([...conditions, {
      id: generateId(),
      field: 'numberOfDays',
      operator: 'GREATER_THAN',
      value: '3',
    }]);
  };

  const removeCondition = (condId: string) => {
    setConditions(conditions.filter((c) => c.id !== condId));
  };

  const updateCondition = (condId: string, updates: Partial<WorkflowCondition>) => {
    setConditions(conditions.map((c) => (c.id === condId ? { ...c, ...updates } : c)));
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const dto: CreateWorkflowDto = {
        name: values.name,
        description: values.description,
        requestTypeId: values.requestTypeId,
        steps: steps.map(({ id: _id, ...rest }) => rest),
        conditions: conditions.map(({ id: _id, ...rest }) => rest),
      };

      if (isEditing && id) {
        await workflowService.updateWorkflow(id, dto);
        message.success('Cập nhật workflow thành công');
      } else {
        await workflowService.createWorkflow(dto);
        message.success('Tạo workflow thành công');
      }
      navigate('/workflows');
    } catch (error: any) {
      if (error?.response?.data?.message) {
        message.error(error.response.data.message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/workflows')}>
          Quay lại
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          {isEditing ? 'Chỉnh sửa Workflow' : 'Tạo Workflow mới'}
        </Title>
      </div>

      <Alert
        type="info"
        message="Hướng dẫn"
        description="Tạo workflow phê duyệt bằng cách thêm các bước duyệt, cấu hình người phê duyệt và điều kiện áp dụng."
        closable
        className="mb-4"
      />

      <Row gutter={24}>
        <Col xs={24} lg={8}>
          <Card title="⚙️ Cài đặt Workflow" style={{ position: 'sticky', top: 80 }}>
            <Form form={form} layout="vertical">
              <Form.Item name="name" label="Tên Workflow" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Input placeholder="VD: Quy trình duyệt nghỉ phép" />
              </Form.Item>
              <Form.Item name="requestTypeId" label="Áp dụng cho loại yêu cầu" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Select placeholder="Chọn loại yêu cầu">
                  {requestTypes.map((rt) => (
                    <Option key={rt.id} value={rt.id}>{rt.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="description" label="Mô tả">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item name="isActive" label="Kích hoạt ngay" valuePropName="checked" initialValue={false}>
                <Switch checkedChildren="Đang dùng" unCheckedChildren="Tắt" />
              </Form.Item>

              <Divider>Điều kiện áp dụng</Divider>
              {conditions.length === 0 && (
                <Text type="secondary" className="block text-center mb-3">Không có điều kiện (áp dụng tất cả)</Text>
              )}
              {conditions.map((cond) => (
                <Card key={cond.id} size="small" className="mb-2" style={{ background: '#fafafa' }}>
                  <div className="flex flex-col gap-1">
                    <Select size="small" value={cond.field} onChange={(v) => updateCondition(cond.id, { field: v })} style={{ width: '100%' }}>
                      {conditionFields.map((f) => <Option key={f.value} value={f.value}>{f.label}</Option>)}
                    </Select>
                    <Select size="small" value={cond.operator} onChange={(v) => updateCondition(cond.id, { operator: v as any })} style={{ width: '100%' }}>
                      {conditionOperators.map((op) => <Option key={op.value} value={op.value}>{op.label}</Option>)}
                    </Select>
                    <div className="flex gap-1">
                      <Input size="small" value={cond.value} onChange={(e) => updateCondition(cond.id, { value: e.target.value })} placeholder="Giá trị" style={{ flex: 1 }} />
                      <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeCondition(cond.id)} />
                    </div>
                  </div>
                </Card>
              ))}
              <Button size="small" icon={<PlusOutlined />} onClick={addCondition} block>Thêm điều kiện</Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title={
              <div className="flex items-center justify-between">
                <span>🔄 Các bước phê duyệt ({steps.length} bước)</span>
                <Space>
                  <Button icon={<EyeOutlined />} onClick={() => setPreviewVisible(true)}>Xem trước</Button>
                  <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
                    {isEditing ? 'Cập nhật' : 'Tạo Workflow'}
                  </Button>
                </Space>
              </div>
            }
          >
            {steps.length === 0 && <Empty description="Chưa có bước nào." />}
            <div className="space-y-3">
              {steps.map((step, index) => (
                <Card
                  key={step.id}
                  size="small"
                  style={{ border: '2px solid #e6f4ff', borderRadius: 8, background: '#fafcff' }}
                  title={
                    <div className="flex items-center gap-2">
                      <Tag color="blue">Bước {index + 1}</Tag>
                      <Input
                        size="small"
                        value={step.name}
                        onChange={(e) => updateStep(step.id, { name: e.target.value })}
                        style={{ width: 200, fontWeight: 'bold' }}
                        bordered={false}
                      />
                    </div>
                  }
                  extra={
                    <Space>
                      <Tooltip title="Di chuyển lên">
                        <Button size="small" icon={<ArrowUpOutlined />} disabled={index === 0} onClick={() => moveStep(index, 'up')} />
                      </Tooltip>
                      <Tooltip title="Di chuyển xuống">
                        <Button size="small" icon={<ArrowDownOutlined />} disabled={index === steps.length - 1} onClick={() => moveStep(index, 'down')} />
                      </Tooltip>
                      <Tooltip title="Xóa bước">
                        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeStep(step.id)} />
                      </Tooltip>
                    </Space>
                  }
                >
                  <Row gutter={[12, 8]}>
                    <Col span={12}>
                      <div className="text-xs text-gray-500 mb-1">Người phê duyệt</div>
                      <Select style={{ width: '100%' }} value={step.approverType} onChange={(v) => updateStep(step.id, { approverType: v as any })}>
                        {Object.entries(APPROVER_TYPE_LABELS).map(([k, v]) => <Option key={k} value={k}>{v}</Option>)}
                      </Select>
                    </Col>
                    <Col span={6}>
                      <div className="text-xs text-gray-500 mb-1">Song song</div>
                      <Switch checked={step.isParallel} onChange={(v) => updateStep(step.id, { isParallel: v })} checkedChildren="Có" unCheckedChildren="Không" />
                    </Col>
                    <Col span={6}>
                      <div className="text-xs text-gray-500 mb-1">Timeout (ngày)</div>
                      <InputNumber min={0} value={step.timeoutDays} onChange={(v) => updateStep(step.id, { timeoutDays: v || undefined })} style={{ width: '100%' }} placeholder="Không" />
                    </Col>
                    {step.approverType === 'FIXED_USER' && (
                      <Col span={24}>
                        <div className="text-xs text-gray-500 mb-1">ID người phê duyệt cố định</div>
                        <Input value={step.approverUserId} onChange={(e) => updateStep(step.id, { approverUserId: e.target.value })} placeholder="Nhập ID người dùng" />
                      </Col>
                    )}
                  </Row>
                </Card>
              ))}
            </div>
            <div className="mt-4">
              <Button type="dashed" icon={<PlusOutlined />} onClick={addStep} size="large" style={{ width: '100%' }}>
                + Thêm bước phê duyệt
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Xem trước Workflow"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={600}
      >
        <div className="space-y-4">
          <div><Text strong>Tên: </Text><Text>{form.getFieldValue('name') || 'Chưa đặt tên'}</Text></div>
          <Divider>Luồng phê duyệt</Divider>
          <Steps
            direction="vertical"
            current={-1}
            items={steps.map((step) => ({
              title: (
                <div className="flex items-center gap-2">
                  <strong>{step.name}</strong>
                  {step.isParallel && <Tag color="orange">Song song</Tag>}
                </div>
              ),
              description: <Tag color="blue">{APPROVER_TYPE_LABELS[step.approverType]}</Tag>,
              icon: <CheckCircleOutlined style={{ color: '#1677ff' }} />,
            }))}
          />
          {conditions.length > 0 && (
            <>
              <Divider>Điều kiện</Divider>
              {conditions.map((cond) => (
                <Tag key={cond.id}>
                  {conditionFields.find((f) => f.value === cond.field)?.label} {cond.operator} {cond.value}
                </Tag>
              ))}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default WorkflowBuilderPage;

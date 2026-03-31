import React from 'react';
import { Empty, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  description?: string;
  onAdd?: () => void;
  addLabel?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  description = 'Không có dữ liệu',
  onAdd,
  addLabel = 'Thêm mới',
}) => {
  return (
    <Empty description={description}>
      {onAdd && (
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          {addLabel}
        </Button>
      )}
    </Empty>
  );
};

export default EmptyState;

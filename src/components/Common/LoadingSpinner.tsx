import React from 'react';
import { Spin } from 'antd';

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'large', tip = 'Đang tải...' }) => {
  return (
    <div className="flex items-center justify-center h-64">
      <Spin size={size} tip={tip} />
    </div>
  );
};

export default LoadingSpinner;

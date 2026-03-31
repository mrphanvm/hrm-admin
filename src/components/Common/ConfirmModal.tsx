import { Modal } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

const { confirm } = Modal;

interface ConfirmOptions {
  title?: string;
  content?: string;
  onOk: () => void | Promise<void>;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
}

export const showConfirm = ({
  title = 'Xác nhận',
  content = 'Bạn có chắc chắn muốn thực hiện thao tác này?',
  onOk,
  okText = 'Xác nhận',
  cancelText = 'Hủy',
  danger = false,
}: ConfirmOptions) => {
  confirm({
    title,
    icon: <ExclamationCircleFilled />,
    content,
    okText,
    cancelText,
    okType: danger ? 'danger' : 'primary',
    onOk,
  });
};

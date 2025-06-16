import { ReloadOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Button, message, Upload } from 'antd';
import { BASE_URL } from '../../config';


interface UpContentProps {
  updateList: () => void;
}

export default function UpContent({ updateList }: UpContentProps) {

  const props: UploadProps = {
    action: `${BASE_URL}/upload`, // 上传的地址
    showUploadList: false, // 是否展示文件列表
    beforeUpload: (file) => { // 上传前的文件大小控制
      // 判断文件大小
      if (file.size > 1024 * 1024 * 10) {
        message.error('文件大小不能超过10MB');
        return false;
      }
      return true;
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        // console.log('文件上传中...');
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`);

        // 刷新列表
        updateList();

      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };

  return (
    <div style={{ marginTop: '6px' }}>
      <Button type='primary' icon={<ReloadOutlined />} onClick={() => updateList()} >刷新列表</Button>&nbsp;&nbsp;
      <Upload {...props}>
        <Button type="dashed" icon={<UploadOutlined />}>上传文件</Button>
      </Upload>
    </div>
  )
}

import { Button, Space, Table, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { BASE_URL } from '../../config';

const formatSize = (size: number) => {
  if (size < 1024) {
    return `${size}B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)}KB`;
  }
  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)}MB`;
  }
}

interface recordType {
  name: string;
  size: number;
  lastModified: string;
  url: string;
}

const DownContent = forwardRef((_, ref) => {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => {
    return {
      getList: getList,
    }
  });

  const columns: ColumnsType<recordType> = [
    {
      title: '序号',
      key: 'index',
      width: 80,
      render: (_: any, __: any, index: number) => index + 1,
      responsive: ['lg', 'md'], // 只在大屏和中屏显示
    },
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      render: (value: string, record: recordType) => <a href={record.url} target="_blank">{value}</a>,
    },
    {
      title: '文件大小',
      dataIndex: 'size',
      key: 'size',
      render: (value: number) => <span>{formatSize(value)}</span>,
      sorter: (a: recordType, b: recordType) => a.size - b.size,
    },
    {
      title: '上传时间',
      dataIndex: 'lastModified',
      key: 'lastModified',
      sorter: (a: recordType, b: recordType) => new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime(),
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (_: any, record: recordType) => (
        <Space size="middle">
          <Button danger type="link" onClick={() => handleDelete(record.name)}>删除</Button>
          <Button type="link" onClick={() => handleDownload(record.name)}>下载</Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    getList();
  }, []);

  const getList = () => {
    setLoading(true);
    fetch(`${BASE_URL}/files`)
      .then(res => res.json())
      .then(data => {
        const formattedData = data.map((item: Record<string, any>, index: number) => ({
          ...item,
          key: item.name || index,  // 使用文件名或索引作为 key
        }));
        setData(formattedData);
      }).finally(() => {
        setLoading(false);
      });
  }

  const handleDelete = (name: string) => {
    Modal.confirm({
      title: `确定删除文件《${name}》吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        setLoading(true);
        fetch(`${BASE_URL}/files/${name}`, {
          method: 'DELETE',
        }).then(res => res.json()).then(data => {
          data.success && getList();
          message.success('删除成功');
        }).finally(() => {
          setLoading(false);
        });
      },
      onCancel: () => {
        console.log('取消');
      },
    });
  }

  const handleDownload = (name: string) => {
    // 获取文件下载地址
    fetch(`${BASE_URL}/files/${name}`, {
      method: 'GET',
    }).then(res => res.json()).then(data => {
      const downloadUrl = data.url;

      // 下载文件
      downloadUrl && fetch(downloadUrl).then(res => res.blob()).then(data => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
      });

    });
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <Table loading={loading} columns={columns} dataSource={data} scroll={{ y: '72vh' }} pagination={{ pageSize: 10 }} />
    </div>
  )
});

export default DownContent;

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const Minio = require('minio');
const dayjs = require('dayjs');
const cors = require('cors');

const app = express();
const port = 19000;

// 启用 CORS
app.use(cors({ origin: '*' }));

const expoUrl = 'http://127.0.0.1:9000';

// 文件名编码处理函数
function decodeFileName(originalname) {
    try {
        // 尝试使用 Buffer 进行解码
        return Buffer.from(originalname, 'latin1').toString('utf8');
    } catch (error) {
        console.error('文件名解码错误:', error);
        return originalname;
    }
}

// 文件上传配置
const upload = multer({
    limits: {
        fileSize: 20 * 1024 * 1024, // 限制20MB
    },
    fileFilter: (req, file, cb) => {
        // 这里可以添加文件类型限制
        cb(null, true);
    },
});

// 中间件配置
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MinIO 客户端配置
const minioClient = new Minio.Client({
    endPoint: '127.0.0.1',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin'
});

// 确保 bucket 存在
const bucketName = 'files';
minioClient.bucketExists(bucketName, function (err, exists) {
    if (err) {
        return console.log(err);
    }
    if (!exists) {
        minioClient.makeBucket(bucketName, function (err) {
            if (err) {
                return console.log('创建 bucket 失败:', err);
            }
            console.log('Bucket 创建成功');
        });
    }
});

// 文件上传接口
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '没有文件被上传' });
        }

        console.log('req.file--->', req.file)

        const decodedFileName = decodeFileName(req.file.originalname);

        const fileName = dayjs().format('YYYYMMDDHHmmss') + '-' + decodedFileName

        const metaData = {
            // 若文件名以.txt结尾，则补充编码为 text/plain; charset=utf-8 解决乱码问题
            'Content-Type': req.file.originalname.endsWith('.txt') ? 'text/plain; charset=utf-8' : req.file.mimetype,
            'Content-Disposition': 'inline'
        };

        await minioClient.putObject(bucketName, fileName, req.file.buffer, metaData);

        res.json({
            success: true,
            fileName: fileName,
            message: '文件上传成功'
        });
    } catch (error) {
        console.error('上传错误:', error);
        res.status(500).json({ error: '文件上传失败' });
    }
});

// 获取文件列表接口
app.get('/files', async (req, res) => {

    try {
        const files = [];
        const stream = minioClient.listObjects(bucketName, '', true);

        stream.on('data', function (obj) {
            files.push({
                name: obj.name,
                size: obj.size,
                lastModified: dayjs(obj.lastModified).format('YYYY-MM-DD HH:mm:ss'),
                url: `${expoUrl}/${bucketName}/${obj.name}`
            });
        });

        stream.on('end', function () {
            // 按最后修改时间降序排序（最新的在前）
            files.sort((a, b) => {
                return new Date(b.lastModified) - new Date(a.lastModified);
            });
            res.json(files);
        });

        stream.on('error', function (err) {
            console.error('获取文件列表错误:', err);
            res.status(500).json({ error: '获取文件列表失败' });
        });
    } catch (error) {
        console.error('获取文件列表错误:', error);
        res.status(500).json({ error: '获取文件列表失败' });
    }
});

// 删除文件接口
app.delete('/files/:fileName', async (req, res) => {
    try {
        const fileName = req.params.fileName;
        await minioClient.removeObject(bucketName, fileName);
        res.json({
            success: true,
            message: '文件删除成功'
        });
    } catch (error) {
        console.error('删除文件错误:', error);
        res.status(500).json({ error: '文件删除失败' });
    }
});

// 获取文件下载链接接口
app.get('/files/:fileName', async (req, res) => {
    try {
        const fileName = req.params.fileName;
        const url = `${expoUrl}/${bucketName}/${fileName}`;
        res.json({
            success: true,
            url: url
        });
    } catch (error) {
        console.error('获取文件链接错误:', error);
        res.status(500).json({ error: '获取文件链接失败' });
    }
});

app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
}); 
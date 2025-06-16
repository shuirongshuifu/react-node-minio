import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/minio',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 react 相关库单独打包
          react: ['react', 'react-dom'],
          // 将其他较大的第三方库拆分
          vendor: ['antd'],
        },
      },
    },
    // 调整 chunk 大小警告限制（可选）
    chunkSizeWarningLimit: 360, // 默认是 500 KB
  },
})

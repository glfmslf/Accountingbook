import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite配置文件
// 用于构建React应用的开发服务器和打包配置
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});

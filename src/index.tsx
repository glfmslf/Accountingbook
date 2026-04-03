/**
 * 记账本应用 - React入口文件
 * 渲染App组件到DOM
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 渲染应用
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

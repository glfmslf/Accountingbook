/**
 * 记账本应用 - 主应用组件
 * 作为根组件，包裹整个应用
 */

import { RecordProvider } from './context/RecordContext';
import { RecordForm } from './components/RecordForm';
import { RecordList } from './components/RecordList';
import { Summary } from './components/Summary';
import './App.css';

/**
 * App根组件
 * 提供全局状态管理，并组织页面布局
 */
function App() {
  return (
    <RecordProvider>
      <div className="app">
        {/* 应用头部 */}
        <header className="app-header">
          <h1 className="app-title">记账本</h1>
          <p className="app-subtitle">轻量级个人财务管理工具</p>
        </header>

        {/* 主内容区域 */}
        <main className="app-main">
          {/* 月度汇总区域 */}
          <section className="section-summary">
            <Summary />
          </section>

          {/* 记账表单区域 */}
          <section className="section-form">
            <RecordForm />
          </section>

          {/* 记录列表区域 */}
          <section className="section-list">
            <RecordList />
          </section>
        </main>

        {/* 应用底部 */}
        <footer className="app-footer">
          <p>数据仅保存在本地浏览器中</p>
        </footer>
      </div>
    </RecordProvider>
  );
}

export default App;

# 记账本应用 - 技术设计文档

| 项目 | 内容 |
|------|------|
| **文档版本** | v1.0 |
| **编写日期** | 2026-04-02 |
| **开发工程师** | [待定] |
| **状态** | 待评审 |

---

## 1. 系统架构

### 1.1 整体架构

本应用采用 **React SPA (Single Page Application)** 架构，前端使用 React + TypeScript 实现，业务数据通过 Context API 进行状态管理，数据持久化层使用 localStorage 实现本地存储。

```
┌─────────────────────────────────────────────────────────────┐
│                        React SPA                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   App       │  │ RecordForm  │  │     RecordList     │  │
│  │ (根组件)    │  │ (记账表单)   │  │     (记录列表)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                           │                                  │
│  ┌─────────────────────────┴─────────────────────────────┐  │
│  │              AppContext (全局状态管理)                  │  │
│  │  - records: Record[]                                  │  │
│  │  - addRecord: (record: Record) => void                │  │
│  │  - deleteRecord: (id: string) => void                 │  │
│  │  - updateRecord: (id: string, record: Record) => void  │  │
│  │  - getMonthlySummary: (year: number, month: number)    │  │
│  └─────────────────────────┬─────────────────────────────┘  │
│                            │                                 │
│  ┌─────────────────────────┴─────────────────────────────┐  │
│  │              StorageService (localStorage)             │  │
│  │  - saveRecords(records: Record[]): void                 │  │
│  │  - loadRecords(): Record[]                              │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 数据流设计

数据流采用 **单向数据流 (Unidirectional Data Flow)** 模式：

1. **用户交互** -> 组件触发 Action
2. **Action** -> 调用 Context 提供的 Dispatch 方法
3. **Context Reducer** -> 处理状态变更，更新 records 数组
4. **State 更新** -> React 自动重新渲染相关组件
5. **持久化** -> 状态变更后自动同步到 localStorage

```
用户操作 -> dispatch(action) -> reducer更新state -> 组件re-render -> 持久化到localStorage
```

### 1.3 模块划分

| 模块 | 职责 | 依赖关系 |
|------|------|----------|
| **AppContext** | 全局状态管理，包含records数组和操作方法 | 被所有组件依赖 |
| **StorageService** | localStorage读写封装，负责数据持久化 | 被AppContext依赖 |
| **RecordForm** | 记账表单组件，负责新增/编辑记录 | 依赖AppContext |
| **RecordList** | 记录列表组件，负责展示和搜索记录 | 依赖AppContext |
| **Summary** | 月度汇总组件，负责展示统计信息 | 依赖AppContext |

---

## 2. 数据模型设计

### 2.1 TypeScript 接口定义

```typescript
/**
 * 记账记录类型
 * - income: 收入
 * - expense: 支出
 */
type RecordType = 'income' | 'expense';

/**
 * 记账记录接口
 * 金额统一使用"分"作为存储单位，避免浮点数精度问题
 */
interface Record {
  /** 记录唯一标识符，使用UUID v4 */
  id: string;
  /** 记录类型：income-收入，expense-支出 */
  type: RecordType;
  /** 金额，单位为"分"（例如：1000 = 10.00元） */
  amount: number;
  /** 分类ID，关联Category.id */
  categoryId: string;
  /** 记录日期，格式：YYYY-MM-DD */
  date: string;
  /** 备注说明，可选 */
  note?: string;
  /** 记录创建时间，ISO 8601格式 */
  createdAt: string;
  /** 记录更新时间，ISO 8601格式 */
  updatedAt: string;
}

/**
 * 分类接口
 */
interface Category {
  /** 分类唯一标识符 */
  id: string;
  /** 分类名称 */
  name: string;
  /** 所属类型：income-收入分类，expense-支出分类 */
  type: RecordType;
  /** 是否为系统默认分类，默认分类不可删除 */
  isDefault: boolean;
}

/**
 * 月度汇总数据接口
 */
interface MonthlySummary {
  /** 年份 */
  year: number;
  /** 月份（1-12） */
  month: number;
  /** 当月总收入（单位：分） */
  totalIncome: number;
  /** 当月总支出（单位：分） */
  totalExpense: number;
  /** 当月结余（单位：分） = 总收入 - 总支出 */
  balance: number;
  /** 各分类支出统计 */
  expenseByCategory: CategorySummary[];
  /** 各分类收入统计 */
  incomeByCategory: CategorySummary[];
}

/**
 * 分类汇总接口
 */
interface CategorySummary {
  /** 分类ID */
  categoryId: string;
  /** 分类名称 */
  categoryName: string;
  /** 该分类总金额（单位：分） */
  amount: number;
  /** 占所属类型总额的比例（0-1） */
  percentage: number;
}

/**
 * Action类型定义
 */
type AppAction =
  | { type: 'ADD_RECORD'; payload: Record }
  | { type: 'DELETE_RECORD'; payload: string }
  | { type: 'UPDATE_RECORD'; payload: { id: string; record: Record } }
  | { type: 'LOAD_RECORDS'; payload: Record[] };
```

### 2.2 金额存储规范

**重要：金额统一使用"分"作为存储单位，避免 JavaScript 浮点数精度问题。**

| 场景 | 存储值 | 实际金额 | 显示值 |
|------|--------|----------|--------|
| 支出100元 | `10000` | 100.00元 | 100.00 |
| 收入50.5元 | `5050` | 50.50元 | 50.50 |
| 支出0.01元 | `1` | 0.01元 | 0.01 |

**金额转换函数：**

```typescript
/**
 * 分转元，保留2位小数
 */
const fenToYuan = (fen: number): string => {
  return (fen / 100).toFixed(2);
};

/**
 * 元转分，支持最多2位小数
 */
const yuanToFen = (yuan: number | string): number => {
  const value = typeof yuan === 'string' ? parseFloat(yuan) : yuan;
  return Math.round(value * 100);
};
```

### 2.3 默认分类数据

```typescript
const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: 'expense-food', name: '餐饮', type: 'expense', isDefault: true },
  { id: 'expense-transport', name: '交通', type: 'expense', isDefault: true },
  { id: 'expense-shopping', name: '购物', type: 'expense', isDefault: true },
  { id: 'expense-entertainment', name: '娱乐', type: 'expense', isDefault: true },
  { id: 'expense-medical', name: '医疗', type: 'expense', isDefault: true },
  { id: 'expense-education', name: '教育', type: 'expense', isDefault: true },
  { id: 'expense-living', name: '居住', type: 'expense', isDefault: true },
  { id: 'expense-communication', name: '通讯', type: 'expense', isDefault: true },
  { id: 'expense-other', name: '其他', type: 'expense', isDefault: true },
];

const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: 'income-salary', name: '工资', type: 'income', isDefault: true },
  { id: 'income-parttime', name: '兼职', type: 'income', isDefault: true },
  { id: 'income-investment', name: '投资收益', type: 'income', isDefault: true },
  { id: 'income-bonus', name: '奖金', type: 'income', isDefault: true },
  { id: 'income-gift', name: '礼金', type: 'income', isDefault: true },
  { id: 'income-other', name: '其他', type: 'income', isDefault: true },
];
```

---

## 3. 组件设计

### 3.1 组件结构

```
App
├── Header (页头)
├── Summary (月度收支概况)
│   ├── BalanceDisplay (当前结余)
│   ├── MonthSelector (月份切换)
│   └── CategoryChart (分类占比图，可选P1)
├── RecordForm (记账表单)
│   ├── TypeSelector (收入/支出切换)
│   ├── AmountInput (金额输入)
│   ├── CategorySelect (分类选择)
│   ├── DatePicker (日期选择)
│   └── NoteInput (备注输入)
└── RecordList (记录列表)
    ├── SearchBar (搜索栏，可选P1)
    ├── FilterBar (筛选栏，可选P1)
    └── RecordItem (记录项)
        ├── TypeIcon (类型图标)
        ├── CategoryBadge (分类标签)
        ├── AmountDisplay (金额显示)
        └── Actions (编辑/删除)
```

### 3.2 组件详细设计

#### 3.2.1 App 根组件

| 属性/方法 | 类型 | 描述 |
|-----------|------|------|
| - | - | 作为 Context Provider，包裹整个应用 |

**职责：**
- 初始化 AppContext，提供全局状态和操作方法
- 管理应用级别的布局和导航

#### 3.2.2 RecordForm 记账表单组件

| 属性/方法 | 类型 | 描述 |
|-----------|------|------|
| editRecord | Record \| undefined | 编辑模式时传入的记录，undefined表示新增模式 |

**职责：**
- 收集用户输入的记账信息
- 表单验证（金额必填、正数、分类必选）
- 调用 Context 的 addRecord 或 updateRecord 方法

**状态管理：**
- type: 'income' | 'expense' - 当前选择的记录类型
- amount: string - 金额输入值（字符串类型用于受控组件）
- categoryId: string - 选中的分类ID
- date: string - 记录日期 YYYY-MM-DD
- note: string - 备注信息

#### 3.2.3 RecordList 记录列表组件

| 属性/方法 | 类型 | 描述 |
|-----------|------|------|
| records | Record[] | 要显示的记录列表 |

**职责：**
- 按日期倒序显示记录列表
- 支持下拉刷新（通过 Context 获取最新数据）
- 每条记录提供编辑和删除入口

**列表项分组：**
- 按日期分组显示，日期作为分组标题
- 组内记录按时间倒序排列

#### 3.2.4 Summary 月度汇总组件

| 属性/方法 | 类型 | 描述 |
|-----------|------|------|
| - | - | 通过 Context 计算获取当月汇总数据 |

**职责：**
- 计算并展示当月总收入、总支出、结余
- 提供月份切换功能
- （P1）展示各分类支出占比饼图

---

## 4. 目录结构

```
/Users/yuyou/Documents/Accountingbook/
├── src/
│   ├── index.tsx              # 应用入口文件
│   ├── App.tsx                # 根组件
│   ├── App.css                # 全局样式
│   ├── context/
│   │   ├── AppContext.tsx     # 全局状态管理Context
│   │   └── AppReducer.ts      # Reducer逻辑
│   ├── components/
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   └── Header.css
│   │   ├── Summary/
│   │   │   ├── Summary.tsx
│   │   │   ├── MonthSelector.tsx
│   │   │   ├── BalanceDisplay.tsx
│   │   │   └── Summary.css
│   │   ├── RecordForm/
│   │   │   ├── RecordForm.tsx
│   │   │   ├── TypeSelector.tsx
│   │   │   ├── AmountInput.tsx
│   │   │   ├── CategorySelect.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   └── RecordForm.css
│   │   └── RecordList/
│   │       ├── RecordList.tsx
│   │       ├── RecordItem.tsx
│   │       ├── SearchBar.tsx
│   │       └── RecordList.css
│   ├── services/
│   │   └── StorageService.ts  # localStorage封装
│   ├── types/
│   │   └── index.ts           # TypeScript接口定义
│   ├── constants/
│   │   └── categories.ts      # 默认分类数据
│   ├── utils/
│   │   ├── format.ts          # 格式化工具函数
│   │   ├── date.ts            # 日期处理工具
│   │   └── id.ts              # UUID生成工具
│   └── hooks/
│       └── useMonthlySummary.ts # 月度汇总计算Hook
├── public/
│   └── index.html
├── package.json
├── tsconfig.json
└── README.md
```

---

## 5. API 设计（预留后端扩展）

### 5.1 设计原则

当前版本数据存储在 localStorage，为未来扩展为需要用户注册登录的云端应用预留 API 接口设计。

### 5.2 RESTful API 接口设计

#### 5.2.1 记账记录接口

| 方法 | 路径 | 描述 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | /api/records | 获取所有记录 | query: { dateFrom, dateTo, type, categoryId } | { records: Record[] } |
| GET | /api/records/:id | 获取单条记录 | - | { record: Record } |
| POST | /api/records | 新增记录 | { type, amount, categoryId, date, note } | { record: Record } |
| PUT | /api/records/:id | 更新记录 | { type, amount, categoryId, date, note } | { record: Record } |
| DELETE | /api/records/:id | 删除记录 | - | { success: boolean } |

#### 5.2.2 分类接口

| 方法 | 路径 | 描述 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | /api/categories | 获取所有分类 | query: { type } | { categories: Category[] } |
| POST | /api/categories | 新增分类 | { name, type } | { category: Category } |
| PUT | /api/categories/:id | 更新分类 | { name } | { category: Category } |
| DELETE | /api/categories/:id | 删除分类 | - | { success: boolean } |

#### 5.2.3 统计接口

| 方法 | 路径 | 描述 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | /api/summary/monthly | 获取月度汇总 | query: { year, month } | MonthlySummary |
| GET | /api/summary/balance | 获取当前结余 | - | { balance: number } |

### 5.3 数据同步策略（未来扩展）

当应用需要支持多设备同步时，可采用以下策略：

1. **增量同步**：每次变更只同步增量数据
2. **时间戳冲突解决**：以服务器时间戳为准，保留最后一次修改
3. **离线队列**：离线时的操作记录到队列，联网后同步

---

## 6. 技术选型理由

### 6.1 React + TypeScript

| 选择 | 理由 |
|------|------|
| **React** | 生态成熟，组件化开发模式成熟，社区活跃，第三方库丰富 |
| **TypeScript** | 提供强类型检查，减少运行时错误；IDE支持好，代码提示准确；便于团队协作和代码维护 |
| **Vite** | 开发服务器启动快，热更新速度快，配置简洁 |

**备选方案对比：**

| 方案 | 优点 | 缺点 |
|------|------|------|
| React + TypeScript (选用) | 类型安全、生态完善 | 学习曲线 |
| Vue + TypeScript | 上手简单、中文文档丰富 | 生态相对较小 |
| Vanilla JS | 轻量、无依赖 | 难以维护大型项目 |

### 6.2 Context API 状态管理

| 选择 | 理由 |
|------|------|
| **Context API** | React 内置，无需额外依赖；适合中低复杂度应用；API 简单易用 |

**备选方案对比：**

| 方案 | 优点 | 缺点 |
|------|------|------|
| Context API (选用) | 无额外依赖、学习成本低、内置于React | 不适合超复杂状态管理 |
| Redux | 功能强大、中间件丰富 | 配置繁琐、冗余代码多 |
| Zustand | 轻量、API简洁 | 社区相对较小 |

### 6.3 localStorage 数据持久化

| 选择 | 理由 |
|------|------|
| **localStorage** | 浏览器内置，无需后端支持；实现简单；满足离线优先需求 |

**备选方案对比：**

| 方案 | 优点 | 缺点 |
|------|------|------|
| localStorage (选用) | 实现简单、无依赖、离线可用 | 存储容量有限(5MB)、仅支持字符串 |
| IndexedDB | 容量大、支持二进制 | API复杂、学习成本高 |
| SQLite (Cordova) | 关系型、容量大 | 需要原生插件、配置复杂 |

### 6.4 金额存储方案

| 选择 | 理由 |
|------|------|
| **整数(分)** | 避免 JavaScript 浮点数精度问题；计算简单高效；与后端金额存储最佳实践一致 |

### 6.5 技术栈汇总

| 层级 | 技术选型 | 版本要求 |
|------|----------|----------|
| 框架 | React | 18.x |
| 语言 | TypeScript | 5.x |
| 构建工具 | Vite | 5.x |
| 状态管理 | React Context API | 内置 |
| 样式 | CSS Modules / styled-components | - |
| 唯一ID生成 | uuid | 9.x |
| 日期处理 | date-fns | 3.x |

---

## 7. 性能优化策略

### 7.1 React 性能优化

1. **useMemo**：对月度汇总计算结果进行缓存，避免每次渲染都重新计算
2. **React.memo**：对 RecordItem 组件进行 memoization，减少不必要的重渲染
3. **虚拟列表**：当记录数量超过100条时，考虑使用虚拟滚动（如 react-window）

### 7.2 localStorage 性能优化

1. **批量写入**：多次快速操作时，使用 debounce 延迟写入，避免频繁 IO
2. **增量更新**：仅更新变化的记录，而非每次全量写入

### 7.3 估算性能指标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 首屏加载 | < 1.5s | 初次打开应用的加载时间 |
| 记账操作 | < 100ms | 从点击保存到显示成功的视觉反馈 |
| 列表滚动 | 60fps | 使用 memoization 优化后应达到 |
| 月度统计计算 | < 50ms | 1000条记录内应在50ms内完成 |

---

## 8. 安全性考虑

### 8.1 XSS 防护

- React 默认转义所有插入到 DOM 的内容
- 用户输入的备注信息不会被执行为 JavaScript 代码

### 8.2 数据隔离

- localStorage 数据仅存储在用户本地浏览器中
- 不同域名的页面无法访问其他域名的 localStorage 数据

### 8.3 数据备份

- 支持导出 JSON 格式备份文件
- 建议用户定期手动备份重要数据

---

## 9. 可访问性 (Accessibility)

1. **语义化 HTML**：使用适当的 HTML 元素（如 button、nav、main）
2. **ARIA 标签**：对图标按钮等非语义元素添加 aria-label
3. **键盘导航**：确保所有交互元素可通过键盘访问
4. **色彩对比度**：满足 WCAG 2.1 AA 级对比度要求

---

## 10. 技术设计评审清单

| 评审项 | 状态 | 备注 |
|--------|------|------|
| 系统架构合理性 | 待评审 | React SPA + Context 架构 |
| 数据模型完整性 | 待评审 | Record 接口定义、金额分存储规范 |
| 组件设计合理性 | 待评审 | 4个核心组件职责清晰 |
| 目录结构规范性 | 待评审 | 遵循 Feature-based 组织方式 |
| API 设计可扩展性 | 待评审 | 预留后端扩展接口 |
| 技术选型合理性 | 待评审 | 理由充分、备选方案对比完整 |
| 性能优化策略 | 待评审 | 已考虑虚拟列表、memoization |
| 安全可访问性 | 待评审 | React 默认防护、语义化HTML |

---

## 11. 签字确认

| 角色 | 签字 | 日期 |
|------|------|------|
| 开发工程师 | | |
| 技术负责人 | | |
| 产品经理 | | |

---

*本文档为记账本应用技术设计初稿，需经技术评审通过后方可进入开发阶段。*

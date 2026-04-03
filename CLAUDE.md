# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

记账本应用 - 用于记录每日收入和支出的轻量级Web应用。

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **后端**: Express (可选，用于未来扩展)
- **存储**: localStorage (当前) / SQLite (未来)
- **样式**: 纯CSS (无框架依赖)

## 常用命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 代码架构

```
src/
├── App.tsx           # 主应用组件，根组件
├── index.tsx         # React入口
├── components/       # UI组件
│   ├── RecordForm.tsx    # 添加/编辑记录表单
│   ├── RecordList.tsx    # 记录列表展示
│   └── Summary.tsx       # 收支汇总卡片
├── context/
│   └── RecordContext.tsx # 全局状态管理
├── types/
│   └── index.ts          # TypeScript类型定义
└── utils/
    └── storage.ts        # localStorage操作封装
```

## 数据模型

```typescript
interface Record {
  id: string;           // 唯一标识 (UUID)
  date: string;         // 日期 (YYYY-MM-DD)
  type: 'income' | 'expense';  // 类型
  amount: number;       // 金额 (分单位存储)
  note: string;         // 备注
  createdAt: number;    // 创建时间戳
}
```

## 设计模式

- **Context Pattern**: 使用React Context进行全局状态管理
- **Repository Pattern**: storage.ts封装所有数据访问操作
- **组件化**: 每个功能模块独立组件

## 文档位置

```
docs/
├── PRD.md              # 产品需求文档
├── technical-design.md # 技术设计方案
├── test-cases.md       # 测试用例文档
└── acceptance.md       # 验收文档
```

## Subagents 定义

本项目定义了5个独立的 Subagent，采用顺序协作流程。

### Subagent 列表

| Agent ID | 名称 | 类型 | 职责 | 输出 |
|----------|------|------|------|------|
| `产品经理` | 产品经理 | general-purpose | 需求分析、用户故事、功能优先级 | PRD.md |
| `开发工程师` | 开发工程师 | general-purpose | 架构设计、技术方案、代码实现 | technical-design.md + 源代码 |
| `测试工程师` | QA | general-purpose | 测试用例、功能验证、缺陷跟踪 | test-cases.md |
| `代码审查` | CR | general-purpose | 代码规范检查、bug发现、安全审查 | 审查报告 |
| `验收工程师` | 验收 | general-purpose | 验收标准、验收报告、最终确认 | acceptance.md |

### 角色目录（详细定义在 roles/ 文件夹下）
```
roles/
├── product-manager.md  # 产品经理 - 需求分析、PRD编写
├── developer.md       # 开发工程师 - 架构设计、代码实现
├── qa.md              # 测试工程师 - 测试用例、缺陷跟踪
├── code-reviewer.md   # 代码审查工程师 - 规范检查、bug审查
└── acceptance.md       # 验收工程师 - 验收标准、验收报告
```

### 各角色详细职责

#### 1. 产品经理 (PM)
- **职责**：收集分析需求、编写PRD、定义功能优先级、撰写用户故事
- **输入**：用户需求、市场调研
- **输出**：`docs/PRD.md`
- **调用**：`读取 roles/product-manager.md，按模板输出 PRD.md`

#### 2. 开发工程师 (Dev)
- **职责**：评审PRD、设计架构、编写技术方案、实现功能代码
- **输入**：`docs/PRD.md`、技术选型约束
- **输出**：`docs/technical-design.md`、完整源代码
- **调用**：`读取 roles/developer.md + PRD，输出技术方案和代码`

#### 3. 测试工程师 (QA)
- **职责**：评审需求和设计、编写测试用例、执行测试、报告缺陷
- **输入**：`docs/PRD.md`、`docs/technical-design.md`、已实现代码
- **输出**：`docs/test-cases.md`、测试报告
- **调用**：`读取 roles/qa.md + PRD + 技术方案，输出测试用例`

#### 4. 代码审查工程师 (CR)
- **职责**：审查代码规范执行情况、检查潜在 bug 和安全漏洞、确保代码质量
- **输入**：源代码、`docs/technical-design.md`、编码规范
- **输出**：`docs/code-review-report.md`、缺陷清单、改进建议
- **调用**：`读取 roles/code-reviewer.md + 源代码，输出审查报告到 docs/code-review-report.md`

#### 5. 验收工程师 (Acceptance)
- **职责**：制定验收标准、执行验收测试、确认功能达标、编写验收报告
- **输入**：所有文档 + 通过测试的代码
- **输出**：`docs/acceptance.md`、验收报告
- **调用**：`读取 roles/acceptance.md + 所有文档，输出验收报告`

### 工作流程

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  产品经理   │ -> │  开发工程师  │ -> │  测试工程师 │ -> │  代码审查   │ -> │  验收工程师 │ -> │  开发实现   │
│  (PM)       │    │  (Dev)      │    │  (QA)       │    │  (CR)       │    │  (Accept)   │    │  代码       │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     │                   │                   │                   │                   │
     v                   v                   v                   v                   v
  PRD.md          technical-design.md     test-cases.md      审查报告          acceptance.md
```

1. **PM** → 输出 `docs/PRD.md`
2. **Dev** → 输出 `docs/technical-design.md`
3. **QA** → 输出 `docs/test-cases.md`
4. **CR** → 输出 `docs/code-review-report.md`
5. **Acceptance** → 输出 `docs/acceptance.md`
6. **Dev** → 基于所有文档实现完整源代码

### 调用示例

```typescript
// 启动产品经理角色
Agent({
  description: "产品经理",
  prompt: "读取 roles/product-manager.md，按角色定义执行：输出 PRD.md"
})

// 启动开发工程师角色
Agent({
  description: "开发工程师",
  prompt: "读取 roles/developer.md 和 docs/PRD.md，按角色定义执行：输出技术方案"
})

// 启动测试工程师角色
Agent({
  description: "测试工程师",
  prompt: "读取 roles/qa.md、docs/PRD.md 和 docs/technical-design.md，按角色定义执行"
})

// 启动代码审查工程师角色
Agent({
  description: "代码审查工程师",
  prompt: "读取 roles/code-reviewer.md 和源代码，按角色定义执行：输出代码审查报告"
})

// 启动验收工程师角色
Agent({
  description: "验收工程师",
  prompt: "读取 roles/acceptance.md 和所有文档，按角色定义执行：输出验收报告"
})
```

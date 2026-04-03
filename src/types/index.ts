/**
 * 记账本应用 - TypeScript类型定义
 * 定义了应用中使用的所有数据类型
 */

/**
 * 记账记录类型
 * - income: 收入
 * - expense: 支出
 */
export type RecordType = 'income' | 'expense';

/**
 * 记账记录接口
 * 金额统一使用"分"作为存储单位，避免浮点数精度问题
 */
export interface Record {
  /** 记录唯一标识符，使用UUID */
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
  note: string;
  /** 记录创建时间戳 */
  createdAt: number;
  /** 记录更新时间戳 */
  updatedAt: number;
}

/**
 * 分类接口
 */
export interface Category {
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
export interface MonthlySummary {
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
export interface CategorySummary {
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
 * Action类型定义 - 用于Reducer处理状态变更
 */
export type AppAction =
  | { type: 'ADD_RECORD'; payload: Record }
  | { type: 'DELETE_RECORD'; payload: string }
  | { type: 'UPDATE_RECORD'; payload: { id: string; record: Omit<Record, 'id' | 'createdAt' | 'updatedAt'> } }
  | { type: 'LOAD_RECORDS'; payload: Record[] };

/**
 * 应用状态接口
 */
export interface AppState {
  /** 记账记录列表 */
  records: Record[];
  /** 是否正在加载数据 */
  isLoading: boolean;
}

/**
 * Context提供的上下文接口
 */
export interface RecordContextValue {
  /** 应用状态 */
  state: AppState;
  /** 添加记录 */
  addRecord: (record: Omit<Record, 'id' | 'createdAt' | 'updatedAt'>) => void;
  /** 更新记录 */
  updateRecord: (id: string, record: Omit<Record, 'id' | 'createdAt' | 'updatedAt'>) => void;
  /** 删除记录 */
  deleteRecord: (id: string) => void;
  /** 获取指定月份的汇总数据 */
  getMonthlySummary: (year: number, month: number) => MonthlySummary;
  /** 计算总余额 */
  getTotalBalance: () => number;
}

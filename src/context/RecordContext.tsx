/**
 * 记账本应用 - 全局状态管理Context
 * 使用React Context API管理应用状态
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Record, AppState, AppAction, RecordContextValue, MonthlySummary, CategorySummary } from '../types';
import { loadRecords, saveRecords } from '../utils/storage';
import { getAllCategories } from '../constants/categories';

// 初始状态
const initialState: AppState = {
  records: [],
  isLoading: true,
};

/**
 * Reducer函数 - 处理状态变更
 * @param state - 当前状态
 * @param action - 要执行的动作
 * @returns 新状态
 */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_RECORDS':
      return {
        ...state,
        records: action.payload,
        isLoading: false,
      };
    case 'ADD_RECORD':
      return {
        ...state,
        records: [...state.records, action.payload],
      };
    case 'DELETE_RECORD':
      return {
        ...state,
        records: state.records.filter(record => record.id !== action.payload),
      };
    case 'UPDATE_RECORD':
      return {
        ...state,
        records: state.records.map(record =>
          record.id === action.payload.id
            ? { ...record, ...action.payload.record, updatedAt: Date.now() }
            : record
        ),
      };
    default:
      return state;
  }
}

// 创建Context
const RecordContext = createContext<RecordContextValue | undefined>(undefined);

/**
 * RecordProvider组件 - 提供全局状态
 * @param children - 子组件
 */
export function RecordProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 组件挂载时从localStorage加载数据
  useEffect(() => {
    try {
      const records = loadRecords();
      dispatch({ type: 'LOAD_RECORDS', payload: records });
    } catch (error) {
      console.error('加载记录失败:', error);
      dispatch({ type: 'LOAD_RECORDS', payload: [] });
    }
  }, []);

  // 当记录变更时保存到localStorage
  useEffect(() => {
    if (!state.isLoading) {
      try {
        saveRecords(state.records);
      } catch (error) {
        console.error('保存记录失败:', error);
      }
    }
  }, [state.records, state.isLoading]);

  /**
   * 添加记录
   */
  const addRecord = useCallback((recordData: Omit<Record, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const newRecord: Record = {
      ...recordData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: 'ADD_RECORD', payload: newRecord });
  }, []);

  /**
   * 更新记录
   */
  const updateRecord = useCallback((id: string, recordData: Omit<Record, 'id' | 'createdAt' | 'updatedAt'>) => {
    dispatch({ type: 'UPDATE_RECORD', payload: { id, record: recordData } });
  }, []);

  /**
   * 删除记录
   */
  const deleteRecord = useCallback((id: string) => {
    dispatch({ type: 'DELETE_RECORD', payload: id });
  }, []);

  /**
   * 获取指定月份的汇总数据
   */
  const getMonthlySummary = useCallback((year: number, month: number): MonthlySummary => {
    // 筛选指定月份的记录
    const monthRecords = state.records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === year && recordDate.getMonth() + 1 === month;
    });

    // 计算总收入和总支出
    const totalIncome = monthRecords
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalExpense = monthRecords
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);

    // 计算各分类汇总
    const calculateCategorySummary = (
      records: Record[],
      type: 'income' | 'expense',
      total: number
    ): CategorySummary[] => {
      const categories = getAllCategories(type);
      const categoryMap = new Map(categories.map(c => [c.id, c.name]));

      const summaryMap = new Map<string, number>();
      records
        .filter(r => r.type === type)
        .forEach(r => {
          const current = summaryMap.get(r.categoryId) || 0;
          summaryMap.set(r.categoryId, current + r.amount);
        });

      const result: CategorySummary[] = [];
      summaryMap.forEach((amount, categoryId) => {
        result.push({
          categoryId,
          categoryName: categoryMap.get(categoryId) || '未知分类',
          amount,
          percentage: total > 0 ? amount / total : 0,
        });
      });

      // 按金额降序排列
      return result.sort((a, b) => b.amount - a.amount);
    };

    return {
      year,
      month,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      expenseByCategory: calculateCategorySummary(monthRecords, 'expense', totalExpense),
      incomeByCategory: calculateCategorySummary(monthRecords, 'income', totalIncome),
    };
  }, [state.records]);

  /**
   * 计算总余额（所有收入 - 所有支出）
   */
  const getTotalBalance = useCallback((): number => {
    const totalIncome = state.records
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalExpense = state.records
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);

    return totalIncome - totalExpense;
  }, [state.records]);

  // 上下文值
  const contextValue = useMemo<RecordContextValue>(() => ({
    state,
    addRecord,
    updateRecord,
    deleteRecord,
    getMonthlySummary,
    getTotalBalance,
  }), [state, addRecord, updateRecord, deleteRecord, getMonthlySummary, getTotalBalance]);

  return (
    <RecordContext.Provider value={contextValue}>
      {children}
    </RecordContext.Provider>
  );
}

/**
 * 使用RecordContext的Hook
 * @returns RecordContextValue
 * @throws 如果在RecordProvider外使用，抛出错误
 */
export function useRecordContext(): RecordContextValue {
  const context = useContext(RecordContext);
  if (!context) {
    throw new Error('useRecordContext必须在RecordProvider内使用');
  }
  return context;
}

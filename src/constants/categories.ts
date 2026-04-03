/**
 * 分类常量定义
 * 包含默认的支出分类和收入分类
 */

import { Category } from '../types';

/**
 * 默认支出分类列表
 * 包含日常生活中常见的支出类型
 */
export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
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

/**
 * 默认收入分类列表
 * 包含常见的收入来源
 */
export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: 'income-salary', name: '工资', type: 'income', isDefault: true },
  { id: 'income-parttime', name: '兼职', type: 'income', isDefault: true },
  { id: 'income-investment', name: '投资收益', type: 'income', isDefault: true },
  { id: 'income-bonus', name: '奖金', type: 'income', isDefault: true },
  { id: 'income-gift', name: '礼金', type: 'income', isDefault: true },
  { id: 'income-other', name: '其他', type: 'income', isDefault: true },
];

/**
 * 获取所有分类
 * @param type - 可选，按类型过滤分类
 * @returns 分类数组
 */
export const getAllCategories = (type?: 'income' | 'expense'): Category[] => {
  if (type === 'income') {
    return DEFAULT_INCOME_CATEGORIES;
  }
  if (type === 'expense') {
    return DEFAULT_EXPENSE_CATEGORIES;
  }
  return [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];
};

/**
 * 根据ID获取分类
 * @param id - 分类ID
 * @returns 分类对象，如果未找到返回undefined
 */
export const getCategoryById = (id: string): Category | undefined => {
  const allCategories = getAllCategories();
  return allCategories.find(cat => cat.id === id);
};

/**
 * 根据类型获取分类名称
 * @param id - 分类ID
 * @returns 分类名称，如果未找到返回"未知分类"
 */
export const getCategoryName = (id: string): string => {
  const category = getCategoryById(id);
  return category?.name || '未知分类';
};

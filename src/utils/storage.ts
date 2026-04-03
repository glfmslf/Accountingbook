/**
 * localStorage存储工具封装
 * 提供数据的持久化和读取功能
 */

import { Record } from '../types';

const STORAGE_KEY = 'accounting_book_records';

/**
 * 验证单条记录的数据完整性
 * @param record 待验证的记录对象
 * @returns 是否为有效记录
 */
function isValidRecord(record: unknown): record is Record {
  if (!record || typeof record !== 'object') return false;
  const r = record as Record;

  return (
    typeof r.id === 'string' &&
    (r.type === 'income' || r.type === 'expense') &&
    typeof r.amount === 'number' &&
    r.amount >= 0 &&
    typeof r.categoryId === 'string' &&
    typeof r.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(r.date) &&
    typeof r.note === 'string' &&
    typeof r.createdAt === 'number' &&
    typeof r.updatedAt === 'number'
  );
}

/**
 * 从localStorage加载记录
 * @returns 记录数组，如果读取失败返回空数组
 */
export const loadRecords = (): Record[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      console.error('数据格式错误: records 不是数组');
      return [];
    }
    // 过滤并验证每条记录
    const records = parsed.filter(isValidRecord);
    if (records.length !== parsed.length) {
      console.warn(`数据验证: ${parsed.length - records.length} 条无效记录被忽略`);
    }
    return records;
  } catch (error) {
    console.error('从localStorage加载数据失败:', error);
    return [];
  }
};

/**
 * 保存记录到localStorage
 * @param records - 要保存的记录数组
 * @returns 是否保存成功
 */
export const saveRecords = (records: Record[]): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch (error) {
    console.error('保存数据到localStorage失败:', error);
    // 检查是否是存储空间已满
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new Error('存储空间已满，请清理一些记录后重试');
    }
    throw error;
  }
};

/**
 * 清除所有记录
 * @returns 是否清除成功
 */
export const clearRecords = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('清除localStorage数据失败:', error);
    return false;
  }
};

/**
 * 检查localStorage是否可用
 * @returns 是否可用
 */
export const isStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * localStorage存储工具封装
 * 提供数据的持久化和读取功能
 */

import { Record } from '../types';

const STORAGE_KEY = 'accounting_book_records';

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
    const records = JSON.parse(data) as Record[];
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

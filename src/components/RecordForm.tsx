/**
 * 记账表单组件
 * 用于添加和编辑记账记录
 */

import React, { useState, useEffect, useRef } from 'react';
import { Record, RecordType } from '../types';
import { useRecordContext } from '../context/RecordContext';
import { getAllCategories } from '../constants/categories';
import { fenToYuan } from '../utils/format';
import './RecordForm.css';

/**
 * 将元转换为分的函数
 * @param yuan - 元单位的金额（可以是字符串或数字）
 * @returns 分单位的金额
 */
function yuanToFen(yuan: number | string): number {
  const value = typeof yuan === 'string' ? parseFloat(yuan) : yuan;
  if (isNaN(value) || value < 0) {
    return 0;
  }
  return Math.round(value * 100);
}

/**
 * 获取今天的日期字符串
 * @returns YYYY-MM-DD格式的日期字符串
 */
function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface RecordFormProps {
  /** 编辑模式下的记录，undefined表示新增模式 */
  editRecord?: Record;
  /** 编辑完成后的回调函数 */
  onEditComplete?: () => void;
}

export function RecordForm({ editRecord, onEditComplete }: RecordFormProps) {
  // 状态管理
  const [type, setType] = useState<RecordType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(() => getTodayDate());
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { addRecord, updateRecord } = useRecordContext();

  // 编辑模式下初始化表单数据
  useEffect(() => {
    if (editRecord !== undefined) {
      setType(editRecord.type);
      setAmount(fenToYuan(editRecord.amount));
      setCategoryId(editRecord.categoryId);
      setDate(editRecord.date);
      setNote(editRecord.note || '');
    }
  }, [editRecord]);

  // 用于跟踪编辑完成定时器的 ref
  const editCompleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (editCompleteTimerRef.current) {
        clearTimeout(editCompleteTimerRef.current);
      }
    };
  }, []);

  // 获取当前类型对应的分类
  const categories = getAllCategories(type);

  // 处理类型切换
  const handleTypeChange = (newType: RecordType) => {
    setType(newType);
    setCategoryId(''); // 切换类型时清空分类
  };

  // 表单提交处理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 验证金额
    const amountValue = parseFloat(amount);
    if (!amount || isNaN(amountValue)) {
      setError('请输入有效金额');
      return;
    }
    if (amountValue <= 0) {
      setError('金额必须为正数');
      return;
    }

    // 验证分类
    if (!categoryId) {
      setError('请选择分类');
      return;
    }

    // 验证日期
    if (!date) {
      setError('请选择日期');
      return;
    }

    const recordData = {
      type,
      amount: yuanToFen(amountValue),
      categoryId,
      date,
      note: note.trim(),
    };

    try {
      if (editRecord !== undefined) {
        // 编辑模式
        updateRecord(editRecord.id, recordData);
        setSuccess('记录已更新');
        if (onEditComplete) {
          editCompleteTimerRef.current = setTimeout(onEditComplete, 1000);
        }
      } else {
        // 新增模式
        addRecord(recordData);
        setSuccess('记录已保存');
        // 重置表单
        setAmount('');
        setCategoryId('');
        setNote('');
        setDate(getTodayDate());
      }
      // 2秒后清除成功提示
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('保存失败，请重试');
    }
  };

  // 重置表单
  const handleReset = () => {
    setAmount('');
    setCategoryId('');
    setNote('');
    setDate(getTodayDate());
    setError('');
    setSuccess('');
  };

  return (
    <form className="record-form" onSubmit={handleSubmit}>
      <h2 className="form-title">{editRecord ? '编辑记录' : '记账'}</h2>

      {/* 类型切换 */}
      <div className="type-selector">
        <button
          type="button"
          className={`type-btn ${type === 'expense' ? 'active expense' : ''}`}
          onClick={() => handleTypeChange('expense')}
        >
          支出
        </button>
        <button
          type="button"
          className={`type-btn ${type === 'income' ? 'active income' : ''}`}
          onClick={() => handleTypeChange('income')}
        >
          收入
        </button>
      </div>

      {/* 金额输入 */}
      <div className="form-group">
        <label htmlFor="amount" className="form-label">金额 (元)</label>
        <input
          id="amount"
          type="text"
          inputMode="decimal"
          className="form-input amount-input"
          placeholder="0.00"
          value={amount}
          onChange={(e) => {
            // 只允许输入数字和小数点，拒绝负号
            const value = e.target.value.replace(/[^0-9.]/g, '').replace(/-/g, '');
            // 防止多个小数点
            const parts = value.split('.');
            if (parts.length > 2) return;
            // 限制小数位数为2位
            if (parts[1] && parts[1].length > 2) return;
            setAmount(value);
          }}
        />
      </div>

      {/* 分类选择 */}
      <div className="form-group">
        <label htmlFor="category" className="form-label">分类</label>
        <select
          id="category"
          className="form-select"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">请选择分类</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* 日期选择 */}
      <div className="form-group">
        <label htmlFor="date" className="form-label">日期</label>
        <input
          id="date"
          type="date"
          className="form-input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* 备注输入 */}
      <div className="form-group">
        <label htmlFor="note" className="form-label">备注 (可选)</label>
        <textarea
          id="note"
          className="form-textarea"
          placeholder="添加备注..."
          maxLength={200}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <span className="char-count">{note.length}/200</span>
      </div>

      {/* 错误提示 */}
      {error && <div className="form-error">{error}</div>}

      {/* 成功提示 */}
      {success && <div className="form-success">{success}</div>}

      {/* 按钮组 */}
      <div className="form-buttons">
        <button type="submit" className="btn btn-primary">
          {editRecord ? '更新' : '保存'}
        </button>
        {!editRecord && (
          <button type="button" className="btn btn-secondary" onClick={handleReset}>
            重置
          </button>
        )}
        {editRecord && (
          <button type="button" className="btn btn-secondary" onClick={onEditComplete}>
            取消
          </button>
        )}
      </div>
    </form>
  );
}

/**
 * 记录列表组件
 * 用于展示收支记录列表，按日期分组显示
 */

import { useMemo, useState } from 'react';
import { Record } from '../types';
import { useRecordContext } from '../context/RecordContext';
import { getCategoryName } from '../constants/categories';
import { fenToYuan, formatDateDisplay } from '../utils/format';
import { RecordForm } from './RecordForm';
import './RecordList.css';

/**
 * 按日期分组记录
 * @param records - 记录数组
 * @returns 分组后的记录Map，key为日期字符串
 */
function groupRecordsByDate(records: Record[]): Map<string, Record[]> {
  const grouped = new Map<string, Record[]>();

  // 按日期倒序排序
  const sortedRecords = [...records].sort((a, b) => {
    // 首先按日期倒序
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    // 然后按创建时间倒序
    return b.createdAt - a.createdAt;
  });

  sortedRecords.forEach(record => {
    const existing = grouped.get(record.date) || [];
    grouped.set(record.date, [...existing, record]);
  });

  return grouped;
}

export function RecordList() {
  const { state, deleteRecord } = useRecordContext();
  const [editingRecord, setEditingRecord] = useState<Record | undefined>();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // 按日期分组记录
  const groupedRecords = useMemo(() => {
    return groupRecordsByDate(state.records);
  }, [state.records]);

  // 处理删除确认
  const handleDelete = (id: string) => {
    deleteRecord(id);
    setDeleteConfirmId(null);
  };

  // 渲染单条记录
  const renderRecordItem = (record: Record) => (
    <div key={record.id} className={`record-item ${record.type}`}>
      <div className="record-info">
        <div className="record-category">{getCategoryName(record.categoryId)}</div>
        {record.note && <div className="record-note">{record.note}</div>}
      </div>
      <div className="record-amount-wrapper">
        <div className={`record-amount ${record.type}`}>
          {record.type === 'expense' ? '-' : '+'}
          {fenToYuan(record.amount)}
        </div>
        <div className="record-actions">
          <button
            className="action-btn edit-btn"
            onClick={() => setEditingRecord(record)}
            aria-label="编辑记录"
          >
            编辑
          </button>
          <button
            className="action-btn delete-btn"
            onClick={() => setDeleteConfirmId(record.id)}
            aria-label="删除记录"
          >
            删除
          </button>
        </div>
      </div>

      {/* 删除确认对话框 */}
      {deleteConfirmId === record.id && (
        <div className="delete-confirm">
          <span>确定删除此记录？</span>
          <button
            className="confirm-btn yes"
            onClick={() => handleDelete(record.id)}
          >
            确定
          </button>
          <button
            className="confirm-btn no"
            onClick={() => setDeleteConfirmId(null)}
          >
            取消
          </button>
        </div>
      )}
    </div>
  );

  // 渲染编辑模式
  if (editingRecord) {
    return (
      <div className="record-list-container">
        <div className="section-header">
          <h2 className="section-title">编辑记录</h2>
        </div>
        <RecordForm
          editRecord={editingRecord}
          onEditComplete={() => setEditingRecord(undefined)}
        />
      </div>
    );
  }

  return (
    <div className="record-list-container">
      <div className="section-header">
        <h2 className="section-title">收支记录</h2>
        <div className="record-count">{state.records.length} 条记录</div>
      </div>

      {state.records.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <div className="empty-text">暂无记录</div>
          <div className="empty-hint">点击上方表单添加第一笔记录吧</div>
        </div>
      ) : (
        <div className="record-groups">
          {Array.from(groupedRecords.entries()).map(([date, records]) => (
            <div key={date} className="record-group">
              <div className="group-header">{formatDateDisplay(date)}</div>
              <div className="group-records">
                {records.map(renderRecordItem)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

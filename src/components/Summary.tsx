/**
 * 月度收支概况组件
 * 用于展示指定月份的收支汇总数据
 */

import { useState, useMemo } from 'react';
import { useRecordContext } from '../context/RecordContext';
import { MonthlySummary } from '../types';
import { fenToYuan } from '../utils/format';
import './Summary.css';

/**
 * 格式化月份显示
 * @param year - 年份
 * @param month - 月份(1-12)
 * @returns 格式化的月份字符串
 */
function formatMonthDisplay(year: number, month: number): string {
  return `${year}年${month}月`;
}

/**
 * 获取当前年月
 * @returns {year: number, month: number}
 */
function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

export function Summary() {
  const { getMonthlySummary, getTotalBalance } = useRecordContext();
  const [selectedYear, setSelectedYear] = useState(getCurrentYearMonth().year);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth().month);

  // 获取月度汇总数据
  const monthlySummary = useMemo<MonthlySummary>(() => {
    return getMonthlySummary(selectedYear, selectedMonth);
  }, [getMonthlySummary, selectedYear, selectedMonth]);

  // 获取总余额
  const totalBalance = useMemo(() => {
    return getTotalBalance();
  }, [getTotalBalance]);

  // 月份切换处理
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleGoToCurrentMonth = () => {
    const current = getCurrentYearMonth();
    setSelectedYear(current.year);
    setSelectedMonth(current.month);
  };

  // 判断是否是当前月
  const isCurrentMonth = useMemo(() => {
    const current = getCurrentYearMonth();
    return selectedYear === current.year && selectedMonth === current.month;
  }, [selectedYear, selectedMonth]);

  // 计算支出占比并缓存
  const expensePercentages = useMemo(() => {
    const map = new Map<string, string>();
    if (monthlySummary.totalExpense === 0) {
      monthlySummary.expenseByCategory.forEach(cat => {
        map.set(cat.categoryId, '0%');
      });
    } else {
      monthlySummary.expenseByCategory.forEach(cat => {
        const pct = ((cat.amount / monthlySummary.totalExpense) * 100).toFixed(1) + '%';
        map.set(cat.categoryId, pct);
      });
    }
    return map;
  }, [monthlySummary]);

  return (
    <div className="summary-container">
      {/* 月份选择器 */}
      <div className="month-selector">
        <button className="nav-btn" onClick={handlePrevMonth} aria-label="上个月">
          &lt;
        </button>
        <div className="current-month" onClick={handleGoToCurrentMonth}>
          {formatMonthDisplay(selectedYear, selectedMonth)}
          {!isCurrentMonth && <span className="back-to-current">点击回到本月</span>}
        </div>
        <button className="nav-btn" onClick={handleNextMonth} aria-label="下个月">
          &gt;
        </button>
      </div>

      {/* 月度统计卡片 */}
      <div className="summary-cards">
        <div className="summary-card income">
          <div className="card-label">本月收入</div>
          <div className="card-value">{fenToYuan(monthlySummary.totalIncome)}</div>
        </div>
        <div className="summary-card expense">
          <div className="card-label">本月支出</div>
          <div className="card-value">{fenToYuan(monthlySummary.totalExpense)}</div>
        </div>
        <div className="summary-card balance">
          <div className="card-label">本月结余</div>
          <div className={`card-value ${monthlySummary.balance >= 0 ? 'positive' : 'negative'}`}>
            {fenToYuan(monthlySummary.balance)}
          </div>
        </div>
      </div>

      {/* 总余额显示 */}
      <div className="total-balance">
        <div className="balance-label">账户总余额</div>
        <div className={`balance-value ${totalBalance >= 0 ? 'positive' : 'negative'}`}>
          {fenToYuan(totalBalance)}
        </div>
      </div>

      {/* 支出分类明细 */}
      {monthlySummary.expenseByCategory.length > 0 && (
        <div className="category-details">
          <h3 className="details-title">支出分类明细</h3>
          <div className="category-list">
            {monthlySummary.expenseByCategory.map((cat) => (
              <div key={cat.categoryId} className="category-item">
                <div className="category-info">
                  <span className="category-name">{cat.categoryName}</span>
                  <span className="category-amount">{fenToYuan(cat.amount)}</span>
                </div>
                <div className="category-bar-wrapper">
                  <div
                    className="category-bar"
                    style={{ width: expensePercentages.get(cat.categoryId) }}
                  />
                  <span className="category-percentage">
                    {expensePercentages.get(cat.categoryId)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 无数据提示 */}
      {monthlySummary.expenseByCategory.length === 0 && monthlySummary.incomeByCategory.length === 0 && (
        <div className="no-data">
          <span>本月暂无收支记录</span>
        </div>
      )}
    </div>
  );
}

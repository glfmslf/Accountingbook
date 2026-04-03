/**
 * 格式化工具函数
 * 提供金额、日期等格式化功能
 */

/**
 * 将分转换为元显示的函数
 * @param fen - 分单位的金额
 * @returns 保留两位小数的元字符串
 */
export function fenToYuan(fen: number): string {
  const yuan = fen / 100;
  const sign = yuan < 0 ? '-' : '';
  return sign + Math.abs(yuan).toFixed(2);
}

/**
 * 格式化日期显示（使用本地时间）
 * @param dateStr - YYYY-MM-DD格式的日期字符串
 * @returns 格式化的日期字符串
 */
export function formatDateDisplay(dateStr: string): string {
  // 使用本地时间创建日期对象
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // 使用本地日期字符串比较
  const dateLocalStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const todayLocalStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const yesterdayLocalStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  if (dateLocalStr === todayLocalStr) {
    return '今天';
  }
  if (dateLocalStr === yesterdayLocalStr) {
    return '昨天';
  }

  // 格式化为周几
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[date.getDay()];

  return `${month}月${day}日 ${weekday}`;
}

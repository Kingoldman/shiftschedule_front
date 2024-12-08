import dayjs from 'dayjs';

export const isNull = (value) => {
  // 检查是否为 null 或 undefined
  if (value === null || value === undefined) {
    return true;
  }

  // 检查是否为字符串，并去除前后空白后是否为空
  if (typeof value === 'string') {
    return value.trim() === '';
  }

  // 检查是否为数组且长度为 0
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  // 检查是否为对象且没有可枚举属性（空对象）
  if (typeof value === 'object') {
    // 注意：这里使用了 Object.keys() 而不是 Object.getOwnPropertyNames()，
    // 因为我们只想检查可枚举属性。如果你需要包括不可枚举属性，请使用后者。
    return Object.keys(value).length === 0 && value.constructor === Object;
  }

  // 检查是否为函数（通常函数不被视为“空”，但可以根据需要添加此检查）
  // if (typeof value === 'function') {
  //   return false; // 或者你可以返回一个特定的值来表示函数是“非空”的
  // }

  // 检查是否为数字 0 或 NaN（通常这些不被视为“空”，但可以根据需要添加此检查）
  // if (typeof value === 'number') {
  //   return value === 0 || Number.isNaN(value); // 注意：NaN 与任何值都不相等，包括它自己
  // }

  // 检查是否为布尔值 false（通常 false 不被视为“空”，但可以根据需要添加此检查）
  // if (typeof value === 'boolean') {
  //   return value === false; // 通常不推荐这样做，因为 false 有其逻辑意义
  // }

  // 如果以上条件都不满足，则认为值不是“空”的
  return false;
};

export const removeNullItem = (obj) => {
  // 使用 Object.fromEntries 和 Object.entries 来过滤掉值为空的属性
  return Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => !isNull(value))
  );
};

// 传入一个日期数组，检查其中日期是否连续，如果不连续，返回缺少的日期
export const checkmissingDates = (to_arranged) => {
  if (!to_arranged || to_arranged.length === 0) {
    return [];
  }
  const dates = to_arranged.map((item) => dayjs(item.date)); // 将日期转换为 dayjs 对象，并提取日期范围
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];
  // 生成从 startDate 到 endDate 的日期数组
  const allDates = [];
  for (
    let date = startDate;
    date.isBefore(endDate) || date.isSame(endDate);
    date = date.add(1, 'day')
  ) {
    allDates.push(date.format('YYYY-MM-DD'));
  }
  const arrangedDates = to_arranged.map((item) => item.date);
  // 检查缺失的日期
  let missingDates = allDates.filter((date) => !arrangedDates.includes(date));

  return missingDates;
};

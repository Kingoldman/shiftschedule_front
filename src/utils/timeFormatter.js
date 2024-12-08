import dayjs from 'dayjs';

const stringFromDate = (date) => {
  date = dayjs(date); // 直接将输入转换为 Day.js 对象
  return date.format('YYYY-MM-DD'); // 格式化为 YYYY-MM-DD
};

const stringFromDateTime = (date) => {
  date = dayjs(date); // 直接将输入转换为 Day.js 对象
  return date.format('YYYY-MM-DD HH:mm:ss'); // 格式化为 YYYY-MM-DD HH:mm:ss
};
export default {
  stringFromDate,
  stringFromDateTime,
};

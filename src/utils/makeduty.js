import { ref } from 'vue';

/**
 * 这个排班算法是一天1个组
 * @param {*待排班的时间区间} to_arranged_days
 * @param {*“周末”} why_weekend
 * @param {*开始组} groupIndex
 * @param {*组} why_groups
 * @param {*是否是只展示在日历上} isshow
 * @returns
 */

export const make_duty = (to_arranged_days, groupIndex = 0, why_groups) => {
  let res = ref([]);
  for (const item of to_arranged_days) {
    // 从 why_groups 中获取当前组
    let currentGroup = why_groups[groupIndex];

    // 收集当前组的所有用户
    const dutyers = currentGroup.staffs.map((staff) => staff.username);
    if (dutyers.length === 0) {
      // ElMessage.error(`第${currentGroup.order_id}组 / ${currentGroup.name} 没有用户`);
      return [
        [],
        [],
        `第${currentGroup.order_id}组 / ${currentGroup.name} 没有用户`,
      ]; // 抛出错误
    }

    // 这里加入检查，组员是否值班，其实还应该在组加入组员那里进行或者组员加入组那里后端直接判定

    // 使用find方法找到第一个state !== 1的对象，不值班
    const find_errstate = currentGroup.staffs.find(
      (staff) => staff.state !== 1
    );

    if (find_errstate) {
      return [
        [],
        [],
        `第${currentGroup.order_id}组 / ${find_errstate.username} 在当前安排时间不值班，请检查`,
      ]; // 抛出错误
    }

    ///////////////////////////////////////////////////////////////////////

    // 确定 fullcalendar 每天属性
    let property = '';
    if (item.isweekend === 1) {
      property = '周末';
    } else if (item.isnormal === 1) {
      property = '工作日';
    } else if (item.holiday !== null) {
      property = item.holiday.holiday_type.name;
    } else if (item.vacationday !== null) {
      property = '调休上班';
    } else {
      console.log(`出现无属性日期: ${item.date}`);
      return [[], [], `出现无属性日期: ${item.date}`];
    }

    // fullcalendar展示的数据title、start、end都是必须
    res.value.push({
      id: item.id,
      date: item.date,
      title: property, // title是fullcalendar必填
      datas: [{ [currentGroup.order_id]: dutyers }], // [ { '1': [ '张三', '李四' ] }, { '2': [ '王五', '赵六' ] } ]
      start: item.date + 'T00:00:00', // start end是fullcalendar必填
      end: item.date + 'T23:59:59',
      // allDay: property === '工作日' || property === '调休上班' ? false : true,
      // group: `第${currentGroup.order_id}组`,
      isweekend: item.isweekend,
      isnormal: item.isnormal,
      holiday_id: item.holiday ? item.holiday.id : undefined, //django 后端
      vacationday_id: item.vacationday ? item.vacationday.id : undefined,
    });

    // 更新 groupIndex，循环访问 why_groups
    groupIndex = (groupIndex + 1) % why_groups.length; // 循环访问
  }

  return [res.value, groupIndex, ''];
};

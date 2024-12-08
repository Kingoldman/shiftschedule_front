<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import CalendarView from '@/views/shiftschedule/components/CalendarView.vue';
import { checkmissingDates, isNull } from '@/utils/utils.js';
import { make_duty } from '@/utils/makeduty.js';
import { useCalendarShowDatas } from '@/stores/calendarshowdata';

import { useGroupsStore } from '@/stores/organizationalstructure';
import { useWhyDayStore } from '@/stores/datesetup';

import { usegroupturnsStore } from '@/stores/groupturns.js';

const whygroupturnsstore = usegroupturnsStore();

const whydaystore = useWhyDayStore();
const whygroupstore = useGroupsStore(); // 0.组

const calendar_show_datas_store = useCalendarShowDatas(); // calendar展示用的数据

let why_groups = ref([]); // 请求到的是现在修改后的，之前的持久化在数据库

let why_days = ref([]);
let why_groupturns = ref([]);

const do_why_days = async () => {
  let to_arranged_days = ref([]); //why_days中未安排的日期 // 按照date从小到大排序
  // let to_arranged = ref([]); // 待安排的日期，// 筛选出 isarranged 为 0 的对象，// 只提取 id 和 date // 按照date从小到大排序
  // 1 .处理时间；拿到没有标志的day的数据
  why_days.value = await whydaystore.fetchWhyDays();

  if (why_days.value.length < 1) {
    // ElMessage.error('未设置why_days!');
    // return;
    return [[], '未设置why_days!'];
  }
  // why_days.value 排个序，后面从小到大安排组
  why_days.value.sort((a, b) => new Date(a.date) - new Date(b.date));
  // 待安排的日期，// 筛选出 isarranged 为 0 的对象，// 只提取 id 和 date // 按照date从小到大排序

  // 加一个简单检测，检测是否中间时间是否漏了项
  let missing_days = checkmissingDates(why_days.value);
  if (missing_days.length > 0) {
    return [[], `why_days 时间不连续，漏项为：${missing_days}，请排查!`];
  }

  to_arranged_days = why_days.value.filter((item) => item.isarranged === 0); // 筛选出未锁定的日期，isarranged 为 0 的对象

  if (to_arranged_days.length < 1) {
    return [[], `没有需要安排的日期`];
  }

  // 加一个简单检测，检测是否中间时间是否漏了项
  let missing_dates = checkmissingDates(to_arranged_days);
  if (missing_dates.length > 0) {
    ElMessage.warning(
      `to_arranged_days 时间不连续，漏项为：${missing_dates}，系统自动跳过漏项日期，继续执行。如不符合要求，请检查why_days内相关数据，重新执行！`
    );
    // return; // 继续执行了
    // return [[], [], `时间不连续，漏项为：${missing_dates}，请排查`];
  }

  return [to_arranged_days, ''];
};

// help 分组[{date: '2023-11-01', order_id: 1, dates: ['2023-11-01', '2023-11-02', '2023-11-03']},{...}]
const groupDates = (arrangedDays, groupTurns) => {
  const result = [];
  let currentGroupId = null;
  let currentGroupDates = [];
  let currentGroupObjects = []; // 存储完整对象

  arrangedDays.forEach((day) => {
    const date = day.date;
    const groupTurn = groupTurns.find((turn) => turn.start_date === date);

    if (groupTurn) {
      // 如果有当前组，则将其推入结果
      if (currentGroupDates.length > 0) {
        result.push({
          date: currentGroupDates[0],
          order_id: currentGroupId,
          dates: currentGroupObjects, // 存储完整对象
        });
      }
      // 更新当前组信息
      currentGroupId = groupTurn.group.order_id;
      currentGroupDates = [date];
      currentGroupObjects = [day]; // 初始化为当前日期的完整对象
    } else {
      if (currentGroupId) {
        currentGroupDates.push(date);
        currentGroupObjects.push(day); // 添加当前日期的完整对象
      }
    }
  });

  // 处理最后一组
  if (currentGroupDates.length > 0) {
    result.push({
      date: currentGroupDates[0],
      order_id: currentGroupId,
      dates: currentGroupObjects, // 存储完整对象
    });
  }

  return result;
};

const do_why_groupturns = async (to_arranged_days) => {
  // to_arranged_days 是从小到大排了序的，
  let cur_group_order_ids = [];
  why_groupturns.value = await whygroupturnsstore.fethgroupturns();
  if (why_groupturns.value.length < 1) {
    // 未设置，不排新的，但是要展示已经锁定的
    return [[], '未设置groupturn!'];
  }
  // 遍历to_arranged_days和why_groupturns中start_date在to_arranged_days中的日期，记录下对应的order_id，将to_arranged_days按照date分组，得到每一个起点的日期数组，[{date: '2023-11-01', order_id: 1, dates: ['2023-11-01', '2023-11-02', '2023-11-03']},{...}]，这样得到的数组是按照date从小到大排序的

  cur_group_order_ids = groupDates(to_arranged_days, why_groupturns.value); //这样得到的数组是按照date从小到大排序的

  if (Array.isArray(cur_group_order_ids) && cur_group_order_ids.length === 0) {
    return [[], '未设置当前待排日期groupturn!'];
  } else {
    if (cur_group_order_ids[0].date !== to_arranged_days[0].date) {
      // 头部不一样，说明有漏项
      return [
        [],
        `[${to_arranged_days[0].date} , ${cur_group_order_ids[0].date})，未设置开始值班组`,
      ];
    }
  }

  return [cur_group_order_ids, ''];
};

// 这里待完善，这里要从groupbackup中取
const do_why_groups = async (cur_group_order_id) => {
  // 组数据
  why_groups.value = await whygroupstore.fetchGroups(); // 组
  // 组按照order_id从小到大排序
  why_groups.value.sort((a, b) => a.order_id - b.order_id);
  // groupIndex就是 cur_group_order_id 的下标
  let groupIndex = why_groups.value.findIndex(
    (item) => item.order_id === cur_group_order_id
  );
  return groupIndex;
};

const init_datas = async () => {
  const res_do_why_days = await do_why_days();

  if (res_do_why_days[1] !== '') {
    ElMessage.error(res_do_why_days[1]);
    return;
  }

  const to_arranged_days = res_do_why_days[0];

  // groupturn可能有多个，按照start_date来对to_arranged进行分组

  const res_do_why_groupturns = await do_why_groupturns(to_arranged_days);

  // res_do_why_groupturns =[{date: '2023-11-01', order_id: 1, dates: ['2023-11-01', '2023-11-02', '2023-11-03']},{...}]

  if (
    res_do_why_groupturns[1] !== '' ||
    res_do_why_groupturns[0].length === 0
  ) {
    ElMessage.error(res_do_why_groupturns[1]);
    return;
  }

  if (res_do_why_groupturns[0].length !== 0) {
    let make_duty_data = [];
    for (const item of res_do_why_groupturns[0]) {
      let cur_group_order_id = item.order_id;
      let item_to_arranged_days = item.dates;
      let groupIndex = await do_why_groups(cur_group_order_id); // 这个区间开始组下标
      const result = make_duty(
        item_to_arranged_days,
        groupIndex,
        why_groups.value // 这里传入的其实已经最新的
      );
      let errmsg = result[2];
      if (!isNull(errmsg)) {
        ElMessage.error(errmsg);
        return;
      }
      make_duty_data = make_duty_data.concat(result[0]); // 这里是数组拼接
    }

    /////////////////////////////////////////////////////////
    // 这里加工数据后写入
    await calendar_show_datas_store.set_new_and_arranged_calendar_show_datas(
      make_duty_data,
      false
    ); // CalendarView不能实时更新，需要刷新一下，不知道为啥，待完善
  } else {
    // cur_group_order_id 为null时候，无法排新的，只展示已经锁定的；还有就是已锁定的就不重排了
    await calendar_show_datas_store.set_new_and_arranged_calendar_show_datas(
      [],
      true
    ); // 获取锁定的，设置了store的
  }
};
init_datas(); // 初始化制作一些数据，这里加await会卡死，不知道为啥，待完善
</script>
<template>
  <!--  <CalendarView :dataview="show_data"></CalendarView>-->
  <CalendarView></CalendarView>
</template>

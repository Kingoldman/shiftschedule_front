import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useShiftscheduleJsonStore } from '@/stores/shiftschedulejson.js';

const merge_cur_month_schedule_json = (results) => {
  let arranged_datas = ref([]);
  for (let result of results) {
    // 再次使用 for...of 循环遍历 cur_month_schedule_json 数组
    for (let everyday_schedule of result.cur_month_schedule_json) {
      // 将每个 schedule 对象添加到 arranged_datas 数组中
      arranged_datas.value.push(everyday_schedule);
    }
  }
  return arranged_datas.value;
};
// 日历展示的数据
// 分成2部分 1.已经锁定的 2.预测的
export const useCalendarShowDatas = defineStore('calendarShowDatas', () => {
  const shiftschedulejsonstore = useShiftscheduleJsonStore();

  let new_and_arranged_calendar_show_datas = ref(
    JSON.parse(localStorage.getItem('new_and_arranged_calendar_show_datas')) ||
      []
  );

  const set_new_and_arranged_calendar_show_datas = async (
    datas,
    onlyarranged
  ) => {
    let results = await shiftschedulejsonstore.fetchshiftschedulejson(); // 这里从shiftschedulejson
    // 这里格式
    /**
     *  [
    {
      "id": 1,
      "year": 2024,
      "month": 11,
      "cur_month_schedule_json": [
        {
          "id": 1,
          "date": "2024-11-01",
          "title": "元旦",
          "datas": [
            {
              "0": [
                "东东",
                "赵六"
              ]
            }
          ],
          "start": "2024-11-01T00:00:00",
          "end": "2024-11-01T23:59:59"
        },{'id':2,....}
      ],
    },{"id": 1,
      "year": 2024,
      "month": 11,
      "cur_month_schedule_json": []}]
     */

    let arranged_datas = merge_cur_month_schedule_json(results); // 这里是已经锁定的数据

    if (!onlyarranged) {
      arranged_datas = arranged_datas.concat(datas); // 合并两个数组 , 这里是预测的数据,可能重复，待完善
      // 把数组按照时间排个序
      arranged_datas.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    new_and_arranged_calendar_show_datas.value = arranged_datas; // 更新ref

    localStorage.setItem(
      'new_and_arranged_calendar_show_datas',
      JSON.stringify(arranged_datas)
    ); // 保存到store中

    return arranged_datas;
  };

  const clear_new_and_arranged_calendar_show_datas = () => {
    localStorage.removeItem('new_and_arranged_calendar_show_datas');
  };

  // 初始化
  const refresh_new_and_arranged_calendar_show_datas = async () => {
    clear_new_and_arranged_calendar_show_datas();

    const results = await shiftschedulejsonstore.fetchshiftschedulejson();
    let arranged_datas = merge_cur_month_schedule_json(results);

    new_and_arranged_calendar_show_datas.value = arranged_datas; // 更新ref

    localStorage.setItem(
      'new_and_arranged_calendar_show_datas',
      JSON.stringify(arranged_datas)
    ); // 初始展示数据，直接设置为已经锁定的
  };

  return {
    new_and_arranged_calendar_show_datas,
    set_new_and_arranged_calendar_show_datas,
    clear_new_and_arranged_calendar_show_datas,
    refresh_new_and_arranged_calendar_show_datas,
  };
});

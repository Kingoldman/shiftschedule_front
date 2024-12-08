<script setup>
import { ref, onMounted, nextTick, onUnmounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import schedulemain from '@/components/schedulemain.vue';
import { useShiftscheduleJsonStore } from '@/stores/shiftschedulejson.js';
const shiftschedulejsonstore = useShiftscheduleJsonStore();

let show_datas = ref([]); // 显示的数据
let chartDom = ref(null); // echart容器
let myChart = null; // echart实例
const resizeChart = () => {
  if (myChart) {
    myChart.resize();
  }
};

let operationloading = ref(false); // 防止短时间重复提交

let res_datas = ref([]);
const requestdatas = async () => {
  if (operationloading.value) return; // 如果已经在加载中，则不执行后续操作

  operationloading.value = true; //加载开始
  try {
    res_datas.value = await shiftschedulejsonstore.fetchshiftschedulejson();
  } catch (error) {
    if (Array.isArray(error)) {
      for (const item of error) {
        ElMessage.error(item);
      }
    } else {
      ElMessage.error(JSON.stringify(error));
    }
  } finally {
    operationloading.value = false; //加载完成
  }
};

// 统计
const count_duty = (results) => {
  let duty_count_data = [];
  // 初始化一个 Map 来保存每个人的统计数据
  const stats = new Map();
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    for (let j = 0; j < result.cur_month_schedule_json.length; j++) {
      const entry = result.cur_month_schedule_json[j];
      const title = entry.title;
      const isHoliday =
        title !== '工作日' && title !== '周末' && title !== '调休上班';

      for (let k = 0; k < entry.datas.length; k++) {
        const data = entry.datas[k];
        const names = Object.values(data).flat(); // 获取当前条目中的所有姓名

        for (let l = 0; l < names.length; l++) {
          const name = names[l];
          if (!stats.has(name)) {
            stats.set(name, {
              '周末': 0,
              '工作日和调休': 0,
              '节假日': 0,
            });
          }
          const counts = stats.get(name);

          // 根据标题增加相应的计数
          if (title === '周末') {
            counts['周末'] += 1;
          } else if (title === '工作日' || title === '调休上班') {
            counts['工作日和调休'] += 1;
          } else if (isHoliday) {
            counts['节假日'] += 1;
          }
        }
      }
    }
  }

  // 将 Map 转换为数组，并排序

  stats.forEach((counts, name) => {
    duty_count_data.push({ [name]: counts });
  });

  // 排序规则：节假日 > 周末 > 工作日和调休
  duty_count_data.sort((a, b) => {
    const aCounts = Object.values(a)[0];
    const bCounts = Object.values(b)[0];

    // 计算每个人的优先级值
    const aPriority =
      aCounts['节假日'] * 100 + aCounts['周末'] * 10 + aCounts['工作日和调休'];
    const bPriority =
      bCounts['节假日'] * 100 + bCounts['周末'] * 10 + bCounts['工作日和调休'];

    return bPriority - aPriority; // 降序排序
  });
  return duty_count_data;
};

// 这四个也存stores，保存的时候更新？
const duty_count_names = ref([]);
const duty_count_weekends = ref([]);
const duty_count_normal_vacationdays = ref([]);
const duty_count_holidays = ref([]);
const get_every_item_show = () => {
  // 遍历 show_datas，提取信息
  for (let i = 0; i < show_datas.value.length; i++) {
    const entry = show_datas.value[i];
    const name = Object.keys(entry)[0]; // 获取姓名
    const counts = entry[name]; // 获取对应的统计数据

    // 将数据添加到相应的数组中
    duty_count_names.value.push(name);
    duty_count_weekends.value.push(counts['周末']);
    duty_count_normal_vacationdays.value.push(counts['工作日和调休']);
    duty_count_holidays.value.push(counts['节假日']);
  }
};

onMounted(async () => {
  await requestdatas(); // 请求数据
  show_datas.value = count_duty(res_datas.value); // 统计数据

  get_every_item_show(); // 拿每条展示的数据

  // 获取数据
  await nextTick(); // 确保DOM元素已经渲染完成
  chartDom.value = document.getElementById('chartshow');
  const chart_option = {
    // title: {
    //   text: '{highlight| 右侧滑块拉伸、移动区间}',
    //   textStyle: {
    //     fontSize: 14,
    //     fontWeight: 'bold',
    //     rich: {
    //       highlight: {
    //         color: '',
    //         fontSize: 14,
    //       },
    //     },
    //   },
    // },
    legend: {
      textStyle: {
        fontSize: 14, // 设置图例字体大小
      },
      itemGap: 20, // 设置图例项之间的间距
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        // 坐标轴指示器，坐标轴触发有效
        type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
      },
    },
    dataZoom: {
      //滑动
      type: 'slider',
      name: '数据滑块',
      start: 70, // 设置初始显示的 start 位置为0
      end: 100,
      yAxisIndex: 0,
      filterMode: 'empty',
      // 设置提示框
      tooltip: {
        show: true,
        formatter: '{start}-{end}',
      },
    },
    grid: {
      left: '3%',
      //   right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
    },
    yAxis: {
      type: 'category',
      data: duty_count_names.value, // y 轴为人名
      // 设置轴标签和轴刻度线的间距
      axisLabel: {
        margin: 14, // 调整轴标签和轴刻度线的间距
        fontSize: 14,
        // 禁止自动旋转轴标签
        rotate: 0,
        // 根据实际情况调整 interval 属性
        interval: 'auto',
      },
      // 设置轴刻度线的长度
      axisTick: {
        alignWithLabel: true,
        length: 10,
      },
    },
    series: [
      {
        name: '节假日',
        type: 'bar',
        stack: 'total',
        label: {
          show: true,
          fontSize: 14,
          color: '#fff', // 设置文本颜色
        },
        emphasis: {
          focus: 'series',
        },
        data: duty_count_holidays.value,
      },
      {
        name: '周末',
        type: 'bar',
        stack: 'total',
        label: {
          show: true,
          fontSize: 14,
          color: '#fff', // 设置文本颜色
        },
        emphasis: {
          focus: 'series',
        },
        data: duty_count_weekends.value,
      },
      {
        name: '工作日和调休',
        type: 'bar',
        stack: 'total',
        label: {
          show: true,
          fontSize: 14,
          color: '#475569', // 设置文本颜色
        },
        emphasis: {
          focus: 'series',
        },
        data: duty_count_normal_vacationdays.value,
      },
    ],
    color: ['#f87171', '#2dd4bf', '#e2e8f0', '#3ba272', '#9a60b4', '#ea7ccc'], // 这里设置另外的色块颜色
  };

  myChart = echarts.init(chartDom.value);

  myChart.setOption(chart_option);

  // 自适应
  window.addEventListener('resize', resizeChart);
});

// onBeforeUnmount(() => {
//   //   console.log('onBeforeMount');
//   window.removeEventListener('resize', () => {
//     myChart.resize();
//   });
// }); // 没起效，不知道为啥

onUnmounted(() => {
  if (myChart !== null && myChart.dispose) {
    myChart.dispose(); // 销毁实例
    myChart = null;
  }
  window.removeEventListener('resize', resizeChart); // 移除事件监听器
});
</script>
<template>
  <schedulemain pagetitle="人员值班统计">
    <el-card shadow="never">
      <div
        id="chartshow"
        :style="{ width: '90%', height: '600px' }"
        class="my-4"
      ></div>
    </el-card>
  </schedulemain>
</template>
<style lang="scss" scoped></style>

<script setup>
import { ref, onMounted, onBeforeMount, computed, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import zhLocale from '@fullcalendar/core/locales/zh-cn';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // for selectable
import listPlugin from '@fullcalendar/list';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useCalendarShowDatas } from '@/stores/calendarshowdata.js';
const calendar_show_datas_store = useCalendarShowDatas(); // 直接从本地取

// props 接收数据有延迟，没试过computed
// const props = defineProps({
//   dataview: {
//     type: Array,
//     default: () => {
//       return [];
//     },
//   },
// });

// 使用computed确保events是响应式的
let events = computed(
  () => calendar_show_datas_store.new_and_arranged_calendar_show_datas
);

const handleDateSelect = () => {};
const handleEventClick = (item) => {
  //console.log(item);
};
const handleEvents = (events) => {};
const showArg = (views) => {
  // console.log(views);
};
// 设置周次显示
const weekNumberContentfunc = (arg) => {
  return '第' + arg.num + '周';
};
const calendarOptions = ref({
  locale: zhLocale,
  plugins: [dayGridPlugin, interactionPlugin, listPlugin, bootstrap5Plugin],
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,dayGridWeek,dayGridDay,listWeek',
  },
  buttonText: {
    list: '列表',
  },

  // 视图的一些基本设置
  views: {
    dayGridMonth: {
      // showNonCurrentDates: false,
      // displayEventTime: true, //是否显示时间
      // titleFormat: { year: "numeric", month: "2-digit", day: "2-digit" }, //控制日历显示的标题
      // moreLinkContent: "+ 更多", //可放在这里单独对每个视图控制显示更多的文字
      dayMaxEvents: 5, // 限制事件最大数量
      moreLinkClick: 'popover',
      eventTimeFormat: {
        hour: 'numeric',
        minute: '2-digit',
        meridiem: false,
      },
      dayPopoverFormat: {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      },
    },
    multiMonthFourMonth: {
      type: 'multiMonth',
      duration: { months: 4 },
    },
    timeGridWeek: {},
    timeGridDay: {},
    listMonth: {},
    dayGridDay: {},
  },

  initialView: 'dayGridMonth',
  // initialView: "multiMonthFourMonth",
  themeSystem: 'bootstrap5',
  events: events, // 数据展示
  dayMaxEvents: true,
  weekends: true,
  select: handleDateSelect, // 点击日期格子
  eventClick: handleEventClick, // 点击当前信息
  eventsSet: handleEvents,
  eventResize: (view) => {
    // console.log(view.type);
  },
  selectable: true, // 表格可选择，依赖 `interactionPlugin` 插件
  handleWindowResize: true, // 是否随浏览器窗口大小变化而自动变化。
  slotLabelFormat: {
    //格式化小时的 -view 时间格式
    hour: '2-digit',
    minute: '2-digit',
    meridiem: false,
    hour12: false, // 设置时间为24小时
  },
  eventTimeFormat: {
    //改变的是日历中展示的日期格式
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    omitZeroMinute: false,
    meridiem: false,
  },

  // 事件数量超出时更多显示链接汉化
  // moreLinkContent: "+ 更多",
  // 高度自动调整
  height: 'auto',
  // 开启视图间导航功能
  navLinks: true,
  // 开启周次显示
  weekNumbers: true,
  // 显示周次文本
  weekText: '周',
  // 设置周次显示
  weekNumberContent: weekNumberContentfunc,
});
</script>

<template>
  <el-card shadow="never">
    <div class="full-calendar">
      <FullCalendar :options="calendarOptions">
        <template #eventContent="arg">
          <div
            v-show="arg.view.type === 'dayGridMonth'"
            class=""
            @click="showArg(arg)"
          >
            <div>
              <div
                v-if="
                  arg.event.title === '工作日' || arg.event.title === '调休上班'
                "
                class="bg-blue-400 rounded-sm text-white px-1"
              >
                {{ arg.event.title }}
              </div>
              <div
                v-else-if="arg.event.title === '周末'"
                class="bg-teal-400 rounded-sm text-white px-1"
              >
                {{ arg.event.title }}
              </div>
              <div v-else class="bg-red-400 rounded-sm text-white px-1">
                {{ arg.event.title }}
              </div>
            </div>

            <div class="mt-1.5">
              <div v-for="item in arg.event.extendedProps.datas" :key="item">
                <div v-for="[key, value] of Object.entries(item)">
                  <div class="font-semibold">
                    {{ '第' + key + '组' }}
                  </div>
                  <div v-for="(name, idx) in value" :key="idx">
                    {{ name }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-show="arg.view.type === 'dayGridWeek'">
            <div>
              <div
                v-if="
                  arg.event.title === '工作日' || arg.event.title === '调休上班'
                "
                class="bg-blue-400 rounded-sm text-white px-1"
              >
                {{ arg.event.title }}
              </div>
              <div
                v-else-if="arg.event.title === '周末'"
                class="bg-teal-400 rounded-sm text-white px-1"
              >
                {{ arg.event.title }}
              </div>
              <div v-else class="bg-red-400 rounded-sm text-white px-1">
                {{ arg.event.title }}
              </div>
            </div>

            <div class="mt-1.5">
              <div v-for="item in arg.event.extendedProps.datas" :key="item">
                <div v-for="[key, value] of Object.entries(item)">
                  <div class="font-semibold">
                    {{ '第' + key + '组' }}
                  </div>
                  <div v-for="(name, idx) in value" :key="idx">
                    {{ name }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-show="arg.view.type === 'dayGridDay'">
            <div>
              <div
                v-if="
                  arg.event.title === '工作日' || arg.event.title === '调休上班'
                "
                class="bg-blue-400 rounded-sm text-white px-1"
              >
                {{ arg.event.title }}
              </div>
              <div
                v-else-if="arg.event.title === '周末'"
                class="bg-teal-400 rounded-sm text-white px-1"
              >
                {{ arg.event.title }}
              </div>
              <div v-else class="bg-red-400 rounded-sm text-white px-1">
                {{ arg.event.title }}
              </div>
            </div>

            <div class="mt-1.5">
              <div v-for="item in arg.event.extendedProps.datas" :key="item">
                <div v-for="[key, value] of Object.entries(item)">
                  <div class="font-semibold">
                    {{ '第' + key + '组' }}
                  </div>
                  <div v-for="(name, idx) in value" :key="idx">
                    {{ name }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-show="arg.view.type === 'listWeek'">
            <div>
              <div
                v-if="
                  arg.event.title === '工作日' || arg.event.title === '调休上班'
                "
                class="bg-blue-400 rounded-sm text-white px-1"
              >
                {{ arg.event.title }}
              </div>
              <div
                v-else-if="arg.event.title === '周末'"
                class="bg-teal-400 rounded-sm text-white px-1"
              >
                {{ arg.event.title }}
              </div>
              <div v-else class="bg-red-400 rounded-sm text-white px-1">
                {{ arg.event.title }}
              </div>
            </div>

            <div class="mt-1.5">
              <div v-for="item in arg.event.extendedProps.datas" :key="item">
                <div v-for="[key, value] of Object.entries(item)">
                  <div class="font-semibold">
                    {{ '第' + key + '组' }}
                  </div>
                  <div v-for="(name, idx) in value" :key="idx">
                    {{ name }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </FullCalendar>
    </div>
  </el-card>
</template>

<style lang="scss" scoped></style>

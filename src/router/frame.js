import FrameView from '@/views/main/frame.vue';
import Home from '@/views/home/index.vue';
import DateManage from '@/views/datemanage/index.vue';
import DayManage from '@/views/datemanage/daymanage/index.vue';
import HolidayType from '@/views/datemanage/holidaytype/index.vue';
import Holiday from '@/views/datemanage/holiday/index.vue';
import VacationDay from '@/views/datemanage/vacationday/index.vue';
import DateRange from '@/views/datemanage/daterange/index.vue';

import OrganizationalStructure from '@/views/organizationalstructure/index.vue';
import DepartmentManage from '@/views/organizationalstructure/departmentmanage/index.vue';
import GroupManage from '@/views/organizationalstructure/groupmanage/index.vue';
import UserManage from '@/views/organizationalstructure/usermanage/index.vue';

import ShiftSchedule from '@/views/shiftschedule/index.vue';
import PeopleDuty from '@/views/shiftschedule/peopleduty/index.vue';
import CarDuty from '@/views/shiftschedule/carduty/index.vue';

import MakeDuty from '@/views/makeduty/index.vue';
import GroupBackupSet from '@/views/makeduty/groupbackupset/index.vue';
import EveryMonthGroupdetail from '@/views/makeduty/groupbackupset/components/everymonthgroupdetail.vue';
import StartGroupSet from '@/views/makeduty/startgroupset/index.vue';
import SaveDuty from '@/views/makeduty/saveduty/index.vue';
import EveryMonthDutydetail from '@/views/makeduty/saveduty/components/everymonthdutydetail.vue';

import DutyCount from '@/views/dutycount/index.vue';
import PeopleDutyCount from '@/views/dutycount/peopledutycount/index.vue';
import CarDutyCount from '@/views/dutycount/cardutycount/index.vue';

const routes = [
  {
    path: '/',
    name: 'frame',
    component: FrameView,
    children: [
      {
        path: '/',
        name: 'home',
        // component: Home,
        component: PeopleDuty,
        meta: {
          icon: 'House',
          text: '首页',
        },
      },

      {
        path: '/organizationalstructure',
        name: 'organizationalstructure',
        component: OrganizationalStructure,
        meta: {
          icon: 'Memo',
          text: '组织管理',
        },
        children: [
          {
            path: 'departmentmanage',
            name: 'departmentmanage',
            component: DepartmentManage,
            meta: {
              icon: 'OfficeBuilding',
              text: '部门管理',
            },
          },
          {
            path: 'groupmanage',
            name: 'groupmanage',
            component: GroupManage,
            meta: {
              icon: 'Lollipop',
              text: '组管理',
            },
          },
          {
            path: 'usermanage',
            name: 'usermanage',
            component: UserManage,
            meta: {
              icon: 'User',
              text: '人员管理',
            },
          },
        ],
      },
      {
        path: '/datemanage',
        name: 'datemanage',
        component: DateManage,
        meta: {
          icon: 'Operation',
          text: '日期管理',
        },
        children: [
          {
            path: 'daterange',
            name: 'daterange',
            component: DateRange,
            meta: {
              icon: 'Sunrise',
              text: '1.基础日期',
            },
          },
          {
            path: 'daymanage',
            name: 'daymanage',
            component: DayManage,
            meta: {
              icon: 'Sunny',
              text: '2.校准周末',
            },
          },

          {
            path: 'holidaytype',
            name: 'holidaytype',
            component: HolidayType,
            meta: {
              icon: 'PartlyCloudy',
              text: '3.1节假日枚举',
            },
          },

          {
            path: 'holiday',
            name: 'holiday',
            component: Holiday,
            meta: {
              icon: 'MostlyCloudy',
              text: '3.2节假日设置',
            },
          },
          {
            path: 'vacationday',
            name: 'vacationday',
            component: VacationDay,
            meta: {
              icon: 'Drizzling',
              text: '4.调休日设置',
            },
          },
        ],
      },

      {
        path: '/makeduty',
        name: 'makeduty',
        component: MakeDuty,
        meta: {
          icon: 'Cpu',
          text: '安排值班',
        },
        children: [
          {
            path: 'startgroupset',
            name: 'startgroupset',
            component: StartGroupSet,
            meta: {
              icon: 'DArrowRight',
              text: '开始组设置',
            },
          },
          {
            path: 'saveduty',
            name: 'saveduty',
            component: SaveDuty,
            meta: {
              icon: 'FolderChecked',
              text: '保存值班',
            },
          },
          {
            path: 'everymonthdutydetail/:pk',
            name: 'everymonthdutydetail',
            component: EveryMonthDutydetail,
            meta: {
              hidden: true,
            },
          },
          {
            path: 'groupbackupset',
            name: 'groupbackupset',
            component: GroupBackupSet,
            meta: {
              icon: 'DocumentCopy',
              text: '值班组备份',
            },
          },
          {
            path: 'everymonthgroupdetail/:pk',
            name: 'everymonthgroupdetail',
            component: EveryMonthGroupdetail,
            meta: {
              hidden: true,
            },
          },
        ],
      },

      {
        path: '/shiftschedule',
        name: 'shiftschedule',
        component: ShiftSchedule,
        meta: {
          icon: 'AlarmClock',
          text: '值班日历',
        },
        children: [
          {
            path: 'peopleduty',
            name: 'peopleduty',
            component: PeopleDuty,
            meta: {
              icon: 'Pointer',
              text: '人员值班',
            },
          },

          {
            path: 'carduty',
            name: 'carduty',
            component: CarDuty,
            meta: {
              icon: 'Bicycle',
              text: '车辆值班',
            },
          },
        ],
      },

      {
        path: '/dutycount',
        name: 'dutycount',
        component: DutyCount,
        meta: {
          icon: 'PieChart',
          text: '值班统计',
        },
        children: [
          {
            path: 'peopledutycount',
            name: 'peopledutycount',
            component: PeopleDutyCount,
            meta: {
              icon: 'DataAnalysis',
              text: '人员值班统计',
            },
          },
          {
            path: 'cardutycount',
            name: 'cardutycount',
            component: CarDutyCount,
            meta: {
              icon: 'DataLine',
              text: '车辆值班统计',
            },
          },
        ],
      },
    ],
  },
];

export default routes;

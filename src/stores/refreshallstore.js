import { defineStore } from 'pinia';
import {
  useHolidayTypesStore,
  useHolidayStore,
  useVacationStore,
  useWhyDayStore,
} from '@/stores/datesetup';
import {
  useUsersStore,
  useGroupsStore,
  useDepartmentsStore,
} from '@/stores/organizationalstructure';
import { useCalendarShowDatas } from '@/stores/calendarshowdata';
import { usegroupturnsStore } from '@/stores/groupturns';
import { useEveryMonthGroupStore } from '@/stores/everymonthgroup.js';
import { useShiftscheduleJsonStore } from '@/stores/shiftschedulejson.js';

export const useRefreshAllStore = defineStore('refreshallstore', () => {
  const calendar_show_datas_store = useCalendarShowDatas();
  const whydaystore = useWhyDayStore();
  const whyholidaytypestore = useHolidayTypesStore();
  const whyholidaystore = useHolidayStore();
  const whyvacationstore = useVacationStore();

  const whyuserstore = useUsersStore();
  const whygroupstore = useGroupsStore();
  const whydepartmentstore = useDepartmentsStore();
  const whygroupturnsstore = usegroupturnsStore();

  const everymonthgroupstore = useEveryMonthGroupStore();

  const shiftschedulejsonstore = useShiftscheduleJsonStore();

  // 刷新所有
  const refresh_all_stores = async () => {
    try {
      await whydaystore.refreshWhyDays();
      await whyholidaytypestore.refreshHolidayTypes();
      await whyholidaystore.refreshHolidays();
      await whyvacationstore.refreshVacationdays();

      await whyuserstore.refreshUsers();
      await whygroupstore.refreshGroups();
      await whydepartmentstore.refreshDepartments();

      await whygroupturnsstore.refreshgroupturns();
      await calendar_show_datas_store.refresh_new_and_arranged_calendar_show_datas();

      await everymonthgroupstore.refreshgroupturns();

      await shiftschedulejsonstore.refreshshiftschedulejson();
    } catch (error) {
      console.log('refresh_all_stores error', error);
    }
  };

  return {
    refresh_all_stores,
  };
});

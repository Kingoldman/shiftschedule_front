import { ref } from 'vue';
import { defineStore } from 'pinia';
import dayhttp from '@/api/dayhttp';
import { ElMessage } from 'element-plus';

// 节假日类型
export const useHolidayTypesStore = defineStore('holidaytypesstore', () => {
  const holidayTypes = ref(
    JSON.parse(localStorage.getItem('holidayTypes')) || []
  );

  const fetchHolidayTypes = async () => {
    let storedData = JSON.parse(localStorage.getItem('holidayTypes')) || [];

    if (storedData.length > 0) {
      holidayTypes.value = storedData; // 更新 ref
      return holidayTypes.value;
    }

    // 2. 如果没有数据，请求后端
    try {
      const res = await dayhttp.getAllHolidayTypes(null, null, { all: true });
      holidayTypes.value = res;
      localStorage.setItem('holidayTypes', JSON.stringify(res)); // 存储到 localStorage
      return res;
    } catch (error) {
      // console.error('获取假期类型失败:', error);
      if (Array.isArray(error)) {
        for (const item of error) {
          ElMessage.error(item);
        }
      } else {
        ElMessage.error(JSON.stringify(error));
      }
      throw error;
    }
  };
  // 删除
  const deleteHolidayType = (id) => {
    holidayTypes.value = JSON.parse(localStorage.getItem('holidayTypes')) || [];
    const index = holidayTypes.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      holidayTypes.value.splice(index, 1); // 从数组中删除
      localStorage.setItem('holidayTypes', JSON.stringify(holidayTypes.value)); // 更新 localStorage
    }
    // else {
    //     console.error(`假期类型 ID ${id} 未找到`);
    // }
  };
  // 新增
  const addHolidayType = (newHT) => {
    holidayTypes.value = JSON.parse(localStorage.getItem('holidayTypes')) || [];
    holidayTypes.value.push(newHT); // 新增假期类型
    localStorage.setItem('holidayTypes', JSON.stringify(holidayTypes.value)); // 更新 localStorage
  };

  // 更新
  const updateHolidayType = (updateHT) => {
    holidayTypes.value = JSON.parse(localStorage.getItem('holidayTypes')) || [];
    const index = holidayTypes.value.findIndex(
      (item) => item.id === updateHT.id
    );

    if (index !== -1) {
      holidayTypes.value[index] = updateHT;
      localStorage.setItem('holidayTypes', JSON.stringify(holidayTypes.value));
    } else {
      console.error(`假期类型 ID ${updateHT.id} 未找到`);
    }
  };

  // 清空并重新获取用户数据
  const refreshHolidayTypes = async () => {
    localStorage.removeItem('holidayTypes'); // 清空 localStorage

    try {
      const res = await dayhttp.getAllHolidayTypes(null, null, { all: true });
      holidayTypes.value = res; // 更新本地数据
      localStorage.setItem('holidayTypes', JSON.stringify(res)); // 存储到 localStorage
      // ElMessage.success('store holidaytype已更新'); // 提示用户
    } catch (error) {
      // console.error('store refresh 存储holidaytype失败:', error);
      if (Array.isArray(error)) {
        for (const item of error) {
          ElMessage.error(item);
        }
      } else {
        ElMessage.error(JSON.stringify(error));
      }
    }
  };

  return {
    holidayTypes,
    fetchHolidayTypes,
    deleteHolidayType,
    addHolidayType,
    updateHolidayType,
    refreshHolidayTypes,
  };
});

// 节假日
export const useHolidayStore = defineStore('holidaystore', () => {
  const whyholidays = ref(
    JSON.parse(localStorage.getItem('whyholidays')) || []
  );

  const fetchHolidays = async () => {
    let storedData = JSON.parse(localStorage.getItem('whyholidays')) || [];

    if (storedData.length > 0) {
      whyholidays.value = storedData; // 更新 ref
      return whyholidays.value;
    }

    // 2. 如果没有数据，请求后端
    try {
      const res = await dayhttp.getAllHolidays(null, null, { all: true });
      whyholidays.value = res;
      localStorage.setItem('whyholidays', JSON.stringify(res)); // 存储到 localStorage
      return res;
    } catch (error) {
      // console.error('获取假期失败:', error);
      if (Array.isArray(error)) {
        for (const item of error) {
          ElMessage.error(item);
        }
      } else {
        ElMessage.error(JSON.stringify(error));
      }
      throw error;
    }
  };
  // 删除
  const deleteHoliday = (id) => {
    whyholidays.value = JSON.parse(localStorage.getItem('whyholidays')) || [];
    const index = whyholidays.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      whyholidays.value.splice(index, 1); // 从数组中删除
      localStorage.setItem('whyholidays', JSON.stringify(whyholidays.value)); // 更新 localStorage
    }
    // else {
    //     console.error(`假期类型 ID ${id} 未找到`);
    // }
  };
  // 新增
  const addHoliday = (newH) => {
    whyholidays.value = JSON.parse(localStorage.getItem('whyholidays')) || [];
    whyholidays.value.push(newH); // 新增假期类型
    localStorage.setItem('whyholidays', JSON.stringify(whyholidays.value)); // 更新 localStorage
  };

  // 更新
  const updateHoliday = (updateH) => {
    whyholidays.value = JSON.parse(localStorage.getItem('whyholidays')) || [];
    const index = whyholidays.value.findIndex((item) => item.id === updateH.id);

    if (index !== -1) {
      whyholidays.value[index] = updateH;
      localStorage.setItem('whyholidays', JSON.stringify(whyholidays.value));
    } else {
      console.error(`假期类型 ID ${updateH.id} 未找到`);
    }
  };

  // 清空并重新获取用户数据
  const refreshHolidays = async () => {
    localStorage.removeItem('whyholidays'); // 清空 localStorage

    try {
      const res = await dayhttp.getAllHolidays(null, null, { all: true });
      whyholidays.value = res; // 更新本地数据
      localStorage.setItem('whyholidays', JSON.stringify(res)); // 存储到 localStorage
      // ElMessage.success('用户数据已更新'); // 提示用户
    } catch (error) {
      // console.error('store refresh 存储holiday失败:', error);
      if (Array.isArray(error)) {
        for (const item of error) {
          ElMessage.error(item);
        }
      } else {
        ElMessage.error(JSON.stringify(error));
      }
    }
  };

  return {
    whyholidays,
    fetchHolidays,
    deleteHoliday,
    addHoliday,
    updateHoliday,
    refreshHolidays,
  };
});

// day
export const useWhyDayStore = defineStore('whydaystore', () => {
  const whydays = ref(JSON.parse(localStorage.getItem('whydays')) || []);

  const fetchWhyDays = async () => {
    let storedData = JSON.parse(localStorage.getItem('whydays')) || [];

    if (storedData.length > 0) {
      whydays.value = storedData; // 更新 ref
      return whydays.value;
    }

    // 2. 如果没有数据，请求后端
    try {
      const res = await dayhttp.getAllDay(null, null, { all: true });

      whydays.value = res;
      localStorage.setItem('whydays', JSON.stringify(res)); // 存储到 localStorage
      return res;
    } catch (error) {
      // console.error('获取每日信息失败:', error);
      if (Array.isArray(error)) {
        for (const item of error) {
          ElMessage.error(item);
        }
      } else {
        ElMessage.error(JSON.stringify(error));
      }
      throw error;
    }
  };
  // 删除
  const deleteWhyDay = (id) => {
    whydays.value = JSON.parse(localStorage.getItem('whydays')) || [];
    const index = whydays.value.findIndex((item) => item.id === id); // 删了这里好像找不到了，哪里已经操作了，懒得改了
    if (index !== -1) {
      whydays.value.splice(index, 1); // 从数组中删除
      localStorage.setItem('whydays', JSON.stringify(whydays.value)); // 更新 localStorage
    }
    // else {
    //     console.log(`day ID ${id} 未找到`);
    // }
  };
  // 新增
  const addWhyDay = (newdata) => {
    whydays.value = JSON.parse(localStorage.getItem('whydays')) || [];
    whydays.value.push(newdata); // 新增假期类型
    localStorage.setItem('whydays', JSON.stringify(whydays.value)); // 更新 localStorage
  };

  // 更新
  const updateWhyDay = (updateday) => {
    whydays.value = JSON.parse(localStorage.getItem('whydays')) || [];
    const index = whydays.value.findIndex((item) => item.id === updateday.id);

    if (index !== -1) {
      whydays.value[index] = updateday;
      localStorage.setItem('whydays', JSON.stringify(whydays.value));
    } else {
      console.error(`day ID ${updateday.id} 未找到`);
    }
  };

  // 清空并重新获取用户数据
  const refreshWhyDays = async () => {
    localStorage.removeItem('whydays'); // 清空 localStorage

    try {
      const res = await dayhttp.getAllDay(null, null, { all: true });
      whydays.value = res; // 更新本地数据
      localStorage.setItem('whydays', JSON.stringify(res)); // 存储到 localStorage
      // ElMessage.success('用户数据已更新'); // 提示用户
    } catch (error) {
      // console.error('store refresh 存储day失败:', error);
      if (Array.isArray(error)) {
        for (const item of error) {
          ElMessage.error(item);
        }
      } else {
        ElMessage.error(JSON.stringify(error));
      }
    }
  };

  return {
    whydays,
    fetchWhyDays,
    deleteWhyDay,
    addWhyDay,
    updateWhyDay,
    refreshWhyDays,
  };
});

///////////////////////////   调休
export const useVacationStore = defineStore('vacationdaystore', () => {
  const whyvacationdays = ref(
    JSON.parse(localStorage.getItem('whyvacationdays')) || []
  );

  const fetchVacationdays = async () => {
    let storedData = JSON.parse(localStorage.getItem('whyvacationdays')) || [];

    if (storedData.length > 0) {
      whyvacationdays.value = storedData; // 更新 ref
      return whyvacationdays.value;
    }

    // 2. 如果没有数据，请求后端
    try {
      const res = await dayhttp.getAllVacationDays(null, null, { all: true });
      whyvacationdays.value = res;
      localStorage.setItem('whyvacationdays', JSON.stringify(res)); // 存储到 localStorage
      return res;
    } catch (error) {
      // console.error('获取调休失败:', error);
      if (Array.isArray(error)) {
        for (const item of error) {
          ElMessage.error(item);
        }
      } else {
        ElMessage.error(JSON.stringify(error));
      }
      throw error;
    }
  };
  // 删除
  const deleteVacationday = (id) => {
    whyvacationdays.value =
      JSON.parse(localStorage.getItem('whyvacationdays')) || [];
    const index = whyvacationdays.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      whyvacationdays.value.splice(index, 1); // 从数组中删除
      localStorage.setItem(
        'whyvacationdays',
        JSON.stringify(whyvacationdays.value)
      ); // 更新 localStorage
    }
    // else {
    //     console.error(`调休 ID ${id} 未找到`);
    // }
  };
  // 新增
  const addVacationday = (newV) => {
    whyvacationdays.value =
      JSON.parse(localStorage.getItem('whyvacationdays')) || [];
    whyvacationdays.value.push(newV); // 新增假期类型
    localStorage.setItem(
      'whyvacationdays',
      JSON.stringify(whyvacationdays.value)
    ); // 更新 localStorage
  };

  // 更新
  const updateVacationday = (updateV) => {
    whyvacationdays.value =
      JSON.parse(localStorage.getItem('whyvacationdays')) || [];
    const index = whyvacationdays.value.findIndex(
      (item) => item.id === updateV.id
    );

    if (index !== -1) {
      whyvacationdays.value[index] = updateV;
      localStorage.setItem(
        'whyvacationdays',
        JSON.stringify(whyvacationdays.value)
      );
    } else {
      console.error(`调休 ID ${updateV.id} 未找到`);
    }
  };

  // 清空并重新获取用户数据
  const refreshVacationdays = async () => {
    localStorage.removeItem('whyvacationdays'); // 清空 localStorage

    try {
      const res = await dayhttp.getAllVacationDays(null, null, { all: true });
      whyvacationdays.value = res; // 更新本地数据
      localStorage.setItem('whyvacationdays', JSON.stringify(res)); // 存储到 localStorage
      // ElMessage.success('用户数据已更新'); // 提示用户
    } catch (error) {
      // console.error('store refresh 存储调休失败:', error);
      if (Array.isArray(error)) {
        for (const item of error) {
          ElMessage.error(item);
        }
      } else {
        ElMessage.error(JSON.stringify(error));
      }
    }
  };

  return {
    whyvacationdays,
    fetchVacationdays,
    deleteVacationday,
    addVacationday,
    updateVacationday,
    refreshVacationdays,
  };
});

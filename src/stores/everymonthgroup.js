import { ref } from 'vue';
import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import staffhttp from '@/api/staffhttp';

export const useEveryMonthGroupStore = defineStore('everymonthgroup', () => {
  const everymonthgroup = ref(
    JSON.parse(localStorage.getItem('everymonthgroup')) || []
  );

  const fetcheverymonthgroup = async () => {
    let storedData = JSON.parse(localStorage.getItem('everymonthgroup')) || [];

    if (storedData.length > 0) {
      everymonthgroup.value = storedData; // 更新 ref
      return everymonthgroup.value;
    }

    try {
      const res = await staffhttp.getgroupbackups(null, null, {
        all: true,
      });
      everymonthgroup.value = res;
      localStorage.setItem('everymonthgroup', JSON.stringify(res)); // 存储到 localStorage
      return res;
    } catch (error) {
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

  const deleteeverymonthgroup = (id) => {
    everymonthgroup.value =
      JSON.parse(localStorage.getItem('everymonthgroup')) || [];

    const index = everymonthgroup.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      everymonthgroup.value.splice(index, 1); // 从数组中删除
      localStorage.setItem(
        'everymonthgroup',
        JSON.stringify(everymonthgroup.value)
      ); // 更新 localStorage
    } else {
      console.error(`everymonthgroup ID ${id} 未找到`);
    }
  };

  // 新增
  const addeverymonthgroup = (newdata) => {
    everymonthgroup.value =
      JSON.parse(localStorage.getItem('everymonthgroup')) || [];

    everymonthgroup.value.push(newdata);

    localStorage.setItem(
      'everymonthgroup',
      JSON.stringify(everymonthgroup.value)
    ); // 更新 localStorage
  };

  // 清空并重新获取用户数据
  const refreshgroupturns = async () => {
    localStorage.removeItem('everymonthgroup'); // 清空 localStorage

    try {
      const res = await staffhttp.getgroupbackups(null, null, {
        all: true,
      });
      everymonthgroup.value = res;
      localStorage.setItem('everymonthgroup', JSON.stringify(res)); // 存储到 localStorage
      return res;
    } catch (error) {
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

  return {
    everymonthgroup,
    fetcheverymonthgroup,
    deleteeverymonthgroup,
    addeverymonthgroup,
    refreshgroupturns,
  };
});

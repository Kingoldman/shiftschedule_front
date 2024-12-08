import { ref } from 'vue';
import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import shiftschedulejsonhttp from '@/api/shiftschedulejsonhttp.js';

export const useShiftscheduleJsonStore = defineStore(
  'shiftschedulejson',
  () => {
    const shiftschedulejson = ref(
      JSON.parse(localStorage.getItem('shiftschedulejson')) || []
    );

    const fetchshiftschedulejson = async () => {
      let storedData =
        JSON.parse(localStorage.getItem('shiftschedulejson')) || [];

      if (storedData.length > 0) {
        shiftschedulejson.value = storedData; // 更新 ref
        return shiftschedulejson.value;
      }

      try {
        const res = await shiftschedulejsonhttp.getshiftschedulejsons(
          null,
          null,
          {
            all: true,
          }
        );
        shiftschedulejson.value = res;
        localStorage.setItem('shiftschedulejson', JSON.stringify(res)); // 存储到 localStorage
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

    const deleteshiftschedulejson = (id) => {
      shiftschedulejson.value =
        JSON.parse(localStorage.getItem('shiftschedulejson')) || [];

      const index = shiftschedulejson.value.findIndex((item) => item.id === id);

      if (index !== -1) {
        shiftschedulejson.value.splice(index, 1); // 从数组中删除
        localStorage.setItem(
          'shiftschedulejson',
          JSON.stringify(shiftschedulejson.value)
        ); // 更新 localStorage
      } else {
        console.error(`shiftschedulejson ID ${id} 未找到`);
      }
    };

    // 新增
    const addshiftschedulejson = (newdata) => {
      shiftschedulejson.value =
        JSON.parse(localStorage.getItem('shiftschedulejson')) || [];

      shiftschedulejson.value.push(newdata);

      localStorage.setItem(
        'shiftschedulejson',
        JSON.stringify(shiftschedulejson.value)
      ); // 更新 localStorage
    };

    // 清空并重新获取用户数据
    const refreshshiftschedulejson = async () => {
      localStorage.removeItem('shiftschedulejson'); // 清空 localStorage

      try {
        const res = await shiftschedulejsonhttp.getshiftschedulejsons(
          null,
          null,
          {
            all: true,
          }
        );
        shiftschedulejson.value = res;
        localStorage.setItem('shiftschedulejson', JSON.stringify(res)); // 存储到 localStorage
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
      shiftschedulejson,
      fetchshiftschedulejson,
      deleteshiftschedulejson,
      addshiftschedulejson,
      refreshshiftschedulejson,
    };
  }
);

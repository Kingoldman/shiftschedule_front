import { ref } from 'vue';
import { defineStore } from 'pinia';
import groupturnhttp from '@/api/groupturnhttp';
import { ElMessage } from 'element-plus';

export const usegroupturnsStore = defineStore('groupturns', () => {
  const groupturns = ref(JSON.parse(localStorage.getItem('groupturns')) || []);

  const fethgroupturns = async () => {
    let storedData = JSON.parse(localStorage.getItem('groupturns')) || [];

    if (storedData.length > 0) {
      groupturns.value = storedData; // 更新 ref
      return groupturns.value;
    }

    try {
      const res = await groupturnhttp.getallgroupturn(null, null, {
        all: true,
      });
      groupturns.value = res;
      localStorage.setItem('groupturns', JSON.stringify(res)); // 存储到 localStorage
      return res;
    } catch (error) {
      // console.error('获取开始组失败！:', error);
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

  const deletegroupturn = (id) => {
    groupturns.value = JSON.parse(localStorage.getItem('groupturns')) || [];
    const index = groupturns.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      groupturns.value.splice(index, 1); // 从数组中删除
      localStorage.setItem('groupturns', JSON.stringify(groupturns.value)); // 更新 localStorage
    } else {
      console.error(`groupturn ID ${id} 未找到`);
    }
  };

  // 新增
  const addgroupturn = (newdata) => {
    groupturns.value = JSON.parse(localStorage.getItem('groupturns')) || [];
    groupturns.value.push(newdata); // 新增假期类型
    localStorage.setItem('groupturns', JSON.stringify(groupturns.value)); // 更新 localStorage
  };

  // 更新
  const updategroupturn = (updateD) => {
    groupturns.value = JSON.parse(localStorage.getItem('groupturns')) || [];
    const index = groupturns.value.findIndex((item) => item.id === updateD.id);

    if (index !== -1) {
      groupturns.value[index] = updateD;
      localStorage.setItem('groupturns', JSON.stringify(groupturns.value));
    } else {
      console.error(`groupturns ID ${updateD.id} 未找到`);
    }
  };

  // 清空并重新获取用户数据
  const refreshgroupturns = async () => {
    localStorage.removeItem('groupturns'); // 清空 localStorage

    try {
      const res = await groupturnhttp.getallgroupturn(null, null, {
        all: true,
      });
      groupturns.value = res; // 更新本地数据
      localStorage.setItem('groupturns', JSON.stringify(res)); // 存储到 localStorage
      // ElMessage.success('用户数据已更新'); // 提示用户
    } catch (error) {
      // console.error('store refresh 存储groupturns失败:', error);
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
    fethgroupturns,
    deletegroupturn,
    addgroupturn,
    updategroupturn,
    refreshgroupturns,
  };
});

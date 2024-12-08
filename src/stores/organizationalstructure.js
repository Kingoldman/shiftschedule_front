import { ref } from 'vue';
import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import staffhttp from '@/api/staffhttp';

////////////////////////////////////////////////////// 部门
export const useDepartmentsStore = defineStore('whydepartmentsstore', () => {
  const whydepartments = ref(
    JSON.parse(localStorage.getItem('whydepartments')) || []
  );

  const fetchDepartments = async () => {
    let storedData = JSON.parse(localStorage.getItem('whydepartments')) || [];

    if (storedData.length > 0) {
      whydepartments.value = storedData; // 更新 ref
      return whydepartments.value;
    }

    // 2. 如果没有数据，请求后端
    try {
      const res = await staffhttp.getAllDepartments(null, null, { all: true });
      whydepartments.value = res;
      localStorage.setItem('whydepartments', JSON.stringify(res)); // 存储到 localStorage
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
  // 删除
  const deleteDepartment = (id) => {
    whydepartments.value =
      JSON.parse(localStorage.getItem('whydepartments')) || [];
    const index = whydepartments.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      whydepartments.value.splice(index, 1); // 从数组中删除
      localStorage.setItem(
        'whydepartments',
        JSON.stringify(whydepartments.value)
      ); // 更新 localStorage
    }
    // else {
    //     console.error(`部门 ID ${id} 未找到`);
    // }
  };
  // 新增
  const addDepartment = (newD) => {
    whydepartments.value =
      JSON.parse(localStorage.getItem('whydepartments')) || [];
    whydepartments.value.push(newD); // 新增假期类型
    localStorage.setItem(
      'whydepartments',
      JSON.stringify(whydepartments.value)
    ); // 更新 localStorage
  };

  // 更新
  const updateDepartment = (updateD) => {
    whydepartments.value =
      JSON.parse(localStorage.getItem('whydepartments')) || [];
    const index = whydepartments.value.findIndex(
      (item) => item.id === updateD.id
    );

    if (index !== -1) {
      whydepartments.value[index] = updateD;
      localStorage.setItem(
        'whydepartments',
        JSON.stringify(whydepartments.value)
      );
    } else {
      console.error(`假期类型 ID ${updateD.id} 未找到`);
    }
  };

  // 清空并重新获取用户数据
  const refreshDepartments = async () => {
    localStorage.removeItem('whydepartments'); // 清空 localStorage

    try {
      const res = await staffhttp.getAllDepartments(null, null, { all: true });
      whydepartments.value = res; // 更新本地数据
      localStorage.setItem('whydepartments', JSON.stringify(res)); // 存储到 localStorage
      // ElMessage.success('用户数据已更新'); // 提示用户
    } catch (error) {
      // console.error('store refresh 存储组失败:', error);
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
    whydepartments,
    fetchDepartments,
    deleteDepartment,
    addDepartment,
    updateDepartment,
    refreshDepartments,
  };
});

///////////////////////////////////////////////////// 组
export const useGroupsStore = defineStore('whygroupsstore', () => {
  const whygroups = ref(JSON.parse(localStorage.getItem('whygroups')) || []);

  const fetchGroups = async () => {
    let storedData = JSON.parse(localStorage.getItem('whygroups')) || [];

    if (storedData.length > 0) {
      whygroups.value = storedData; // 更新 ref
      return whygroups.value;
    }

    // 2. 如果没有数据，请求后端
    try {
      const res = await staffhttp.getAllGroups(null, null, { all: true });
      whygroups.value = res;
      localStorage.setItem('whygroups', JSON.stringify(res)); // 存储到 localStorage
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
  // 删除
  const deleteGroup = (id) => {
    whygroups.value = JSON.parse(localStorage.getItem('whygroups')) || [];
    const index = whygroups.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      whygroups.value.splice(index, 1); // 从数组中删除
      localStorage.setItem('whygroups', JSON.stringify(whygroups.value)); // 更新 localStorage
    }
    // else {
    //     console.error(`组 ID ${id} 未找到`);
    // }
  };
  // 新增
  const addGroup = (newdata) => {
    whygroups.value = JSON.parse(localStorage.getItem('whygroups')) || [];
    whygroups.value.push(newdata); // 新增假期类型
    localStorage.setItem('whygroups', JSON.stringify(whygroups.value)); // 更新 localStorage
  };

  // 更新
  const updateGroup = (updateD) => {
    whygroups.value = JSON.parse(localStorage.getItem('whygroups')) || [];
    const index = whygroups.value.findIndex((item) => item.id === updateD.id);

    if (index !== -1) {
      whygroups.value[index] = updateD;
      localStorage.setItem('whygroups', JSON.stringify(whygroups.value));
    } else {
      console.error(`组 ID ${updateD.id} 未找到`);
    }
  };

  // 清空并重新获取用户数据
  const refreshGroups = async () => {
    localStorage.removeItem('whygroups'); // 清空 localStorage

    try {
      const res = await staffhttp.getAllGroups(null, null, { all: true });
      whygroups.value = res; // 更新本地数据
      localStorage.setItem('whygroups', JSON.stringify(res)); // 存储到 localStorage
      // ElMessage.success('用户数据已更新'); // 提示用户
    } catch (error) {
      // console.error('store refresh 存储组失败:', error);
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
    whygroups,
    fetchGroups,
    deleteGroup,
    addGroup,
    updateGroup,
    refreshGroups,
  };
});

// 人员
export const useUsersStore = defineStore('whyusersstore', () => {
  const whyusers = ref(JSON.parse(localStorage.getItem('whyusers')) || []);

  const fetchUsers = async () => {
    let storedData = JSON.parse(localStorage.getItem('whyusers')) || [];

    if (storedData.length > 0) {
      whyusers.value = storedData; // 更新 ref
      return whyusers.value;
    }

    // 2. 如果没有数据，请求后端
    try {
      const res = await staffhttp.getAllStaff(null, null, { all: true });
      whyusers.value = res;
      localStorage.setItem('whyusers', JSON.stringify(res)); // 存储到 localStorage
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
  // 删除
  const deleteUser = (id) => {
    whyusers.value = JSON.parse(localStorage.getItem('whyusers')) || [];
    const index = whyusers.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      whyusers.value.splice(index, 1); // 从数组中删除
      localStorage.setItem('whyusers', JSON.stringify(whyusers.value)); // 更新 localStorage
    }
    // else {
    //     console.error(`人员 ID ${id} 未找到`);
    // }
  };
  // 新增
  const addUser = (newdata) => {
    whyusers.value = JSON.parse(localStorage.getItem('whyusers')) || [];
    whyusers.value.push(newdata); // 新增假期类型
    localStorage.setItem('whyusers', JSON.stringify(whyusers.value)); // 更新 localStorage
  };

  // 更新
  const updateUser = (updatedata) => {
    whyusers.value = JSON.parse(localStorage.getItem('whyusers')) || [];
    const index = whyusers.value.findIndex((item) => item.id === updatedata.id);

    if (index !== -1) {
      whyusers.value[index] = updatedata;
      localStorage.setItem('whyusers', JSON.stringify(whyusers.value));
    } else {
      console.error(`人员 ID ${updatedata.id} 未找到`);
    }
  };

  // 清空并重新获取用户数据
  const refreshUsers = async () => {
    localStorage.removeItem('whyusers'); // 清空 localStorage

    try {
      const res = await staffhttp.getAllStaff(null, null, { all: true });
      whyusers.value = res; // 更新本地数据
      localStorage.setItem('whyusers', JSON.stringify(res)); // 存储到 localStorage
      // ElMessage.success('用户数据已更新'); // 提示用户
    } catch (error) {
      // console.error('store refresh 存储人员失败:', error);
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
    whyusers,
    fetchUsers,
    deleteUser,
    addUser,
    updateUser,
    refreshUsers,
  };
});

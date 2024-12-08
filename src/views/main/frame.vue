<script setup>
import { ref } from 'vue';

import { useAuthStore } from '@/stores/auth';
import ScheduleSider from './ScheduleSider/index.vue';
import AsiderHandler from './AsiderHandler/index.vue';
import ResetPwdForm from './ResetPwdForm/index.vue';
import UserDropDown from './UserDropDown/index.vue';
import { RouterView } from 'vue-router';
import IntoLoading from './IntoLoading/index.vue';
import { useRefreshAllStore } from '@/stores/refreshallstore';
const refreshallstore = useRefreshAllStore();

let is_into_masking = ref(false);
const operationloading = ref(false);
const enterinto = async () => {
  if (operationloading.value) return;
  operationloading.value = true;
  try {
    await refreshallstore.refresh_all_stores(); // 进来时获取最新数据
    is_into_masking.value = true;
  } catch (error) {
    console.log(error);
  } finally {
    operationloading.value = false;
  }
};

const authStore = useAuthStore(); // pinia

// 侧边栏收缩状态
const isCollapsed = ref(false);
//改密码dialog窗显示状态
const dialogFormVisible = ref(false);
</script>
<template>
  <div class="common-layout" v-if="is_into_masking">
    <el-container class="h-screen">
      <!-- 侧边栏 ScheduleSider -->
      <ScheduleSider v-model:isCollapsed="isCollapsed"></ScheduleSider>
      <el-container class="!bg-slate-50">
        <el-header class="!bg-white flex items-center justify-between">
          <!-- 侧边栏收缩控制键 AsiderHandler -->
          <AsiderHandler
            :isCollapsed="isCollapsed"
            @updateCollapsed="isCollapsed = !isCollapsed"
          ></AsiderHandler>
          <!-- 右侧用户下拉菜单 UserDropDown -->
          <UserDropDown
            :dialogFormVisible="dialogFormVisible"
            :authStore="authStore"
            @open:dialogFormVisible="dialogFormVisible = true"
          ></UserDropDown>
        </el-header>
        <!--主体内容 el-main-->
        <el-main class=""><RouterView></RouterView></el-main>
      </el-container>
    </el-container>
  </div>
  <!-- IntoLoading 进入主页确定，实际请求最新数据 -->
  <IntoLoading
    v-else
    @enterinto="enterinto"
    :operationloading="operationloading"
    >else</IntoLoading
  >
  <!-- 修改密码弹窗 el-dialog-->
  <el-dialog
    v-model="dialogFormVisible"
    title=""
    width="400"
    center
    append-to="body"
  >
    <!-- 修改密码弹窗里面的表单 ResetPwdForm -->
    <ResetPwdForm
      :dialogFormVisible="dialogFormVisible"
      @close:resetpwddialog="dialogFormVisible = false"
    >
      >
    </ResetPwdForm>
  </el-dialog>
</template>
<style lang="scss" scoped></style>

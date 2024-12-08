<script setup>
import { ref, reactive } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import {
  Menu as IconMenu,
  ArrowDown,
  UserFilled,
} from '@element-plus/icons-vue';
import {ElMessage} from "element-plus";

const props = defineProps({
  authStore: {},
});

const emit = defineEmits(['open:dialogFormVisible']);

// 打开修改密码对话框
const onOpenResetPwdDialog = () => {
  emit('open:dialogFormVisible');
};

const router = useRouter();

// 退出登录
const onLogout = () => {
  try {
    props.authStore.clearUserToken();
    router.push({ name: 'login' });
    ElMessage.warning('退出登录成功');
  } catch (error) {
    if(Array.isArray(error)){
      for (const item of error){
        ElMessage.error(item);
      }
    }else{
      ElMessage.error(JSON.stringify(error));
    }

    ElMessage.error('退出登录失败');
  }
};
</script>
<template>
  <div>
    <el-dropdown class="">
      <span class="flex items-center">
        <el-avatar :icon="UserFilled" :size="25" />
        <span class="ml-2 text-base">{{ authStore.user.username }}</span>
        <el-icon class="ml-2">
          <ArrowDown />
        </el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="onOpenResetPwdDialog"
            >修改密码</el-dropdown-item
          >
          <el-dropdown-item @click="onLogout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>
<style lang="scss" scoped></style>

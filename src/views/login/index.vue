<script setup>
import { ref, reactive } from 'vue';

import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import authHttp from '@/api/authhttp';
import { ElMessage } from 'element-plus';

const router = useRouter();
const authStore = useAuthStore();

const ruleFormRef = ref(); // 登录form

let isLoading = ref(false); // 添加这个标志来控制请求状态

const ruleForm = reactive({
  loginaccount: '',
  password: '',
});

const checkloginaccount = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入账号'));
  } else {
    // 假设我们仍然需要异步检查邮箱（

    callback(); // 有效，继续下一步
  }
  // 字母或数字
  // const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  // if (!alphanumericRegex.test(value)) {
  //    callback(new Error('账号格式错误'));
  // } else {
  //   // 假设我们仍然需要异步检查邮箱（

  //   callback(); // 有效，继续下一步
  // }
};

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'));
  } else if (value.length < 6) {
    // 假设密码长度至少为6位
    callback(new Error('密码长度不能少于6位'));
  } else {
    // 异步验证或其他复杂逻辑
    // 如果需要异步验证，可以在这里进行
    callback();
  }
};

const rules = {
  loginaccount: [{ validator: checkloginaccount, trigger: 'blur' }],
  password: [{ validator: validatePass, trigger: 'blur' }],
};

const submitForm = (formEl) => {
  if (!formEl) return;
  if (isLoading.value) return; // 如果已经在加载中，则不执行后续操作

  formEl.validate(async (valid) => {
    if (valid) {
      isLoading.value = true; // 设置加载状态为true
      // console.log('submit!');
      // 调用登录接口
      try {
        let data = await authHttp.login(
          ruleForm.loginaccount,
          ruleForm.password
        );
        authStore.setUserToken(data.user, data.token);

        router.push({ name: 'frame' });
        ElMessage.success('登录成功');
      } catch (error) {
        if (Array.isArray(error)) {
          for (const item of error) {
            ElMessage.error(item);
          }
        } else {
          ElMessage.error(JSON.stringify(error));
        }
      } finally {
        isLoading.value = false; // 无论成功或失败，都设置为非加载状态
      }
    } else {
      //console.log('error submit!');
    }
  });
};
</script>
<template>
  <div class="h-screen flex items-center justify-center">
    <div class="w-1/4 flex-col space-y-2">
      <div class="space-x-2">
        <el-text>后端托管在</el-text>
        <el-tag type="primary">PythonAnywhere </el-tag>
      </div>
      <div class="space-x-2">
        <el-text>前端托管在</el-text>
        <el-tag type="primary">GitHubPages </el-tag>
      </div>
      <div>
        <el-text type="danger">因为没给钱，所以很慢</el-text>
      </div>
    </div>

    <div>
      <div class="p-8 m-1 w-96 shadow-lg">
        <h2
          class="font-medium text-gray-600 text-2xl leading-tight tracking-wider text-center mb-6"
        >
          登录
        </h2>
        <el-form
          ref="ruleFormRef"
          style="max-width: 400px"
          :model="ruleForm"
          status-icon
          :rules="rules"
          label-width=""
          class="demo-ruleForm space-y-6 mx-auto"
        >
          <el-form-item label="账号" prop="loginaccount">
            <el-input
              v-model="ruleForm.loginaccount"
              type="text"
              autocomplete="off"
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="ruleForm.password"
              type="password"
              autocomplete="off"
              :show-password="true"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="submitForm(ruleFormRef)"
              class="w-full"
              :loading="isLoading"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped></style>

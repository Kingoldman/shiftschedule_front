<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

import authHttp from '@/api/authhttp';
import {ElMessage} from "element-plus";

const router = useRouter();

const props = defineProps({
  dialogFormVisible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close:resetpwddialog']);

const closedialog = () => {
  emit('close:resetpwddialog');
  initFormData(); // 关闭窗口时候重置表单
};

const resetpwdform = reactive({
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: '',
});
const ruleFormRef = ref();

const validate_old_password = (rule, value, callback) => {
  if (value === '') {
    return callback(new Error('请输入旧密码'));
  } else {
    callback(); //继续下一步
  }
};

const validate_newPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入新密码'));
  } else {
    if (resetpwdform.confirmNewPassword !== '') {
      if (!ruleFormRef.value) return;
      ruleFormRef.value.validateField('confirmNewPassword');
    }
    callback();
  }
};

const validate_confirmNewPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'));
  } else if (value !== resetpwdform.newPassword) {
    callback(new Error('两次输入的密码不一致!'));
  } else {
    callback();
  }
};

const rules = {
  oldPassword: [
    {
      validator: validate_old_password,
      trigger: 'blur',
      required: true,
    },
  ],
  newPassword: [
    {
      validator: validate_newPassword,
      trigger: 'blur',
      required: true,
    },
    { min: 6, max: 20, message: '长度6-20位', trigger: 'blur' },
  ],
  confirmNewPassword: [
    {
      validator: validate_confirmNewPassword,
      trigger: 'blur',
      required: true,
    },
    { min: 6, max: 20, message: '长度6-20位', trigger: 'blur' },
  ],
};

const isResetPwdLoading = ref(false); // 防止短时间重复提交
// 重置表单
const resetForm = (formEl) => {
  if (!formEl) return;
  formEl.resetFields();
};

const initFormData = () => {
  resetpwdform.oldPassword = '';
  resetpwdform.newPassword = '';
  resetpwdform.confirmNewPassword = '';
  resetForm(ruleFormRef.value);
};

const submitForm = (formEl) => {
  if (!formEl) return;
  if (isResetPwdLoading.value) return; // 如果已经在加载中，则不执行后续操作

  formEl.validate(async (valid) => {
    if (valid) {
      isResetPwdLoading.value = true; // 设置加载状态为true

      try {
        await authHttp.resetPassword(
          resetpwdform.oldPassword,
          resetpwdform.newPassword,
          resetpwdform.confirmNewPassword
        );

        closedialog();
        router.push({ name: 'login' });
        ElMessage.success('密码修改成功，请重新登录');
      } catch (error) {
        if(Array.isArray(error)){
          for (const item of error){
            ElMessage.error(item);
          }
        }else{
          ElMessage.error(JSON.stringify(error));
        }
      } finally {
        isResetPwdLoading.value = false; // 最终都要解除加载状态
        initFormData(); // 清空表单
      }
    } else {
      //console.log('error submit!');
    }
  });
};
</script>

<template>
  <div>
    <h2
      class="font-medium text-gray-600 text-xl leading-tight tracking-wider text-center mb-2"
    >
      修改密码
    </h2>
    <el-form
      :model="resetpwdform"
      ref="ruleFormRef"
      :rules="rules"
      label-width="auto"
      class="demo-ruleForm space-y-6 mx-auto p-4"
      status-icon
    >
      <el-form-item label="原密码" prop="oldPassword">
        <el-input
          v-model="resetpwdform.oldPassword"
          autocomplete="off"
          type="password"
          :show-password="true"
        />
      </el-form-item>

      <el-form-item label="新的密码" prop="newPassword">
        <el-input
          v-model="resetpwdform.newPassword"
          autocomplete="off"
          type="password"
          :show-password="true"
        />
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmNewPassword">
        <el-input
          v-model="resetpwdform.confirmNewPassword"
          autocomplete="off"
          type="password"
          :show-password="true"
        />
      </el-form-item>
    </el-form>

    <div class="mt-2 mb-1 flex justify-center items-center">
      <el-button @click="closedialog" :loading="isResetPwdLoading"
        >取消</el-button
      >
      <el-button
        type="primary"
        @click="submitForm(ruleFormRef)"
        :loading="isResetPwdLoading"
      >
        确定
      </el-button>
    </div>
  </div>
</template>
<style lang="scss" scoped></style>

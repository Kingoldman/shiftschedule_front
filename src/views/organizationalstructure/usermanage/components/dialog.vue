<script setup>
import { ref, reactive, watch, toRefs } from 'vue';
import staffhttp from '@/api/staffhttp';
import { removeNullItem } from '@/utils/utils.js';
import { whyStatus, whyGender, whyState } from '@/utils/constant';
import { ElMessage } from 'element-plus';

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  width: {
    type: String,
    default: '500',
  },
  editdataform: {
    type: Object,
    default: () => {},
  },
  why_groups: {
    type: Array,
    default: () => [],
  },
  why_departments: {
    type: Array,
    default: () => [],
  },
});

let ruleForm = reactive({
  id: null,
  order_id: null,
  loginaccount: null,
  password: null,
  username: null,
  department_id: null,
  mygroup_id: null,
  phone: null,
  gender: null,
  status: null,
  state: null,
  is_leader: null,
});
const ruleFormRef = ref(); //表单ref
const rules = ref({
  order_id: [
    {
      required: true,
      message: '顺序号必填项',
      trigger: 'blur',
    },
  ],
  loginaccount: [
    {
      required: true,
      message: '登录名必填项',
      trigger: 'blur',
    },
  ],
  password: [
    {
      required: true,
      message: '密码必填项',
      trigger: 'blur',
    },
  ],
  username: [
    {
      required: true,
      message: '姓名必填项',
      trigger: 'blur',
    },
  ],
  department_id: [],
  mygroup_id: [],
  phone: [],
  gender: [],
  status: [],
  state: [],
  is_leader: [],
});

// 双向数据绑定
let dialogFormVisible = defineModel('dialogVisible');
let operationloading = defineModel('operationloading');

const emits = defineEmits(['initrequest']); // 修改后通知父组件刷新数据

// 监听父组件传来的待编辑的数据，赋值给前端Form
watch(
  () => props.editdataform,
  () => {
    // console.log('props.editdataform', props.editdataform);
    ruleForm = props.editdataform;
    // console.log('ruleForm', ruleForm);
  },
  { deep: true }
);

const cancelForm = () => {
  dialogFormVisible.value = false;
  ruleFormRef.value.resetFields(); // 清空form
};

const submitForm = (formEl) => {
  if (!formEl) return;
  if (operationloading.value) return; // 如果已经在加载中，则不执行后续操作
  let ischangesuccess = false; // 是否修改成功标记
  formEl.validate(async (valid) => {
    if (valid) {
      operationloading.value = true; // 设置加载状态为true
      try {
        let params = {
          ...ruleForm, // 解构 ruleForm 的所有属性
        };

        // 编辑之前先把params中的空值删除?
        params = removeNullItem(params);

        if (props.title === '添加人员') {
          let res = await staffhttp.createStaff(params);

          ElMessage.success('添加成功');
        } else if (props.title === '编辑人员') {
          let res = await staffhttp.updateStaff(params.id, params);

          ElMessage.success('修改成功');
        }
        ischangesuccess = true; // 修改成功
        dialogFormVisible.value = false; // 关闭弹窗
      } catch (error) {
        ischangesuccess = false; // 修改失败，不发起新请求
        if (Array.isArray(error)) {
          for (const item of error) {
            ElMessage.error(item);
          }
        } else {
          ElMessage.error(JSON.stringify(error));
        }
      } finally {
        operationloading.value = false; // 重置加载状态
      }
      if (ischangesuccess) {
        emits('initrequest'); // 修改成功才通知父组件刷新数据
      }
    } else {
      // operationloading.value = false; // 设置为非加载状态，这一步好像没必要
      //console.log('error submit!');
    }
  });
};
</script>

<template>
  <el-dialog
    v-model="dialogFormVisible"
    :title="title"
    :width="width"
    append-to="body"
    @close="cancelForm"
  >
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      status-icon
      :rules="rules"
      label-width="auto"
      class="demo-ruleForm"
    >
      <el-form-item label="顺序号" prop="order_id">
        <el-input v-model="ruleForm.order_id" clearable />
      </el-form-item>

      <el-form-item label="姓名" prop="username">
        <el-input v-model="ruleForm.username" clearable />
      </el-form-item>

      <el-form-item label="账号" prop="loginaccount">
        <el-input v-model="ruleForm.loginaccount" clearable />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input
          v-model="ruleForm.password"
          type="password"
          :show-password="true"
          clearable
        />
      </el-form-item>

      <el-form-item label="领导" prop="is_leader">
        <el-select v-model="ruleForm.is_leader" placeholder="领导" clearable>
          <el-option
            v-for="val in [
              { idx: 1, value: true, name: '是' },
              { idx: 2, value: false, name: '否' },
            ]"
            :key="val.idx"
            :label="val.name"
            :value="val.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="单位" prop="department_id">
        <el-select v-model="ruleForm.department_id" clearable>
          <el-option
            v-for="(department, index) in why_departments"
            :key="index"
            :label="department.name"
            :value="department.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="值班组" prop="mygroup_id">
        <el-select v-model="ruleForm.mygroup_id" clearable>
          <el-option
            v-for="(group, index) in why_groups"
            :key="index"
            :label="'第' + group.order_id + '组' + '/' + group.name"
            :value="group.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="手机" prop="phone">
        <el-input v-model="ruleForm.phone" clearable />
      </el-form-item>

      <el-form-item label="性别" prop="gender">
        <el-select v-model="ruleForm.gender" clearable>
          <el-option
            v-for="(option, index) in whyGender"
            :key="index"
            :label="option.name"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="值班状态" prop="state">
        <el-select v-model="ruleForm.state" clearable>
          <el-option
            v-for="(option, index) in whyState"
            :key="index"
            :label="option.name"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="用户状态" prop="status">
        <el-select v-model="ruleForm.status" clearable>
          <el-option
            v-for="(option, index) in whyStatus"
            :key="index"
            :label="option.name"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancelForm" :loading="operationloading"
          >取消</el-button
        >
        <el-button
          type="primary"
          @click="submitForm(ruleFormRef)"
          :loading="operationloading"
        >
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<style scoped></style>

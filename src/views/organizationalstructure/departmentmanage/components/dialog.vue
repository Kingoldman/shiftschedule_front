<script setup>
import { ref, reactive, watch } from 'vue';
import staffhttp from '@/api/staffhttp';
import { removeNullItem } from '@/utils/utils.js';
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
  why_users: {
    type: Array,
    default: () => [],
  },
});
let ruleForm = reactive({
  id: null,
  order_id: null,
  name: '',
  intro: '',
  created_at: '',
  staffs_ids: [],
});
const ruleFormRef = ref(); //表单ref
const rules = ref({
  order_id: [],
  name: [
    {
      required: true,
      message: '部门名称必填项',
      trigger: 'blur',
    },
  ],
  intro: [
    {
      required: false,
    },
  ],
  created_at: [],
  staffs_ids: [],
});
// 双向数据绑定
let dialogFormVisible = defineModel('dialogVisible');
let operationloading = defineModel('operationloading');

const emits = defineEmits(['initrequest']); // 修改后通知父组件刷新数据

// 监听父组件传来的待编辑的数据，赋值给前端Form
watch(
  () => props.editdataform,
  () => {
    // console.log(props.editdataform);
    ruleForm = props.editdataform;
    //console.log('ruleForm', ruleForm);
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
        // 编辑之前先把params中的空值删除
        params = removeNullItem(params);

        const data = {
          id: params.id,
          order_id: params.order_id,
          name: params.name,
          intro: params.intro,
          staffs_ids: params.staffs_ids ? params.staffs_ids : [],
        }; // 筛选一下put的data

        if (props.title === '添加部门') {
          let res = await staffhttp.createDepartment(data);
          // whydepartmentstore.addDepartment(res); // 有外键，不好在这里直接添加，直接外面重新获取一次算了
          ElMessage.success('添加成功');
        } else if (props.title === '编辑部门') {
          let res = await staffhttp.updateDepartment(data.id, data);
          // whydepartmentstore.updateDepartment(res); // 有外键，不好在这里直接添加，直接外面重新获取一次算了
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
        <el-input v-model="ruleForm.order_id" />
      </el-form-item>
      <el-form-item label="部门名称" prop="name">
        <el-input v-model="ruleForm.name" />
      </el-form-item>
      <el-form-item label="简介" prop="intro">
        <el-input v-model="ruleForm.intro" />
      </el-form-item>
      <el-form-item label="包含人员" prop="staffs_ids">
        <el-select v-model="ruleForm.staffs_ids" multiple>
          <el-option
            v-for="(user, index) in why_users"
            :key="index"
            :label="user.username"
            :value="user.id"
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

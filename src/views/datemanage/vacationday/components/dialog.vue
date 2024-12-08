<script setup>
import { ref, reactive, watch } from 'vue';
import dayhttp from '@/api/dayhttp';
import { ElMessage } from 'element-plus';
import { removeNullItem } from '@/utils/utils.js';

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
  why_days: {
    type: Object,
    default: () => [],
  },
  isedit: {
    type: Boolean,
    default: false,
  },
});
let ruleForm = reactive({
  id: null,
  created_at: '',
  day_id: null,
});
const ruleFormRef = ref(); //表单ref
const rules = ref({
  created_at: [],
  day_id: [{ required: true, message: '请选择', trigger: 'change' }],
});

// 双向数据绑定
let dialogFormVisible = defineModel('dialogVisible');
let operationloading = defineModel('operationloading');

const emits = defineEmits(['initrequest']); // 修改后通知父组件刷新数据

// 监听父组件传来的待编辑的数据，赋值给前端Form
watch(
  () => props.editdataform,
  () => {
    ruleForm = props.editdataform;
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
        let params = removeNullItem(ruleForm);
        const data = {
          id: params.id,
          day_id: params.day_id,
        }; // 筛选一下put的data

        if (props.title === '添加调休') {
          let res = await dayhttp.createVacationDay(data);
          // 修改store 有外键，待完善,不在这里添加，直接在initrequest里重新获取一次

          ElMessage.success('添加成功');
        } else if (props.title === '编辑调休') {
          let res = await dayhttp.updateVacationDay(data.id, data);
          // 修改store 有外键，待完善,不在这里添加，直接在initrequest里重新获取一次
          // whyvacationstore.updateVacationday(res)
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
      <el-form-item label="日期" prop="vacationday">
        <el-select v-model="ruleForm.day_id" :disabled="isedit">
          <el-option
            v-for="(day, index) in why_days"
            :key="index"
            :label="day.date"
            :value="day.id"
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

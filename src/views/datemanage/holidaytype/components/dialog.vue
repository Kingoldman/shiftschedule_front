<script setup>
import { ref, reactive, watch } from 'vue';
import dayhttp from '@/api/dayhttp';
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
});
let ruleForm = reactive({
  id: null,
  name: '',
  created_at: '',
});
const ruleFormRef = ref(); //表单ref
const rules = ref({
  name: [
    {
      required: true,
      message: '类型名称号必填项',
      trigger: 'blur',
    },
  ],

  created_at: [],
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
        if (props.title === '添加类型') {
          let res = await dayhttp.createHolidayType(ruleForm);
          // 更新store  不在这里添加，直接在initrequest里重新获取一次
          // whyholidaytypestore.addHolidayType(res);
          ElMessage.success('添加成功');
        } else if (props.title === '编辑类型') {
          const data = {
            name: ruleForm.name,
          }; // 筛选一下put的data
          let res = await dayhttp.updateHolidayType(ruleForm.id, data);
          // 更新store，就是更新res holidays不好更新，不在这里添加，直接在initrequest里重新获取一次
          // whyholidaytypestore.updateHolidayType(res);
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
      <el-form-item label="类型名称" prop="name">
        <el-input v-model="ruleForm.name" />
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

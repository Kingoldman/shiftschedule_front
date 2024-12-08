<script setup>
import { ref, reactive, watch } from 'vue';
import groupturnhttp from '@/api/groupturnhttp.js';
import { removeNullItem } from '@/utils/utils.js';
import { ElMessage } from 'element-plus';
import { selectYear } from '@/utils/constant';
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
});
let ruleForm = reactive({
  id: null,
  group_id: null,
  start_date: '',
});
const ruleFormRef = ref(); //表单ref
const rules = ref({
  group_id: [
    {
      required: true,
      message: '组必填',
      trigger: 'blur',
    },
  ],
  start_date: [
    {
      required: true,
      message: '开始时间必填',
      trigger: 'blur',
    },
  ],
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
        // 编辑之前先把params中的空值删除
        let params = removeNullItem(ruleForm);
        const data = {
          start_date: params.start_date ? params.start_date : '',
          group_id: params.group_id ? params.group_id : '',
        }; // 筛选一下put的data

        if (props.title === '添加') {
          const res = await groupturnhttp.creategroupturn(data);
          ElMessage.success('添加成功');
        } else if (props.title === '编辑') {
          const res = await groupturnhttp.updategroupturn(params.id, data);
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
      <el-form-item label="开始时间" prop="start_date">
        <el-date-picker
          v-model="ruleForm.start_date"
          type="date"
          placeholder="选择起始时间"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>

      <el-form-item label="组" prop="group_id">
        <el-select v-model="ruleForm.group_id" clearable>
          <el-option
            v-for="group in why_groups"
            :key="group.id"
            :label="'第' + group.order_id + '组' + ' / ' + group.name"
            :value="group.id"
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

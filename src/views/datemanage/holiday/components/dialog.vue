<script setup>
import { ref, reactive, watch } from 'vue';
import dayhttp from '@/api/dayhttp';
import { removeNullItem } from '@/utils/utils.js';
import { selectYear } from '@/utils/constant';
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
  holiday_types: {
    type: Object,
    default: () => [],
  },
  why_days: {
    type: Object,
    default: () => [],
  },
});
let ruleForm = reactive({
  id: null,
  year: '',
  holiday_type_id: null,
  days_ids: [],
  created_at: '',
});
const ruleFormRef = ref(); //表单ref
const rules = ref({
  year: [
    {
      required: true,
      message: '年份必填项',
      trigger: 'blur',
    },
  ],
  holiday_type_id: [
    { required: true, message: '请选择假日类型', trigger: 'change' },
  ],
  days_ids: [],

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
          id: params.id,
          year: params.year ? params.year : '',
          holiday_type_id: params.holiday_type_id,
          days_ids: params.days_ids ? params.days_ids : [],
        }; // 筛选一下put的data

        if (props.title === '添加假期') {
          let res = await dayhttp.createHoliday(data);
          //console.log("res",res)
          // 修改store 有外键，待完善,不在这里添加，直接在initrequest里重新获取一次
          // whyholidaystore.addHoliday(res) ;// 这里修改store的时候要注意，这里传入的是id
          ElMessage.success('添加成功');
        } else if (props.title === '编辑假期') {
          let res = await dayhttp.updateHoliday(data.id, data);
          // 修改store 有外键，待完善
          // whyholidaystore.updateHoliday(res) // 不在这里添加，直接在initrequest里重新获取一次
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
      <el-form-item label="假期名称" prop="holiday_type_id">
        <el-select v-model="ruleForm.holiday_type_id">
          <el-option
            v-for="(holiday_type, index) in holiday_types"
            :key="index"
            :label="holiday_type.name"
            :value="holiday_type.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="年份" prop="year">
        <el-select v-model="ruleForm.year" clearable placeholder="所属年份">
          <el-option
            v-for="(year, index) in selectYear"
            :key="index"
            :label="year"
            :value="year"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="包含日期" prop="days_ids">
        <el-select v-model="ruleForm.days_ids" multiple>
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

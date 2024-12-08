<script setup>
import { ref, reactive, watchEffect, watch } from 'vue';
import dayhttp from '@/api/dayhttp';
import { isNull, removeNullItem } from '@/utils/utils.js';
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
  why_holidays: {
    type: Array,
    default: () => [],
  },

  why_holiday_types: {
    type: Array,
    default: () => [],
  },
  why_vacationdays: {
    type: Array,
    default: () => [],
  },
});

let ruleForm = reactive({
  id: null,
  date: '',
  holiday_id: null,
  vacationday_id: null,
  isweekend: 0,
  isnormal: 1,
  isarranged: 0,
  ischecked: 0,
});

let is_vacationday = ref(false);
const ruleFormRef = ref(); //表单ref
const rules = ref({
  date: [
    {
      required: true,
      message: '日期必填项',
      trigger: 'blur',
    },
  ],

  // 下面四个属性，有且只能有1个大于0，待完善validate
  holiday_id: [],
  vacationday_id: [],
  isweekend: [],
  isnormal: [],
  isarranged: [],
  ischecked: [],
});

// 双向数据绑定
let dialogFormVisible = defineModel('dialogVisible');
let operationloading = defineModel('operationloading');

const emits = defineEmits(['initrequest']); // 修改后通知父组件刷新数据

let initialized = ref(false); // 状态标志 // 状态标志初始化时设置 is_vacationday 的值，而不是在每次更新时都覆盖它。

// 有个问题，选不了节假日，待完善
// 监听 editdataform 的变化
// watchEffect(() => {
//   // 每次打开对话框时重置状态
//   initialized.value = false; // 重置标志位
//   // ruleForm = { ...props.editdataform }; // 更新 ruleForm
//   ruleForm = props.editdataform;
//   if (!isNull(ruleForm.vacationday_id)) {
//     is_vacationday.value = true; // 设置调休状态
//   } else {
//     is_vacationday.value = false;
//   }

//   initialized.value = true; // 设置标志为 true
// });
watch(
  () => props.editdataform,
  () => {
    ruleForm = props.editdataform;

    if (!isNull(ruleForm.vacationday_id) && !isNull(ruleForm.date)) {
      const foundVacationDay = props.why_vacationdays.find(
        (v) => v.id === ruleForm.vacationday_id
      );
      if (foundVacationDay) {
        const vacationDate = foundVacationDay.vacationday.date;
        if (vacationDate !== ruleForm.date) {
          // console.log('调休选择的日期和当天日期不一致');
          ElMessage.error('调休选择的日期和当天日期不一致');
        }
      } else {
        // console.log('找不到对应的 vacationday');
        ElMessage.error('找不到对应的 vacationday');
      }
    }
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
        // holiday_id选项拿到的如果是null，就是“无”，转换为0
        // dutygroup_ids选项拿到的如果是[0]，就是“无”，转换为[]
        let params = {
          ...ruleForm, // 解构 ruleForm 的所有属性
        };

        // 编辑之前先把params中的空值删除
        params = removeNullItem(params);

        const data = {
          date: params.date,
          holiday_id: params.holiday_id,
          vacationday_id: params.vacationday_id,
          isweekend: params.isweekend ? params.isweekend : 0,
          isnormal: params.isnormal ? params.isnormal : 0,
          isarranged: params.isarranged ? params.isarranged : 0,
          ischecked: params.ischecked ? params.ischecked : 0,
        };

        if (props.title === '添加') {
          let dayres = await dayhttp.createDay(data); // 会返回id
          ElMessage.success('添加成功');
        } else if (props.title === '编辑') {
          let dayres = await dayhttp.updateDay(params.id, data); // 更新
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
      <el-form-item label="日期" prop="date">
        <el-date-picker
          v-model="ruleForm.date"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="日期"
        />
      </el-form-item>

      <el-form-item label="所属假期" prop="holiday_id">
        <el-select v-model="ruleForm.holiday_id" clearable>
          <el-option
            v-for="(holiday, index) in why_holidays"
            :key="index"
            :label="holiday.year + ' / ' + holiday.holiday_type.name"
            :value="holiday.id"
          />
        </el-select>
      </el-form-item>

      <!-- <el-form-item label="调休" prop="is_vacationday">
        <el-select v-model="is_vacationday" clearable>
          <el-option
            v-for="(option, index) in [
              { value: false, name: '否' },
              { value: true, name: '是' },
            ]"
            :key="index"
            :label="option.name"
            :value="option.value"
          />
        </el-select>
      </el-form-item> -->

      <el-form-item label="调休" prop="vacationday_id">
        <el-select v-model="ruleForm.vacationday_id" clearable>
          <el-option
            v-for="vacationday in why_vacationdays"
            :key="vacationday"
            :label="vacationday.vacationday.date"
            :value="vacationday.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="周末" prop="isweekend">
        <el-select v-model="ruleForm.isweekend" clearable>
          <el-option
            v-for="(option, index) in [
              { id: 0, name: '否' },
              { id: 1, name: '是' },
            ]"
            :key="index"
            :label="option.name"
            :value="option.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="普通日" prop="isnormal">
        <el-select v-model="ruleForm.isnormal" clearable>
          <el-option
            v-for="(option, index) in [
              { id: 0, name: '否' },
              { id: 1, name: '是' },
            ]"
            :key="index"
            :label="option.name"
            :value="option.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="校准周末" prop="ischecked">
        <el-select v-model="ruleForm.ischecked" clearable>
          <el-option
            v-for="(option, index) in [
              { id: 0, name: '否' },
              { id: 1, name: '是' },
            ]"
            :key="index"
            :label="option.name"
            :value="option.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="值班锁定" prop="isarranged">
        <el-select v-model="ruleForm.isarranged" clearable>
          <el-option
            v-for="(option, index) in [
              { id: 0, name: '否' },
              { id: 1, name: '是' },
            ]"
            :key="index"
            :label="option.name"
            :value="option.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancelForm" :loading="operationloading"
          >取消
        </el-button>
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

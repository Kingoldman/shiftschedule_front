<script setup>
import { ref, reactive, watch } from 'vue';
import staffhttp from '@/api/staffhttp';
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
  year: null,
  month: null,
  created_at: '',
  cur_month_group_set: '',
});
const ruleFormRef = ref(); //表单ref
const rules = ref({
  year: [
    {
      required: true,
      message: '年份必填',
      trigger: 'blur',
    },
  ],
  month: [
    {
      required: true,
      message: '月份必填',
      trigger: 'blur',
    },
  ],

  created_at: [],
  cur_month_group_set: [],
});

let cur_month_group = ref([]); // 接收一下why_groups，对话框那里便于清空
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
  cur_month_group.value = [];
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

        if (props.title === '添加') {
          cur_month_group.value = props.why_groups;
          const data = {
            year: params.year,
            month: params.month,
            cur_month_group_set: cur_month_group.value, // 这个地方直接传入
          };
          let res = await staffhttp.creategroupbackup(data);
          ElMessage.success('添加成功');
        } else if (props.title === '编辑') {
          // 编辑不支持编辑 cur_month_group_set
          const data = {
            year: params.year,
            month: params.month,
          };
          let res = await staffhttp.updategroupbackup(params.id, data);
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
      <el-form-item label="年份" prop="year">
        <el-select v-model="ruleForm.year" clearable placeholder="年份">
          <el-option
            v-for="year in selectYear"
            :key="year"
            :label="year"
            :value="year"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="月份" prop="month">
        <el-select v-model="ruleForm.month" clearable placeholder="月份">
          <el-option
            v-for="month in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]"
            :key="month"
            :label="month"
            :value="month"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="当月值班组" prop="cur_month_group_set">
        <el-text>
          读取当前值班组信息：
          <span v-if="cur_month_group.length > 0" class="text-teal-400"
            >读取成功</span
          >
          <span v-else class="text-red-400">暂未读取或读取失败</span>
        </el-text>
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

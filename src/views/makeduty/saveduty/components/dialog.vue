<script setup>
import { ref, reactive, watch } from 'vue';
import shiftschedulejsonhttp from '@/api/shiftschedulejsonhttp.js';
import dayhttp from '@/api/dayhttp';
import { checkmissingDates, isNull, removeNullItem } from '@/utils/utils.js';
import { ElMessage } from 'element-plus';
import { selectYear } from '@/utils/constant';
import dayjs from 'dayjs';
import { make_duty } from '@/utils/makeduty.js';
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
    type: Array,
    default: [],
  },
  why_groups: {
    type: Array,
    default: [],
  },

  why_groupturns: {
    type: Array,
    default: [],
  },
});
let ruleForm = reactive({
  id: null,
  year: null,
  month: null,
  created_at: '',
  cur_month_schedule_json: '',
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
  cur_month_schedule_json: [],
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
  monthdutydetail.value = [];
  ruleFormRef.value.resetFields(); // 清空form
};

let monthdutydetail = ref([]); // 当月值班详情

const submitForm = async (formEl) => {
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
          let result = make_schedule_datas(); // 排班数据

          if (isNull(result[0])) {
            ischangesuccess = false; // 修改失败，不发起新请求
            ElMessage.error(result[1]);
            return;
          }

          monthdutydetail.value = result[0];
          // console.log('monthdutydetail', monthdutydetail.value);

          const data = {
            year: params.year,
            month: params.month,
            cur_month_schedule_json: result[0], // 这个地方直接传入安排的值班
          };
          const res = await shiftschedulejsonhttp.createshiftschedulejson(data);
          ElMessage.success(
            `${params.year}年-${params.month}月值班信息保存成功！`
          );
          // 这里还要修改why_days的状态
          /**
           *  /**
           * [[
              { id: item.id },
              {
                date: item.date,
                isweekend: isweekend,
                isnormal: isnormal,
                ischecked: 1, // 已校准周末
              },
            ],[...]]
           */

          const post_arranged_datas = monthdutydetail.value.map((item) => [
            { 'id': item.id },
            {
              'isarranged': 1,
              'holiday_id': item.holiday_id,
              'vacationday_id': item.vacationday_id,
              'isweekend': item.isweekend,
              'isnormal': item.isnormal,
            },
          ]);

          let batch_response = await dayhttp.batchUpdateDays(
            post_arranged_datas
          );

          if (batch_response.success) {
            ElMessage.success(
              `更新 ${batch_response.updated} 天 isarranged 记录成功`
            );
          } else {
            ElMessage.error('更新 isarranged失败');
            ElMessage.error(batch_response.errors);
          }
        } else if (props.title === '编辑') {
          // 编辑不支持编辑 cur_month_schedule_json
          const data = {
            year: params.year,
            month: params.month,
          };
          let res = await shiftschedulejsonhttp.updateshiftschedulejson(
            params.id,
            data
          );
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

const groupDates = (arrangedDays, groupTurns) => {
  const result = [];
  let currentGroupId = null;
  let currentGroupDates = [];
  let currentGroupObjects = []; // 存储完整对象

  arrangedDays.forEach((day) => {
    const date = day.date;
    const groupTurn = groupTurns.find((turn) => turn.start_date === date);

    if (groupTurn) {
      // 如果有当前组，则将其推入结果
      if (currentGroupDates.length > 0) {
        result.push({
          date: currentGroupDates[0],
          order_id: currentGroupId,
          dates: currentGroupObjects, // 存储完整对象
        });
      }
      // 更新当前组信息
      currentGroupId = groupTurn.group.order_id;
      currentGroupDates = [date];
      currentGroupObjects = [day]; // 初始化为当前日期的完整对象
    } else {
      if (currentGroupId) {
        currentGroupDates.push(date);
        currentGroupObjects.push(day); // 添加当前日期的完整对象
      }
    }
  });

  // 处理最后一组
  if (currentGroupDates.length > 0) {
    result.push({
      date: currentGroupDates[0],
      order_id: currentGroupId,
      dates: currentGroupObjects, // 存储完整对象
    });
  }

  return result;
};

const do_why_days = () => {
  let to_arranged_days = ref([]); //传入进来的why_days中未安排的日期 // 按照date从小到大排序
  // let to_arranged = ref([]); // 待安排的日期，// 筛选出 isarranged 为 0 的对象，// 只提取 id 和 date // 按照date从小到大排序
  // 1 .处理时间；拿到没有标志的day的数据

  // why_days.value = await whydaystore.fetchWhyDays();

  if (props.why_days.length < 1) {
    // ElMessage.error('未设置why_days!');
    // return;
    return [[], '未设置why_days!'];
  }
  // why_days.value 排个序，后面从小到大安排组
  props.why_days.sort((a, b) => new Date(a.date) - new Date(b.date));
  // 待安排的日期，// 筛选出 isarranged 为 0 的对象，// 只提取 id 和 date // 按照date从小到大排序

  // 加一个简单检测，检测是否中间时间是否漏了项
  let missing_days = checkmissingDates(props.why_days);
  if (missing_days.length > 0) {
    return [[], `why_days 时间不连续，漏项为：${missing_days}，请排查!`];
  }

  to_arranged_days = props.why_days.filter((item) => item.isarranged === 0); // 筛选出未锁定的日期，isarranged 为 0 的对象

  // 加一个简单检测，检测是否中间时间是否漏了项
  let missing_dates = checkmissingDates(to_arranged_days);
  if (missing_dates.length > 0) {
    ElMessage.warning(
      `to_arranged_days 时间不连续，漏项为：${missing_dates}，系统自动跳过漏项日期，继续执行。如不符合要求，请检查why_days内相关数据，重新执行！`
    );
    // return; // 继续执行了
    // return [[], [], `时间不连续，漏项为：${missing_dates}，请排查`];
  }

  return [to_arranged_days, ''];
};
const do_limit_days_check = (tmp_to_arranged_days) => {
  let allDates = []; // 用户选择的时间区间
  // 这里待完善，修改为根据选择的year,month 构造
  let selected_year = ruleForm.year;
  let selected_month = ruleForm.month - 1; //月份从0开始，即0表示1月，11表示12月

  const startOfMonth = dayjs()
    .year(selected_year)
    .month(selected_month)
    .startOf('month');
  const endOfMonth = dayjs()
    .year(selected_year)
    .month(selected_month)
    .endOf('month');

  for (
    let date = startOfMonth;
    date.isSameOrBefore(endOfMonth);
    date = date.add(1, 'day')
  ) {
    allDates.push(date.format('YYYY-MM-DD'));
  }

  // 这里还要做个检测就是，alldates区间应该属于to_arranged_days的子区间，这俩都是有序的，直接判断起始值

  if (
    !(
      tmp_to_arranged_days[0].date <= allDates[0] &&
      allDates[allDates.length - 1] <=
        tmp_to_arranged_days[tmp_to_arranged_days.length - 1].date
    )
  ) {
    // ElMessage.error('锁定时间区间超出why_days区间!');
    return [null, '锁定时间区间超出why_days区间!'];
  }

  let to_arranged_days = [];
  to_arranged_days = tmp_to_arranged_days.filter((item) =>
    allDates.includes(item.date)
  );

  if (to_arranged_days.length === 0) {
    // ElMessage.error('没有需要安排的日期');
    return [null, '没有需要保存的日期'];
  }

  let missing_dates = checkmissingDates(to_arranged_days);
  if (missing_dates.length > 0) {
    return [
      null,
      `时间不连续，漏项为：${missing_dates}，系统自动跳过漏项日期，继续执行。如不符合要求，请检查why_days内相关数据，重新执行！`,
    ];
  }

  return [to_arranged_days, ''];
};

const do_why_groupturns = (to_arranged_days) => {
  // to_arranged_days 是从小到大排了序的，
  let cur_group_order_ids = [];
  // props.why_groupturns = await whygroupturnsstore.fethgroupturns();
  if (props.why_groupturns.length < 1) {
    // 未设置，不排新的，但是要展示已经锁定的
    return [[], '未设置groupturn!'];
  }
  // 遍历to_arranged_days和why_groupturns中start_date在to_arranged_days中的日期，记录下对应的order_id，将to_arranged_days按照date分组，得到每一个起点的日期数组，[{date: '2023-11-01', order_id: 1, dates: ['2023-11-01', '2023-11-02', '2023-11-03']},{...}]，这样得到的数组是按照date从小到大排序的

  cur_group_order_ids = groupDates(to_arranged_days, props.why_groupturns); //这样得到的数组是按照date从小到大排序的

  if (Array.isArray(cur_group_order_ids) && cur_group_order_ids.length === 0) {
    return [[], '未设置当前待排日期groupturn!'];
  } else {
    if (cur_group_order_ids[0].date !== to_arranged_days[0].date) {
      // 头部不一样，说明有漏项
      return [
        [],
        `[${to_arranged_days[0].date} , ${cur_group_order_ids[0].date})，未设置开始值班组`,
      ];
    }
  }

  return [cur_group_order_ids, ''];
};

// 这里待完善，这里要从groupbackup中取
const do_why_groups = (cur_group_order_id) => {
  // 组数据
  // props.why_groups = await whygroupstore.fetchGroups(); // 组
  // 组按照order_id从小到大排序
  // props.why_groups.sort((a, b) => a.order_id - b.order_id);
  // groupIndex就是 cur_group_order_id 的下标
  let groupIndex = props.why_groups.findIndex(
    (item) => item.order_id === cur_group_order_id
  );
  return groupIndex;
};

const make_schedule_datas = () => {
  const res_do_why_days = do_why_days();
  if (res_do_why_days[1] !== '') {
    ElMessage.error(res_do_why_days[1]);
    return;
  }

  const res_do_limit_days_check = do_limit_days_check(res_do_why_days[0]); // 检测选择的时间是否超出未安排时间区间
  if (res_do_limit_days_check[1] !== '') {
    ElMessage.error(res_do_limit_days_check[1]);
    return;
  }

  const to_arranged_days = res_do_limit_days_check[0]; // 上面检测了区间是连续的了

  // groupturn可能有多个，按照start_date来对to_arranged进行分组

  const res_do_why_groupturns = do_why_groupturns(to_arranged_days); // res_do_why_groupturns =[{date: '2023-11-01', order_id: 1, dates: ['2023-11-01', '2023-11-02', '2023-11-03']},{...}]

  // 没有值班组不能保存
  if (
    res_do_why_groupturns[1] !== '' ||
    res_do_why_groupturns[0].length === 0
  ) {
    ElMessage.error(res_do_why_groupturns[1]);
    return;
  }
  // 排班
  let make_duty_data = [];
  if (res_do_why_groupturns[0].length !== 0) {
    for (const item of res_do_why_groupturns[0]) {
      let cur_group_order_id = item.order_id;
      let item_to_arranged_days = item.dates;
      let groupIndex = do_why_groups(cur_group_order_id); // 这个区间开始组下标
      const result = make_duty(
        item_to_arranged_days,
        groupIndex,
        props.why_groups // 这里传入的其实已经最新的
      );
      let errmsg = result[2];
      if (!isNull(errmsg)) {
        ElMessage.error(errmsg);
        return;
      }
      make_duty_data = make_duty_data.concat(result[0]); // 这里是数组拼接
    }
  }

  return [make_duty_data, ''];
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
      <el-form-item label="当月值班详情" prop="cur_month_schedule_json">
        <el-text>
          计算当月值班详情
          <span v-if="monthdutydetail.length > 0" class="text-teal-400"
            >计算成功</span
          >
          <span v-else class="text-red-400">未执行或计算失败</span>
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

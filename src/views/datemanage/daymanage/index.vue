<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { isNull, removeNullItem, checkmissingDates } from '@/utils/utils.js';
import dayjs from 'dayjs';
import {
  Delete,
  Edit,
  InfoFilled,
  Plus,
  Search,
  Refresh,
  Setting,
  SetUp,
} from '@element-plus/icons-vue';

import dayhttp from '@/api/dayhttp';
import schedulemain from '@/components/schedulemain.vue';
import AddOrEditDialog from '@/views/datemanage/daymanage/components/dialog.vue';

import {
  useHolidayTypesStore,
  useHolidayStore,
  useVacationStore,
  useWhyDayStore,
} from '@/stores/datesetup';

const whydaystore = useWhyDayStore();
const whyholidaytypestore = useHolidayTypesStore();
const whyholidaystore = useHolidayStore();
const whyvacationstore = useVacationStore();

import { useRefreshAllStore } from '@/stores/refreshallstore';
const refreshallstore = useRefreshAllStore();

let operationloading = ref(false); // 防止短时间重复提交，
let searchcontent = ref({
  date: null,
  holiday_id: null,
  isvacationday: null, // 调休查询待完善
  isweekend: null,
  isnormal: null,
  isarranged: null,
  ischecked: null,
}); // 要提交到请求的内容这个应该设置条件多一点，年、时间范围、假期类型、是否节假日、是否周末等

// 分页数据
let mypagination = reactive({
  count: 0, // 总页数
  page: 1, // 当前页码
});

let datas = ref([]); // 数据列表
// 请求列表按页码
const requestdatas = async (page) => {
  if (operationloading.value) return; // 如果已经在加载中，则不执行后续操作
  operationloading.value = true; //加载开始
  try {
    // 先把params中的空值删除
    searchcontent.value = removeNullItem(searchcontent.value);

    let res = await dayhttp.getAllDay(
      page,
      pagesize.value,
      searchcontent.value
    );

    mypagination.count = res.count;
    // mypagination.page = 1; 因为点击页码函数也执行了本函数，切换了新的页码，所以这里不能定页码，不然又切换到1了

    datas.value = res.results;
  } catch (error) {
    if (Array.isArray(error)) {
      for (const item of error) {
        ElMessage.error(item);
      }
    } else {
      ElMessage.error(JSON.stringify(error));
    }
  } finally {
    operationloading.value = false; //加载完成
  }
};

let why_holidays = ref([]); // 所有假期分类
let why_holiday_types = ref([]); // 所有假期类型
let why_vacationdays = ref([]); // 这里用不着还是这里拿一下

let why_days = ref([]); // 所有天

// 初始化加载请求所有部门
onMounted(async () => {
  // 1. 拿到每天数据
  await requestdatas(1); // 数据请求，因为这个是带分页的

  why_days.value = await whydaystore.fetchWhyDays();
  why_days.value.sort((a, b) => new Date(a.date) - new Date(b.date));
  // 2. 同时拿到所有假期
  why_holidays.value = await whyholidaystore.fetchHolidays();

  // 3. 拿到节假日枚举
  why_holiday_types.value = await whyholidaytypestore.fetchHolidayTypes();

  // 6. 拿调休，这里其实用不着
  why_vacationdays.value = await whyvacationstore.fetchVacationdays();
});

// 搜索click
const handlesearch = async () => {
  // 搜索之前先把params中的空值删除
  searchcontent.value = removeNullItem(searchcontent.value);

  if (isNull(searchcontent.value)) {
    return;
  } else {
    await requestdatas(1);
  }
};

//////////////////////////////////////////////////
// 删除pop框
const confirmdelete = async (id, index) => {
  if (operationloading.value) return; // 如果已经在加载中，则不执行后续操作
  operationloading.value = true; // 设置加载状态为true
  try {
    await dayhttp.deleteDay(id);
    datas.value.splice(index, 1); // 删除数据，
    // 删除可能也会影响其他store，直接重新获取，懒得改；
    await refreshallstore.refresh_all_stores();

    ElMessage.success('删除成功');
  } catch (error) {
    ElMessage.error(JSON.stringify(error));
  } finally {
    operationloading.value = false; // 重置加载状态
  }
};
const canceldelete = () => {
  //console.log('取消删除');
};

///////////////////////////////////////////
/**
 * 新增、编辑对话框
 */
let dialogVisible = ref(false); // 对话框是否显示
let dialogtitle = ref(''); // 对话框标题
// 新增或者编辑对话框
let editdataform = ref({});
// 打开增加或编辑对话框
const handdledialog = (row) => {
  const isEditing = !isNull(row);
  dialogtitle.value = isEditing ? '编辑' : '添加';
  dialogVisible.value = true;

  let editData = {};

  if (isEditing) {
    // 复制所有需要保留的属性
    const { holiday, vacationday, ...otherProps } = row;

    editData = { ...otherProps }; // 保留不变得属性

    // 添加替换后的属性，外键全部传入id
    editData.vacationday_id = isNull(vacationday) ? null : vacationday.id;
    editData.holiday_id = isNull(holiday) ? null : holiday.id;
  } else {
    // 如果是添加模式，则 editData 保持为空对象
    editData = {};
  }

  editdataform.value = editData;
};

////////////////////////////////////////////////////////////
/**
 * 分页设置
 */
const pagesize = ref(5); // 分页，每页显示条数
// 分页
const handleSizeChange = async (val) => {
  // 每页多少条
  // console.log(`${val} items per page`);
  pagesize.value = val;
  await handleCurrentChange(1); // 刷新数据
};

// 页码变化，重新请求
const handleCurrentChange = async (val) => {
  // console.log(`current page: ${val}`);
  await requestdatas(val);
};

// 手动刷新
const handlerefresh = async () => {
  requestdatas(1); // 初始化加载请求所有部门
  mypagination.page = 1; // 初始化页面1

  await refreshallstore.refresh_all_stores(); // 更新store
};

const initrequest = async () => {
  await handleCurrentChange(mypagination.page); // 重新请求当页数据
  // 更新store
  await refreshallstore.refresh_all_stores();
};

const do_why_days = () => {
  let to_checked_days = ref([]); //why_days中未安排的日期
  let to_checked = ref([]); // 待安排的日期，// 筛选出 isarranged 为 0 的对象，// 只提取 id 和 date // 按照date从小到大排序
  // 1 .处理时间；拿到没有标志的day的数据
  // why_days.value = await whydaystore.fetchWhyDays();

  if (why_days.value.length < 1) {
    // ElMessage.error('未设置why_days!');
    // return;
    return [[], [], '未设置why_days!'];
  }
  // why_days.value 排个序，后面从小到大安排组
  why_days.value.sort((a, b) => new Date(a.date) - new Date(b.date));
  // 待安排的日期，// 筛选出 isarranged 为 0 的对象，// 只提取 id 和 date // 按照date从小到大排序

  // 加一个简单检测，检测是否中间时间是否漏了项
  let missing_days = checkmissingDates(why_days.value);
  if (missing_days.length > 0) {
    return [[], [], `时间不连续，漏项为：${missing_days}，请排查!`];
  }

  to_checked_days = why_days.value.filter((item) => item.ischecked === 0); // 筛选出未锁定的日期，ischecked为 0 的对象

  to_checked = to_checked_days
    .map((item) => ({
      id: item.id,
      date: item.date,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (to_checked.length === 0) {
    // ElMessage.error('没有需要校准的日期');
    return [[], [], '没有需要校准的日期!'];
  }

  // 加一个简单检测，检测是否中间时间是否漏了项
  let missing_dates = checkmissingDates(to_checked);
  if (missing_dates.length > 0) {
    ElMessage.warning(
      `时间不连续，漏项为：${missing_dates}，系统自动跳过漏项日期，继续执行。如不符合要求，请檢查why_days内相关数据，重新执行！`
    );
    return [[], [], `时间不连续，漏项为：${missing_dates}，请排查`];
  }

  return [to_checked_days, to_checked, ''];
};

const do_why_vacationdays = () => {
  // 2. 处理调休数组格式，['YYYY-MM--DD']
  // why_vacationdays.value = await whyvacationstore.fetchVacationdays(); // 调休
  const vacationDates = why_vacationdays.value
    .map((item) => item.vacationday.date)
    .sort();
  return vacationDates;
};

const do_why_holidays = () => {
  // 3. 处理节假日数组格式，['YYYY-MM--DD']
  // why_holidays.value = await whyholidaystore.fetchHolidays(); // 假期
  const holidaysarr = why_holidays.value
    .flatMap((item) => item.days.map((day) => day.date))
    .sort();
  return holidaysarr;
};

const do_why_weekend = (to_checked, vacationDates, holidaysarr) => {
  // 4.拿到真正的“周末”
  // 先通过dayjs拿到本来的周末
  const origin_weekend = to_checked
    .map((item) => dayjs(item.date)) // 将日期转换为 dayjs 对象
    .filter((date) => date.day() === 0 || date.day() === 6) // 0 是星期天，6 是星期六
    .map((date) => date.format('YYYY-MM-DD')); // 格式化为字符串

  // 在通过剔除被定为调休和节假日的部分得到想要的“周末”
  // 生成 why_weekend
  const why_weekend = origin_weekend.filter(
    (date) => !vacationDates.includes(date) && !holidaysarr.includes(date)
  );
  return why_weekend;
};

const get_real_weekend = (to_checked_days, why_weekend) => {
  let res = ref([]);
  for (const item of to_checked_days) {
    let isweekend = 0;
    let isnormal = 0;

    if (item.holiday === null && item.vacationday === null) {
      // 1.周末或者普通日
      if (why_weekend.includes(item.date)) {
        // 周末情况
        isweekend = 1;
        isnormal = 0;
      } else {
        // 普通日情况
        isweekend = 0;
        isnormal = 1;
      }
    } else if (item.holiday === null && item.vacationday !== null) {
      // 调休情况 // 已设置，不动
    } else if (item.holiday !== null && item.vacationday === null) {
      // 节假日情况 // 已设置，不动
    } else {
      // 2个都有的情况，一般没有
      console.log(`出现错误属性日期: ${item.date}`);
      // ElMessage.error(`出现无属性日期: ${item.date}`);
      return [[], `出现无属性日期: ${item.date}`];
    }

    // 检查是否只有一个为真，同理上面else错误属性日期，其实没必要
    const trueCount = [
      isweekend,
      isnormal,
      item.holiday !== null,
      item.vacationday !== null,
    ].filter(Boolean).length;
    if (trueCount !== 1) {
      // ElMessage.error('错误：只能有一个变量为真');
      return [[], '周末、节假日、调休、普通工作日只能有一个变量为真'];
    }
    // 存放2个对象id和post data
    res.value.push([
      { id: item.id },
      {
        date: item.date,
        isweekend: isweekend,
        isnormal: isnormal,
        ischecked: 1, // 已校准周末
      },
    ]);
  }
  return [res.value, ''];
};

// 处理调休、节假日之外的周末
const make_real_weekend = async () => {
  if (operationloading.value) {
    ElMessage.warning('请等待上次操作完成');
    return;
  }
  operationloading.value = true; // 开始加载

  const res_do_why_days = do_why_days();
  if (res_do_why_days[2] !== '') {
    ElMessage.error(res_do_why_days[2]);
    operationloading.value = false; // 重置加载状态
    return;
  }

  const to_checked_days = res_do_why_days[0];
  const to_checked = res_do_why_days[1];

  const vacationDates = do_why_vacationdays();
  const holidaysarr = do_why_holidays();
  const why_weekend = do_why_weekend(to_checked, vacationDates, holidaysarr);

  let result = get_real_weekend(to_checked_days, why_weekend);
  if (result[1].length === '') {
    ElMessage.error(result[1]);
    operationloading.value = false; // 重置加载状态
    return;
  }

  try {
    // ///////////////////////////////////////////////////////////////////////////
    // 批量更新why_days
    const response = await dayhttp.batchUpdateDays(result[0]);

    if (response.success) {
      ElMessage.success(`校准 ${response.updated} 天 weekend 记录成功`);
    } else {
      ElMessage.error('校准 weekend 失败');
      ElMessage.error(response.errors);
    }
  } catch (error) {
    //console.log(error)
    if (Array.isArray(error)) {
      for (const item of error) {
        ElMessage.error(item);
      }
    } else {
      ElMessage.error(JSON.stringify(error));
    }
  } finally {
    operationloading.value = false; // 重置加载状态
    await initrequest(); // 同时刷新页面和存储store
  }
};
</script>
<template>
  <schedulemain pagetitle="每日列表">
    <el-card shadow="never">
      <div class="flex-col space-y-3">
        <div>
          <el-button
            type="danger"
            @click="make_real_weekend"
            :icon="SetUp"
            :loading="operationloading"
            >校准周末</el-button
          >
        </div>
        <div class="">
          <div class="inline-block w-32 mr-2">
            <el-select
              v-model="searchcontent.holiday_id"
              clearable
              placeholder="所属假期"
            >
              <el-option
                v-for="(holiday, index) in why_holidays"
                :key="index"
                :label="holiday.holiday_type.name + ' / ' + holiday.year"
                :value="holiday.id"
              ></el-option>
            </el-select>
          </div>

          <div class="inline-block mr-2">
            <el-date-picker
              v-model="searchcontent.date"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="日期"
            />
          </div>

          <div class="inline-block mr-3 w-24">
            <el-select
              v-model="searchcontent.isvacationday"
              clearable
              placeholder="调休"
            >
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
          </div>

          <div class="inline-block mr-3 w-24">
            <el-select
              v-model="searchcontent.isweekend"
              clearable
              placeholder="周末"
            >
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
          </div>

          <div class="inline-block mr-3 w-24">
            <el-select
              v-model="searchcontent.isnormal"
              clearable
              placeholder="普通日"
            >
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
          </div>

          <div class="inline-block mr-3 w-32">
            <el-select
              v-model="searchcontent.ischecked"
              clearable
              placeholder="周末校准"
            >
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
          </div>

          <div class="inline-block mr-3 w-32">
            <el-select
              v-model="searchcontent.isarranged"
              clearable
              placeholder="值班确定"
            >
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
          </div>

          <el-button
            type="primary"
            :icon="Search"
            @click="handlesearch"
            :loading="operationloading"
            >搜索</el-button
          >
        </div>

        <div>
          <el-button
            type="warning"
            @click="handdledialog()"
            :icon="Plus"
            :loading="operationloading"
            >添加</el-button
          >
          <el-button
            type="primary"
            @click="handlerefresh"
            :icon="Refresh"
            :loading="operationloading"
            >刷新</el-button
          >
        </div>
      </div>

      <el-table :data="datas" v-loading="operationloading" class="pt-2 mt-2">
        <el-table-column prop="date" label="日期">
          <template #default="scope">
            {{ scope.row.date }}
          </template>
        </el-table-column>

        <el-table-column prop="holiday" label="所属假期">
          <template #default="scope">
            {{
              !isNull(scope.row.holiday)
                ? scope.row.holiday.year +
                  '/' +
                  scope.row.holiday.holiday_type.name
                : '无'
            }}
          </template>
        </el-table-column>

        <el-table-column prop="vacationday" label="调休">
          <template #default="scope">
            {{ scope.row.vacationday ? '是' : '否' }}
          </template>
        </el-table-column>

        <el-table-column prop="isweekend" label="周末">
          <template #default="scope">
            {{ scope.row.isweekend ? '是' : '否' }}
          </template>
        </el-table-column>

        <el-table-column prop="isnormal" label="普通日">
          <template #default="scope">
            {{ scope.row.isnormal ? '是' : '否' }}
          </template>
        </el-table-column>

        <el-table-column prop="ischecked" label="周末校准">
          <template #default="scope">
            {{ scope.row.ischecked ? '是' : '否' }}
          </template>
        </el-table-column>

        <el-table-column prop="isarranged" label="值班锁定">
          <template #default="scope">
            {{ scope.row.isarranged ? '是' : '否' }}
          </template>
        </el-table-column>

        <el-table-column prop="action" label="操作" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              @click="handdledialog(scope.row)"
              link
              :icon="Edit"
              :loading="operationloading"
            >
              编辑</el-button
            >

            <el-popconfirm
              confirm-button-text="是"
              confirm-button-type="primary"
              cancel-button-text="否"
              :icon="InfoFilled"
              icon-color="#f56c6c"
              title="确认删除本条内容?"
              @confirm="confirmdelete(scope.row.id, scope.$index)"
              @cancel="canceldelete"
            >
              <template #reference>
                <el-button
                  type="danger"
                  :loading="operationloading"
                  link
                  :icon="Delete"
                  >删除</el-button
                >
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        background
        layout="total,sizes,  prev, pager, next, jumper"
        :total="mypagination.count"
        :page-sizes="[5, 10, 15, 20]"
        v-model:current-page="mypagination.page"
        :page-size="pagesize"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="justify-center mt-4"
      /> </el-card
  ></schedulemain>

  <AddOrEditDialog
    v-model:dialogVisible="dialogVisible"
    v-model:operationloading="operationloading"
    :title="dialogtitle"
    @initrequest="initrequest"
    :editdataform="editdataform"
    :why_holidays="why_holidays"
    :why_holiday_types="why_holiday_types"
    :why_vacationdays="why_vacationdays"
  >
  </AddOrEditDialog>
</template>
<style lang="scss" scoped></style>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { isNull, removeNullItem } from '@/utils/utils.js';
import {
  Delete,
  Edit,
  InfoFilled,
  Plus,
  Search,
  Refresh,
} from '@element-plus/icons-vue';
import dayhttp from '@/api/dayhttp';
import schedulemain from '@/components/schedulemain.vue';
import AddOrEditDialog from '@/views/datemanage/holiday/components/dialog.vue';
import timeFormatter from '@/utils/timeFormatter';
import { selectYear } from '@/utils/constant';

import {
  useHolidayTypesStore,
  useHolidayStore,
  useWhyDayStore,
} from '@/stores/datesetup';

const whydaystore = useWhyDayStore();
const whyholidaytypestore = useHolidayTypesStore();
const whyholidaystore = useHolidayStore();

import { useRefreshAllStore } from '@/stores/refreshallstore';
const refreshallstore = useRefreshAllStore();

let operationloading = ref(false); // 防止短时间重复提交，
let searchcontent = ref({
  year: null,
  holiday_type_id: null,
}); // 要提交到请求的内容

// 分页数据
let mypagination = reactive({
  count: 0, // 总页数
  page: 1, // 当前页码
});

let datas = ref([]); // 部门数据列表
// 请求部门列表按页码
const requestdatas = async (page) => {
  if (operationloading.value) return; // 如果已经在加载中，则不执行后续操作

  operationloading.value = true; //加载开始
  try {
    // 先把params中的空值删除
    searchcontent.value = removeNullItem(searchcontent.value);

    let res = await dayhttp.getAllHolidays(
      page,
      pagesize.value,
      searchcontent.value
    );

    mypagination.count = res.count;
    // mypagination.page = 1; 因为点击页码函数也执行了本函数，切换了新的页码，所以这里不能定页码，不然又切换到1了

    datas.value = res.results;
  } catch (error) {
    //console.log(error);
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

let holiday_types = ref([]); // 所有假期分类
let why_days = ref([]); //
let why_holidays = ref([]); // 所有假期
// 初始化加载请求所有部门
onMounted(async () => {
  // 1. 请求节假日列表
  await requestdatas(1);

  // 2. 同时拿到所有假期
  why_holidays.value = await whyholidaystore.fetchHolidays(); // 存store

  // 2. 同时拿到所有假期分类
  holiday_types.value = await whyholidaytypestore.fetchHolidayTypes();
  // 3. 同时拿到每天管理
  why_days.value = await whydaystore.fetchWhyDays();
});

// 搜索click
const handlesearch = async () => {
  // 搜索之前先把params中的空值删除
  searchcontent.value = removeNullItem(searchcontent.value);
  // console.log('search', searchcontent.value, isNull(searchcontent.value));
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
    await dayhttp.deleteHoliday(id);
    datas.value.splice(index, 1); // 删除数据
    // 修改store
    // whyholidaystore.deleteHoliday(id);
    // await refresh_holiday_related_stores(); // 更新其他有关store
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
  dialogtitle.value = isEditing ? '编辑假期' : '添加假期';
  dialogVisible.value = true;

  let editData = {};

  if (isEditing) {
    // 复制所有需要保留的属性
    const { holiday_type, days, ...otherProps } = row;

    editData = { ...otherProps }; // 保留不变得属性

    // 添加替换后的外键id
    editData.holiday_type_id = isNull(holiday_type) ? null : holiday_type.id;
    editData.days_ids =
      isNull(days) || days.length === 0 ? [] : days.map((item) => item.id);
  } else {
    // 如果是添加模式，则 editData 保持为空对象
    editData = {};
  }
  editdataform.value = editData;
  // console.log('editdataform', editdataform.value);
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
  await requestdatas(1); // 初始化加载请求所有部门
  mypagination.page = 1; // 初始化页面1
  // refresh store
  // await whyholidaystore.refreshHolidays();
  // await refresh_holiday_related_stores();
  await refreshallstore.refresh_all_stores();
};

const initrequest = async () => {
  await handleCurrentChange(mypagination.page); // 重新请求当页数据
  // await whyholidaystore.refreshHolidays(); // 更新store
  // // 可能同时更新了关联的day，还有type，重新获取一次
  // await refresh_holiday_related_stores();
  await refreshallstore.refresh_all_stores();
};
</script>
<template>
  <schedulemain pagetitle="假期列表">
    <el-card shadow="never">
      <div class="flex-col space-y-3">
        <div>
          <div class="w-32 mr-2 inline-block">
            <el-select
              v-model="searchcontent.holiday_type_id"
              clearable
              placeholder="假期类型"
            >
              <el-option
                v-for="(holiday_type, index) in holiday_types"
                :key="index"
                :label="holiday_type.name"
                :value="holiday_type.id"
              />
            </el-select>
          </div>
          <div class="mr-2 w-32 inline-block">
            <el-select
              v-model="searchcontent.year"
              clearable
              placeholder="所属年份"
            >
              <el-option
                v-for="(year, index) in selectYear"
                :key="index"
                :label="year"
                :value="year"
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
            >添加假期</el-button
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
        <el-table-column prop="holiday_type" label="假期名称">
          <template #default="scope">
            {{ scope.row.holiday_type.name }}
          </template>
        </el-table-column>
        <el-table-column prop="year" label="所属年份">
          <template #default="scope">
            {{ scope.row.year }}
          </template>
        </el-table-column>
        <el-table-column prop="days" label="包含日期">
          <template #default="scope">
            <el-text
              class="mx-1"
              type="primary"
              v-for="(day, index) in scope.row.days"
              :key="index"
              >{{ day.date }}</el-text
            >
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="创建时间">
          <template #default="scope">
            {{ timeFormatter.stringFromDate(scope.row.created_at) }}
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
    :holiday_types="holiday_types"
    :why_days="why_days"
  >
  </AddOrEditDialog>
</template>
<style lang="scss" scoped></style>

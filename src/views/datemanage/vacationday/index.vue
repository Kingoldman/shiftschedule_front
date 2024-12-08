<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { isNull, removeNullItem } from '@/utils/utils.js';
import {
  Delete,
  Edit,
  InfoFilled,
  Plus,
  Refresh,
  Search,
} from '@element-plus/icons-vue';
import dayhttp from '@/api/dayhttp';
import schedulemain from '@/components/schedulemain.vue';
import AddOrEditDialog from '@/views/datemanage/vacationday/components/dialog.vue';
import timeFormatter from '@/utils/timeFormatter';

import { useVacationStore, useWhyDayStore } from '@/stores/datesetup';

const whydaystore = useWhyDayStore();

const whyvacationstore = useVacationStore();

import { useRefreshAllStore } from '@/stores/refreshallstore';
const refreshallstore = useRefreshAllStore();

let operationloading = ref(false); // 防止短时间重复提交，
let searchcontent = ref({
  date: null,
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

    let res = await dayhttp.getAllVacationDays(
      page,
      pagesize.value,
      searchcontent.value
    );

    mypagination.count = res.count;
    // mypagination.page = 1; 因为点击页码函数也执行了本函数，切换了新的页码，所以这里不能定页码，不然又切换到1了

    datas.value = res.results;
    // console.log("datas",datas.value)
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

let why_days = ref([]); // 每日
let why_vacationdays = ref([]);

// 初始化加载请求所有部门
onMounted(async () => {
  await requestdatas(1);
  why_vacationdays.value = await whyvacationstore.fetchVacationdays();
  why_days.value = await whydaystore.fetchWhyDays();
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
    await dayhttp.deleteVacationDay(id);
    datas.value.splice(index, 1); // 删除数据
    // whyvacationstore.deleteVacationday(id); // store
    // // 关联的store
    // await refresh_vacationday_related_stores();
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
let isEditing = false; // 调休的编辑懒得弄了，如果编辑直接锁定，isediting控制
const handdledialog = (row) => {
  //console.log('row',row)
  isEditing = !isNull(row);
  dialogtitle.value = isEditing ? '编辑调休' : '添加调休';
  dialogVisible.value = true;

  let editData = {};

  if (isEditing) {
    // 复制所有需要保留的属性
    const { vacationday, ...otherProps } = row;

    editData = { ...otherProps }; // 保留不变得属性

    // 添加替换后的属性
    editData.day_id = isNull(vacationday) ? null : vacationday.id;
    editData.date = isNull(vacationday) ? null : vacationday.date;
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
  await requestdatas(1); // 初始化加载请求所有部门
  mypagination.page = 1; // 初始化页面1
  // refresh store
  // await whyvacationstore.refreshVacationdays();
  // await refresh_vacationday_related_stores();
  await refreshallstore.refresh_all_stores();
};

const initrequest = async () => {
  await handleCurrentChange(mypagination.page); // 重新请求当夜数据
  // await whyvacationstore.refreshVacationdays(); // 更新store
  // await refresh_vacationday_related_stores();
  await refreshallstore.refresh_all_stores();
};
</script>
<template>
  <schedulemain pagetitle="调休列表">
    <el-card shadow="never">
      <div class="flex-col space-y-3">
        <div>
          <el-date-picker
            v-model="searchcontent.date"
            type="date"
            placeholder="选调休日期"
            value-format="YYYY-MM-DD"
            class="mr-3"
          />
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
            >添加调休</el-button
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
        <el-table-column prop="date" label="调休日期">
          <template #default="scope">
            {{ scope.row.vacationday.date }}
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
    :why_days="why_days"
    :isedit="isEditing"
  >
  </AddOrEditDialog>
</template>
<style lang="scss" scoped></style>

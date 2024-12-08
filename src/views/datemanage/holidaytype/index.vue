<script setup>
import { ref, reactive, onMounted } from 'vue';
import {
  Delete,
  Edit,
  Plus,
  Search,
  Refresh,
  InfoFilled,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { isNull, removeNullItem } from '@/utils/utils.js'; // 自定义工具函数
import dayhttp from '@/api/dayhttp';
import schedulemain from '@/components/schedulemain.vue'; // 自定义组件
import AddOrEditDialog from '@/views/datemanage/holidaytype/components/dialog.vue';
import timeFormatter from '@/utils/timeFormatter'; // 自定义函数

import { useHolidayTypesStore } from '@/stores/datesetup';

const whyholidaytypestore = useHolidayTypesStore();

import { useRefreshAllStore } from '@/stores/refreshallstore';
const refreshallstore = useRefreshAllStore();

let operationloading = ref(false); // 防止短时间重复提交，
let searchcontent = ref({
  name: '',
}); // 搜索双向绑定

// 分页数据
let mypagination = reactive({
  count: 0, // 总页数
  page: 1, // 当前页码
});

let datas = ref([]); // 数据列表

// 请求部门列表按页码
const requestdatas = async (page) => {
  if (operationloading.value) return; // 如果已经在加载中，则不执行后续操作

  operationloading.value = true; //加载开始
  try {
    // 先把params中的空值删除
    searchcontent.value = removeNullItem(searchcontent.value);

    let res = await dayhttp.getAllHolidayTypes(
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

let holiday_types = ref([]); // 节假日类型列表
// 初始化加载请求
onMounted(async () => {
  await requestdatas(1);
  holiday_types.value = await whyholidaytypestore.fetchHolidayTypes(); // 存store
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
    await dayhttp.deleteHolidayType(id);
    datas.value.splice(index, 1); // 删除数据
    // 更新store
    // whyholidaytypestore.deleteHolidayType(id);
    // // 删除也会影响到关联的内容，比如holiday直接重新获取，懒得写
    // await refresh_holidaytype_related_stores();
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
  if (isNull(row)) {
    dialogtitle.value = '添加类型';
    editdataform.value = {};
  } else {
    dialogtitle.value = '编辑类型';
    editdataform.value = JSON.parse(JSON.stringify(row));
  }
  dialogVisible.value = true;
};

////////////////////////////////////////////////////////////
/**
 * 分页设置
 */
const pagesize = ref(5); // 分页，每页显示条数
// 分页
const handleSizeChange = async (val) => {
  // 每页多少条
  pagesize.value = val;
  await handleCurrentChange(1); // 刷新数据
};

// 页码变化，重新请求
const handleCurrentChange = async (val) => {
  //console.log(`current page: ${val}`);
  await requestdatas(val);
};

// 手动刷新
const handlerefresh = async () => {
  await requestdatas(1); // 初始化加载请求所有部门
  mypagination.page = 1; // 初始化页面1
  // store
  // await whyholidaytypestore.refreshHolidayTypes();
  // await refresh_holidaytype_related_stores();
  await refreshallstore.refresh_all_stores();
};

const initrequest = async () => {
  await handleCurrentChange(mypagination.page); // 重新请求当夜数据
  // await whyholidaytypestore.refreshHolidayTypes(); // 更新store
  // // 关联的holiday，但是只有删除会影响到holiday等，添加和编辑不会，就不用refresh 其他
  // await refresh_holidaytype_related_stores();
  await refreshallstore.refresh_all_stores();
};
</script>
<template>
  <schedulemain pagetitle="假期类型枚举">
    <el-card shadow="never">
      <div class="flex-col space-y-3">
        <div>
          <div class="inline-block mr-3 w-48">
            <el-input
              placeholder="假期名称"
              clearable
              v-model="searchcontent.name"
              @keyup.enter="handlesearch"
            ></el-input>
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
            >添加类型</el-button
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
        <el-table-column prop="name" label="类型名称">
          <template #default="scope">
            {{ scope.row.name }}
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
  >
  </AddOrEditDialog>
</template>
<style lang="scss" scoped></style>

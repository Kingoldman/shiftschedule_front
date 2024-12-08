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
import staffhttp from '@/api/staffhttp';
import schedulemain from '@/components/schedulemain.vue';
import AddOrEditDialog from '@/views/organizationalstructure/groupmanage/components/dialog.vue';
import timeFormatter from '@/utils/timeFormatter';

import {
  useUsersStore,
  useGroupsStore,
} from '@/stores/organizationalstructure';

const whyuserstore = useUsersStore();
const whygroupstore = useGroupsStore();

import { useRefreshAllStore } from '@/stores/refreshallstore';
const refreshallstore = useRefreshAllStore();
let operationloading = ref(false); // 防止短时间重复提交，
let searchcontent = ref({
  order_id: null,
  name: '',
}); // 搜索双向绑定

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
    let res = await staffhttp.getAllGroups(
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

let why_users = ref([]); // 所有用户
let why_groups = ref([]); // 所有部门
// 初始化加载请求所有部门
onMounted(async () => {
  await requestdatas(1);
  why_groups.value = await whygroupstore.fetchGroups();
  // 拿到用户
  why_users.value = await whyuserstore.fetchUsers();
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
    await staffhttp.deleteGroup(id);
    datas.value.splice(index, 1); // 删除数据
    // whygroupstore.deleteGroup(id); // 更新store
    // await refresh_whygroup_related_stores(); // 更新other
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
  dialogtitle.value = isEditing ? '编辑组' : '添加组';
  dialogVisible.value = true;

  let editData = {};

  if (isEditing) {
    //console.log('row', row);
    // 复制所有需要保留的属性
    const { staffs, ...otherProps } = row;

    editData = { ...otherProps }; // 保留不变得属性

    // 添加替换后的属性，外键全部传入id

    editData.staffs_ids =
      isNull(staffs) || staffs.length === 0
        ? []
        : staffs.map((item) => item.id);
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
  // store
  // await whygroupstore.refreshGroups();
  // await refresh_whygroup_related_stores(); // other
  await refreshallstore.refresh_all_stores();
};

const initrequest = async () => {
  await handleCurrentChange(mypagination.page); // 重新请求当夜数据
  // await whygroupstore.refreshGroups(); // 更新store
  // await refresh_whygroup_related_stores(); // other
  await refreshallstore.refresh_all_stores();
};
</script>
<template>
  <schedulemain pagetitle="组列表">
    <el-card shadow="never">
      <div class="flex-col space-y-3">
        <div>
          <div class="inline-block w-32 mr-2">
            <el-input
              placeholder="请输入组编号"
              clearable
              v-model="searchcontent.order_id"
              @keyup.enter="handlesearch"
              type="number"
            ></el-input>
          </div>
          <div class="inline-block mr-3 w-32">
            <el-input
              placeholder="请输入组名称"
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
            >添加组</el-button
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
        <el-table-column prop="order_id" label="序号">
          <template #default="scope">
            {{ scope.row.order_id }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称">
          <template #default="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>

        <el-table-column prop="staffs" label="人员">
          <template #default="scope">
            <el-text
              class="mx-1"
              type="primary"
              v-for="(staff, index) in scope.row.staffs"
              :key="index"
              >{{ staff.username }}</el-text
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
    :why_users="why_users"
  >
  </AddOrEditDialog>
</template>
<style lang="scss" scoped></style>

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
import AddOrEditDialog from '@/views/organizationalstructure/usermanage/components/dialog.vue';
import timeFormatter from '@/utils/timeFormatter';
import { whyStatus, whyGender, whyState } from '@/utils/constant';

import {
  useUsersStore,
  useGroupsStore,
  useDepartmentsStore,
} from '@/stores/organizationalstructure';

const whyuserstore = useUsersStore();
const whygroupstore = useGroupsStore();
const whydepartmentstore = useDepartmentsStore();

import { useRefreshAllStore } from '@/stores/refreshallstore';
const refreshallstore = useRefreshAllStore();

let operationloading = ref(false); // 防止短时间重复提交，
let searchcontent = ref({
  order_id: null,
  username: '',
  loginaccount: '',
  phone: '',
  gender: '',
  status: '',
  department_id: '',
  mygroup_id: '',
  state: '',
  is_leader: '',
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
    let res = await staffhttp.getAllStaff(
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

/**
 * 这些东西后续都要放到pinia里
 */
let why_groups = ref([]); // 所有组
let why_departments = ref([]); // 所有单位
let why_users = ref([]); // 所有用户
// 初始化加载请求所有部门
onMounted(async () => {
  await requestdatas(1);
  why_users.value = await whyuserstore.fetchUsers();
  // group
  why_groups.value = await whygroupstore.fetchGroups();
  // department
  why_departments.value = await whydepartmentstore.fetchDepartments();
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
    await staffhttp.deleteStaff(id);
    datas.value.splice(index, 1); // 删除数据
    // whyuserstore.deleteUser(id); // store
    // await refresh_whyuser_related_stores(); //other store
    await refreshallstore.refresh_all_stores();
    ElMessage.success('删除成功');
  } catch (error) {
    ElMessage.error(JSON.stringify(error));
  } finally {
    operationloading.value = false; // 重置加载状态
  }
};
const canceldelete = () => {
  // console.log('取消删除');
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
  dialogtitle.value = isEditing ? '编辑人员' : '添加人员';
  dialogVisible.value = true;

  let editData = {};

  if (isEditing) {
    // 复制所有需要保留的属性
    const { department, mygroup, ...otherProps } = row;

    editData = { ...otherProps }; // 保留不变得属性

    // 添加替换后的属性，外键全部传入id
    editData.department_id = isNull(department) ? null : department.id;
    editData.mygroup_id = isNull(mygroup) ? null : mygroup.id;
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
  //console.log(`${val} items per page`);
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
  // await whyuserstore.refreshUsers(); // 更新store
  // await refresh_whyuser_related_stores(); // other
  await refreshallstore.refresh_all_stores();
};

const initrequest = async () => {
  await handleCurrentChange(mypagination.page); // 重新请求当夜数据
  // await whyuserstore.refreshUsers(); // 更新store
  // await refresh_whyuser_related_stores(); // other
  await refreshallstore.refresh_all_stores();
};
</script>
<template>
  <schedulemain pagetitle="人员列表">
    <el-card shadow="never">
      <div class="flex-col space-y-3">
        <div class="">
          <div class="inline-block mr-3 w-24">
            <el-input
              placeholder="姓名"
              clearable
              v-model="searchcontent.username"
            ></el-input>
          </div>

          <div class="inline-block mr-3 w-32">
            <el-input
              placeholder="账号"
              clearable
              v-model="searchcontent.loginaccount"
            ></el-input>
          </div>

          <div class="inline-block mr-3 w-24">
            <el-select
              v-model="searchcontent.is_leader"
              placeholder="领导"
              clearable
            >
              <el-option
                v-for="val in [
                  { idx: 1, value: true, name: '是' },
                  { idx: 2, value: false, name: '否' },
                ]"
                :key="val.idx"
                :label="val.name"
                :value="val.value"
              />
            </el-select>
          </div>

          <div class="inline-block mr-3 w-24">
            <el-select
              v-model="searchcontent.department_id"
              placeholder="部门"
              clearable
            >
              <el-option
                v-for="(department, index) in why_departments"
                :key="index"
                :label="department.name"
                :value="department.id"
              />
            </el-select>
          </div>

          <div class="inline-block mr-3 w-24">
            <el-select
              v-model="searchcontent.mygroup_id"
              placeholder="组"
              clearable
            >
              <el-option
                v-for="(group, index) in why_groups"
                :key="index"
                :label="'第' + group.order_id + '组' + '/' + group.name"
                :value="group.id"
              />
            </el-select>
          </div>

          <div class="inline-block mr-3 w-32">
            <el-input
              v-model="searchcontent.phone"
              placeholder="电话"
              clearable
            />
          </div>

          <div class="inline-block mr-3 w-24">
            <el-select
              v-model="searchcontent.gender"
              placeholder="性别"
              clearable
            >
              <el-option
                v-for="(option, index) in whyGender"
                :key="index"
                :label="option.name"
                :value="option.value"
              />
            </el-select>
          </div>

          <div class="inline-block mr-3 w-32">
            <el-select
              v-model="searchcontent.state"
              placeholder="值班状态"
              clearable
            >
              <el-option
                v-for="(option, index) in whyState"
                :key="index"
                :label="option.name"
                :value="option.value"
              />
            </el-select>
          </div>

          <div class="inline-block mr-3 w-32">
            <el-select
              v-model="searchcontent.status"
              placeholder="账号状态"
              clearable
            >
              <el-option
                v-for="(option, index) in whyStatus"
                :key="index"
                :label="option.name"
                :value="option.value"
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
            >添加人员
          </el-button>
          <el-button
            type="primary"
            @click="handlerefresh"
            :icon="Refresh"
            :loading="operationloading"
            >刷新
          </el-button>
        </div>
      </div>
      <el-table :data="datas" v-loading="operationloading" class="pt-2 mt-2">
        <el-table-column prop="order_id" label="序号">
          <template #default="scope">
            {{ scope.row.order_id }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名">
          <template #default="scope">
            {{ scope.row.username }}
          </template>
        </el-table-column>
        <el-table-column prop="loginaccount" label="账号">
          <template #default="scope">
            {{ scope.row.loginaccount }}
          </template>
        </el-table-column>

        <el-table-column prop="is_leader" label="领导">
          <template #default="scope">
            {{ scope.row.is_leader === true ? '是' : '否' }}
          </template>
        </el-table-column>

        <el-table-column prop="department" label="部门">
          <template #default="scope">
            {{ scope.row.department ? scope.row.department.name : '' }}
          </template>
        </el-table-column>

        <el-table-column prop="mygroup" label="组">
          <template #default="scope">
            {{
              scope.row.mygroup ? '第' + scope.row.mygroup.order_id + '组' : ''
            }}
          </template>
        </el-table-column>

        <el-table-column prop="phone" label="电话">
          <template #default="scope">
            {{ scope.row.phone }}
          </template>
        </el-table-column>

        <el-table-column prop="gender" label="性别">
          <template #default="scope">
            {{ scope.row.gender === 1 ? '男' : '女' }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="账号状态">
          <template #default="scope">
            {{
              scope.row.status === 1
                ? '激活'
                : scope.row.status === 2
                ? '未激活'
                : '锁定'
            }}
          </template>
        </el-table-column>

        <el-table-column prop="state" label="值班状态">
          <template #default="scope">
            {{ scope.row.state === 1 ? '值班' : '不值班' }}
          </template>
        </el-table-column>

        <el-table-column prop="date_joined" label="创建时间">
          <template #default="scope">
            {{ timeFormatter.stringFromDate(scope.row.date_joined) }}
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
              编辑
            </el-button>

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
                  >删除
                </el-button>
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
      />
    </el-card>
  </schedulemain>

  <AddOrEditDialog
    v-model:dialogVisible="dialogVisible"
    v-model:operationloading="operationloading"
    :title="dialogtitle"
    @initrequest="initrequest"
    :editdataform="editdataform"
    :why_groups="why_groups"
    :why_departments="why_departments"
  >
  </AddOrEditDialog>
</template>
<style lang="scss" scoped></style>

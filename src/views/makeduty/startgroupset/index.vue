<script setup>
import { ref, onMounted, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { isNull, removeNullItem } from '@/utils/utils.js';
import Schedulemain from '@/components/schedulemain.vue';
import AddOrEditDialog from '@/views/makeduty/startgroupset/components/dialog.vue';
import groupturnhttp from '@/api/groupturnhttp.js';
import {
  Delete,
  InfoFilled,
  Plus,
  Search,
  Refresh,
  Edit,
} from '@element-plus/icons-vue';

import { useGroupsStore } from '@/stores/organizationalstructure.js';

import { usegroupturnsStore } from '@/stores/groupturns.js';

const whygroupstore = useGroupsStore();

const whygroupturnsstore = usegroupturnsStore();

import { useRefreshAllStore } from '@/stores/refreshallstore.js';

const refreshallstore = useRefreshAllStore();

let searchcontent = ref({
  group_id: '',
  start_date: '',
}); // 搜索双向绑定

// 这里面的组，用修改之后的组就是合理的啊

/**
 * 分页设置
 */
let mypagination = reactive({
  count: 0, // 总页数
  page: 1, // 当前页码
});

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

const operationloading = ref(false); // 操作的loading
const dataloading = ref(false); // 数据加载的loading
let datas = ref([]); // 数据列表
// 请求列表按页码
const requestdatas = async (page) => {
  if (dataloading.value) return; // 如果已经在加载中，则不执行后续操作
  dataloading.value = true; //加载开始
  try {
    // 先把params中的空值删除
    searchcontent.value = removeNullItem(searchcontent.value);
    let res = await groupturnhttp.getallgroupturn(
      page,
      pagesize.value,
      searchcontent.value
    );

    mypagination.count = res.count;
    datas.value = res.results;
  } catch (error) {
    // console.log(error);
    if (Array.isArray(error)) {
      for (const item of error) {
        ElMessage.error(item);
      }
    } else {
      ElMessage.error(JSON.stringify(error));
    }
  } finally {
    dataloading.value = false; //加载完成
  }
};

let why_groups = ref([]);
let why_groupturns = ref([]);

onMounted(async () => {
  await requestdatas(1);

  why_groups.value = await whygroupstore.fetchGroups(); // 拿到组
  why_groupturns.value = await whygroupturnsstore.fethgroupturns();
});

//////////////////////////////////////////////////
// 删除pop框
const confirmdelete = async (id, index) => {
  if (dataloading.value) return; // 如果已经在加载中，则不执行后续操作
  dataloading.value = true; // 设置加载状态为true
  try {
    await groupturnhttp.deletegroupturn(id);
    datas.value.splice(index, 1); // 删除数据，
    await refreshallstore.refresh_all_stores();
    ElMessage.success('删除成功');
  } catch (error) {
    if (Array.isArray(error)) {
      for (const item of error) {
        ElMessage.error(item);
      }
    } else {
      ElMessage.error(JSON.stringify(error));
    }
  } finally {
    dataloading.value = false; // 重置加载状态
  }
};
const canceloperate = () => {
  //console.log('取消操作');
};

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
    const { group, ...otherProps } = row;
    editData = { ...otherProps };
    editData.group_id = isNull(group) ? null : group.id;
  } else {
    // 如果是添加模式，则 editData 保持为空对象
    editData = {};
  }
  editdataform.value = editData;
};

const initrequest = async () => {
  await handleCurrentChange(mypagination.page); // 重新请求当夜数据
  await refreshallstore.refresh_all_stores(); // 待完善
};

// 手动刷新
const handlerefresh = async () => {
  await requestdatas(1); // 初始化加载请求所有部门
  mypagination.page = 1; // 初始化页面1

  await refreshallstore.refresh_all_stores(); // 待完善
};
</script>
<template>
  <schedulemain pagetitle="开始组设置">
    <el-card shadow="never">
      <div class="flex-col space-y-3">
        <div class="flex space-x-2">
          <el-date-picker
            v-model="searchcontent.start_date"
            type="date"
            placeholder="选择起始时间"
            value-format="YYYY-MM-DD"
          />

          <div class="w-56">
            <el-select v-model="searchcontent.group_id" clearable>
              <el-option
                v-for="group in why_groups"
                :key="group.id"
                :label="'第' + group.order_id + '组' + ' / ' + group.name"
                :value="group.id"
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
          <el-popconfirm
            confirm-button-text="是"
            confirm-button-type="primary"
            cancel-button-text="否"
            :icon="InfoFilled"
            icon-color="#f56c6c"
            title="值班组为目前情况，设置之前确认已经完善了人和组信息？"
            @confirm="handdledialog()"
            @cancel="canceloperate"
          >
            <template #reference>
              <el-button :icon="Plus" type="warning" :loading="operationloading"
                >设置开始组
              </el-button>
            </template>
          </el-popconfirm>

          <el-button
            type="primary"
            @click="handlerefresh"
            :icon="Refresh"
            :loading="operationloading"
            >刷新
          </el-button>
        </div>
      </div>
    </el-card>
    <el-card shadow="never">
      <el-table :data="datas" v-loading="dataloading" class="pt-2 mt-2">
        <el-table-column prop="start_date" label="开始时间">
          <template #default="scope">
            {{ scope.row.start_date }}
          </template>
        </el-table-column>

        <el-table-column prop="group" label="值班组">
          <template #default="scope">
            <el-text type="primary"
              >{{
                '第' +
                scope.row.group.order_id +
                '组' +
                ' / ' +
                scope.row.group.name
              }}
            </el-text>
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
              @cancel="canceloperate"
            >
              <template #reference>
                <el-button
                  type="danger"
                  :loading="dataloading"
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
  >
  </AddOrEditDialog>
</template>
<style lang="scss" scoped></style>

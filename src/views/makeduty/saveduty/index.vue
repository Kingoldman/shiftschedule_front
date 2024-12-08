<script setup>
import { onMounted, ref, reactive } from 'vue';
import { RouterLink } from 'vue-router';
import { ElMessage } from 'element-plus';
import { isNull, removeNullItem } from '@/utils/utils.js';
import shiftschedulejsonhttp from '@/api/shiftschedulejsonhttp.js';

import { useWhyDayStore } from '@/stores/datesetup.js';

import { useGroupsStore } from '@/stores/organizationalstructure.js';
import { usegroupturnsStore } from '@/stores/groupturns.js';

const whydaystore = useWhyDayStore();

const whygroupstore = useGroupsStore();
const whygroupturnsstore = usegroupturnsStore();

import { useRefreshAllStore } from '@/stores/refreshallstore.js';
import {
  Delete,
  Edit,
  InfoFilled,
  Plus,
  Refresh,
  Search,
} from '@element-plus/icons-vue';
import { selectYear } from '@/utils/constant.js';
import AddOrEditDialog from '@/views/makeduty/saveduty/components/dialog.vue';
import timeFormatter from '@/utils/timeFormatter.js';
import dayhttp from '@/api/dayhttp.js';

const refreshallstore = useRefreshAllStore();

let why_groups = ref([]); // 所有组
let why_days = ref([]);
let why_groupturns = ref([]);

onMounted(async () => {
  await requestdatas(1);
  why_days.value = await whydaystore.fetchWhyDays();
  why_days.value.sort((a, b) => new Date(a.date) - new Date(b.date));
  why_groups.value = await whygroupstore.fetchGroups(); // 组
  // 组按照order_id从小到大排序
  why_groups.value.sort((a, b) => a.order_id - b.order_id);
  why_groupturns.value = await whygroupturnsstore.fethgroupturns();
});

let operationloading = ref(false);

let searchcontent = ref({
  year: '',
  month: '',
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
    let res = await shiftschedulejsonhttp.getshiftschedulejsons(
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
// 删除的时候
const confirmdelete = async (row, id, index) => {
  if (operationloading.value) return; // 如果已经在加载中，则不执行后续操作
  operationloading.value = true; // 设置加载状态为true
  try {
    await shiftschedulejsonhttp.deleteshiftschedulejson(id);
    // 这里删除之后，还要修改这些日期的isarranged属性为0，待完善
    const { cur_month_schedule_json, ...otherProps } = row;

    const post_arranged_datas = cur_month_schedule_json.map((item) => [
      { 'id': item.id },

      {
        'isarranged': 0,
        'holiday_id': item.holiday_id,
        'vacationday_id': item.vacationday_id,
        'isweekend': item.isweekend,
        'isnormal': item.isnormal,
      },
    ]);

    let batch_response = await dayhttp.batchUpdateDays(post_arranged_datas);

    if (batch_response.success) {
      ElMessage.success(
        `成功更新 ${batch_response.updated} 天 isarranged 记录`
      );
    } else {
      ElMessage.error('更新 isarranged 失败');
      ElMessage.error(batch_response.errors);
    }

    datas.value.splice(index, 1); // 删除数据
    await refreshallstore.refresh_all_stores();
    ElMessage.success('删除成功');
  } catch (error) {
    ElMessage.error(JSON.stringify(error));
  } finally {
    operationloading.value = false; // 重置加载状态
  }
};
const canceloperate = () => {
  //console.log('取消操作');
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
    const { cur_month_schedule_json, ...otherProps } = row; // 不传入组，只支持编辑年、月
    editData = { ...otherProps };
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

  await refreshallstore.refresh_all_stores(); // 待完善
};

const initrequest = async () => {
  await handleCurrentChange(mypagination.page); // 重新请求当夜数据
  await refreshallstore.refresh_all_stores(); // 待完善
};
</script>
<template>
  <schedulemain pagetitle="保存值班">
    <el-card shadow="never">
      <div class="flex-col space-y-3">
        <div>
          <div class="mr-2 w-32 inline-block">
            <el-select
              v-model="searchcontent.year"
              clearable
              placeholder="年份"
            >
              <el-option
                v-for="year in selectYear"
                :key="year"
                :label="year"
                :value="year"
              />
            </el-select>
          </div>

          <div class="mr-2 w-32 inline-block">
            <el-select
              v-model="searchcontent.month"
              clearable
              placeholder="月份"
            >
              <el-option
                v-for="month in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]"
                :key="month"
                :label="month"
                :value="month"
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
            title="将按照目前值班组情况进行排班，确认已经完善了人和组信息？"
            @confirm="handdledialog()"
            @cancel="canceloperate"
          >
            <template #reference>
              <el-button :icon="Plus" type="warning" :loading="operationloading"
                >锁定值班
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
      <el-table :data="datas" v-loading="operationloading" class="pt-2 mt-2">
        <el-table-column prop="year" label="年份">
          <template #default="scope">
            {{ scope.row.year }}
          </template>
        </el-table-column>
        <el-table-column prop="month" label="月份">
          <template #default="scope">
            {{ scope.row.month }}
          </template>
        </el-table-column>

        <el-table-column prop="cur_month_schedule_json" label="值班情况">
          <template #default="scope">
            <RouterLink
              :to="{
                name: 'everymonthdutydetail',
                params: { pk: scope.row.id },
              }"
              >点击查看当月值班详情</RouterLink
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
              编辑
            </el-button>

            <el-popconfirm
              confirm-button-text="是"
              confirm-button-type="primary"
              cancel-button-text="否"
              :icon="InfoFilled"
              icon-color="#f56c6c"
              title="确认删除本条内容?"
              @confirm="confirmdelete(scope.row, scope.row.id, scope.$index)"
              @cancel="canceloperate"
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
    :why_days="why_days"
    :why_groups="why_groups"
    :why_groupturns="why_groupturns"
  >
  </AddOrEditDialog>
</template>
<style lang="scss" scoped></style>

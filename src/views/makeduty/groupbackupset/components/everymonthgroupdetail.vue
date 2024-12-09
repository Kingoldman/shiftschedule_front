<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import staffhttp from '@/api/staffhttp';
import schedulemain from '@/components/schedulemain.vue';
const route = useRoute();
const datas = ref([]);
let operationloading = ref(false); // 防止短时间重复提交，
const requestdatas = async (id) => {
  if (operationloading.value) return;

  operationloading.value = true;
  try {
    let res = await staffhttp.retrievegroupbackup(id);

    if (!res.cur_month_group_set) {
      ElMessage.error('未读取到当月值班组');
      return;
    }

    datas.value = res.cur_month_group_set;
  } catch (error) {
    if (Array.isArray(error)) {
      for (const item of error) {
        ElMessage.error(item);
      }
    } else {
      ElMessage.error(JSON.stringify(error));
    }
  } finally {
    operationloading.value = false;
  }
};
onMounted(async () => {
  // 拿到网址传入的当月检索的id
  const pk = route.params.pk;
  await requestdatas(pk);
});
</script>

<template>
  <schedulemain pagetitle="每月值班组情况">
    <el-table :data="datas" height="500" style="width: 100%">
      <el-table-column prop="order_id" label="组序" width="180" />
      <el-table-column prop="name" label="组名称" width="180">
        <template #default="scope">
          <el-tag type="warning">{{ scope.row.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="staffs" label="组员">
        <template #default="scope">
          <el-tag
            class="mx-1"
            type="primary"
            v-for="staff in scope.row.staffs"
            :key="staff"
            >{{ staff.username }}</el-tag
          >
        </template>
      </el-table-column>
    </el-table>
  </schedulemain>
</template>

<style scoped lang="scss"></style>

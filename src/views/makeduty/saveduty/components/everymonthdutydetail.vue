<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import shiftschedulejsonhttp from '@/api/shiftschedulejsonhttp.js';
import schedulemain from '@/components/schedulemain.vue';
const route = useRoute();
const datas = ref([]);
let operationloading = ref(false); // 防止短时间重复提交，
const requestdatas = async (id) => {
  if (operationloading.value) return;

  operationloading.value = true;
  try {
    let res = await shiftschedulejsonhttp.retrieveshiftschedulejson(id);

    if (!res.cur_month_schedule_json) {
      ElMessage.error('未读取到当月值班存储json');
      return;
    }

    datas.value = res.cur_month_schedule_json;
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
      <el-table-column prop="date" label="日期" width="180" />
      <el-table-column prop="title" label="天属性" width="180">
        <template #default="scope">
          <el-tag v-if="scope.row.title === '工作日'" type="primary">
            {{ scope.row.title }}
          </el-tag>
          <el-tag v-else-if="scope.row.title === '调休上班'" type="danger">
            {{ scope.row.title }}
          </el-tag>
          <el-tag v-else-if="scope.row.title === '周末'" type="warning">
            {{ scope.row.title }}
          </el-tag>
          <el-tag v-else type="success">
            {{ scope.row.title }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="datas" label="值班组">
        <template #default="scope">
          <div v-for="data in scope.row.datas" :key="data">
            <div v-for="(value, key) in data" :key="value">
              <el-text class="mx-1" type="primary">
                {{ '第' + key + '组' }}
              </el-text>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="datas" label="值班人员">
        <template #default="scope">
          <div v-for="data in scope.row.datas" :key="data">
            <div v-for="(value, key) in data" :key="value">
              <el-tag
                v-for="name in value"
                :key="name"
                class="mx-1"
                type="primary"
              >
                {{ name }}
              </el-tag>
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </schedulemain>
</template>

<style scoped lang="scss"></style>

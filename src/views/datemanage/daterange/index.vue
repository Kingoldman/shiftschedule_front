<script setup>
import { ref } from 'vue';
import dayjs from 'dayjs'; // 使用dayjs
import { ElMessage } from 'element-plus';
import { isNull } from '@/utils/utils.js';
import dayhttp from '@/api/dayhttp.js';
import Schedulemain from '@/components/schedulemain.vue';

import { useRefreshAllStore } from '@/stores/refreshallstore.js';
const refreshallstore = useRefreshAllStore();

const rangevalue = ref([]);
let operationloading = ref(false);

const handlesubmit_date_set = async () => {
  const allDates = ref([]);
  if (!isNull(rangevalue.value) && rangevalue.value.length === 2) {
    const startDate = dayjs(rangevalue.value[0]);
    const endDate = dayjs(rangevalue.value[1]);
    for (
      let date = startDate;
      date.isBefore(endDate) || date.isSame(endDate, 'day');
      date = date.add(1, 'day')
    ) {
      allDates.value.push(date.format('YYYY-MM-DD')); // 格式化为 YYYY-MM-DD
    }
  } else {
    ElMessage.warning('请输入起止日期！');
    operationloading.value = false;
    return;
  }

  if (operationloading.value) {
    return;
  }
  operationloading.value = true; // 设置加载状态为true
  try {
    const daysData = allDates.value.map((date) => ({
      date: date,
      holiday_id: undefined,
      vacationday_id: undefined,
      isweekend: 0,
      isnormal: 1,
    }));

    const response = await dayhttp.batchCreateDays({ days: daysData });
    await refreshallstore.refresh_all_stores(); // 记得更新store
    if (response.success) {
      ElMessage.success(`成功创建 ${response.created} 天记录`);
    } else {
      ElMessage.error('更新失败');
      ElMessage.error(response.errors);
    }
  } catch (error) {
    if (Array.isArray(error)) {
      for (const item of error) {
        ElMessage.error(item);
      }
    } else {
      ElMessage.error(JSON.stringify(error));
    }
  } finally {
    allDates.value = []; // 创建完置空，不然会一直加
    rangevalue.value = []; // 清空日期选择器
    operationloading.value = false; // 重置加载状态
  }
};
</script>
<template>
  <schedulemain pagetitle="创建基础日期">
    <el-card shadow="never">
      <div class="flex space-x-2">
        <div>
          <el-date-picker
            v-model="rangevalue"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </div>

        <div class="">
          <el-button
            type="primary"
            @click="handlesubmit_date_set"
            v-loading="operationloading"
            >生成日期</el-button
          >
        </div>
      </div>
    </el-card>
  </schedulemain>
</template>
<style lang="scss" scoped></style>

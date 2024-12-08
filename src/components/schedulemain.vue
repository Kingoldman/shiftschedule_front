<script setup>
import { ref } from 'vue';
import PageHeader from './PageHeader.vue';
const props = defineProps({
  pagetitle: String,
});
</script>
<template>
  <el-space direction="vertical" fill :size="20" class="w-full">
    <PageHeader :pagetitle="pagetitle"></PageHeader>
    <slot></slot>
  </el-space>
</template>
<style lang="scss" scoped>
/* table宽度自定义，不然要变形*/
.el-space :deep(.el-space__item) {
  width: 100%;
}
</style>

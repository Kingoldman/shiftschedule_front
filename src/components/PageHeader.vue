<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
const goBack = () => {
  router.go(-1);
};
const props = defineProps({
  pagetitle: {
    type: String,
    default: "",
  },
});
</script>
<template>
  <el-page-header @back="goBack" title="返回">
    <template #content>
      <span class="text-base mr-3"> {{ pagetitle }} </span>
    </template>
  </el-page-header>
</template>
<style lang="scss" scoped></style>

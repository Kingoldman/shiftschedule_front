<script setup>
import { Expand, Fold } from "@element-plus/icons-vue";

const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["updateCollapsed"]);
</script>
<template>
  <div>
    <el-button
      type=""
      :icon="Expand"
      v-show="isCollapsed"
      @click="$emit('updateCollapsed')"
      class="!ml-0"
    />
    <el-button
      type=""
      :icon="Fold"
      v-show="!isCollapsed"
      @click="$emit('updateCollapsed')"
      class="!ml-0"
    />
  </div>
</template>
<style lang="scss" scoped></style>

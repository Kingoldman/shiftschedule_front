<script setup>
const props = defineProps({
  operationloading: {
    type: Boolean,
    default: '',
  },
});
const emits = defineEmits(['enterinto']);

const enterinto = () => {
  emits('enterinto');
};
</script>
<template>
  <div class="h-screen flex items-center justify-center">
    <div class="space-y-4 m-2 px-10 py-8 shadow-xl">
      <div class="space-y-1">
        <div class="text-slate-600">个人玩具，看看就行，不接受意见！</div>
        <div class="text-sm text-slate-400 font-extralight">
          这里其实是在获取最新数据
        </div>
      </div>
      <el-button
        type="primary"
        @click="enterinto"
        v-loading="operationloading"
        class="w-full text-center"
      >
        同意
      </el-button>
    </div>
  </div>
</template>
<style scoped></style>

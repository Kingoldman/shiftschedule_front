<script setup>
// 侧边栏
import { ref, computed } from 'vue';
// import {
//   House,
//   DocumentChecked,
//   User,
//   Bell,
//   Calendar,
//   HomeFilled,
//   Checked,
// } from '@element-plus/icons-vue';
import { RouterLink } from 'vue-router';
import frame_routes from '@/router/frame';

const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false,
  },
});

// 侧边栏宽度
const asideWidth = computed(() => {
  if (props.isCollapsed) {
    return '64px';
  } else {
    return '200px';
  }
});

defineEmits(['update:isCollapsed']);

// defineExpose({
//   asideWidth,
// });
</script>
<template>
  <el-aside :width="asideWidth" class="bg-blue-500 !text-white">
    <div class="bg-blue-500 p-4 text-center font-bold text-xl tracking-widest">
      <RouterLink to="/" class="text-white no-underline"
        >帅<span v-show="!isCollapsed">无敌</span></RouterLink
      >
    </div>

    <el-menu
      active-text-color="#ffd04b"
      background-color="#3b82f6"
      class="el-menu-vertical-demo !bg-blue-500 !border-r-0"
      default-active="1"
      text-color="#fff"
      :collapse="isCollapsed"
      @update:isCollapsed="($event) => $emit('update:isCollapsed', $event)"
      :collapse-transition="false"
      :router="true"
      :unique-opened="true"
    >
      <template
        v-for="(route, route_idx) in frame_routes[0].children"
        :key="route_idx"
      >
        <el-menu-item
          v-if="!route.children"
          :index="route.name"
          :route="{ name: route.name }"
        >
          <el-icon>
            <component :is="route.meta.icon"></component>
          </el-icon>
          <span>{{ route.meta.text }}</span>
        </el-menu-item>

        <el-sub-menu v-else :index="route.name">
          <template #title>
            <el-icon>
              <component :is="route.meta.icon"></component>
            </el-icon>
            <span>{{ route.meta.text }}</span>
          </template>
          <template
            v-for="(child, child_idx) in route.children"
            :key="child_idx"
          >
            <el-menu-item
              v-if="!child.meta.hidden"
              :index="child.name"
              :route="{ name: child.name }"
            >
              <el-icon> <component :is="child.meta.icon"></component></el-icon>

              <span>{{ child.meta.text }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>
      </template>
    </el-menu>
  </el-aside>
</template>
<style scoped></style>

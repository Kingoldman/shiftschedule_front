<script setup>
import { defineEmits } from 'vue';

const emit = defineEmits();

const enterSite = () => {
  emit('entered'); // 发出事件，通知父组件
};
</script>

<template>
  <div class="overlay">
    <div class="modal">
      <h2>欢迎来到网站</h2>
      <p>点击下面的按钮开始浏览</p>
      <button @click="enterSite">进入网站</button>
    </div>
  </div>
</template>

<style>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}
</style>

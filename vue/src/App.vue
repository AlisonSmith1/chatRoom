<script setup>
import Navbar from './components/Navbar.vue'
</script>

<template>
  <Navbar />
  <router-view />
  <!-- 自動根據「路由設定」去載入對應的 view（頁面元件） -->
</template>
<style>
.lu {
  background-color: #42b983;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
}
.po {
  background-color: #42b983;
  border: none;
  border-radius: 10px;
  margin: 0;
  padding: 10px;
  color: white;
  cursor: pointer;
}

.po:hover {
  background-color: #369870;
}
</style>

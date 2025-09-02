<script setup>
import { ref } from 'vue'
import HomeBlock from './components/HomeBlock.vue'
import LoginBlock from './components/LoginBlock.vue'
import ChatBlock from './components/ChatBlock.vue'
import RegisterBlock from './components/RegisterBlock.vue'

const currentComponent = ref(HomeBlock)
const ifLogin = ref(false)

function showHome() {
  currentComponent.value = HomeBlock
}
function showLogin() {
  currentComponent.value = LoginBlock
}
function showChat() {
  currentComponent.value = ChatBlock
}
function showRegister() {
  currentComponent.value = RegisterBlock
}
function logOut() {
  alert('已登出')
  currentComponent.value = HomeBlock
}
</script>

<template>
  <div class="lu">
    <button class="po" @click="showHome">首頁</button>
    <button class="po" @click="showRegister">註冊</button>
    <button class="po" @click="showLogin">登入</button>
    <button class="po" @click="showChat" v-if="ifLogin">聊天</button>
    <button class="po" @click="logOut" v-if="ifLogin">登出</button>
  </div>

  <component :is="currentComponent" />
</template>
<style scoped>
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

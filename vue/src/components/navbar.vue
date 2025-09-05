<script setup>
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

userStore.loadFromStorage()

function logOut() {
  userStore.logout()
  router.push('/')
  alert('已登出')
}
</script>

<template>
  <div class="lu">
    <router-link class="po" to="/">首頁</router-link>
    <router-link class="po" to="/register" v-if="!userStore.isLogin">註冊</router-link>
    <router-link class="po" to="/login" v-if="!userStore.isLogin">登入</router-link>
    <router-link class="po" to="/chat" v-if="userStore.isLogin">聊天</router-link>
    <button class="po" v-if="userStore.isLogin" @click="logOut">登出</button>
  </div>
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
  text-decoration: none; /* 移除 router-link 預設底線 */
}

.po:hover {
  background-color: #369870;
}
</style>

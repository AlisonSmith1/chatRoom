<template>
  <div class="lu">
    <router-link class="po" to="/">首頁</router-link>
    <router-link class="po" to="/register" v-if="ifRegister">註冊</router-link>
    <router-link class="po" @click="ifLoginStatus" to="/login">登入</router-link>
    <router-link class="po" v-if="ifLogin" to="/chat">聊天</router-link>
    <button class="po" v-if="ifLogin" @click="logOut">登出</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const ifRegister = ref(true)
const ifLogin = ref(false)

onMounted(() => {
  const account = localStorage.getItem('Account')
  if (account) {
    ifLogin.value = true
    ifRegister.value = false
  } else {
    ifLogin.value = false
    ifRegister.value = true
  }
})

function logOut() {
  localStorage.removeItem('Account')
  ifLogin.value = false
  ifRegister.value = true
  alert('已登出')
  router.push('/')
}
</script>

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

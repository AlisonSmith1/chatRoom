<template>
  <div class="block">
    <h2>登入</h2>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div class="form-group">
      <label>帳號：</label>
      <input v-model="username" type="text" @keyup.enter="login" placeholder="輸入帳號" />
    </div>
    <div class="form-group">
      <label>密碼：</label>
      <input v-model="password" type="password" @keyup.enter="login" placeholder="輸入密碼" />
    </div>

    <button class="login-btn" @click="login">登入</button>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const router = useRouter()
const username = ref('')
const password = ref('')
// const API_URL = 'https://chatroom-production-300c.up.railway.app'
const API_URL = `http://localhost:4000`

const loginAccount = ref([])
const errorMessage = ref('')

async function login() {
  try {
    if (!username.value || !password.value) {
      errorMessage.value = '請輸入帳號與密碼'
      return
    }

    if (!res.ok) {
      errorMessage.value = data.error
      return
    }

    const res = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    })
    const data = await res.json()
    loginAccount.value = data

    if (res.ok) {
      userStore.login(data)
      router.push('/')
      alert('登入成功！')
    } else {
      alert(data.error)
    }
  } catch (error) {
    console.error(error)
  }
}
</script>
<style scoped>
h2 {
  color: #42b983;
  margin: 10px;
}

p {
  color: #1f8457;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 10px;
}

.block {
  border: #1f8457 1px solid;
  margin: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.form-group {
  margin: 10px;
}

input {
  padding: 5px 10px;
  border-radius: 5px;
  border: 1px solid #42b983;
}

.login-btn {
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  margin-bottom: 10px;
}

.login-btn:hover {
  background-color: #369870;
}
</style>

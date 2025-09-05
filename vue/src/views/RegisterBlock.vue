<template>
  <div class="block">
    <h2>註冊</h2>
    <input v-model="username" placeholder="帳號" />
    <input v-model="password" placeholder="密碼" />
    <button @click="register">註冊</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const username = ref('')
const password = ref('')

async function register() {
  if (!username.value || !password.value) {
    alert('請輸入帳號與密碼')
    return
  }

  try {
    const res = await fetch('http://localhost:3000/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value }),
    })
    const data = await res.json()
    if (res.ok) {
      userStore.login(data)
      router.push('/')
      alert('註冊成功！')
    } else {
      alert(data.error)
    }
  } catch (err) {
    console.error(err)
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

.register-btn {
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

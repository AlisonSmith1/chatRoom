<template>
  <div class="block">
    <h2>登入</h2>
    <p>請輸入帳號密碼登入系統。</p>
    <div class="form-group">
      <label>帳號：</label>
      <input v-model="username" type="text" placeholder="輸入帳號" />
    </div>
    <div class="form-group">
      <label>密碼：</label>
      <input v-model="password" type="text" placeholder="輸入密碼" />
    </div>
    <button class="login-btn" @click="login">登入</button>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')

const loginAccount = ref([])

async function login() {
  try {
    if (!username.value || !password.value) {
      alert('請輸入帳號與密碼')
      return
    }

    const res = await fetch('http://localhost:3000/users/login', {
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
      localStorage.setItem('Account', JSON.stringify(data))
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

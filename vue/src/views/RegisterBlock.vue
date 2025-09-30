<template>
  <div class="block">
    <h2>註冊</h2>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <div class="form-group">
      <label>帳號：</label>
      <input v-model="username" type="text" @keyup.enter="register" placeholder="輸入帳號" />
    </div>
    <div class="form-group">
      <label>密碼：</label>
      <input v-model="password" type="password" @keyup.enter="register" placeholder="輸入密碼" />
    </div>

    <button class="register-btn" @click="register">註冊</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import API_URL from '../router/api_url'

const router = useRouter()
const userStore = useUserStore()
const username = ref('')
const password = ref('')
const errorMessage = ref('')

async function register() {
  if (!username.value || !password.value) {
    errorMessage.value = '請輸入帳號與密碼'
    return
  }

  try {
    const res = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value }),
    })
    const data = await res.json()

    if (!res.ok) {
      errorMessage.value = data.error
      return
    }
    if (res.ok) {
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

.form-group {
  margin: 10px;
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

.register-btn:hover {
  background-color: #369870;
}

@media screen and (max-width: 600px) {
  h2 {
    display: none;
  }
  .block {
    border: none;
    margin: 10px;
  }
}
</style>

<template>
  <div class="block">
    <h2>註冊</h2>
    <p>請填寫帳號密碼完成註冊。</p>
    <div class="form-group">
      <label>帳號：</label>
      <input v-model="username" type="text" placeholder="輸入帳號" />
    </div>
    <div class="form-group">
      <label>密碼：</label>
      <input v-model="password" type="text" placeholder="輸入密碼" />
    </div>
    <button class="login-btn" @click="login">註冊帳號</button>
  </div>
</template>
<script setup></script>
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

<template>
  <div class="block">
    <h2>聊天頁面</h2>
    <p>這裡放聊天訊息和輸入框。</p>
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
</style>

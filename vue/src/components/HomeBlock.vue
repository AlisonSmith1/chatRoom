<template>
  <div>
    <h1>{{ title }}</h1>
    <p>
      {{ msg }}
    </p>
  </div>
</template>

<script setup>
const title = '即時聊天系統'
const msg =
  '本專案是一個開發的即時聊天系統，提供使用者能夠即時傳送與接收訊息的體驗。\n系統設計簡潔直觀，適合作為前端與後端整合的學習專案，也能展示即時通訊的核心功能。'
</script>

<style scoped>
h1 {
  color: #42b983;
  margin: 10px;
}

p {
  color: #1f8457;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 10px;
}

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
}

.po:hover {
  background-color: #369870;
}
</style>

<template>
  <div>
    <h1>{{ title }}</h1>
    <p>
      {{ msg }}
    </p>
    <table>
      <thead>
        <tr>
          <th>組別</th>
          <th style="width: 150px">帳號</th>
          <th style="width: 150px">密碼</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>第一組</td>
          <td>8888</td>
          <td>8888</td>
        </tr>
        <tr>
          <td>第二組</td>
          <td>1111</td>
          <td>1111</td>
        </tr>
        <tr>
          <td>第三組</td>
          <td>2222</td>
          <td>2222</td>
        </tr>
        <tr>
          <td>第四組</td>
          <td>3333</td>
          <td>3333</td>
        </tr>
      </tbody>
    </table>
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

table {
  border-collapse: collapse;
  width: 50%;
  margin: 20px auto;
}

th,
td {
  border: 1px solid #1f8457;
  padding: 8px 20px; /* 水平 padding 加大 */
  text-align: center;
}

th {
  background-color: #3bd48f;
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

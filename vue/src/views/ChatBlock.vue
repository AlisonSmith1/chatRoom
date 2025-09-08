<template>
  <div class="chat-container">
    <h2>聊天室</h2>
    <ul ref="chatBox">
      <li v-for="(msg, index) in messages" :key="index">
        <strong>{{ msg.username }}:</strong> {{ msg.content }}
      </li>
    </ul>
    <input v-model="message" @keyup.enter="sendMessage" placeholder="輸入訊息..." />
    <button @click="sendMessage">送出</button>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { io } from 'socket.io-client'

const messages = ref([])
const message = ref('')
const chatBox = ref(null)

// 連線後端 Socket.IO
const accountStr = localStorage.getItem('Account')
let token = null
if (accountStr) {
  token = JSON.parse(accountStr).token
}

const socket = io('http://localhost:3000', {
  auth: { token },
})

onMounted(() => {
  // 接收訊息
  socket.on('chat message', (msg) => {
    // msg 格式已經是 { id, userId, username, content }
    messages.value.push(msg)
    scrollToBottom()
  })
})

function sendMessage() {
  if (message.value.trim() !== '') {
    socket.emit('chat message', message.value) // 傳純文字就好
    message.value = ''
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (chatBox.value) {
      chatBox.value.scrollTop = chatBox.value.scrollHeight
    }
  })
}
</script>

<style scoped>
.chat-container {
  max-width: 500px;
  margin: 20px auto;
  padding: 10px;
  border: 1px solid #42b983;
  display: flex;
  flex-direction: column;
}
ul {
  list-style: none;
  padding: 0;
  margin-bottom: 10px;
  flex-grow: 1;
  overflow-y: auto;
  max-height: 300px;
}
li {
  padding: 5px;
  word-break: break-word;
  white-space: pre-wrap;
}
input {
  padding: 5px;
  margin-bottom: 5px;
}
button {
  padding: 5px;
  background-color: #42b983;
  color: white;
  border: none;
  cursor: pointer;
}
</style>

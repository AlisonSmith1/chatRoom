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
import { ref, nextTick, onMounted, watch } from 'vue'
import { io } from 'socket.io-client'

const messages = ref([])
const message = ref('')
const chatBox = ref(null)

const accountStr = localStorage.getItem('Account')
const API_URL = 'https://chatroom-production-300c.up.railway.app'
// const API_URL = `http://localhost:4000`
let token = null
if (accountStr) token = JSON.parse(accountStr).token

const socket = io(API_URL, { auth: { token } })

// 接收父元件傳入的房間 id
const props = defineProps({
  roomId: Number,
})

// 初次加入房間，抓歷史訊息
onMounted(() => {
  if (props.roomId) {
    socket.emit('join room', props.roomId)
    // 主動請求歷史訊息
    socket.emit('get history', props.roomId)
  }

  socket.on('chat history', (history) => {
    messages.value = history
    scrollToBottom()
  })
  socket.on('chat message', (msg) => {
    messages.value.push(msg)
    scrollToBottom()
  })
})

// 當房間改變時
watch(
  () => props.roomId,
  (newRoomId) => {
    if (!newRoomId) return
    socket.emit('join room', newRoomId)
    messages.value = []
  },
)

function sendMessage() {
  if (!message.value.trim()) return
  socket.emit('chat message', { content: message.value, roomId: props.roomId })
  message.value = ''
}

function scrollToBottom() {
  nextTick(() => {
    if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight
  })
}
</script>

<style scoped>
.chat-container {
  width: 100%;
  margin: 20px;
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

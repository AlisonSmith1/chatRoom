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
import API_URL from '../router/api_url'

const messages = ref([])
const message = ref('')
const chatBox = ref(null)

const accountStr = localStorage.getItem('Account')
let token = null
if (accountStr) token = JSON.parse(accountStr).token

const socket = io(API_URL, { auth: { token } })

const props = defineProps({
  roomId: Number,
})

onMounted(() => {
  if (props.roomId) {
    socket.emit('join room', props.roomId)
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

watch(
  () => props.roomId,
  (newRoomId) => {
    if (!newRoomId) return

    // 清掉舊監聽，避免訊息重複
    socket.off('chat message')

    // 加入新房間並請求歷史訊息
    socket.emit('join room', newRoomId)
    socket.emit('get history', newRoomId)

    // 清空舊訊息並滾動
    messages.value = []
    scrollToBottom()

    // 重新監聽新的房間訊息
    socket.on('chat message', (msg) => {
      messages.value.push(msg)
      scrollToBottom()
    })
  },
)

function sendMessage() {
  if (!message.value.trim()) return
  socket.emit('chat message', { content: message.value, roomId: props.roomId }, (ack) => {
    if (ack?.status === 'ok') {
      console.log('送出成功')
    } else {
      console.error('送出失敗', ack)
    }
  })
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

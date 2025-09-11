<template>
  <div class="chat-container">
    <h2>{{ isPrivate ? '私人聊天室' : '聊天室' }}</h2>

    <button
      v-if="!isPrivate"
      @click="findRandomChat"
      :disabled="roomId === null && messages[0]?.username === '系統'"
    >
      隨機一對一聊天
    </button>

    <ul ref="chatBox">
      <li v-for="(msg, index) in messages" :key="index">
        <strong>{{ msg.username }}:</strong> {{ msg.content }}
      </li>
    </ul>

    <input
      v-model="message"
      @keyup.enter="sendMessage"
      placeholder="輸入訊息..."
      :disabled="!roomId"
    />
    <button @click="sendMessage" :disabled="!roomId">送出</button>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, watch } from 'vue'
import { io } from 'socket.io-client'
import API_URL from '../router/api_url'

const messages = ref([])
const message = ref('')
const chatBox = ref(null)
const roomId = ref(null)
const isPrivate = ref(false)

const accountStr = localStorage.getItem('Account')
let token = accountStr ? JSON.parse(accountStr).token : null
const socket = io(API_URL, { auth: { token } })

const props = defineProps({
  roomId: Number,
  isPrivate: Boolean,
})

// 處理訊息
function handleMessage(msg) {
  messages.value.push(msg)
  scrollToBottom()
}

// 加入房間
function joinRoom(id) {
  if (!id) return
  roomId.value = id
  messages.value = []
  scrollToBottom()
  socket.emit('join room', id)
}

// 送訊息
function sendMessage() {
  if (!message.value.trim() || !roomId.value) return

  const event = isPrivate.value ? 'private message' : 'chat message'
  socket.emit(event, { roomId: roomId.value, content: message.value }, (ack) => {
    if (ack?.status === 'ok') console.log(`${isPrivate.value ? '私訊' : '訊息'}送出成功`)
  })
  message.value = ''
}

// 滾動到底
function scrollToBottom() {
  nextTick(() => {
    if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight
  })
}

// 隨機配對
function findRandomChat() {
  socket.emit('find random chat')
  messages.value = [{ username: '系統', content: '正在等待配對...' }]
  roomId.value = null
}

onMounted(() => {
  if (props.roomId) joinRoom(props.roomId)
  if (props.isPrivate) isPrivate.value = props.isPrivate

  socket.on('chat message', handleMessage)
  socket.on('private message', handleMessage)
  socket.on('chat history', (history) => {
    messages.value = history
    scrollToBottom()
  })
  socket.on('waiting', () => {
    messages.value = [{ username: '系統', content: '正在等待配對...' }]
    roomId.value = null
  })
  socket.on('matched', ({ roomId: privateRoomId }) => {
    roomId.value = privateRoomId
    isPrivate.value = true
    messages.value = []
    scrollToBottom()
    console.log('配對成功，房間ID:', privateRoomId)
  })
})

// 監聽 props 更新
watch(
  () => props.roomId,
  (newRoomId) => {
    if (newRoomId && newRoomId !== roomId.value) joinRoom(newRoomId)
  },
)
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
  margin-bottom: 5px;
  background-color: #42b983;
  color: white;
  border: none;
  cursor: pointer;
}
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
